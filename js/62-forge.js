/* THE GRID — THE FORGE and the three upgrades it sells.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- The Forge: spend shards on yourself ------------------------------------
const UPGRADES = [
  {k: 'damage', name: 'HOLLOW ROUNDS', desc: '+15% weapon damage', max: 5, cost: l => 4 + l * 4},
  {k: 'vitality', name: 'SECOND SKIN', desc: '+25 maximum health', max: 4, cost: l => 5 + l * 5},
  {k: 'swift', name: 'LIGHT STEP', desc: '+6% movement speed', max: 3, cost: l => 4 + l * 5}
];
// ---- The house: ten levels, a steeper price every time ----------------------
const HOUSE_MAX = 10;
function houseLv() { return Math.min(HOUSE_MAX, (progress && progress.house) || 0); }
function houseCost(l) { return 8 + l * 7 + l * l * 3; }              // 8, 18, 34, 56, 84, 118, 158, 204, 256, 314
function houseBonus() { return houseLv() * 8; }
const houseWindows = [], houseLamp = new THREE.PointLight(0xffb060, 0, 14, 1.5);
houseLamp.position.set(0, 1.9, -11.6); scene.add(houseLamp);
[[-2.15, -9.02, 0], [2.15, -9.02, 0], [-3.36, -11.2, 1], [-3.36, -13.4, 1], [3.36, -11.2, 1], [3.36, -13.4, 1]].forEach(([x, z, side]) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.66),
    new THREE.MeshBasicMaterial({color: 0xffb060, transparent: true, opacity: 0.9, fog: false}));
  m.position.set(x, 1.55, z);
  m.rotation.y = side ? (x > 0 ? -Math.PI / 2 : Math.PI / 2) : (z < -10 ? Math.PI : 0);
  m.visible = false; scene.add(m); houseWindows.push(m);
});
function houseVisual() {
  const lvl = houseLv();
  houseWindows.forEach((m, i) => { m.visible = i < Math.ceil(lvl / 2) && lvl > 0; });
  houseLamp.intensity = lvl * 0.35;
}
function applyHouse() { applyUpgrades(); houseVisual(); }
function updateHouse(dt) {
  if (realm !== 1 || heaven || dead || paused) return;
  if (houseLv() <= 0 || !insideHouse()) return;
  if (health >= maxHp) return;
  health = Math.min(maxHp, health + (1 + houseLv() * 0.5) * dt);
  updateStats();
}

const FORGE_AT = {1: [-6, 2], 2: [3, 17], 3: [-4, 15], 4: [0, 9]};
const forges = [];
function buildForge(n) {
  const [lx, lz] = FORGE_AT[n];
  const g = new THREE.Group(); g.position.set(REALM_X[n] + lx, 0, lz);
  const stone = new THREE.MeshStandardMaterial({color: 0x15100d, roughness: 0.75, metalness: 0.35, emissive: 0x1a0a04});
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.08, 0.45, 8), stone); base.position.y = 0.22; g.add(base);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.46, 1.5, 8), stone); col.position.y = 1.05; g.add(col);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.32, 0.3, 10), stone); bowl.position.y = 1.9; g.add(bowl);
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({color: 0xff8a3a}));
  ember.position.y = 2.02; g.add(ember);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 6, 28), new THREE.MeshBasicMaterial({color: 0xffb060}));
  ring.position.y = 1.5; ring.rotation.x = Math.PI / 2; g.add(ring);
  const lt = new THREE.PointLight(0xff8a3a, 1.7, 9, 1.6); lt.position.y = 2.1; g.add(lt);
  g.userData = {ember, ring, realm: n, light: lt};
  forgeLayer.add(g); forges.push(g);
  return g;
}
for (const n of [1, 2, 3, 4]) buildForge(n);

const forgeEl = document.getElementById('forge');
let forgeOpen = false, endingUp = false;
function buildForgeUI() {
  forgeEl.querySelector('.sh').textContent = '◆ ' + shards + ' SHARDS   ·   CYCLE ' + ((progress.cycle || 0) + 1);
  const box = document.getElementById('forgeRows');
  box.innerHTML = '';
  for (const u of UPGRADES) {
    const lvl = up[u.k], maxed = lvl >= u.max, cost = u.cost(lvl);
    const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button');
    b.innerHTML = u.name + ' <span class="lvl">' + '\u25a0'.repeat(Math.max(0, lvl)) + '\u25a1'.repeat(Math.max(0, u.max - lvl)) + '</span><span class="desc">' + u.desc + '</span>';
    b.disabled = maxed || shards < cost;
    b.addEventListener('click', () => {
      // re-read live state: the panel is rebuilt after every purchase
      const live = up[u.k], c = u.cost(live);
      if (live >= u.max || shards < c) return;
      shards -= c; up[u.k]++;
      applyUpgrades(); sweepTone(320, 900, 0.35, 0.45, 'triangle');
      saveAll(); buildForgeUI();
    });
    const c = document.createElement('div'); c.className = 'cost';
    c.textContent = maxed ? 'MAX' : cost + '◆';
    row.append(b, c); box.appendChild(row);
  }
  if (realm === 1) {
    const lvl = houseLv(), maxed = lvl >= HOUSE_MAX, cost = houseCost(lvl);
    const head = document.createElement('div');
    head.className = 'houseHead';
    head.textContent = 'THE HOUSE';
    const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button');
    b.innerHTML = 'YOUR CABIN <span class="lvl">' + '\u25a0'.repeat(Math.max(0, lvl)) + '\u25a1'.repeat(Math.max(0, HOUSE_MAX - lvl))
      + '</span><span class="desc">+8 max health each level \u00b7 it heals you while you stand inside</span>';
    b.disabled = maxed || shards < cost;
    b.addEventListener('click', () => {
      const live = houseLv(), c = houseCost(live);
      if (live >= HOUSE_MAX || shards < c) return;
      shards -= c; progress.house = live + 1;
      applyHouse(); saveAll();
      sweepTone(260, 780, 0.4, 0.4, 'triangle');
      say('THE HOUSE HOLDS YOU A LITTLE BETTER', 2200);
      buildForgeUI();
    });
    const c = document.createElement('div'); c.className = 'cost';
    c.textContent = maxed ? 'MAX' : cost + '\u25c6';
    row.append(b, c);
    box.append(head, row);
  }
}
function openForge() {
  if (paused || heaven) return;
  forgeOpen = true;
  setPaused(true);
  menu.classList.add('hidden');
  forgeEl.style.display = 'block';
  buildForgeUI();
}
function closeForge() {
  forgeEl.style.display = 'none';
  forgeOpen = false;
  setPaused(false);
  startAudio();
  if (!isTouch && cv.requestPointerLock) cv.requestPointerLock();
}
document.getElementById('forgeClose').addEventListener('click', closeForge);
function applyUpgrades() {
  maxHp = 100 + up.vitality * 25 + houseBonus();
  if (health > maxHp) health = maxHp;
  updateStats();
}
function updateForge(dt) {
  for (const f of forges) {
    const on = f.userData.realm === realm && !heaven;
    f.visible = on;
    if (!on) continue;
    f.userData.ember.scale.setScalar(1 + Math.sin(time * 4) * 0.12);
    f.userData.ring.rotation.z += dt * 0.7;
    f.userData.light.intensity = 1.5 + Math.sin(time * 3.3) * 0.35;
  }
}

