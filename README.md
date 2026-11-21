# THE GRID

A first-person horror shooter that runs from a single HTML file. No assets, no build step — every
texture, sound and enemy is generated at runtime.

**Play:** open `index.html`, or `npm start` and open <http://localhost:8000>.

```
WASD      move            CLICK   shoot          E    interact
SHIFT     run             Q / 1-3 switch weapon  P    pause
SPACE     jump            M       mute           ESC  pause (releases mouse)
```

## The game

Four worlds, each behind the death of the one before it:

| World | Place | Who is waiting |
|---|---|---|
| 1 | The Dead Forest — a cabin, a pistol, a forest that will not end | **The Tall Man** |
| 2 | The Hollow Glow — a fungus forest under a ringed planet | **The Bloom** |
| 3 | The Ashen Waste — bone fields, a black sun, a pack | **The Cinder Hounds** |
| 4 | The Eclipse — a circular arena built to keep something in | **The Hollow King** |

Between the fighting: shards to collect, a Forge in every world to spend them at, twelve lore
fragments, and a Cloud Stairs purgatory that returns you to whichever world killed you.

Dying costs you time, not progress. Beating the King starts a new cycle with everything angrier.

## Development

```
npm install
npm test        # headless regression suite: 4 worlds, 3 weapons, bosses, forge, lore, NG+
npm start       # static server on :8000
```

Everything lives in `index.html`. `tools/smoke.mjs` boots the real game in jsdom with Three.js and
stubbed WebGL, then drives every realm and menu path — so changes can be made without guessing.

See [ROADMAP.md](ROADMAP.md) for where this is going and why.
