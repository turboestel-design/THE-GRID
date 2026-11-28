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
run('wall:los', '(() => { setRealm(1); doorOpen = false; doorAngle = 0; const shut = wallBetween(0, -8.3, 0, -9.7); '
  + 'doorOpen = true; doorAngle = 1.75; const open = wallBetween(0, -8.3, 0, -9.7); doorOpen = false; doorAngle = 0; return [shut, open]; })()');
run('wall:melee', '(() => { setRealm(1); paused = false; dead = false; heaven = false; settings.god = false; mobs.length = 0; spawnMobs(1); '
  + 'const z = mobs.find(m => m.kind === "zombie"); z.rise = 0; z.g.position.set(0, 0, -8.3); z.atk = 0; camera.position.set(0, 1.65, -9.7); '
  + 'health = 100; updateMobs(0.05); const thruWall = health; doorOpen = true; doorAngle = 1.75; z.atk = 0; camera.position.set(0, 1.65, -9.4); '
  + 'updateMobs(0.05); const thruDoor = health < 100; doorOpen = false; doorAngle = 0; health = 100; return [thruWall, thruDoor]; })()');
run('wall:spit', '(() => { mobs.length = 0; spawnMobs(2); const sp = mobs.find(m => m.kind === "spitter"); if (!sp) return true; '
  + 'sp.rise = 0; sp.g.position.set(0, 0.2, -8.4); sp.atk = 0; camera.position.set(0, 1.65, -12); '
  + 'mobShots.forEach(s => { s.life = 0; }); updateMobs(0.05); return mobShots.filter(s => s.life > 0).length; })()');
run('wall:shoot', '(() => { camera.position.set(0, 1.65, -9.6); camera.lookAt(0, 1.6, -20); camera.updateMatrixWorld(); '
  + 'const r = new THREE.Raycaster(); r.setFromCamera({x: 0, y: 0}, camera); const h = r.intersectObjects(targetsFor(), true)[0]; '
  + 'return h ? h.object.geometry.type : null; })()');
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
run('rest:sit', '(() => { progress.interior = 10; interiorVisual(); setRealm(1); paused = false; dead = false; heaven = false; '
  + 'camera.position.set(-0.95, 1.65, -11.6); updateDoor(0.016); const a = action; useAction(); '
  + 'return [a, resting && resting.kind, prompt.textContent]; })()');
run('rest:locked', 'for (let i = 0; i < 3; i++) loop(); [+camera.position.x.toFixed(2), +camera.position.y.toFixed(2), +camera.position.z.toFixed(2)]');
run('rest:stand', 'keys.KeyW = true; loop(); keys.KeyW = false; [resting === null, +camera.position.y.toFixed(2)]');
run('rest:bed', '(() => { camera.position.set(-2.6, 1.65, -11.9); updateDoor(0.016); const a = action; useAction(); '
  + 'const kind = resting && resting.kind; for (let i = 0; i < 3; i++) loop(); const y = +camera.position.y.toFixed(2); '
  + 'standUp(); return [a, kind, y, resting === null]; })()');
run('rest:bed-clear', '(() => { progress.interior = 10; interiorVisual(); camera.position.set(-2.6, 1.65, -13.6); updateDoor(0.016); useAction(); '
  + 'loop(); const down = new THREE.Raycaster(camera.position.clone(), new THREE.Vector3(0, -1, 0), 0, 3)'
  + '.intersectObjects(scene.children, true).filter(h => h.object.visible !== false)[0]; '
  + 'const back = new THREE.Raycaster(camera.position.clone(), new THREE.Vector3(0, 0, -1), 0, 3)'
  + '.intersectObjects(scene.children, true).filter(h => h.object.visible !== false)[0]; '
  + 'const ahead = new THREE.Raycaster(camera.position.clone(), new THREE.Vector3(0, 0, 1), 0, 1)'
  + '.intersectObjects(scene.children, true).filter(h => h.object.visible !== false).length; '
  + 'const r = [down ? +down.distance.toFixed(2) : 9, back ? +back.distance.toFixed(2) : 9, ahead]; '
  + 'standUp(); return r; })()');
run('rest:gated', '(() => { progress.interior = 1; camera.position.set(-0.95, 1.65, -11.6); updateDoor(0.016); return action; })()');
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
run('dim:atmos', '(() => { setRealm(5); paused = false; dead = false; for (let i = 0; i < 30; i++) dimAtmos(0.016); '
  + 'return [typeof dimFx, dimFx.braziers.length, dimFx.crows.length, dimFx.cracks.length, dimFx.mist.length, +scene.fog.density.toFixed(3)]; })()');
