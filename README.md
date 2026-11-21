# THE GRID

A first-person horror shooter that runs from a single HTML file. No image or audio assets, no build
step — every texture, sound and enemy is generated at runtime, and Three.js is vendored so it works
completely offline.

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

## Project layout

```
index.html              markup + the script load order
vendor/three.min.js     Three.js r128, vendored so the game needs no network
css/style.css           all styling, including the menus and HUD
js/
  00-core.js            renderer, scene, camera, lights, ground, trees
  10-forest.js          world 1 scenery: the cabin, its door, the E-prompt
  15-hud.js             HUD element handles
  20-heaven.js          the Cloud Stairs
  25-tall-man.js        boss: THE TALL MAN
  30-world-2-glow.js    world 2 scenery + boss: THE BLOOM
  35-gun.js             pistol view model + the shared raycaster
  40-weapons.js         weapon table, switching, ammo, gunshot audio
  45-world-3-ash.js     world 3 scenery + Cinder Hounds
  50-world-4-eclipse.js world 4 arena + boss: THE HOLLOW KING
  55-pickups.js         floating weapons, ammo and health
  60-enemies.js         husks, spitters, wisps, the mid-boss wave
  61-shards.js          shard currency
  62-forge.js           the Forge and its upgrades
  63-lore.js            the twelve lore fragments
  64-interact.js        prompt scanning, world-entry dispatch
  70-combat-realms.js   shot resolution, boss bar, portals, realm switching
  75-qol.js             objective compass, regen, save/load, hit markers
  80-settings.js        settings schema, settings UI, applying settings
  85-input.js           keyboard, mouse, touch look, joystick
  90-audio.js           procedural audio engine (no sound files)
  95-pause.js           title screen, pause menu and its panels
  99-loop.js            movement, jump, head bob, the frame loop, boot
tools/
  harness.mjs           boots the game headless (jsdom + real Three.js)
  smoke.mjs             regression suite          -> npm test
  build.mjs             bundles back to one file  -> npm run build
  split.mjs             the one-off script that produced this layout
```

The 23 scripts are **classic scripts, not modules**: they share one global scope and run in the
order listed in `index.html`. That means files can be edited independently, but a file may only use
something declared in a file loaded *before* it. Moving a script tag earlier can break the game —
if you reorder, run `npm test`.

## Development

```
npm install
npm test                # headless regression suite (all realms, weapons, bosses, forge, lore, NG+)
npm run build           # bundles everything into the-grid.html (single file, for sharing)
npm start               # static server on :8000
```

`tools/smoke.mjs` boots the real game in jsdom with Three.js and stubbed WebGL, then drives every
realm and menu path — so changes can be verified without a browser.

See [ROADMAP.md](ROADMAP.md) for where this is going and why.
