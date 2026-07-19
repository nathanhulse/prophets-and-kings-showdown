const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const round1 = [
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

// Round 2 — Come, Follow Me, July 13-19 2026: "He Trusted in the Lord God of Israel" (2 Kings 16-25)
const round2 = [
  { cat: "fall", tag: "Israel falls", q: "Assyria conquered and scattered which kingdom, whose tribes became known as the 'lost tribes'?", a: ["Judah, in the south", "Israel, in the north", "Edom", "Moab"], c: 1 },
  { cat: "fall", tag: "Israel falls", q: "According to 2 Kings 17, why was Israel carried away captive?", a: ["A long famine", "They had worshipped other gods and rejected the Lord's commandments", "They lost a treaty with Egypt", "Their king died without an heir"], c: 1 },
  { cat: "hezekiah", tag: "Hezekiah", q: "What did Hezekiah do to the brass serpent Moses had made?", a: ["Placed it in the temple", "Broke it in pieces, because the people were burning incense to it", "Buried it in the desert", "Sent it to Assyria as tribute"], c: 1 },
  { cat: "hezekiah", tag: "Hezekiah", q: "2 Kings 18:5 says no king of Judah was like Hezekiah because he did what?", a: ["Built the largest temple", "Trusted in the Lord God of Israel", "Won the most battles", "Reigned the longest"], c: 1 },
  { cat: "hezekiah", tag: "Hezekiah", q: "Which empire, under King Sennacherib, invaded Judah and threatened Jerusalem?", a: ["Babylon", "Assyria", "Egypt", "Persia"], c: 1 },
  { cat: "hezekiah", tag: "Hezekiah", q: "When Hezekiah received a letter threatening Jerusalem, what did he do with it?", a: ["Burned it in anger", "Took it to the temple and spread it before the Lord", "Sent gold to buy peace", "Hid it from the people"], c: 1 },
  { cat: "hezekiah", tag: "Hezekiah", q: "Which prophet counseled and reassured Hezekiah during the Assyrian siege?", a: ["Isaiah", "Jeremiah", "Elisha", "Amos"], c: 0 },
  { cat: "hezekiah", tag: "Hezekiah", q: "How was Jerusalem delivered from the Assyrian army?", a: ["The walls of the enemy camp fell", "An angel of the Lord smote 185,000 Assyrians in one night", "Egypt arrived with an army", "Hezekiah paid a huge tribute"], c: 1 },
  { cat: "hezekiah", tag: "Hezekiah", q: "Isaiah told Hezekiah he would die. After Hezekiah wept and prayed, what happened?", a: ["The Lord added fifteen years to his life", "He died the next day", "He was struck blind", "He gave the throne to his son"], c: 0 },
  { cat: "hezekiah", tag: "Hezekiah", q: "What sign did the Lord give Hezekiah that he would be healed?", a: ["A rainbow over Jerusalem", "The shadow went backward ten degrees on the sundial", "Fire fell on the altar", "A dove landed on the temple"], c: 1 },
  { cat: "josiah", tag: "Josiah", q: "How old was Josiah when he became king of Judah?", a: ["Eight years old", "Sixteen years old", "Twenty-five years old", "Forty years old"], c: 0 },
  { cat: "josiah", tag: "Josiah", q: "While the temple was being repaired, what did Hilkiah the high priest find?", a: ["The ark of the covenant", "The book of the law", "A hidden treasure", "The rod of Aaron"], c: 1 },
  { cat: "josiah", tag: "Josiah", q: "When the book of the law was read aloud to Josiah, how did he react?", a: ["He rent (tore) his clothes", "He laughed", "He ordered it burned", "He fell asleep"], c: 0 },
  { cat: "josiah", tag: "Josiah", q: "Josiah sent his servants to inquire of the Lord from which prophetess?", a: ["Deborah", "Huldah", "Miriam", "Anna"], c: 1 },
  { cat: "josiah", tag: "Josiah", q: "Josiah kept a great feast such as had not been held since the days of the judges. Which feast?", a: ["The Passover", "The Feast of Tabernacles", "Pentecost", "The Day of Atonement"], c: 0 },
  { cat: "fall", tag: "Judah falls", q: "Which empire finally destroyed Jerusalem and burned the temple?", a: ["Assyria", "Babylon, under Nebuchadnezzar", "Rome", "Greece"], c: 1 },
];

const rounds = [
  { name: "Round 1", subtitle: "Elijah, Elisha, and the divided kingdom", questions: round1 },
  { name: "Round 2", subtitle: "Hezekiah, Josiah, and the fall of Judah", questions: round2 },
];

let currentRound = 0;
const questions = () => rounds[currentRound].questions;

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

function questionPayload(index) {
  const item = questions()[index];
  return {
    type: "question", index, total: questions().length,
    tag: item.tag, q: item.q, answers: item.a,
    round: currentRound, roundName: rounds[currentRound].name,
  };
}

function sendQuestion(index) {
  players.forEach(p => { p.answered = false; p.choice = null; });
  revealed = false;
  broadcastAll(questionPayload(index));
}

function sendReveal() {
  const item = questions()[currentQuestion];
  players.forEach(p => {
    if (p.answered && p.choice === item.c) p.score += 1;
  });
  revealed = true;
  broadcastAll({ type: "reveal", correctIndex: item.c, players: publicPlayerList() });
}

function sendFinal() {
  const leaderboard = publicPlayerList().sort((a, b) => b.score - a.score);
  broadcastAll({
    type: "final", leaderboard,
    round: currentRound, roundName: rounds[currentRound].name,
    nextRound: currentRound + 1 < rounds.length ? currentRound + 1 : null,
    nextRoundName: currentRound + 1 < rounds.length ? rounds[currentRound + 1].name : null,
  });
}

function roundMenu() {
  return rounds.map((r, i) => ({ index: i, name: r.name, subtitle: r.subtitle, count: r.questions.length }));
}

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    if (msg.type === "host_hello") {
      hostWs = ws;
      send(ws, { type: "rounds", rounds: roundMenu() });
      send(ws, { type: "player_list", players: publicPlayerList() });
      if (currentQuestion >= 0) {
        send(ws, questionPayload(currentQuestion));
        if (revealed) send(ws, { type: "reveal", correctIndex: questions()[currentQuestion].c, players: publicPlayerList() });
      }
      return;
    }

    if (msg.type === "join") {
      const id = crypto.randomBytes(4).toString("hex");
      players.set(ws, { id, name: String(msg.name || "Guest").slice(0, 18), avatar: msg.avatar || "\u{1F451}", score: 0, answered: false, choice: null });
      send(ws, { type: "joined", id });
      if (currentQuestion >= 0 && !revealed) {
        send(ws, questionPayload(currentQuestion));
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
      const r = Number(msg.round);
      currentRound = Number.isInteger(r) && r >= 0 && r < rounds.length ? r : 0;
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
      if (currentQuestion >= questions().length) {
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
      if (hostWs) send(hostWs, { type: "rounds", rounds: roundMenu() });
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