run('dim:bestiary', `(() => {
  setRealm(5); paused = false; dead = false;
  const kinds = ['crawler', 'hound', 'rattle', 'screamer', 'bloat', 'brute',
    'glow_echo', 'cinder_hound', 'tall_echo', 'king_echo', 'angel'];
  const built = kinds.filter(k => { try { const m = dimMakeMob(k, ZX + 30, 40); return m.alive && typeof m.tick === 'function'; } catch (e) { return false; } });
  return [kinds.length, built.length, Object.keys(MOB_DEF).length];
})()`);
run('dim:crew', '(() => { const r = k => dimWaveCrew(k, 12); '
  + 'const early = r(1).every(k => k === "zombie"); '
  + 'const late = r(12); '
  + 'return [early, late.includes("brute"), late.filter(k => k === "brute").length <= 2, late.length]; })()');
run('dim:gate', `(() => {
  const guests = ['glow_echo', 'cinder_hound', 'tall_echo', 'king_echo', 'angel'];
  const noneEarly = [1, 2, 3, 5, 7, 9, 10].every(r => dimWaveCrew(r, 18).every(k => !guests.includes(k)));
  const eachAt = guests.every(k => dimWaveCrew(DIM_UNLOCK[k], 18).includes(k));
  const cap = {tall_echo: 1, king_echo: 1, angel: 1, glow_echo: 2, cinder_hound: 2};
  const capped = [14, 16, 18, 20, 22, 30].every(r => guests.every(k => dimWaveCrew(r, 18).filter(x => x === k).length <= cap[k]));
  const order = guests.map(k => DIM_UNLOCK[k]).every((v, i, arr) => i === 0 || v > arr[i - 1]);
  return [noneEarly, eachAt, capped, order];
})()`);
run('dim:guests', `(() => {
  clearDimensionMobs(); setRealm(5); paused = false; dead = false;
  const kinds = ['glow_echo', 'cinder_hound', 'tall_echo', 'king_echo', 'angel'];
  const made = {}; let ok = 0;
  for (const k of kinds) {
    try {
      const m = dimMakeMob(k, ZX + 30, 40); made[k] = m;
      for (let i = 0; i < 5; i++) { dimAnimate(m, true, 0.016); m.tick(m, 0.016); }
      if (m.alive && MOB_DEF[k].name) ok++;
    } catch (e) { made[k] = null; }
  }
  return [kinds.length, ok, made.angel.g.position.y > 0.1, Math.abs(made.angel.g.userData.halo.rotation.z) > 0,
    made.cinder_hound.g.userData.legs.length, made.tall_echo.g.userData.legs.length,
    Math.abs(made.glow_echo.g.userData.ring.rotation.z) > 0];
})()`);
run('dim:angel-shot', `(() => {
  clearDimensionMobs(); setRealm(5); paused = false; dead = false; health = 9999;
  camera.position.set(ZX, 1.65, 14);
  const a = dimMakeMob('angel', ZX + 4, 20); tuneDimMob(a, 18, false);
  let seen = 0;
  for (let i = 0; i < 420; i++) { updateMobs(1 / 60); updateMobShots(1 / 60);
    seen = Math.max(seen, mobShots.filter(s => s.life > 0).length); }
  const d = Math.hypot(a.g.position.x - camera.position.x, a.g.position.z - camera.position.z);
  return [seen > 0, d > 5 && d < 11, MOB_DEF.angel.style];
})()`);
run('dim:visitors', `(() => {
  clearDimensionMobs(); setRealm(5); paused = false; dead = false;
  const kinds = ['cinder_hound', 'tall_man', 'hollow_king'];
  const made = {}; let ok = 0, leaked = 0;
  for (const k of kinds) {
    try {
      const m = dimMakeMob(k, ZX + 30, 40); made[k] = m;
      for (let i = 0; i < 4; i++) { dimAnimate(m, true, 0.016); m.tick(m, 0.016); }
      if (m.alive) ok++;
      m.g.traverse(o => { if (o.userData.man || o.userData.hound || o.userData.boss) leaked++; });
    } catch (e) { made[k] = null; }
  }
  const r = [kinds.length, ok, made.tall_man.g.visible, made.cinder_hound.g.userData.legs.length,
    made.hollow_king.g.userData.arms.length, leaked];
  clearDimensionMobs();
  return r;
})()`);
run('dim:visitor-hits', `(() => {
  clearDimensionMobs(); setRealm(5); paused = false; dead = false; health = 9999;
  hasGun = true; owned.pistol = true; cur = 'pistol'; ammo = 999;
  const world = [manHp, kingHp, hounds.map(h => h.hp).join()];
  const out = [];
  for (const [k, z, pit] of [['tall_man', 11, 0], ['cinder_hound', 12.2, -0.55], ['hollow_king', 11, 0.4]]) {
    camera.position.set(ZX, 1.65, 14); yaw = 0; pitch = pit; camera.rotation.set(pitch, yaw, 0); camera.updateMatrixWorld(true);
    const m = dimMakeMob(k, ZX, z); m.hp = m.max = 500; scene.updateMatrixWorld(true);
    const hp0 = m.hp;
    for (let i = 0; i < 4; i++) { shootCd = 0; shoot(); scene.updateMatrixWorld(true); }
    out.push(hp0 - m.hp > 0);
  }
  const untouched = [manHp === world[0], kingHp === world[1], hounds.map(h => h.hp).join() === world[2]];
  clearDimensionMobs();
  return out.concat(untouched);
})()`);
run('dim:king-round', `(() => {
  clearDimensionMobs(); dimActive = true; dimWave = 19; dimWaveT = 0; spawnDimWave();
  const k = dimKingMob();
  const a = [!!k, k ? Math.round(k.max) : 0, bossInfo().name];
  clearDimensionMobs(); if (lord) { lordLayer.remove(lord.g); lord = null; }
  dimWave = 24; dimWaveT = 0; spawnDimWave();
  const b = [!!lord, !!dimKingMob(), bossInfo().name];
  clearDimensionMobs(); if (lord) { lordLayer.remove(lord.g); lord = null; }
  return a.concat(b);
})()`);
run('dim:king-orbs', `(() => {
  clearDimensionMobs(); setRealm(5); paused = false; dead = false; health = 9999;
  camera.position.set(ZX, 1.65, 14);
  const k = dimSpawnKing(20);
  const hp0 = health; let orbs = 0, wave = false;
  for (let i = 0; i < 600; i++) {
    updateMobs(1 / 60); dimVisitorUpdate(1 / 60);
    orbs = Math.max(orbs, dimKingOrbs.filter(o => o.life > 0).length);
    wave = wave || dimKingRing.visible;
  }
  const d = Math.hypot(k.g.position.x - camera.position.x, k.g.position.z - camera.position.z);
  const out = [orbs > 0, wave, hp0 - health > 0, d < 40, Math.round(k.hp) > 0];
  hurtMob(k, 9999);
  out.push(!k.alive, !dimKingRing.visible);
  clearDimensionMobs(); health = maxHp;
  return out;
})()`);
run('dim:brute-headshot', `(() => {
  clearDimensionMobs();
  const b = dimMakeMob('brute', ZX + 20, 30);
  const hp = b.hp; hurtMob(b, 1, true);
  return [hp, b.hp < hp - 1];
})()`);
run('dim:bloat-boom', `(() => {
  clearDimensionMobs();
  camera.position.set(ZX, EYE, 14); health = maxHp;
  const b = dimMakeMob('bloat', ZX + 2, 15); b.hp = 0.2;
  hurtMob(b, 99);
  return [b.alive, health < maxHp];
})()`);
run('dim:screamer', `(() => {
  clearDimensionMobs();
  const s = dimMakeMob('screamer', camera.position.x + 5, camera.position.z + 5);
  const z = dimMakeMob('zombie', camera.position.x + 9, camera.position.z + 6);
  s.screamT = 0; s.tick(s, 0.016);
  const [buffed, anim] = [z.buffT > 0, s.screamAnim > 0];
  clearDimensionMobs();
  return [buffed, anim];
})()`);
run('dim:skyline', '(() => { const far = dim.children.filter(o => o.isInstancedMesh); '
  + 'return [far.length >= 3, dim.children.length > 40]; })()');
