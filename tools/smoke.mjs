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
run('home:locked', 'progress.max = 1; progress.cleared = false; progress.cycle = 0; setRealm(1); shards = 9999; buildForgeUI(); '
  + '(() => { const b = [...document.querySelectorAll("#forgeRows button")].find(x => x.textContent.includes("CABIN")); '
  + 'return [homeUnlocked(), b.disabled, document.querySelectorAll("#forgeRows .cost")[3].textContent]; })()');
run('home:unlock', 'progress.cleared = true; buildForgeUI(); '
  + '(() => { const b = [...document.querySelectorAll("#forgeRows button")].find(x => x.textContent.includes("CABIN")); return b.disabled; })()');
run('home:table', '(() => { progress.interior = 1; interiorVisual(); const a = coffeeTable.visible; '
  + 'progress.interior = 2; interiorVisual(); return [a, coffeeTable.visible]; })()');
run('home:hitboxes', '(() => { progress.house = 6; progress.interior = 8; realm = 1; '
  + 'const b = homeBoxes(); return [b.length, b.every(x => x.length === 4 && x[2] > x[0] && x[3] > x[1])]; })()');
run('home:table-box', '(() => { progress.interior = 2; return homeBoxes()[0]; })()');
run('home:gate-gap', '(() => { progress.house = 6; return homeBoxes().filter(b => b[1] < -6.3 && b[3] > -6.6 && b[0] < 0.35 && b[2] > -0.35).length; })()');
run('home:no-ghost-wall', '(() => { progress.house = 6; const hit = () => homeBoxes().filter(b => b[0] <= 0 && b[2] >= 0 && b[1] <= -11.9 && b[3] >= -12.3).length; '
  + 'progress.interior = 1; const empty = hit(); progress.interior = 2; return [empty, hit()]; })()');
run('home:mob-fence', '(() => { setRealm(1); spawnMobs(1); progress.house = 4; const z = mobs.find(m => m.kind === "zombie"); z.rise = 0; '
  + 'z.g.position.set(3, 0, -5.2); for (let i = 0; i < 20; i++) mobMove(z, 0, -0.15); return z.g.position.z > -6.0; })()');
run('house:costs', '[0, 1, 4, 9].map(houseCost)');
run('house:buy', '(() => { setRealm(1); paused = false; shards = 2000; openForge(); '
  + 'const b = [...document.querySelectorAll("#forgeRows button")].find(x => x.textContent.includes("CABIN")); '
  + 'const m0 = maxHp; b.click(); return [progress.house, maxHp - m0, shards]; })()');
run('house:max', '(() => { for (let i = 0; i < 12; i++) { const b = [...document.querySelectorAll("#forgeRows button")].find(x => x.textContent.includes("CABIN")); if (b && !b.disabled) b.click(); } '
  + 'return [progress.house, maxHp, houseWindows.filter(w => w.visible).length]; })()');
run('house:heal', '(() => { closeForge(); health = 30; camera.position.set(0, 1.65, -11); paused = false; '
  + 'for (let i = 0; i < 100; i++) updateHouse(0.05); return health > 30; })()');
run('house:stages', '[0,1,2,3,4,5,6,7,8,9,10].map(l => { progress.house = l; houseVisual(); return houseStages.filter(s => s.g.visible).length; })');
run('house:animate', '(() => { for (let l = 0; l <= 10; l++) { progress.house = l; houseVisual(); for (let i = 0; i < 5; i++) houseAnimate(0.05); } return true; })()');
run('interior:stages', '[0,1,5,10].map(l => { progress.interior = l; interiorVisual(); return interiorStages.filter(s => s.g.visible).length; })');
run('interior:buy', '(() => { progress.interior = 0; paused = false; shards = 2000; openForge(); '
  + 'const b = [...document.querySelectorAll("#forgeRows button")].find(x => x.textContent.includes("FURNISH")); '
  + 'b.click(); return [progress.interior, shards]; })()');
run('interior:animate', '(() => { for (let l = 0; l <= 10; l++) { progress.interior = l; interiorVisual(); for (let i = 0; i < 4; i++) interiorAnimate(0.05); } return true; })()');
run('warp:world1', '(() => { buildWarp(); return [...document.querySelectorAll("#warp button")].some(b => b.textContent.indexOf("World 1") === 0); })()');
run('lore:read', 'for (const g of loreItems) readLore(g.userData.i); [loreFound, Object.keys(progress.lore).length]');
run('interact:scan', 'camera.position.set(-6, 1.65, 2); scanInteractors(); [nearLore, !!nearForge]');
run('save:roundtrip', 'saveAll(); [JSON.parse(localStorage.getItem(SKEY)).progress.shards, JSON.parse(localStorage.getItem(SKEY)).progress.up.damage]');
run('cheat:infShards', 'settings.infShards = true; shards = 3; paused = false; updateQoL(0.016); [shards > 999, DEF.infShards]');
run('cheat:infShardsOff', 'settings.infShards = false; shards = 5; updateQoL(0.016); shards');

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
run('dim:realm', 'setRealm(5); [realm, dim.visible, REALM_NAME[5]]');
run('dim:wave', '(() => { dimActive = true; dimWave = 0; dimWaveT = 0; updateDimension(0.016); return [dimWave, mobs.filter(m => m.realm === 5).length]; })()');
run('dim:objective', 'objective().t');
run('dim:rift', '(() => { camera.position.set(ZX, 1.65, 14); paused = false; dead = false; heaven = false; updateDimension(0.016); updateDoor(0.016); return [nearRift, action]; })()');
run('dim:clamp', 'clampToRealm(ZX + 999, 999, 5)');
run('dim:move', '(() => { setRealm(5); camera.position.set(ZX, 1.65, 14); paused = false; dead = false; teleporting = false; '
  + 'keys.KeyW = true; keys.KeyD = true; for (let i = 0; i < 30; i++) loop(); keys.KeyW = false; keys.KeyD = false; '
  + 'return [isFinite(camera.position.x), isFinite(camera.position.z), camera.position.x > ZX - 60]; })()');
run('dim:bossbar', 'bossInfo().name');
run('dim:leave', '(() => { resetDimension(); setRealm(1); return [realm, dim.visible, dimActive]; })()');

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
  console.log('PASS — 4 realms, 3 weapons, 4 enemy types, horde, gore, the Congregation, the Zombie Dimension, house upgrades, interior, house hitboxes, forge, lore, shards, checkpoint death, NG+ all OK');
}
