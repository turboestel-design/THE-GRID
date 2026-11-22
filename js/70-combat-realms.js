/* THE GRID — Shooting resolution, boss health bar, portals, realm switching and teleporting.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Shooting, switching, health bar, portals, realms (these replace the earlier versions) ----
function targetsFor(){
  if (realm === 5) return [mobLayer, lordLayer];
  const base = realm === 2 ? [beast, shroomStems, shroomCaps] : realm === 3 ? [...hounds.map(h => h.g), rocks] : realm === 4 ? [king, pillars] : [man, trunks];
  return base.concat([mobLayer, lordLayer]);
}
function shoot(){
  if (!hasGun || paused || dead || heaven || teleporting || shootCd > 0) return;
  const W = WEAPONS[cur];
  if (ammo <= 0) { clickSound(); shootCd = 0.3; say('OUT OF AMMO  ·  FIND CRATES', 1200); return; }
  if (!settings.infAmmo) ammo--; shootCd = W.cd; recoil = W.kick; flashT = 0.06; gunshot(cur); rumble(60, 0.4); updateStats();
  const tg = targetsFor();
  for (let i = 0; i < W.pellets; i++) {
    const sx = (Math.random() - .5)*2*W.spread, sy = (Math.random() - .5)*2*W.spread;
    ray.setFromCamera({x: sx, y: sy}, camera);
    let hit = ray.intersectObjects(tg, true)[0];
    const isT = h => h && (h.object.userData.man || h.object.userData.beast || h.object.userData.hound || h.object.userData.boss || h.object.userData.mob || h.object.userData.lord);
    if (settings.aimAssist && !isT(hit)) for (const a of [[0.03, 0], [-0.03, 0], [0, 0.04], [0, -0.04]]) { ray.setFromCamera({x: sx + a[0], y: sy + a[1]}, camera); const h2 = ray.intersectObjects(tg, true)[0]; if (isT(h2)) { hit = h2; break; } }
    if (!hit) continue;
    const o = hit.object.userData, d = (o.head ? W.head : W.dmg) * (1 + up.damage * 0.15);
    if (o.man || o.beast || o.hound || o.boss || o.mob || o.lord) hitMark(o.head);
    if (o.man) hurtMan(d); else if (o.beast) hurtBeast(d); else if (o.hound) hurtHound(o.hound, d); else if (o.boss) hurtKing(o.head ? d : d*0.7); else if (o.mob) hurtMob(o.mob, d, o.head); else if (o.lord) hurtLord(d);
  }
}
document.addEventListener('keydown', e => {
  if (paused || e.repeat) return;
  if (e.code === 'Digit1') selectWeapon('pistol'); else if (e.code === 'Digit2') selectWeapon('shotgun'); else if (e.code === 'Digit3') selectWeapon('rifle'); else if (e.code === 'KeyQ') cycleWeapon();
});
document.addEventListener('mousedown', e => { if (e.button === 0 && document.pointerLockElement === renderer.domElement) firing = true; });
document.addEventListener('mouseup', () => { firing = false; });
document.addEventListener('pointerlockchange', () => { firing = false; });
addEventListener('blur', () => { firing = false; });
fireBtn.addEventListener('pointerdown', () => { firing = true; });
['pointerup', 'pointercancel', 'pointerleave'].forEach(t => fireBtn.addEventListener(t, () => { firing = false; }));
swapBtn.addEventListener('pointerdown', e => { e.preventDefault(); cycleWeapon(); });
let lastBar = '';
function bossInfo(){
  if (lord && lord.alive) return {name: LORD_NAME, alive: true, hp: Math.max(0, lord.hp), max: lord.max, pos: lord.g.position};
  if (realm === 2) return {name: 'THE BLOOM', alive: beastAlive, hp: Math.max(0, beastHp), max: 10 * cyc(), pos: beast.position};
  if (realm === 3) {
    const live = hounds.filter(h => h.alive); let hp = 0; live.forEach(h => { hp += Math.max(0, h.hp); });
    return {name: 'CINDER HOUNDS', alive: live.length > 0, hp, max: hounds.length * 3 * cyc(), pos: (live[0] || hounds[0]).g.position};
  }
  if (realm === 4) return {name: 'THE HOLLOW KING', alive: kingAlive, hp: Math.max(0, kingHp), max: 45 * cyc(), pos: king.position};
  if (realm === 5) return {name: 'THE ZOMBIE DIMENSION', alive: false, hp: 0, max: 1, pos: camera.position};
  return {name: 'THE TALL MAN', alive: manAlive, hp: Math.max(0, manHp), max: 8 * cyc(), pos: man.position};
}
function updateBars(dt){
  const b = bossInfo();
  if (lastBar !== b.name) {
    lastBar = b.name; ghostHp = b.hp; bossName.textContent = b.name;
    const w = 100/(b.max > 20 ? 15 : b.max); bossSeg.style.background = `repeating-linear-gradient(90deg,transparent 0,transparent calc(${w}% - 2px),#000 calc(${w}% - 2px),#000 ${w}%)`;
  }
  const d = Math.hypot(camera.position.x - b.pos.x, camera.position.z - b.pos.z);
  bossHide = b.alive ? 0 : bossHide + dt;
  bossBar.style.display = (!heaven && (b.alive ? (d < 45 || b.hp < b.max) : bossHide < 2.5)) ? 'block' : 'none';
  bossFill.style.width = (b.hp/b.max*100) + '%';
  ghostHp += (b.hp - ghostHp) * Math.min(1, dt*2.5);
  bossGhost.style.width = (ghostHp/b.max*100) + '%';
}
const portalC = makePortal(15, 40);
portalA.userData.to = 2; portalB.userData.to = 3; portalC.userData.to = 4;
function openPortalC(){
  if (realm !== 3 || heaven || dead) return;
  const r = pushC(camera.position.x - Math.sin(yaw)*8, camera.position.z - Math.cos(yaw)*8, rockPos, 1.5);
  openPortal(portalC, r[0], r[1]);
}
function hurtBeast(d){
  if (!beastAlive) return;
  beastHp -= d; bHit = 0.12; bStagger = 0.3;
  if (bState === 'wind') { bState = 'creep'; bT = 1.5; }
  if (beastHp <= 0) { beastAlive = false; kills++; spawnShards(beast.position.x, 1.6, beast.position.z, 14); say('THE BLOOM WITHERS. A NEW PORTAL OPENS.', 5500); setTimeout(openPortalB, tm(2500)); }
}
function updatePortals(dt){
  let best = null;
  for (const p of [portalA, portalB, portalC]) {
    if (!p.visible) continue;
    p.userData.t += dt; const k = Math.min(1, p.userData.t/1.5);
    p.scale.setScalar(Math.max(0.01, k)); p.userData.disc.rotation.z += dt*0.9; best = p;
    const d = Math.hypot(camera.position.x - p.position.x, camera.position.z - p.position.z);
    if (k >= 1 && d < 1.0 && !teleporting && !dead) teleport(p.userData.to);
  }
  if (best) { portalLight.position.set(best.position.x, 1.8, best.position.z); portalLight.color.setHSL(best.userData.hue/360, 1, 0.6); portalLight.intensity = 2.2*Math.min(1, best.userData.t/1.5) + Math.sin(time*9)*0.2; }
  else portalLight.intensity = 0;
}
function setHeavenAudio(){
  if (padGain) padGain.gain.setTargetAtTime(heaven ? 0.07 : 0, ac.currentTime, 0.8);
  if (r2Gain) r2Gain.gain.setTargetAtTime((realm === 2 || realm === 4) && !heaven ? 0.12 : 0, ac.currentTime, 0.6);
  if (droneGain) droneGain.gain.value = (heaven || realm > 1) ? 0 : 0.22;
}
function setRealm(n){
  realm = n;
  realm2.visible = sporeMesh.visible = planetG.visible = (n === 2);
  realm3.visible = ashMesh.visible = emberMesh.visible = (n === 3);
  realm4.visible = (n === 4); dim.visible = (n === 5);
  stars.visible = (n === 2 || n === 4 || n === 5); sunG.visible = (n === 3 || n === 4);
  glowLight.intensity = n === 2 ? 1.6 : n === 4 ? 1.0 : 0;
  portalA.visible = portalB.visible = portalC.visible = false;
  if (n !== 2) beast.visible = false;
  hounds.forEach(h => { h.g.visible = (n === 3); }); king.visible = (n === 4); man.visible = (n === 1);
  (n === 4 ? king : beast).add(beastLight); beastLight.position.set(0, n === 4 ? 5.5 : 2, 0.5); beastLight.intensity = 0;
  document.getElementById('grain').style.display = n === 2 ? 'none' : 'block';
  if (n === 5) { scene.background.setHex(0x1a070e); scene.fog.color.setHex(0x2a0a16); scene.fog.density = 0.022; ambient.color.setHex(0xc07a86); ambient.intensity = 1.25; moon.color.setHex(0xff6a6a); moon.intensity = 1.7; }
  else if (n === 2) { scene.background.setHex(0x090514); scene.fog.color.setHex(0x0b0618); scene.fog.density = 0.032; ambient.color.setHex(0x6a4aa8); ambient.intensity = 0.9; moon.color.setHex(0x5a4aa0); moon.intensity = 0.35; }
  else if (n === 3) { scene.background.setHex(0x7a2c12); scene.fog.color.setHex(0x7a2c12); scene.fog.density = 0.02; ambient.color.setHex(0xff9060); ambient.intensity = 0.8; moon.color.setHex(0xff7a3a); moon.intensity = 1.1; }
  else if (n === 4) { scene.background.setHex(0x030208); scene.fog.color.setHex(0x050310); scene.fog.density = 0.012; ambient.color.setHex(0x7a6ac0); ambient.intensity = 0.7; moon.color.setHex(0xd8c8ff); moon.intensity = 0.6; }
  else { ambient.color.setHex(0x2a3a44); moon.color.setHex(0x6f8fb0); }
  setHeavenAudio();
}
function enterRealm2(){
  setRealm(2); man.visible = false; health = maxHp; jumpH = 0; vy = 0; camGround = 0; landDip = 0;
  camera.position.set(RX, EYE, 20); yaw = 0; pitch = 0;
  resetItems(realm2); spawnBeast(); refill(); spawnMobs(2);
  say('A DIFFERENT PLACE. SOMETHING IS WATCHING.', 5500);
}
function enterRealm3(){
  setRealm(3); health = maxHp; jumpH = 0; vy = 0; camGround = 0; landDip = 0;
  camera.position.set(AX, EYE, 20); yaw = 0; pitch = 0;
  resetItems(realm3); spawnHounds(); refill(); spawnMobs(3);
  sweepTone(300, 120, 1.4, 0.6, 'sawtooth');
  say('THE ASHEN WASTE. THEY HAVE YOUR SCENT.', 5500);
}
function enterRealm4(){
  setRealm(4); health = maxHp; jumpH = 0; vy = 0; camGround = 0; landDip = 0;
  camera.position.set(BX, EYE, 18); yaw = 0; pitch = 0;
  resetItems(realm4); spawnKing(); refill(); spawnMobs(4);
  say('THE HOLLOW KING. AIM FOR THE MASK. JUMP THE SHOCKWAVES.', 6000);
}
function leaveRealm2(){
  setRealm(1); camera.position.set(0, EYE, 5); yaw = 0; pitch = 0; jumpH = 0; vy = 0; camGround = 0; health = maxHp;
  man.visible = true; spawnMan(55); refill(); spawnMobs(1);
  say('BACK IN THE FOREST. HE IS STILL OUT THERE.', 5000);
}
function exitHeaven(){
  heaven = false; dead = false; health = maxHp; jumpH = 0; vy = 0; camGround = 0; landDip = 0;
  heavenGroup.visible = false; gunView.visible = hasGun; crossEl.style.display = hasGun ? 'block' : 'none';
  document.getElementById('vig').style.display = 'block';
  document.getElementById('grain').style.display = 'block';
  ambient.intensity = 0.35; moon.intensity = 0.18;
  yaw = 0; pitch = 0;
  const back = Math.max(1, Math.min(4, deathRealm));
  enterRealmByIndex(back);
  say('BACK TO ' + REALM_NAME[back] + '. IT REMEMBERS YOU.', 4000);
}
function teleport(to){
  if (teleporting) return;
  teleporting = true; portalSound();
  fadeEl.style.transition = 'opacity .9s'; fadeEl.style.background = ['', '#d8ffd0', '#b9a2ff', '#ffb27a', '#ffffff'][to]; fadeEl.textContent = ''; fadeEl.style.opacity = '1';
  setTimeout(() => {
    if (to === 2) enterRealm2(); else if (to === 3) enterRealm3(); else if (to === 4) enterRealm4(); else leaveRealm2();
    fadeEl.style.transition = 'none'; void fadeEl.offsetWidth; fadeEl.style.transition = 'opacity 2s'; fadeEl.style.opacity = '0';
    teleporting = false;
  }, tm(1000));
}
function updateRealm2(dt){
  if (realm !== 2) return;
  stars.position.copy(camera.position); planetG.position.set(camera.position.x - 50, 95, camera.position.z - 140);
  sporeMesh.position.set(camera.position.x, 0, camera.position.z);
  for (let i = 0; i < SP_N; i++) { sporePos[i*3 + 1] += dt*(0.25 + (i % 5)*0.08); sporePos[i*3] += Math.sin(time*0.6 + i)*dt*0.3; if (sporePos[i*3 + 1] > 14) sporePos[i*3 + 1] = 0; }
  sporeGeo.attributes.position.needsUpdate = true;
  chimeT -= dt; if (chimeT <= 0) { chimeT = 2.5 + Math.random()*6; chime(); }
}
function updateWorlds(dt){
  if (realm === 3 || realm === 4) { sunG.position.set(camera.position.x, camera.position.y + (realm === 3 ? 40 : 75), camera.position.z - 150); sunG.lookAt(camera.position); }
  if (realm === 4) stars.position.copy(camera.position);
  if (realm === 3) {
    ashMesh.position.set(camera.position.x, 0, camera.position.z); emberMesh.position.copy(ashMesh.position);
    for (let i = 0; i < ASH_N; i++) { ashPos[i*3 + 1] -= dt*1.4; ashPos[i*3] += dt*0.8; if (ashPos[i*3 + 1] < 0) ashPos[i*3 + 1] = 22; if (ashPos[i*3] > 30) ashPos[i*3] = -30; }
    for (let i = 0; i < EMB_N; i++) { embPos[i*3 + 1] += dt*(1 + (i % 4)*0.3); if (embPos[i*3 + 1] > 20) embPos[i*3 + 1] = 0; }
    ashGeo.attributes.position.needsUpdate = emberGeo.attributes.position.needsUpdate = true;
    if (windGain) windGain.gain.value = 0.22 + Math.sin(time*0.5)*0.06;
  }
}

