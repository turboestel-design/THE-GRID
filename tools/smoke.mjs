// Headless smoke test for THE GRID.
// Boots the real game (all js/*.js files, real Three.js, stubbed WebGL) and drives
// every realm, weapon, boss, forge purchase and death path to catch runtime crashes.
// Run with: npm test
import { boot } from './harness.mjs';

const { run: exec, errors } = boot(process.argv[2] || 'index.html');
const run = (label, expr) => exec(expr, label);

// 0. title screen and menu panels
run('menu:title', '[document.getElementById("menuTitle").textContent, document.getElementById("resume").textContent, paused]');
run('menu:enter', 'document.getElementById("resume").click(); [started, paused]');
run('menu:pause', 'setPaused(true); [document.getElementById("menuTitle").textContent, document.getElementById("resume").textContent]');
run('menu:panels', 'document.getElementById("navSettings").click(); ["panelSettings","panelWorlds","panelCredits"].map(i => document.getElementById(i).classList.contains("open"))');
run('menu:panelSwitch', 'document.getElementById("navWorlds").click(); ["panelSettings","panelWorlds"].map(i => document.getElementById(i).classList.contains("open"))');
run('menu:escape', 'document.dispatchEvent(new window.KeyboardEvent("keydown",{code:"Escape"})); document.getElementById("panelWorlds").classList.contains("open")');
run('menu:meta', 'shards = 12; refreshMenu(); document.getElementById("saveMeta").textContent');
run('menu:backIn', 'document.getElementById("resume").click(); paused');

// 1. probe
run('probe', 'typeof realm === "number" && typeof setRealm === "function"');

// 2. drive the loop a few times
run('loop', 'paused = false; for (let i = 0; i < 30; i++) loop();');

// 3. every realm: enter, step its update fn, fire every weapon
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
run('forge:open', 'paused = false; shards = 99; openForge(); [paused, forgeOpen]');
run('forge:buy', 'document.querySelectorAll("#forgeRows button").forEach(b => { b.click(); b.click(); }); [up.damage, up.vitality, up.swift, maxHp, shards]');
run('forge:close', 'closeForge(); forgeOpen');
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

if (errors.length) {
  console.log('FAIL');
  for (const e of [...new Set(errors)]) console.log(' -', e);
  process.exitCode = 1;
} else {
  console.log('PASS — 4 realms, 3 weapons, 3 enemy types, forge, lore, shards, checkpoint death, NG+ all OK');
}