run('dim:ambience-setting', '(() => { setRealm(1); return [typeof settings.ambience, settings.ambience !== false]; })()');
run('dim:chapel', '(() => { setRealm(5); paused = false; dead = false; return [typeof dimChapel, dimChapel.candles.length, '
  + 'dimBoxes.filter(b => b[2] > ZX - 33 && b[0] < ZX - 21 && b[3] > 30 && b[1] < 44).length]; })()');
run('dim:chapel-aisle', `(() => {
  const out = [];
  for (let z = 30.2; z <= 38.4; z += 0.1) {
    const x = ZX + DIM_CHAPEL_AT.x;
    for (const b of dimBoxes) if (x > b[0] - 0.32 && x < b[2] + 0.32 && z > b[1] - 0.32 && z < b[3] + 0.32) { out.push(+z.toFixed(1)); break; }
  }
  return out.length ? out.slice(0, 3) : 'clear';
})()`);
run('dim:weather', '(() => { dimFlash = 0; dimPulse = 0; for (let i = 0; i < 20; i++) dimWeather(0.016); '
  + 'const calm = [+moon.intensity.toFixed(2), +ambient.intensity.toFixed(2)]; dimBoltT = 0.001; dimWeather(0.016); '
  + 'return [calm, moon.intensity > calm[0], dimWx.ash.position.x === camera.position.x]; })()');
