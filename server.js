const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const questions = [
  { cat: "kingdom", tag: "Kingdom split", q: "After Solomon died, who became king of the northern kingdom, Israel?", a: ["Rehoboam", "Jeroboam", "Omri", "Ahab"], c: 1 },
  { cat: "kingdom", tag: "Kingdom split", q: "Which queen was the daughter of Ahab and Jezebel, and later seized the throne of Judah?", a: ["Athaliah", "Jezebel", "Bathsheba", "Huldah"], c: 0 },
  { cat: "elijah", tag: "Elijah", q: "Who fed Elijah bread and meat at the brook Cherith?", a: ["Angels", "Ravens", "Widow of Zarephath", "Obadiah"], c: 1 },
  { cat: "elijah", tag: "Elijah", q: "At Zarephath, what miracle did Elijah perform for a poor widow?", a: ["Turned water to wine", "Her jar of meal and jug of oil never ran out", "He gave her gold", "He healed her leprosy"], c: 1 },
  { cat: "elijah", tag: "Elijah", q: "On Mount Carmel, how many prophets of Baal did Elijah challenge?", a: ["12", "70", "450", "1,000"], c: 2 },
  { cat: "elijah", tag: "Elijah", q: "What proved the Lord was God on Mount Carmel?", a: ["A great earthquake", "Fire fell and consumed the water-soaked altar", "A rainbow appeared", "The sea parted"], c: 1 },
  { cat: "elijah", tag: "Elijah", q: "Fleeing from Jezebel, where did Elijah hear the Lord in a 'still small voice'?", a: ["Mount Sinai / Horeb", "The Jordan River", "Jerusalem", "Jericho"], c: 0 },
  { cat: "elijah", tag: "Elijah", q: "How did Elijah call Elisha to follow him?", a: ["He wrote him a letter", "He cast his mantle over him", "He healed his father", "He gave him a sword"], c: 1 },
  { cat: "elijah", tag: "Elijah", q: "How did Elijah leave the earth?", a: ["He died of old age", "He was taken up in a chariot of fire, in a whirlwind", "He was killed in battle", "He disappeared into the temple"], c: 1 },
  { cat: "elisha", tag: "Elisha", q: "What did Elisha ask for before Elijah was taken up?", a: ["Great riches", "A double portion of Elijah's spirit", "To be king", "To live forever"], c: 1 },
  { cat: "elisha", tag: "Elisha", q: "How did Elisha part the Jordan River, just as Elijah had?", a: ["He prayed all night", "He struck the water with Elijah's mantle", "He built a bridge", "He called down fire"], c: 1 },
  { cat: "elisha", tag: "Elisha", q: "How was the Shunammite woman blessed for her kindness to Elisha?", a: ["She was given land", "She was promised a son", "She became wealthy", "She was healed of illness"], c: 1 },
  { cat: "elisha", tag: "Elisha", q: "What did Elisha tell Naaman to do to be healed of leprosy?", a: ["Offer a sacrifice", "Wash seven times in the Jordan River", "Fast for 40 days", "Travel to Jerusalem"], c: 1 },
  { cat: "elisha", tag: "Elisha", q: "Naaman was angry at first because Elisha's instructions seemed too simple. What changed his mind?", a: ["A prophet threatened him", "His servants urged him to just try it", "The king ordered him to obey", "He saw a vision"], c: 1 },
  { cat: "elisha", tag: "Elisha", q: "What did Elisha do when an iron axe head fell into the Jordan and sank?", a: ["He dove in and found it", "He made it float by throwing in a stick", "He bought a new axe", "He asked the king for help"], c: 1 },
  { cat: "elisha", tag: "Elisha", q: "What happened to Elisha's servant Gehazi after he secretly took payment from Naaman?", a: ["He was made a prophet", "He was struck with leprosy", "He became rich and happy", "Nothing happened"], c: 1 },
];

