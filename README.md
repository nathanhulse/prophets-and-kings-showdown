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

## Deploy it so people can scan a QR code from anywhere

This needs a small always-on server, since phones and the projector have to stay in sync in
real time. The free tier of **Render** works well and is what was used last time:

1. Put this folder in a GitHub repo (or ask to have it pushed for you).
2. Go to [render.com](https://render.com) → **New Web Service** → connect the repo.
3. Build command: `npm install`  ·  Start command: `npm start`
4. Deploy. Render gives you a URL like `yourgame.onrender.com`.
5. Open `yourgame.onrender.com/host.html` and project it — the QR code and join link
   update automatically to the live URL.

Render's free tier sleeps after inactivity, so open the host URL yourself a minute or two
before class to wake it up.

If you'd rather not deal with GitHub/Render yourself, Claude Code or Cowork can push this
to a repo and deploy it for you in one go — just hand this folder over there.

## How it works

- `server.js` — Node/Express server plus a WebSocket game loop (join, start, answer,
  reveal, next, restart). All questions and scoring live here.
- `public/index.html` — the player's phone screen: name + icon picker, then questions.
- `public/host.html` — the projector screen: QR code, live roster, live answer tally,
  reveal, and leaderboard.

To add or edit questions, edit the `questions` array at the top of `server.js` — it's
shared by both the host and player views automatically.