run('dim:round-fx', '(() => { clearDimensionMobs(); dimWave = 0; dimPulse = 0; spawnDimWave(); return [+dimPulse.toFixed(2), dimWave]; })()');
run('dim:props', '[dimBoxes.length, dimBoxes.every(b => b[2] > b[0] && b[3] > b[1] && b[0] > ZX - 60 && b[0] < ZX + 60), dimMeshes.length > 20]');
run('dim:rounds', '(() => { setRealm(5); dimActive = true; clearDimensionMobs(); dimWave = 0; spawnDimWave(); '
  + 'const r1 = mobs.filter(m => m.realm === 5); const a = [dimWave, r1.length, r1[0].hp, +r1[0].spd.toFixed(2)]; '
  + 'clearDimensionMobs(); dimWave = 9; spawnDimWave(); const r10 = mobs.filter(m => m.realm === 5); '
  + 'return [a, [dimWave, r10.length, r10[0].hp, +r10[0].spd.toFixed(2), r10.filter(m => m.runner).length]]; })()');
run('dim:runner', '(() => { clearDimensionMobs(); dimWave = 4; spawnDimWave(); const ms = mobs.filter(m => m.realm === 5); '
  + 'const run = ms.find(m => m.runner), walk = ms.find(m => !m.runner); return [!!run, !!walk, run.spd > walk.spd]; })()');
run('dim:escalate', '(() => { clearDimensionMobs(); dimWave = 0; spawnDimWave(); const a = mobs.filter(m => m.realm === 5); '
  + 'const n1 = a.length, hp1 = a[0].hp, sp1 = a[0].spd; clearDimensionMobs(); dimWave = 9; spawnDimWave(); '
  + 'const b = mobs.filter(m => m.realm === 5); const run = b.find(m => m.runner); '
  + 'return [b.length > n1, b[0].hp > hp1, run.spd > sp1 * 1.5]; })()');
run('dim:cover', '(() => { const b = dimBoxes[0]; '
  + 'return [wallBetween(b[0] - 3, (b[1] + b[3]) / 2, b[2] + 3, (b[1] + b[3]) / 2), targetsFor().includes(dimMeshes[0])]; })()');
run('dim:mobblocked', '(() => { clearDimensionMobs(); const b = dimBoxes[0]; const x = (b[0] + b[2]) / 2, z = b[3] + 2.4; '
  + 'const m = makeMob("zombie", x, z, 5); m.rise = 0; for (let i = 0; i < 40; i++) mobMove(m, 0, -0.08); '
  + 'const inside = m.g.position.x > b[0] && m.g.position.x < b[2] && m.g.position.z > b[1] && m.g.position.z < b[3]; return [inside, m.g.position.z > b[1]]; })()');
run('dim:clear', '(() => { clearDimensionMobs(); dimWave = 2; dimCleared = false; health = 40; shards = 5; dimWaveT = 99; '
  + 'updateDimension(0.016); const r = [health, shards, dimCleared]; health = maxHp; return r; })()');
run('dim:pickups', '(() => { const d = items.filter(i => i.group === dim); return [d.length, d.filter(i => i.kind === "ammo").length, '
  + 'd.filter(i => i.kind === "health").length, d.filter(i => inDimProp(i.wx - ZX, i.wz, 0.6)).length]; })()');
