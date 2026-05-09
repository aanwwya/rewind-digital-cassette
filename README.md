# 📼 Rewind — Digital Cassette

> A love letter, in analog. Wrap a song around a personal message and send it as a vintage cassette tape or vinyl record.

**Live demo:** https://aanwwya.github.io/digital-cassette-/

Rewind is a static, single-page web app that lets you craft a shareable "mixtape moment" — pick a song, write a note, choose a theme, and the recipient opens a warm, animated cassette/vinyl player that reveals your message as it plays. Everything is encoded into a shareable URL, so there is no backend, no sign-up, and no database.

---

## ✨ Features

- **Two formats** — animated cassette tape (spinning reels) or vinyl record (rotating disc with grooves)
- **Four themes** — Soft Pink, Brown Vintage, Dark Night, Pastel Dreamy
- **Simulated player** — play / pause / scrub with a live progress bar and time counter
- **Custom message card** with optional sender signature and a "memory image" that reveals on play
- **Mood-based song suggestions** (Romantic, Sad, Happy, Nostalgic, Lofi)
- **Shareable links** — entire card state is encoded in URL query parameters
- **Save as image** — exports the message card to a PNG via `<canvas>`, no external libraries
- **Polish details** — film-grain overlay, floating sparkles, soft shake on form errors, keyboard shortcut (Space to play/pause)
- **Fully responsive** and accessible (semantic landmarks, `aria-hidden` on decorative elements)

---

## 🛠 Tech Stack

| Layer       | Tech                                                |
| ----------- | --------------------------------------------------- |
| Markup      | Semantic HTML5                                      |
| Styling     | Vanilla CSS3 (custom properties, gradients, keyframe animations) |
| Logic       | Vanilla JavaScript (ES6+) — no frameworks, no build step |
| Persistence | URL query parameters via `URLSearchParams` + `history.pushState` |
| Image export| HTML `<canvas>` 2D API                              |
| Hosting     | GitHub Pages                                        |

Zero dependencies. Zero build tools. The whole site is three files.

---

## 📁 Project Structure

```
digital-cassette-/
├── index.html            # Markup + page structure (Home, Create, Player)
├── assets/
│   ├── css/
│   │   └── style.css     # Design tokens, themes, layout, animations
│   └── js/
│       └── script.js     # State, routing, player sim, share link, canvas export
├── LICENSE
├── package.json          # Project metadata + local dev script
└── README.md
```

---

## 🚀 Run Locally

The project is fully static, so any HTTP server works. Easiest options:

```bash
# With Node (no install needed)
npx serve .

# Or with Python
python3 -m http.server 8080
```

Then open [http://localhost:3000](http://localhost:3000) (or whatever port the server prints).

You can also just double-click `index.html` — it works straight from the file system, although the Clipboard API falls back to the legacy path on `file://`.

---

## 🚢 Deploy

Hosted on **GitHub Pages** from the `main` branch / root directory. Pushing to `main` redeploys automatically.

---

## 🧠 How It Works

1. **Page routing** is a simple `showPage(id)` that toggles a `.hidden` class on three `<section class="page">` elements — no router, no framework.
2. **State** lives in a single `state` object in `script.js` (song, artist, message, format, theme, etc.).
3. **Sharing** serializes `state` into a query string (`?song=…&msg=…&fmt=…&theme=…`) and updates the URL with `history.pushState`. On load, `parseUrlAndLoad()` rehydrates the state and jumps directly to the player page.
4. **Player simulation** uses a `setInterval` that ticks `currentSeconds`, updates the progress bar width, and toggles a `.spinning` class on the cassette reels and vinyl disc to drive the CSS keyframe rotation.
5. **Card export** paints a gradient background, grain noise, song/artist/message text, and a wrapped quote onto an offscreen canvas, then triggers a download via `<a download>`.

---

## 🪄 Highlights

- **No framework, no build** — every byte is hand-written and intentional, which keeps load instant and the code easy to read top-to-bottom.
- **Stateless sharing** — by encoding the card into the URL, the app is fully serverless yet still feels personal and persistent.
- **Animation-first feel** — spinning reels, vinyl rotation, sparkles, grain, and gentle fades make a small project feel polished.

---

## 📜 License

[MIT](./LICENSE)
