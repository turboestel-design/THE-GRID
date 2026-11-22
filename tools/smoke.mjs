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
run('menu:card', 'shards = 7; kills = 3; progress.owned.pistol = true; progress.max = 2; refreshMenu(); '
  + '["statWorld","statShards","statLore","statKills","statCycle","saveMeta"].map(i => document.getElementById(i).textContent)');
run('menu:nav', 'setPaused(true); closePanels(); selectNav(0); '
  + 'document.dispatchEvent(new window.KeyboardEvent("keydown",{code:"ArrowDown"})); navBtns()[navSel].id');
run('menu:navWrap', 'selectNav(0); document.dispatchEvent(new window.KeyboardEvent("keydown",{code:"ArrowUp"})); navBtns()[navSel].id');
run('menu:navEnter', 'closePanels(); selectNav(1); '
  + 'document.dispatchEvent(new window.KeyboardEvent("keydown",{code:"Enter"})); '
  + '[document.getElementById("panelHow").classList.contains("open"), anyPanelOpen()]');
run('menu:navEscape', 'document.dispatchEvent(new window.KeyboardEvent("keydown",{code:"Escape"})); anyPanelOpen()');
run('menu:wipeArm', 'document.getElementById("wipe").click(); '
  + '[document.getElementById("wipe").classList.contains("arm"), document.getElementById("wipe").textContent]');
run('qol:status', 'setPaused(true); health = 55; owned.shotgun = true; store.shotgun = 5; openPanel("panelStatus"); '
  + '(() => { const t = document.getElementById("statusBody").textContent; return [t.includes("SHOTGUN"), t.includes("55 / "), t.includes("Kills")]; })()');
run('qol:escResume', 'closePanels(); document.dispatchEvent(new window.KeyboardEvent("keydown",{code:"Escape"})); paused');
run('qol:escPause', 'document.dispatchEvent(new window.KeyboardEvent("keydown",{code:"Escape"})); paused');
run('qol:dmgDir', 'setRealm(1); spawnMobs(1); health = 100; (() => { for (const m of mobs) m.g.position.set(0, 0, 0); hurt(5); '
  + 'const el = document.getElementById("dmgDir"); return [el.style.opacity !== "0", el.style.transform.indexOf("rotate") === 0]; })()');
run('qol:blur', 'setPaused(false); window.dispatchEvent(new window.Event("blur")); paused');
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

// 4b. the dead: walkers that climb out of the ground, headshots and the horde
run('dead:kind', 'setRealm(1); spawnMobs(1); paused = false; [MOB_DEF.zombie.hp, MOB_DEF.zombie.name, mobs.filter(m => m.kind === "zombie").length]');
run('dead:rise', '(() => { const z = mobs.find(m => m.kind === "zombie"); for (let i = 0; i < 110; i++) updateMobs(0.016); return [z.rise <= 0, z.g.position.y > -0.2]; })()');
run('dead:body', '(() => { const z = mobs.find(m => m.kind === "zombie" && m.alive); hurtMob(z, 1, false); return z.alive; })()');
run('dead:headshot', '(() => { const z = mobs.find(m => m.kind === "zombie" && m.alive); hurtMob(z, 1, true); return z.alive; })()');
run('dead:gore', 'gorePool.filter(g => g.life > 0).length');
run('dead:horde', '(() => { hordeT = 0; updateHorde(0.016); return [hordeN, document.getElementById("hordeTag").style.display, document.getElementById("hordeNum").textContent]; })()');
run('dead:hordeCap', '(() => { for (let i = 0; i < 40; i++) { hordeT = 0; updateHorde(0.016); } return hordeAlive() <= HORDE_CAP + 2; })()');
run('dead:realmReset', 'setRealm(2); [hordeN, hordeT]');
run('lord:spawn', 'setRealm(1); spawnMobs(1); paused = false; (() => { const l = spawnLord(1); return [!!l, l.alive, Math.round(l.hp)]; })()');
run('lord:bar', 'bossInfo().name');
run('lord:summon', '(() => { const z0 = mobs.filter(m => m.kind === "zombie").length; lord.summon = 0; updateHordeLord(0.016); return mobs.filter(m => m.kind === "zombie").length > z0; })()');
run('lord:damage', '(() => { const h0 = lord.hp; hurtLord(5); return h0 - lord.hp; })()');
run('lord:kill', '(() => { hurtLord(9999); return [lord.alive, bossInfo().name]; })()');
run('lord:fade', '(() => { for (let i = 0; i < 130; i++) updateHordeLord(0.016); return [lord === null, lordLayer.children.length]; })()');

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
  console.log('PASS — 4 realms, 3 weapons, 4 enemy types, horde, gore, the Congregation, forge, lore, shards, checkpoint death, NG+ all OK');
}