run('dim:ammo', '(() => { setRealm(5); paused = false; dead = false; heaven = false; hasGun = true; owned.pistol = true; cur = "pistol"; '
  + 'const it = items.find(i => i.group === dim && i.kind === "ammo"); it.cd = 0; it.g.visible = true; ammo = 0; store.pistol = 0; '
  + 'camera.position.set(it.wx, 1.65, it.wz); updatePickups(0.016); return [ammo > 0, !it.g.visible, it.cd > 0]; })()');
run('dim:health', '(() => { const it = items.find(i => i.group === dim && i.kind === "health"); it.cd = 0; it.g.visible = true; '
  + 'const oldMax = maxHp; maxHp = 100; health = 10; camera.position.set(it.wx, 1.65, it.wz); updatePickups(0.016); '
  + 'const r = [health, !it.g.visible]; maxHp = oldMax; health = maxHp; return r; })()');
run('dim:hut', '(() => { setRealm(5); paused = false; dead = false; heaven = false; teleporting = false; camera.position.set(ZX, 1.65, 32.4); '
  + 'updateDoor(0.016); const a = action; useAction(); const r = [a, dimShopOpen, paused, dimShopRows.children.length]; closeDimShop(); return r; })()');
run('dim:spawn-clear', '(() => { setRealm(5); camera.position.set(ZX, 1.65, 14); let hut = 0, prop = 0; '
  + 'for (let i = 0; i < 300; i++) { const c = dimSpawnPoint(11, 20); const lx = c[0] - ZX; '
  + 'if (lx > -2.2 && lx < 2.2 && c[1] > 31.3 && c[1] < 34.7) hut++; if (inDimProp(lx, c[1], 0.2)) prop++; } return [hut, prop]; })()');
run('dim:hut-sealed', '(() => { mobs.length = 0; const m = makeMob("zombie", ZX, 26, 5); m.rise = 0; '
  + 'for (let i = 0; i < 80; i++) mobMove(m, 0, 0.08); const out = m.g.position.z < 31.3; '
  + 'const inside = makeMob("zombie", ZX, 33, 5); inside.rise = 0; mobMove(inside, 0, 0.01); '
  + 'return [out, inside.g.position.z > 34.7 || inside.g.position.z < 31.3]; })()');
run('shop:pointer-lock', '(() => { const old = cv.requestPointerLock; let n = 0; cv.requestPointerLock = () => { n++; }; '
  + 'paused = false; setRealm(5); openDimShop(); closeDimShop(); const shop = n; openForge(); closeForge(); '
  + 'cv.requestPointerLock = old; paused = false; return [shop, n - shop, paused]; })()');
run('dim:buy', '(() => { const keep = shards; shards = 400; buildDimShop(); buyDim("scatter"); const r = [owned.scatter, cur, dimGear.scatter, shards]; shards = keep; return r; })()');
run('dim:gear-drop', '(() => { dimGear.gre = 2; dimGear.bomb = 1; dropDimGear(); return [owned.scatter, owned.ripper, cur, dimGear.gre, dimGear.bomb, dimGear.hot]; })()');
run('dim:grenade', '(() => { setRealm(5); paused = false; dead = false; mobs.length = 0; const z = makeMob("zombie", ZX + 0.4, 20, 5); z.rise = 0; '
  + 'camera.position.set(ZX, 1.65, 15.2); camera.lookAt(ZX, 1.5, 21); camera.updateMatrixWorld(); dimGear.gre = 1; throwGrenade(); '
  + 'for (let i = 0; i < 200 && dimGrenades.length; i++) updateDimGearFx(0.02); return [z.alive, dimGear.gre]; })()');
run('dim:nuke', '(() => { mobs.length = 0; for (let i = 0; i < 4; i++) { const m = makeMob("zombie", ZX + i, 22, 5); m.rise = 0; } '
  + 'dimGear.bomb = 1; detonateNuke(); return [dimGear.bomb, mobs.filter(m => m.alive).length]; })()');
run('dim:fatigue', '[1, 5, 10, 20].map(r => { dimWave = r; return +dimFatigue().toFixed(2); })');
run('dim:locked', '(() => { progress.cleared = false; progress.cycle = 0; settings.dimOpen = false; refreshMenu(); '
  + 'const dis = document.getElementById("navDim").disabled; const was = realm; enterDimension(); '
  + 'return [dimUnlocked(), dis, realm === was]; })()');
run('dim:unlock', '(() => { progress.cleared = true; const a = dimUnlocked(); progress.cleared = false; '
  + 'settings.dimOpen = true; const b = dimUnlocked(); settings.dimOpen = false; progress.cycle = 1; const c = dimUnlocked(); '
  + 'progress.cycle = 0; refreshMenu(); return [a, b, c, document.getElementById("navDim").disabled]; })()');
