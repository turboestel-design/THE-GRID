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

// ---- ten visible stages, one per level -------------------------------------
const houseStages = [];
function houseStage(lvl, group) {
  group.visible = false; scene.add(group);
  houseStages.push({lvl, g: group});
  return group;
}
const hsMat = () => new THREE.MeshStandardMaterial({color: 0x50331e, roughness: 1, flatShading: true});
const hsGlow = (c, o) => new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: o === undefined ? 1 : o, fog: false});

// 1 · two windows light up in the front
[[-2.15, -9.02, 0], [2.15, -9.02, 0]].forEach(([x, z, side]) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.66), hsGlow(0xffb060, 0.9));
  m.position.set(x, 1.55, z); m.rotation.y = side ? 0 : 0;
  houseWindows.push(m); houseStage(1, m);
});

// 2 · a porch lamp over the door
{
  const g = new THREE.Group();
  const boxl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), hsGlow(0xffcf8a, 1));
  boxl.position.set(0.85, 2.4, -8.92); g.add(boxl);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.4), hsMat());
  arm.position.set(0.85, 2.56, -9.05); g.add(arm);
  const pl = new THREE.PointLight(0xffc078, 1.1, 7, 2); pl.position.set(0.85, 2.35, -8.6); g.add(pl);
  houseStage(2, g);
}

// 3 · a chimney, and smoke that keeps coming
{
  const g = new THREE.Group();
  const stack = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.7, 0.66), new THREE.MeshStandardMaterial({color: 0x3a2a22, roughness: 1, flatShading: true}));
  stack.position.set(2.35, 3.85, -12.2); g.add(stack);
  const smoke = [];
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.22, 7, 6), hsGlow(0x8a8a92, 0.22));
    p.position.set(2.35, 4.9, -12.2); p.userData.t = i / 7; g.add(p); smoke.push(p);
  }
  g.userData.smoke = smoke;
  houseStage(3, g);
}

// 4 · a fence across the front
{
  const g = new THREE.Group();
  const wood = hsMat();
  for (let i = 0; i < 9; i++) {
    const x = -6 + i * 1.5;
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.15, 0.16), wood);
    p.position.set(x, 0.58, -6.4); p.rotation.z = (Math.random() - .5) * 0.1; g.add(p);
  }
  [-6.1, -1.4].forEach(() => {});
  [-5.2, -2.6, 1.4, 5.2].forEach(x => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 0.1), wood);
    rail.position.set(x, 0.9, -6.4); g.add(rail);
  });
  houseStage(4, g);
}

// 5 · the side windows light too
[[-3.36, -11.2, 1], [-3.36, -13.4, 1], [3.36, -11.2, 1], [3.36, -13.4, 1]].forEach(([x, z, side]) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.62), hsGlow(0xffb060, 0.85));
  m.position.set(x, 1.55, z); m.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
  houseWindows.push(m); houseStage(5, m);
});

// 6 · sandbags across the porch
{
  const g = new THREE.Group();
  const bag = new THREE.MeshStandardMaterial({color: 0x4a4230, roughness: 1, flatShading: true});
  for (let i = 0; i < 3; i++) {
    [-1.5, 1.5].forEach(x => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.26, 0.4), bag);
      b.position.set(x + (Math.random() - .5) * 0.12, 0.14 + i * 0.26, -8.5);
      b.rotation.y = (Math.random() - .5) * 0.3; g.add(b);
    });
  }
  houseStage(6, g);
}

// 7 · a weathervane on the roof
{
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 5), hsGlow(0x9a8f80, 1));
  pole.position.set(0, 5.2, -12); g.add(pole);
  const vane = new THREE.Group(); vane.position.set(0, 5.95, -12);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.05), hsGlow(0x9a8f80, 1)); vane.add(bar);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.02), hsGlow(0x9a8f80, 1)); fin.position.x = -0.3; vane.add(fin);
  g.add(vane); g.userData.vane = vane;
  houseStage(7, g);
}

