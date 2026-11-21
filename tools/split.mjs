// Splits the monolithic game script into ordered files.
// Guarantees: concatenating every generated file (minus the added banner
// comments) reproduces the original script byte for byte.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'index.html');
const html = fs.readFileSync(SRC, 'utf8');
const lines = html.split('\n');           // 1-based line numbers below

// [file, firstLine, lastLine, banner]
const PLAN = [
  ['00-core.js',        156, 225, 'Renderer, scene, camera, lights, ground and the dead trees.'],
  ['10-forest.js',      226, 306, 'World 1 scenery: the cabin, its door, and the E-to-interact prompt.'],
  ['15-hud.js',         307, 328, 'HUD element handles (health, message, crosshair, fade) and the ammo elements.'],
  ['20-heaven.js',      329, 392, 'The Cloud Stairs: where you wait when you die.'],
  ['25-tall-man.js',    393, 461, 'THE TALL MAN — the boss of world 1.'],
  ['30-world-2-glow.js',462, 652, 'World 2: THE HOLLOW GLOW — the fungus forest, its sky and THE BLOOM.'],
  ['35-gun.js',         653, 684, 'The pistol view model, muzzle light and the raycaster every shot uses.'],
  ['40-weapons.js',     685, 743, 'The weapon table, switching, ammo stores and the shot sound.'],
  ['45-world-3-ash.js', 744, 852, 'World 3: THE ASHEN WASTE — the black sun and the Cinder Hounds.'],
  ['50-world-4-eclipse.js', 853, 989, 'World 4: THE ECLIPSE — the arena, the orbs and THE HOLLOW KING.'],
  ['55-pickups.js',     990, 1030, 'Floating pickups: weapons, ammo crates and health.'],
  ['60-enemies.js',     1031, 1260, 'Act II enemies: husks, spitters and wisps, plus the mid-boss wave.'],
  ['61-shards.js',      1261, 1296, 'Shards — the currency that survives death.'],
  ['62-forge.js',       1297, 1379, 'THE FORGE and the three upgrades it sells.'],
  ['63-lore.js',        1380, 1438, 'Twelve lore fragments and the card that shows them.'],
  ['64-interact.js',    1439, 1466, 'Shared prompt scanning and world-entry dispatch.'],
  ['70-combat-realms.js', 1467, 1635, 'Shooting resolution, boss health bar, portals, realm switching and teleporting.'],
  ['75-qol.js',         1636, 1709, 'Objective compass, health regen, save/load and hit markers.'],
  ['80-settings.js',    1710, 1894, 'The full settings schema, the settings UI and how it is applied.'],
  ['85-input.js',       1895, 1943, 'Keyboard, mouse, touch look and the on-screen joystick.'],
  ['90-audio.js',       1944, 2035, 'The procedural audio engine — everything is synthesised, no sound files.'],
  ['95-pause.js',       2036, 2062, 'The pause menu.'],
  ['99-loop.js',        2063, 2211, 'Movement, jumping, head bob and the main frame loop. Boots the game at the end.'],
];

const scriptStart = lines.findIndex(l => l.trim() === '<script>') + 1;      // 0-based index of first JS line
const scriptEnd = lines.findIndex(l => l.trim() === '</script>');            // 0-based index of </script>
if (scriptStart !== 155 || scriptEnd !== 2211) {
  throw new Error(`unexpected script bounds: ${scriptStart + 1}..${scriptEnd + 1}`);
}
const original = lines.slice(scriptStart, scriptEnd).join('\n');

// carve
let joined = '';
const banner = (text) => `/* THE GRID — ${text}\n   Classic script: every file shares one global scope, loaded in the order used by\n   index.html. Splitting this file cannot change behaviour. */\n`;

for (const [name, from, to, desc] of PLAN) {
  const body = lines.slice(from - 1, to).join('\n');
  joined += body + '\n';
  fs.mkdirSync(path.join(ROOT, 'js'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'js', name), banner(desc) + body + '\n');
}

// verify byte-identical concatenation
const reparsed = PLAN.map(([name]) => fs.readFileSync(path.join(ROOT, 'js', name), 'utf8')
  .replace(/^\/\* THE GRID — [\s\S]*?\*\/\n/, ''))
  .join('').replace(/\n$/, '');
if (reparsed !== original) {
  const a = reparsed.split('\n'), b = original.split('\n');
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  throw new Error(`mismatch at line ${i + 1}:\n  got: ${a[i]}\n  exp: ${b[i]}`);
}

// stylesheet
const styleOpen = lines.indexOf('<style>'), styleClose = lines.indexOf('</style>');
fs.mkdirSync(path.join(ROOT, 'css'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'css', 'style.css'),
  lines.slice(styleOpen + 1, styleClose).join('\n').replace(/^\n/, '') + '\n');

// rebuild index.html
const before = lines.slice(0, styleOpen).join('\n');
const between = lines.slice(styleClose + 1, scriptStart - 1).join('\n'); // body markup + cdn script tag
const tags = PLAN.map(([name]) => `<script src="js/${name}"></script>`).join('\n');
const out = `${before}\n<link rel="stylesheet" href="css/style.css">${between}\n${tags}\n</body>\n</html>\n`;
fs.writeFileSync(SRC, out);

console.log(`split into ${PLAN.length} js files + css/style.css — concatenation verified identical (${original.split('\n').length} lines)`);