run('dim:saved-unlock', '(() => { const keep = progress.cleared; progress.cleared = true; saveAll(); '
  + 'const d = JSON.parse(localStorage.getItem("grid-walker-save") || "{}"); progress.cleared = keep; '
  + 'localStorage.removeItem("grid-walker-save"); return !!d.progress && !!d.progress.cleared; })()');
run('dim:settings-row', '(() => { buildSettingsUI(); return document.getElementById("settingsBox").textContent.toUpperCase().includes("UNLOCK THE ZOMBIE DIMENSION"); })()');
run('menu:no-reset-button', '(() => [!!document.getElementById("reset"), document.getElementById("settingsBox").parentNode.textContent.includes("Return to world 1")])()');
run('dim:reset-items', '(() => { items.filter(i => i.group === dim).forEach(i => { i.cd = 0; i.g.visible = false; }); resetItems(dim); '
  + 'return items.filter(i => i.group === dim && i.g.visible).length; })()');
run('dim:hud', '(() => { updateDimension(0.016); return [dimRoundEl.style.display, dimRoundNum.textContent, dimLeftEl.textContent]; })()');
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
run('save:wipe', '(() => { shards = 500; kills = 40; owned.rifle = true; ammo = 12; up.damage = 2; up.vitality = 1; progress.cleared = true; progress.lore = {a: 1}; '
  + 'wipeProgress(); return [shards, kills, hasGun, owned.rifle, ammo, up.damage, up.vitality, Object.keys(progress.lore).length, dimUnlocked(), maxHp]; })()');
run('save:wipe-settings', '(() => { shards = 640; settings.infShards = true; settings.god = true; settings.diff = "hard"; wipeProgress(); '
  + 'const a = [shards, settings.infShards, settings.god, settings.diff]; for (let i = 0; i < 5; i++) updateQoL(0.016); '
  + 'return [a, shards]; })()');
run('voice:throat', `(() => {
  const param = () => ({ value: 0, setValueAtTime(){ return this; }, linearRampToValueAtTime(){ return this; }, exponentialRampToValueAtTime(){ return this; } });
  const node = e => Object.assign({ connect(){ return this; }, start(){}, stop(){} }, e);
  let made = 0;
  const oldAc = ac, oldMaster = master, oldBuf = whiteBuf;
  ac = { currentTime: 1, sampleRate: 48000, destination: node({}),
    createOscillator: () => { made++; return node({ type: '', frequency: param() }); },
    createGain: () => node({ gain: param() }), createBiquadFilter: () => node({ type: '', frequency: param(), Q: param() }),
    createBufferSource: () => { made++; return node({ buffer: null, loop: false }); }, createStereoPanner: () => node({ pan: param() }) };
  master = node({ gain: param() }); whiteBuf = { length: 1 };
  const b0 = made; zombieGroan(0.9, 0); const groan = made - b0;
  const b1 = made; zombieGroan(0, 0); const silent = made - b1;
  const b2 = made; zombieDeath(0.9, 0); const death = made - b2;
  const b3 = made; lordRoar(); const lord = made - b3;
  ac = oldAc; master = oldMaster; whiteBuf = oldBuf;
  return [groan > 8, silent, death > 8, lord > 20];
})()`);
run('voice:pan', '(() => { const y0 = yaw; camera.position.set(0, EYE, 0); yaw = 0; '
  + 'const l = panFor(-10, 0), r = panFor(10, 0); yaw = Math.PI / 2; const spun = panFor(-10, 0); yaw = y0; '
  + 'return [l, r, spun, volFor(3, 0, 5) > 0.9, volFor(90, 0, 5)]; })()');