// 8 · a string of lights along the porch
{
  const g = new THREE.Group();
  const bulbs = [];
  for (let i = 0; i < 9; i++) {
    const x = -3.2 + i * 0.8;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 7, 6), hsGlow(i % 2 ? 0xffd08a : 0xff8a5a, 1));
    b.position.set(x, 2.62 - Math.sin(i / 8 * Math.PI) * 0.22, -8.86); g.add(b); bulbs.push(b);
  }
  g.userData.bulbs = bulbs;
  houseStage(8, g);
}

// 9 · a floodlight that throws across the yard
{
  const g = new THREE.Group();
  const lampL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.34), hsGlow(0xfff0c0, 1));
  lampL.position.set(-2.9, 4.3, -9.15); g.add(lampL);
  const sp = new THREE.SpotLight(0xffe0a0, 2.6, 30, 0.62, 0.55, 1.1);
  sp.position.set(-2.9, 4.3, -9.15);
  sp.target.position.set(0.6, 0, -1.5);
  g.add(sp, sp.target);
  g.userData.spot = sp;
  houseStage(9, g);
}

// 10 · a beacon over the roof
{
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.85, 15, 9, 1, true),
    new THREE.MeshBasicMaterial({color: 0xffc070, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}));
  beam.position.set(0, 9.5, -12); g.add(beam);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), hsGlow(0xffe0b0, 1));
  cap.position.set(0, 5.9, -12); g.add(cap);
  g.userData.beam = beam;
  houseStage(10, g);
}

function houseVisual() {
  const lvl = houseLv();
  for (const s of houseStages) s.g.visible = lvl >= s.lvl;
  houseLamp.intensity = lvl * 0.35;
}
function houseAnimate(dt) {
  const lvl = houseLv();
  if (lvl <= 0) return;
  const at = n => houseStages.find(s => s.lvl === n);
  const s3 = at(3), s7 = at(7), s8 = at(8), s10 = at(10);
  if (lvl >= 3 && s3.g.userData.smoke) {
    for (const p of s3.g.userData.smoke) {
      p.userData.t += dt * 0.22;
      if (p.userData.t > 1) p.userData.t -= 1;
      const t = p.userData.t;
      p.position.y = 4.9 + t * 4.2;
      p.position.x = 2.35 + Math.sin(t * 5.2) * 0.55 * t;
      p.position.z = -12.2 + Math.cos(t * 3.7) * 0.4 * t;
      const sc = 0.6 + t * 2.1;
      p.scale.setScalar(sc);
      p.material.opacity = 0.24 * (1 - t);
    }
  }
  if (lvl >= 7 && s7.g.userData.vane) s7.g.userData.vane.rotation.y += dt * (0.5 + Math.sin(time * 0.7) * 0.4);
  if (lvl >= 8 && s8.g.userData.bulbs) {
    s8.g.userData.bulbs.forEach((b, i) => {
      b.material.opacity = 0.55 + 0.45 * Math.sin(time * 2.2 + i * 0.9);
    });
  }
  if (lvl >= 10 && s10.g.userData.beam) {
    s10.g.userData.beam.material.opacity = 0.10 + Math.sin(time * 1.3) * 0.06;
    s10.g.userData.beam.rotation.y += dt * 0.25;
  }
}
function applyHouse() { applyUpgrades(); houseVisual(); }
function updateHouse(dt) {
  if (realm === 1 && !heaven) houseAnimate(dt);
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
      + '</span><span class="desc">+8 max health \u00b7 heals you inside \u00b7 every level changes how it looks</span>';
    b.disabled = maxed || shards < cost;
    b.addEventListener('click', () => {
      const live = houseLv(), c = houseCost(live);
      if (live >= HOUSE_MAX || shards < c) return;
      shards -= c; progress.house = live + 1;
      applyHouse(); saveAll();
      gorePuff(0, 2.4, -9, 16, 0xffc070, 3.5, 4.5);
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

