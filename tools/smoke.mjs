// Headless smoke test for THE GRID.
// Loads the real Three.js + jsdom, stubs only WebGL/canvas/audio, then drives
// every realm and combat path to catch runtime crashes.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import * as THREE from 'three';

const ROOT = path.resolve(import.meta.dirname, '..');
const file = process.argv[2] || 'index.html';
const html = fs.readFileSync(path.join(ROOT, file), 'utf8');

const scriptMatch = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (!scriptMatch.length) throw new Error('no inline script found');
const code = scriptMatch[scriptMatch.length - 1][1];

const errors = [];
const dom = new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/g, ''), {
  url: 'https://the-grid.test/',
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});
const { window } = dom;

// ---- stub a 2D canvas context (jsdom has no canvas backend) ----
const gradient = { addColorStop() {} };
function ctx2d() {
  return new Proxy({}, {
    get(t, k) {
      if (k === 'canvas') return { width: 256, height: 256 };
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => gradient;
      if (k === 'createPattern') return () => ({});
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (k in t) return t[k];
      return typeof k === 'string' ? () => {} : undefined;
    },
    set(t, k, v) { t[k] = v; return true; },
  });
}
window.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === '2d') return this.__ctx || (this.__ctx = ctx2d());
  return null;
};
window.HTMLCanvasElement.prototype.toDataURL = () => 'data:,';

// ---- stub WebGL renderer ----
class FakeRenderer {
  constructor() {
    this.domElement = window.document.createElement('canvas');
    this.capabilities = { getMaxAnisotropy: () => 4 };
    this._pr = 1;
  }
  setPixelRatio(v) { this._pr = v; }
  getPixelRatio() { return this._pr; }
  setSize() {}
  render() { this.renders = (this.renders || 0) + 1; }
  dispose() {}
}
const THREE_STUB = Object.create(null);
for (const k of Object.keys(THREE)) THREE_STUB[k] = THREE[k];
THREE_STUB.WebGLRenderer = FakeRenderer;

if (!window.matchMedia) {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
}
window.devicePixelRatio = 1;
window.innerWidth = 1280;
window.innerHeight = 720;
window.requestAnimationFrame = () => 0; // drive the loop manually
window.cancelAnimationFrame = () => {};

// capture runtime + console errors
window.addEventListener('error', e => errors.push('window error: ' + e.message));
const origError = console.error;
console.error = (...a) => { errors.push('console.error: ' + a.join(' ')); };

Object.assign(window, { THREE: THREE_STUB });
const context = dom.getInternalVMContext();

function run(label, expr) {
  try { return vm.runInContext(expr, context, { filename: label }); }
  catch (e) { errors.push(`[${label}] ${e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : e}`); return undefined; }
}

// 1. boot
run('boot', code);
const booted = run('probe', 'typeof realm === "number" && typeof setRealm === "function"');

// 2. drive the loop a few times
run('loop', 'paused = false; for (let i = 0; i < 30; i++) loop();');

// 3. every realm: enter, step its update fn, fire every weapon, check collisions
const realms = [
  ['realm1', 'setRealm(1)'],
  ['realm2', 'enterRealm2()'],
  ['realm3', 'enterRealm3()'],
  ['realm4', 'enterRealm4()'],
];
for (const [name, enter] of realms) {
  run(name + ':enter', enter);
  run(name + ':frames', 'paused = false; for (let i = 0; i < 40; i++) loop();');
  for (const w of ['pistol', 'shotgun', 'rifle']) {
    run(`${name}:shoot:${w}`, `owned.${w} = true; selectWeapon('${w}'); ammo = 99; for (let i = 0; i < 10; i++) { shootCd = 0; shoot(); }`);
  }
  run(name + ':updates', 'for (const f of [updateMan, updateBeast, updateHounds, updateKing, updatePortals, updatePickups, updateWorlds, updateBars, updateQoL, updateHeaven]) f(0.016);');
}

// 4. kill every boss and walk the portal chain
run('kill:man', 'manHp = 1; hurtMan(99);');
run('kill:beast', 'beastHp = 1; hurtBeast(99);');
run('kill:hounds', 'hounds.forEach(h => hurtHound(h, 99));');
run('kill:king', 'kingHp = 1; hurtKing(99);');

// 4b. act II: mobs, shards, forge, lore, waves
for (const [name, enter] of realms) {
  run(name + ':mobs', enter + '; [mobs.filter(m => m.realm === realm).length, mobs.filter(m => m.g.visible).length]');
  run(name + ':killmobs', 'for (const m of mobs.slice()) if (m.realm === realm) hurtMob(m, 999); [kills, shardPicks.length]');
  run(name + ':mobupdates', 'for (let i = 0; i < 60; i++) { updateMobs(1/60); updateMobShots(1/60); updateShards(1/60); updateWaves(); }');
}
run('forge:open', 'shards = 99; openForge();');
run('forge:buy', 'document.querySelectorAll("#forgeRows button").forEach((b, i) => { b.click(); b.click(); }); [up.damage, up.vitality, up.swift, maxHp, shards]');
run('forge:close', 'closeForge();');
run('lore:read', 'for (const g of loreItems) readLore(g.userData.i); [loreFound, Object.keys(progress.lore).length]');
run('interact:scan', 'camera.position.set(-6, 1.65, 2); scanInteractors(); [nearLore, !!nearForge]');
run('save:roundtrip', 'saveAll(); [JSON.parse(localStorage.getItem(SKEY)).progress.shards, JSON.parse(localStorage.getItem(SKEY)).progress.up.damage]');

// 5. death + heaven + respawn paths
for (const r of [1, 2, 3, 4]) {
  run(`death:realm${r}`, `enterRealmByIndex(${r}); health = maxHp; die(); [deathRealm, dead]`);
  run(`heaven:exit${r}`, 'enterHeaven(); exitHeaven(); realm');
}
run('death', 'health = 100; hurt(999);');
run('heaven:exit', 'exitHeaven();');
run('ending:panel', 'enterRealm4(); kingHp = 1; hurtKing(99); ending(); document.getElementById("endWrap").style.display');
run('ending:ngplus', 'document.getElementById("endNext").click(); [progress.cycle, realm, teleporting]');
run('respawn', 'respawnHere();');
run('pickups', 'for (const it of items) { camera.position.set(it.wx, 1.65, it.wz); updatePickups(0.016); }');

console.error = origError;

const stats = {
  booted: !!booted,
  errors: errors.length,
};
if (errors.length) {
  console.log('FAIL');
  for (const e of [...new Set(errors)]) console.log(' -', e);
  process.exitCode = 1;
} else {
  console.log('PASS — 4 realms, 3 weapons, 3 enemy types, forge, lore, shards, checkpoint death, NG+ all OK');
}
