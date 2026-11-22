/* THE GRID — The weapon table, switching, ammo stores and the shot sound.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ===== WEAPONS, WORLD 3 (ASHEN WASTE) AND WORLD 4 (FINAL ARENA) =====
const WEAPONS = {
  pistol:  {name: 'PISTOL',  max: 14, cd: 0.4,  auto: false, pellets: 1, spread: 0,     dmg: 1,   head: 4,   kick: 1},
  shotgun: {name: 'SHOTGUN', max: 8,  cd: 0.95, auto: false, pellets: 8, spread: 0.075, dmg: 0.6, head: 1.2, kick: 2},
  rifle:   {name: 'RIFLE',   max: 30, cd: 0.11, auto: true,  pellets: 1, spread: 0.012, dmg: 0.5, head: 2,   kick: 0.35}
};
const owned = {pistol: false, shotgun: false, rifle: false}, store = {pistol: 0, shotgun: 0, rifle: 0};
let cur = 'pistol', firing = false;
const ammoLabel = document.getElementById('ammoLabel'), swapBtn = document.getElementById('swapBtn');
statsEl.textContent = 'HP 100';
function box(w, h, d, mat, x, y, z){ const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; }
const woodMat2 = new THREE.MeshStandardMaterial({color: 0x5a3a22, emissive: 0x1a0f08, roughness: 1});
function makeShotgun(){ const g = new THREE.Group(); g.add(box(0.05, 0.05, 0.6, gunMat, 0, 0.03, -0.2), box(0.045, 0.045, 0.6, gunMat, 0, -0.025, -0.2), box(0.07, 0.06, 0.22, woodMat2, 0, -0.04, -0.12), box(0.06, 0.09, 0.3, gunMat, 0, 0, 0.12), box(0.05, 0.12, 0.22, woodMat2, 0, -0.04, 0.32)); return g; }
function makeRifle(){ const g = new THREE.Group(); g.add(box(0.05, 0.08, 0.5, gunMat, 0, 0, 0), box(0.03, 0.03, 0.4, gunMat, 0, 0.02, -0.4), box(0.04, 0.15, 0.07, gunMat, 0, -0.11, 0.02), box(0.05, 0.1, 0.3, woodMat2, 0, -0.02, 0.38), box(0.03, 0.04, 0.12, gunMat, 0, 0.07, -0.05)); return g; }
const views = {pistol: makeGun(), shotgun: makeShotgun(), rifle: makeRifle()};
views.shotgun.position.z = -0.1; views.rifle.position.z = -0.12;
for (const k in views) { views[k].visible = (k === 'pistol'); gunView.add(views[k]); }
function selectWeapon(t){
  if (!owned[t]) return;
  store[cur] = ammo; cur = t; ammo = store[t];
  for (const k in views) views[k].visible = (k === t);
  recoil = 0; shootCd = 0.25; updateStats(); clickSound();
}
function cycleWeapon(){ const ks = Object.keys(WEAPONS).filter(k => owned[k]); if (ks.length > 1) selectWeapon(ks[(ks.indexOf(cur) + 1) % ks.length]); }
function refill(){ store[cur] = ammo; for (const k in WEAPONS) if (owned[k]) store[k] = WEAPONS[k].max; ammo = store[cur]; updateStats(); }
function giveAmmo(){ store[cur] = ammo; for (const k in WEAPONS) if (owned[k]) store[k] = Math.min(WEAPONS[k].max, store[k] + Math.ceil(WEAPONS[k].max*0.5)); ammo = store[cur]; updateStats(); }
function needAmmo(){ store[cur] = ammo; return Object.keys(WEAPONS).some(k => owned[k] && store[k] < WEAPONS[k].max); }
function updateStats(){
  statsEl.textContent = 'HP ' + Math.max(0, Math.round(health)) + (maxHp > 100 ? '/' + maxHp : '') + '   ◆ ' + shards;
  const W = WEAPONS[cur], n = Object.keys(owned).filter(k => owned[k]).length;
  ammoBox.style.display = (hasGun && !heaven) ? 'block' : 'none';
  ammoLabel.textContent = W.name + (n > 1 ? '  [Q]' : '');
  ammoNum.textContent = ammo; ammoNum.classList.toggle('low', ammo <= Math.ceil(W.max*0.2));
  bullets.forEach((b, i) => { b.style.display = i < W.max ? 'block' : 'none'; b.classList.toggle('spent', i >= ammo); });
  swapBtn.style.display = (isTouch && hasGun && n > 1) ? 'block' : 'none';
}
function pickGun(){
  hasGun = true; owned.pistol = true; cur = 'pistol'; store.pistol = ammo = 14;
  scene.remove(gunPickup); gunView.visible = true; crossEl.style.display = 'block';
  for (const k in views) views[k].visible = (k === 'pistol');
  if (isTouch) fireBtn.style.display = 'block';
  clickSound(); setTimeout(clickSound, 160); say('PISTOL EQUIPPED  ·  14 ROUNDS', 3000); updateStats();
}
function hurt(d){ if (teleporting || settings.god) return; if (typeof hurtMarker === 'function') hurtMarker(); health -= d*(DMG[settings.diff] || 1); lastHurt = time; hurtFlash = settings.reduceFlash ? 0.4 : 1; rumble(250, 0.8); ouch(); updateStats(); if (health <= 0 && !dead) die(); }
function gunshot(t){
  if (!ac || !whiteBuf) return;
  const P = {pistol: [5000, 400, 0.3, 1.8, 140, 40, 0.18], shotgun: [3500, 180, 0.55, 2.6, 110, 30, 0.3], rifle: [7000, 900, 0.14, 1.3, 180, 70, 0.09]}[t || 'pistol'];
  const n = ac.currentTime, s = ac.createBufferSource(); s.buffer = whiteBuf;
  const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(P[0], n); f.frequency.exponentialRampToValueAtTime(P[1], n + P[2]);
  const g = ac.createGain(); g.gain.setValueAtTime(P[3], n); g.gain.exponentialRampToValueAtTime(0.001, n + P[2] + 0.05);
  s.connect(f); f.connect(g); g.connect(master); s.start(n, Math.random()*0.5, P[2] + 0.1);
  const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(P[4], n); o.frequency.exponentialRampToValueAtTime(P[5], n + P[6]);
  og.gain.setValueAtTime(1.2, n); og.gain.exponentialRampToValueAtTime(0.001, n + P[6] + 0.02);
  o.connect(og); og.connect(master); o.start(n); o.stop(n + P[6] + 0.05);
}
function colliders(){ return realm === 2 ? shroomPos : realm === 3 ? rockPos : realm === 4 ? pillarPos : realm === 5 ? gravePos : treePos; }
function pushC(nx, nz, list, e){ for (const t of list) { const ox = nx - t[0], oz = nz - t[1], r = t[2] + e, d2 = ox*ox + oz*oz; if (d2 < r*r) { const d = Math.sqrt(d2) || 0.001; nx = t[0] + ox/d*r; nz = t[1] + oz/d*r; } } return [nx, nz]; }

