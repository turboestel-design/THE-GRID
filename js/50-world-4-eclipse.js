/* THE GRID — World 4: THE ECLIPSE — the arena, the orbs and THE HOLLOW KING.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- World 4: THE ECLIPSE (final boss arena) ----
const realm4 = new THREE.Group(); realm4.position.set(BX, 0, 0); realm4.visible = false; scene.add(realm4);
const a4 = document.createElement('canvas'); a4.width = a4.height = 512; const a4x = a4.getContext('2d');
a4x.fillStyle = '#07050d'; a4x.fillRect(0, 0, 512, 512); a4x.strokeStyle = 'rgba(170,130,255,.9)'; a4x.lineWidth = 3;
[60, 120, 190, 250].forEach(r => { a4x.beginPath(); a4x.arc(256, 256, r, 0, 6.283); a4x.stroke(); });
a4x.lineWidth = 2;
for (let i = 0; i < 24; i++) { const a = i/24*6.283; a4x.beginPath(); a4x.moveTo(256 + Math.cos(a)*120, 256 + Math.sin(a)*120); a4x.lineTo(256 + Math.cos(a)*190, 256 + Math.sin(a)*190); a4x.stroke(); }
for (let i = 0; i < 48; i++) { const a = i/48*6.283; a4x.strokeRect(256 + Math.cos(a)*220 - 4, 256 + Math.sin(a)*220 - 4, 8, 8); }
const a4tex = new THREE.CanvasTexture(a4);
const floor4 = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({map: a4tex, emissiveMap: a4tex, emissive: 0xffffff, emissiveIntensity: 0.7, roughness: 0.5, metalness: 0.4}));
floor4.rotation.x = -Math.PI/2; realm4.add(floor4);
const edge4 = new THREE.Mesh(new THREE.TorusGeometry(30.2, 0.3, 6, 64), bBasic(0x9a78ff)); edge4.rotation.x = Math.PI/2; realm4.add(edge4);
const pillars = new THREE.Group(), pillarPos = []; realm4.add(pillars);
for (let i = 0; i < 6; i++) {
  const a = i/6*6.283 + 0.35, x = Math.cos(a)*15, z = Math.sin(a)*15;
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 8, 10), new THREE.MeshStandardMaterial({color: 0x15101f, emissive: 0x1c1038, roughness: 0.5, metalness: 0.4}));
  p.position.set(x, 4, z); pillars.add(p); pillarPos.push([BX + x, z, 1.15]);
  const cap = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.08, 6, 20), bBasic(0x9a78ff)); cap.rotation.x = Math.PI/2; cap.position.set(x, 7.6, z); pillars.add(cap);
}
// The Hollow King
const king = new THREE.Group(); king.visible = false; scene.add(king);
const robeMat = new THREE.MeshStandardMaterial({color: 0x08060e, emissive: 0x120a24, roughness: 1});
const maskMat = new THREE.MeshStandardMaterial({color: 0xe8e4f0, emissive: 0x333040, roughness: 0.6});
function kpart(geo, mat, x, y, z, head){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.userData.boss = true; if (head) m.userData.head = true; king.add(m); return m; }
kpart(new THREE.ConeGeometry(1.7, 5.2, 14), robeMat, 0, 3.4, 0);
kpart(new THREE.SphereGeometry(0.9, 12, 8), robeMat, 0, 5.5, 0).scale.set(1.8, 0.5, 0.9);
kpart(new THREE.SphereGeometry(0.5, 14, 12), maskMat, 0, 6.15, 0, true);
kpart(new THREE.BoxGeometry(0.13, 0.22, 0.05), bBasic(0xffffff), -0.18, 6.2, 0.46, true);
kpart(new THREE.BoxGeometry(0.13, 0.22, 0.05), bBasic(0xffffff), 0.18, 6.2, 0.46, true);
for (let i = 0; i < 7; i++) { const a = i/7*6.283, c = kpart(new THREE.ConeGeometry(0.07, 1.3, 5), maskMat, Math.cos(a)*0.4, 6.8, Math.sin(a)*0.4, true); c.rotation.set(Math.sin(a)*0.5, 0, -Math.cos(a)*0.5); }
const kArms = [-1, 1].map(s => {
  const piv = new THREE.Group(); piv.position.set(s*1.3, 5.3, 0); king.add(piv);
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.4, 0.22), robeMat); a.position.y = -1.2; a.userData.boss = true; piv.add(a);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.15), maskMat); h.position.y = -2.55; h.userData.boss = true; piv.add(h);
  piv.rotation.x = -0.6; return piv;
});
const orbs = [];
for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), bBasic(0xffb060)); m.visible = false; scene.add(m); orbs.push({m, vx: 0, vy: 0, vz: 0, life: 0}); }
const wave = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 64), new THREE.MeshBasicMaterial({color: 0xff8040, transparent: true, opacity: 0.85, side: THREE.DoubleSide}));
wave.rotation.x = -Math.PI/2; wave.visible = false; scene.add(wave);
let kingHp = 45, kingAlive = true, kAng = -1.5708, kAtkT = 3, kWaveCd = 8, kBlink = 9, kSlam = 0, kHit = 0, kFall = 0, kPhase = 1, waveR = 0, waveHit = false, waveX = 0, waveZ = 0;
function spawnKing(){
  kingHp = 45 * cyc(); kingAlive = true; kAng = -1.5708; kAtkT = 3; kWaveCd = 8; kBlink = 9; kSlam = 0; kHit = 0; kFall = 0; kPhase = 1;
  king.scale.setScalar(1); king.rotation.set(0, 0, 0); king.visible = true; wave.visible = false; orbs.forEach(o => { o.life = 0; o.m.visible = false; });
}
function fireOrbs(n){
  const dx = camera.position.x - king.position.x, dz = camera.position.z - king.position.z, base = Math.atan2(dx, dz), dist = Math.hypot(dx, dz) || 1;
  sweepTone(220, 90, 0.35, 0.8, 'sawtooth');
  for (let i = 0; i < n; i++) {
    const o = orbs.find(x => x.life <= 0); if (!o) return;
    const a = base + (i - (n - 1)/2)*0.22, sx = king.position.x + Math.sin(a)*1.5, sz = king.position.z + Math.cos(a)*1.5, t = dist/9.5;
    o.m.position.set(sx, 3.6, sz); o.vx = Math.sin(a)*9.5; o.vz = Math.cos(a)*9.5; o.vy = (1.1 - 3.6)/t; o.life = 4; o.m.visible = true;
  }
}
function hurtKing(d){
  if (!kingAlive) return;
  kingHp -= d; kHit = 0.1;
  if (kingHp <= 0) { kingAlive = false; kills++; spawnShards(king.position.x, 2.2, king.position.z, 26); say('THE HOLLOW KING FALLS', 4500); sweepNoise(100, 3000, 3, 2); setTimeout(ending, tm(3500)); }
}
function updateKing(dt){
  if (realm !== 4 || heaven) return;
  const pp = camera.position;
  for (const o of orbs) {
    if (o.life <= 0) continue;
    o.life -= dt; o.m.position.x += o.vx*dt; o.m.position.y += o.vy*dt; o.m.position.z += o.vz*dt;
    const m = o.m.position;
    if (m.y < 0.05 || o.life <= 0) { o.life = 0; o.m.visible = false; continue; }
    if (pillarPos.some(p => Math.hypot(m.x - p[0], m.z - p[1]) < p[2] + 0.3 && m.y < 8)) { o.life = 0; o.m.visible = false; continue; }
    if (!dead && Math.hypot(m.x - pp.x, m.z - pp.z, m.y - (pp.y - 0.35)) < 0.65) { o.life = 0; o.m.visible = false; hurt(20); }
  }
  if (wave.visible) {
    waveR += dt*11; wave.scale.setScalar(waveR);
    if (!waveHit && !dead && Math.abs(Math.hypot(pp.x - waveX, pp.z - waveZ) - waveR) < 0.7 && jumpH < 0.5) { waveHit = true; hurt(25); }
    if (waveR > 34) wave.visible = false;
  }
  if (!kingAlive) {
    kFall = Math.min(1, kFall + dt*0.5); king.scale.setScalar(Math.max(0.02, 1 - kFall*kFall)); king.rotation.y += dt*4*kFall;
    beastLight.intensity = 3*(1 - kFall) + Math.random()*kFall*4; return;
  }
  kHit = Math.max(0, kHit - dt);
  const ph = kingHp <= 22 ? 2 : 1;
  if (ph !== kPhase) { kPhase = ph; say('IT SCREAMS. THE FLOOR TREMBLES.', 3500); sweepNoise(80, 2500, 1.6, 1.8); }
  kAng += dt*(ph === 2 ? 0.28 : 0.15);
  king.position.set(BX + Math.cos(kAng)*9, 0.8 + Math.sin(time*1.3)*0.25, Math.sin(kAng)*9);
  king.rotation.y = Math.atan2(pp.x - king.position.x, pp.z - king.position.z);
  kAtkT -= dt; kWaveCd -= dt;
  if (kSlam > 0) { kSlam -= dt; if (kSlam <= 0) { wave.visible = true; waveR = 1; waveHit = false; waveX = king.position.x; waveZ = king.position.z; wave.position.set(waveX, 0.06, waveZ); sweepNoise(60, 1200, 0.8, 2); kAtkT = 1.5; } }
  else if (kAtkT <= 0) {
    if (ph === 2 && kWaveCd <= 0) { kSlam = 0.9; kWaveCd = 7; sweepTone(50, 140, 0.9, 1, 'sawtooth'); }
    else { fireOrbs(ph === 2 ? 5 : 3); kAtkT = ph === 2 ? 1.7 : 2.4; }
  }
  if (ph === 2) { kBlink -= dt; if (kBlink <= 0) { kBlink = 9; kAng = Math.random()*6.283; sweepNoise(300, 4000, 0.4, 1.2); } }
  const ax = kSlam > 0 ? -2.8 : -0.6;
  kArms.forEach(a => { a.rotation.x += (ax - a.rotation.x)*Math.min(1, dt*8); });
  robeMat.emissive.setHex(kHit > 0 ? 0x6030a0 : 0x120a24); maskMat.emissive.setHex(kHit > 0 ? 0xaaaaee : 0x333040);
  beastLight.intensity = (kSlam > 0 ? 4 : 1.6) + Math.sin(time*4)*0.2;
}
function endRow(k, v){ return '<div class="st"><span>' + k + '</span><b>' + v + '</b></div>'; }
function ending(){
  teleporting = true; endingUp = true; clearKeys(); joyReset(); firing = false;
  if (document.pointerLockElement) document.exitPointerLock();
  const prev = progress.cycle || 0;
  const mins = Math.floor(runTime / 60), secs = Math.floor(runTime % 60);
  const loreN = progress.lore ? Object.keys(progress.lore).length : 0;
  document.getElementById('endSub').textContent = prev === 0
    ? 'THE GRID LETS GO. IT DOES NOT LET GO FOR LONG.'
    : 'CYCLE ' + (prev + 1) + ' ENDS. THE GRID REBUILDS ITSELF, A LITTLE ANGRIIER.';
  document.getElementById('endStats').innerHTML =
    endRow('CYCLE', prev + 1) +
    endRow('TIME', mins + ':' + String(secs).padStart(2, '0')) +
    endRow('KILLS', kills) +
    endRow('SHARDS', shards) +
    endRow('LORE FOUND', loreN + '/' + LORE.length) +
    endRow('UPGRADES', (up.damage + up.vitality + up.swift) + '/12');
  document.getElementById('endNext').textContent = 'BEGIN CYCLE ' + (prev + 2);
  document.getElementById('endWrap').style.display = 'flex';
  sweepNoise(120, 2600, 2.6, 1.2);
}
function leaveEnding(){
  document.getElementById('endWrap').style.display = 'none';
  endingUp = false; teleporting = false; dead = false; health = maxHp; runTime = 0;
  if (!isTouch && cv.requestPointerLock) cv.requestPointerLock();
}
document.getElementById('endNext').addEventListener('click', () => {
  progress.cycle = (progress.cycle || 0) + 1;
  kills = 0;
  saveAll();
  leaveEnding();
  leaveRealm2();
  progress.max = Math.max(progress.max || 1, 1); recordProgress();
  say('CYCLE ' + (progress.cycle + 1) + '. EVERYTHING IS A LITTLE ANGRIER.', 4500);
});
document.getElementById('endStay').addEventListener('click', () => {
  leaveEnding();
  say('YOU STAY. THE GRID IS PATIENT.', 3500);
});

