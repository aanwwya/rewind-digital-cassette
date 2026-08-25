# rewind digital cassette

**live demo:** https://aanwwya.github.io/rewind-digital-cassette/

rewind is a small static web app for making digital mixtapes.

pick a song, write a message, choose a theme, and send someone a little cassette or vinyl player with it. when they open the link, the player plays back the song card and reveals the message.

there's no account, backend, or database. the whole thing lives in the link itself.

## features

* cassette or vinyl player
* 4 visual themes
* play, pause, scrub, and progress tracking
* custom message with an optional signature
* optional memory image
* mood-based song suggestions
* shareable links with the full card state encoded in the url
* save the finished card as a png
* small details like film grain, sparkles, fades, and keyboard controls
* responsive layout

## stack

| part         | used                                    |
| ------------ | --------------------------------------- |
| markup       | semantic html5                          |
| styling      | vanilla css                             |
| logic        | vanilla javascript                      |
| sharing      | `urlsearchparams` + `history.pushstate` |
| image export | html `<canvas>`                         |
| hosting      | github pages                            |

no frameworks. no dependencies. no build step.

the site is essentially just html, css, and javascript.

## project structure

```text
digital-cassette-/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── LICENSE
├── package.json
└── README.md
```

## run locally

the project is fully static, so you can run it with any local http server.

```bash
npx serve .
```

or:

```bash
python3 -m http.server 8080
```

then open the local address shown by the server.

you can also open `index.html` directly, although some browser apis behave differently when running from `file://`.

## how it works

the app keeps everything in a small state object — song, artist, message, format, theme, and the rest of the card settings.

when a card is shared, that state is turned into url parameters. opening the link again rebuilds the same card from the url, so nothing needs to be stored on a server.

the player itself is simulated in javascript. a timer updates the current position and progress bar while css handles the cassette reels and vinyl rotation.

the save-as-image feature draws the finished card onto an offscreen canvas and exports it as a png.

## a few things i liked building

**stateless sharing**

the url is the data. there is no database sitting behind a shared card.

**no framework**

everything is written in vanilla html, css, and javascript, which makes the project fairly easy to follow from top to bottom.

**the little details**

most of the personality comes from the small things — spinning reels, vinyl grooves, grain, sparkles, transitions, and the different visual treatments for each theme.

## deploy

rewind is hosted on github pages.

pushing to the `main` branch redeploys the site.

## license

[mit](https://github.com/aanwwya/rewind-digital-cassette/blob/main/LICENSE)