let players = new Map(); // ws -> {id, name, avatar, score, answered, choice}
let hostWs = null;
let currentQuestion = -1; // -1 = lobby
let revealed = false;

function publicPlayerList() {
  return Array.from(players.values()).map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }));
}

function send(ws, obj) {
  if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

function broadcastAll(obj) {
  players.forEach((p, ws) => send(ws, obj));
  if (hostWs) send(hostWs, obj);
}

function broadcastPlayerList() {
  broadcastAll({ type: "player_list", players: publicPlayerList() });
}

function answerCounts() {
  const counts = [0, 0, 0, 0];
  players.forEach(p => {
    if (p.answered && p.choice != null) counts[p.choice]++;
  });
  return counts;
}

function sendQuestion(index) {
  const item = questions[index];
  players.forEach(p => { p.answered = false; p.choice = null; });
  revealed = false;
  const payload = { type: "question", index, total: questions.length, tag: item.tag, q: item.q, answers: item.a };
  broadcastAll(payload);
}

function sendReveal() {
  const item = questions[currentQuestion];
  players.forEach(p => {
    if (p.answered && p.choice === item.c) p.score += 1;
  });
  revealed = true;
  broadcastAll({ type: "reveal", correctIndex: item.c, players: publicPlayerList() });
}

function sendFinal() {
  const leaderboard = publicPlayerList().sort((a, b) => b.score - a.score);
  broadcastAll({ type: "final", leaderboard });
}

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    if (msg.type === "host_hello") {
      hostWs = ws;
      send(ws, { type: "player_list", players: publicPlayerList() });
      if (currentQuestion >= 0) {
        send(ws, { type: "question", index: currentQuestion, total: questions.length, tag: questions[currentQuestion].tag, q: questions[currentQuestion].q, answers: questions[currentQuestion].a });
        if (revealed) send(ws, { type: "reveal", correctIndex: questions[currentQuestion].c, players: publicPlayerList() });
      }
      return;
    }

    if (msg.type === "join") {
      const id = crypto.randomBytes(4).toString("hex");
      players.set(ws, { id, name: String(msg.name || "Guest").slice(0, 18), avatar: msg.avatar || "\u{1F451}", score: 0, answered: false, choice: null });
      send(ws, { type: "joined", id });
      if (currentQuestion >= 0 && !revealed) {
        send(ws, { type: "question", index: currentQuestion, total: questions.length, tag: questions[currentQuestion].tag, q: questions[currentQuestion].q, answers: questions[currentQuestion].a });
      }
      broadcastPlayerList();
      return;
    }

    if (msg.type === "answer") {
      const p = players.get(ws);
      if (!p || revealed || currentQuestion < 0) return;
      if (p.answered) return;
      p.answered = true;
      p.choice = msg.choice;
      if (hostWs) send(hostWs, { type: "answer_count", counts: answerCounts(), total: players.size });
      return;
    }

    if (msg.type === "host_start") {
      currentQuestion = 0;
      players.forEach(p => { p.score = 0; });
      sendQuestion(currentQuestion);
      return;
    }

    if (msg.type === "host_reveal") {
      if (currentQuestion >= 0 && !revealed) sendReveal();
      return;
    }

    if (msg.type === "host_next") {
      currentQuestion += 1;
      if (currentQuestion >= questions.length) {
        sendFinal();
      } else {
        sendQuestion(currentQuestion);
      }
      return;
    }

    if (msg.type === "host_restart") {
      currentQuestion = -1;
      revealed = false;
      players.forEach(p => { p.score = 0; p.answered = false; p.choice = null; });
      broadcastAll({ type: "lobby" });
      broadcastPlayerList();
      return;
    }
  });

  ws.on("close", () => {
    if (ws === hostWs) { hostWs = null; return; }
    if (players.has(ws)) {
      players.delete(ws);
      broadcastPlayerList();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Listening on port " + PORT));
