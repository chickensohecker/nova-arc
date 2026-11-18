# Nova Arc — a comet slingshot puzzle

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/chickensohecker/nova-arc/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/chickensohecker/nova-arc/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Bend your comet around planets, dodge the Maw, and sink it into the Star Gate.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
file server). No build step, no network requests, no assets to download — the
whole game is one canvas and a handful of ES modules.

- **Drag back from the comet** like a slingshot, aim with the dotted preview
  (it simulates your true flight path), and release to launch.
- **Planets pull your comet.** Use their gravity to curve around corners —
  touch one and you crash.
- **Black holes** drink comets whole. **Portals** fling you across the chart.
- **Reach the Star Gate** to clear the chart. Collect the cyan shards and keep
  shots spare for points; three stars need a clean run.
- Ten charts, from First Light to the Grand Arc. `R` restarts a chart,
  `M` mutes, `H` shows how to play.

## Layout

- `game/index.html` — the page, one canvas
- `game/src/main.js` — state machine and game loop
- `game/src/levels.js` — the ten charts
- `game/src/physics.js` — gravity, portals, black holes, trajectory preview
- `game/src/render.js` — everything drawn on the canvas
- `game/src/input.js` — mouse, touch and keyboard
- `game/src/audio.js` — synthesized WebAudio sound effects
- `game/src/particles.js` — trail, bursts, shake and floating text
- `game/src/config.js` — tuning constants and palette
- `game/src/random.js` — seeded starfields
- `game/src/shots.js` — deterministic `?shot=` states for screenshots
- `main.ts` — the entry program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json`
- `vendor/makefun-game.ts` — the make.fun dossier library, unchanged from the kit

## Screenshots

The four images under `screenshots/` are real renders of this code, taken in
headless Chrome with the deterministic states in `shots.json`:
`?shot=start`, `?shot=play`, `?shot=complete`, `?shot=failed`.

MIT licensed. Built for the make.fun best-game-01 bounty.

<sub>Entered on [make.fun](https://make.fun/?ref=34622d2x&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