run('ui:hover-sound', `(() => {
  let n = 0;
  const osc = () => ({ type: '', frequency: { setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){}, start(){ n++; }, stop(){} });
  const gain = () => ({ gain: { setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){} });
  const oldAc = ac, oldMaster = master;
  ac = { currentTime: 0, createOscillator: osc, createGain: gain }; master = {};
  settings.uiSound = true; hoverLast = null; hoverAt = 0;
  document.getElementById('resume').dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
  const on = n;
  settings.uiSound = false; hoverLast = null; hoverAt = 0;
  document.getElementById('navHow').dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
  const off = n;
  ac = oldAc; master = oldMaster; settings.uiSound = true;
  return [on, off];
})()`);
run('save:start-over', '(() => { shards = 700; kills = 30; up.damage = 2; progress.house = 5; progress.interior = 4; progress.cleared = true; '
  + 'settings.infShards = true; hasGun = true; owned.pistol = true; const b = document.getElementById("wipe2"); '
  + 'b.click(); b.click(); const saved = JSON.parse(localStorage.getItem("grid-walker-save") || "{}"); '
  + 'return [shards, kills, progress.house, progress.interior, up.damage, settings.infShards, realm, hasGun, !!gunPickup.parent, dimUnlocked(), saved.settings && saved.settings.infShards]; })()');
run('save:wipe-gun', '(() => { wipeProgress(); return [gunView.visible, !!gunPickup.parent, crossEl.style.display]; })()');

if (errors.length) {
  console.log('FAIL');
  for (const e of [...new Set(errors)]) console.log(' -', e);
  process.exitCode = 1;
} else {
  console.log('PASS — 4 realms, 3 weapons, 4 enemy types, horde, gore, the Congregation, the Zombie Dimension, house upgrades, interior, sitting and lying, house hitboxes, walls stop the dead, forge, lore, shards, checkpoint death, NG+ all OK');
}
run('knife:press', '(() => { setRealm(1); paused = false; dead = false; heaven = false; '
  + 'for (let i = 0; i < 90; i++) updateKnife(0.016); const before = knifeView.visible; '
  + 'document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyV" })); '
  + 'return [before, knifeView.visible, knifeT > 0]; })()');
run('knife:one-second', '(() => { for (let i = 0; i < 50; i++) updateKnife(0.016); const mid = knifeT > 0; '
  + 'for (let i = 0; i < 30; i++) updateKnife(0.016); return [mid, knifeT <= 0, knifeView.visible]; })()');
