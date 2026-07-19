# Prophets & Kings Showdown — phone edition

A live, multiplayer version of the Elijah/Elisha review game. One screen (projector) shows
the questions and a QR code; everyone else joins on their own phone, picks a name and an
icon, and answers in real time.

## Run it locally (to try it before deploying)

```
npm install
npm start
```

Then open:
- `http://localhost:3000/host.html` — the screen you project
- `http://localhost:3000/` — the player join page (open this on your phone, on the same Wi-Fi,
  using your computer's local IP instead of localhost, e.g. `http://192.168.1.23:3000`)

## It's already deployed

- **Project this:** https://prophets-and-kings-showdown.onrender.com/host.html
- **Players join at:** https://prophets-and-kings-showdown.onrender.com (or scan the QR)

Pushing to `main` on the GitHub repo auto-deploys to Render, so editing questions and
pushing is all it takes to update the live game.

Render's free tier sleeps after about 15 minutes of inactivity and takes ~50 seconds to
wake. Open the host URL a minute or two before class so a room full of phones doesn't
hit a cold start all at once.

Deploy settings, if it ever needs rebuilding: build command `npm install`, start command
`npm start`. These are also in `render.yaml`, so a fresh Render Blueprint deploy picks
them up with no manual configuration.

## How it works

- `server.js` — Node/Express server plus a WebSocket game loop (join, start, answer,
  reveal, next, restart). All questions and scoring live here.
- `public/index.html` — the player's phone screen: name + icon picker, then questions.
- `public/host.html` — the projector screen: QR code, live roster, live answer tally,
  reveal, and leaderboard.

To add or edit questions, edit the round arrays at the top of `server.js` — they're
shared by both the host and player views automatically:

- `round1` — Elijah, Elisha, and the divided kingdom (1 Kings 17 – 2 Kings 6)
- `round2` — Hezekiah, Josiah, and the fall of Judah (2 Kings 16–25)

Each question is `{ cat, tag, q, a: [four answers], c: index of the correct answer }`.
The `tag` is what shows in the little banner above the question. Note that `c` is
zero-based, so `c: 1` means the *second* answer is correct.

To add a Round 3, write another array and add it to the `rounds` list below them:

```js
const rounds = [
  { name: "Round 1", subtitle: "Elijah, Elisha, and the divided kingdom", questions: round1 },
  { name: "Round 2", subtitle: "Hezekiah, Josiah, and the fall of Judah", questions: round2 },
];
```

The lobby builds its round buttons from that list, so a new round shows up on the
projector automatically — no other changes needed. Rounds don't have to be the same
length, and each round starts everyone back at zero.