run('knife:hits', `(() => {
  setRealm(1); paused = false; dead = false;
  camera.position.set(0, EYE, 0); yaw = 0; pitch = 0;
  const m = makeMob('zombie', 0, -1.6, 1); m.rise = 0; m.hp = m.max = 10;
  for (let i = 0; i < 90; i++) updateKnife(0.016);
  knifeCd = 0; knifeStab();
  for (let i = 0; i < 40; i++) updateKnife(0.016);
  return [m.hp < 10, m.hp > 6];
})()`);
run('knife:range', `(() => {
  for (let i = 0; i < 90; i++) updateKnife(0.016);
  const far = makeMob('zombie', 0, -6, 1); far.rise = 0; far.hp = far.max = 10;
  knifeCd = 0; knifeStab();
  for (let i = 0; i < 40; i++) updateKnife(0.016);
  const back = makeMob('zombie', 0, 1.4, 1); back.rise = 0; back.hp = back.max = 10;
  knifeCd = 0; knifeStab();
  for (let i = 0; i < 40; i++) updateKnife(0.016);
  return [far.hp === 10, back.hp === 10];
})()`);
run('almanac:open', `(() => {
  progress.alm = {};
  setPaused(true); openPanel('panelAlmanac');
  const list = document.getElementById('almanacList');
  return [document.getElementById('panelAlmanac').classList.contains('open'), almanacBuilt,
    list.querySelectorAll('.almCard').length, list.querySelectorAll('.almHead').length,
    list.querySelectorAll('.almCard.locked').length, almKnown()];
})()`);
run('almanac:entries', `(() => {
  const bad = [];
  for (const e of ALMANAC) {
    if (!almanacStatsRows(e).length) bad.push(e.id + ':stats');
    if (typeof e.rounds !== 'string' || !e.rounds) bad.push(e.id + ':rounds');
    if (!e.where || !e.text || !e.tip) bad.push(e.id + ':text');
    if (!almanacPortrait(e)) bad.push(e.id + ':pic');
  }
  return [ALMANAC.length, bad.length, almanacSections().length];
})()`);
run('almanac:rounds-live', `(() => {
  const out = [];
  for (const e of ALMANAC) {
    if (DIM_UNLOCK[e.id] != null) out.push(e.rounds.indexOf('round ' + DIM_UNLOCK[e.id]) >= 0);
  }
  return [out.length, out.every(Boolean), dimKingRound(20), dimKingRound(30), !dimKingRound(15)];
})()`);
run('almanac:locked', `(() => {
  progress.alm = {};
  openAlmanacEntry('brute');
  const d = document.getElementById('almanacDetail');
  const t = d.querySelector('.almTitle').textContent;
  const hint = d.querySelector('[data-alm="where"]').textContent;
  const back = d.querySelector('.almBack'); if (back) back.click();
  return [t === '? ? ?', !/BRUTE/.test(hint), d.hidden, almKnown()];
})()`);
run('almanac:scan', `(() => {
  progress.alm = {};
  clearDimensionMobs(); setRealm(5); paused = false; dead = false;
  camera.position.set(ZX, 1.65, 14);
  const far = dimMakeMob('angel', ZX + 400, 400);
  const near = dimMakeMob('brute', ZX + 3, 18);
  almanacScan();
  const a = [almSeen('brute'), almSeen('angel')];
  hurtMob(far, 9999); clearDimensionMobs();
  return a;
})()`);
run('almanac:unlock', `(() => {
  progress.alm = {};
  almMark('brute', true);
  const list = document.getElementById('almanacList');
  const card = [...list.querySelectorAll('.almCard')].find(c => c.dataset.alm === 'brute');
  openAlmanacEntry('brute');
  const d = document.getElementById('almanacDetail');
  const r = [card && !card.classList.contains('locked'), d.querySelector('.almTitle').textContent === 'BRUTE',
    d.querySelectorAll('.almStat').length > 2, almKnown() >= 1];
  const back = d.querySelector('.almBack'); if (back) back.click();
  return r;
})()`);
run('almanac:heaven', `(() => {
  progress.alm = {};
  heaven = true; heavenGroup.visible = true;
  almanacScan();
  const r = [almSeen('angel_heaven'), almSeen('heaven'), almanacSections().some(s => s.name === 'Heaven')];
  heaven = false; heavenGroup.visible = false;
  openAlmanacEntry('angel_heaven');
  const d = document.getElementById('almanacDetail');
  r.push(d.querySelector('.almTitle').textContent === 'THE ANGELS', d.querySelectorAll('.almStat').length >= 3);
  const back = d.querySelector('.almBack'); if (back) back.click();
  progress.alm = {};
  return r;
})()`);
run('almanac:count', `(() => {
  progress.alm = {};
  almMark('zombie', true); almMark('husk', true); almMark('shard', true);
  openPanel('panelAlmanac');
  const note = document.getElementById('almNote').textContent;
  const r = [almKnown() === 3, note.indexOf('Seen 3 of 29') >= 0, document.getElementById('almanacList').textContent.indexOf('2 / 4') >= 0];
  progress.alm = {};
  return r;
})()`);
run('almanac:nav', `(() => { closePanels(); setPaused(true); selectNav(4); const id = navBtns()[navSel].id; closePanels(); return id; })()`);
run('knife:dimension', `(() => {
  setRealm(5); paused = false; dead = false;
  camera.position.set(ZX, EYE, 14); yaw = 0;
  const m = dimMakeMob('crawler', ZX, 12.6); m.hp = m.max = 30;
  for (let i = 0; i < 90; i++) updateKnife(0.016);
  knifeCd = 0; knifeStab();
  for (let i = 0; i < 40; i++) updateKnife(0.016);
  clearDimensionMobs(); setRealm(1);
  return [m.hp < 30, m.hp > 20];
})()`);
run('knife:hides-gun', '(() => { setRealm(1); paused = false; dead = false; heaven = false; hasGun = true; gunView.visible = true; '
  + 'for (let i = 0; i < 90; i++) updateKnife(0.016); knifeCd = 0; knifeStab(); '
  + 'for (let i = 0; i < 20; i++) updateKnife(0.016); return [gunView.visible, knifeView.visible]; })()');
run('knife:restores-gun', '(() => { for (let i = 0; i < 60; i++) updateKnife(0.016); '
  + 'return [gunView.visible, knifeView.visible]; })()');
run('knife:arm', '(() => { const cy = knifeArm.children.filter(c => c.geometry && c.geometry.type === "CylinderGeometry"); '
  + 'return [cy.length, cy.some(c => c.geometry.parameters.height > 0.5), knifeArm.children.length >= 5]; })()');
run('knife:no-gun-restore', '(() => { hasGun = false; gunView.visible = false; for (let i = 0; i < 90; i++) updateKnife(0.016); '
  + 'knifeCd = 0; knifeStab(); for (let i = 0; i < 80; i++) updateKnife(0.016); const r = gunView.visible; '
  + 'hasGun = true; gunView.visible = true; return r === false; })()');
