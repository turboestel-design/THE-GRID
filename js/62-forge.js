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
// ---- The interior: ten levels of furniture, bought the same way --------------
const INTERIOR_MAX = 10;
function interiorLv() { return Math.min(INTERIOR_MAX, (progress && progress.interior) || 0); }
function interiorCost(l) { return 6 + l * 5 + l * l * 2; }           // 6, 13, 24, 39, 58, 81, 108, 139, 174, 213
const interiorStages = [];
function interiorStage(lvl, group) {
  group.visible = false; scene.add(group);
  interiorStages.push({lvl, g: group});
  return group;
}
const darkWood = () => new THREE.MeshStandardMaterial({color: 0x3a2418, roughness: 1, flatShading: true});
const cloth = c => new THREE.MeshStandardMaterial({color: c, roughness: 1});
const candleGlow = () => new THREE.MeshBasicMaterial({color: 0xffc070, fog: false});

// 1 · a rug on the floor
{
  const g = new THREE.Group();
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.3), cloth(0x5a1a1c));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.03, -12.1); g.add(rug);
  const trim = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 1.95), cloth(0x7a2a24));
  trim.rotation.x = -Math.PI / 2; trim.position.set(0, 0.035, -12.1); g.add(trim);
  const roomLight = new THREE.PointLight(0xffb060, 0.7, 11, 1.6);
  roomLight.position.set(0, 2.5, -12.1); g.add(roomLight);
  interiorStage(1, g);
}
// 2 · a table and two chairs
{
  const g = new THREE.Group(), wood = darkWood();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.9), wood); top.position.set(0, 0.76, -12.1); g.add(top);
  [[-0.62, -0.35], [0.62, -0.35], [-0.62, 0.35], [0.62, 0.35]].forEach(([x, z]) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.74, 0.08), wood);
    l.position.set(x, 0.37, -12.1 + z); g.add(l);
  });
  [-0.95, 0.95].forEach(x => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.44), wood); seat.position.set(x, 0.45, -12.1); g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.07), wood); back.position.set(x, 0.72, -12.32); g.add(back);
    [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(([lx, lz]) => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), wood);
      l.position.set(x + lx, 0.22, -12.1 + lz); g.add(l);
    });
  });
  interiorStage(2, g);
}
// 3 · a fireplace at the back wall, with fire
{
  const g = new THREE.Group();
  const brick = new THREE.MeshStandardMaterial({color: 0x2e2320, roughness: 1, flatShading: true});
  const mantel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.5, 0.42), brick); mantel.position.set(0, 0.75, -14.58); g.add(mantel);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 0.56), darkWood()); shelf.position.set(0, 1.56, -14.5); g.add(shelf);
  const hole = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.88, 0.1), new THREE.MeshBasicMaterial({color: 0x120402})); hole.position.set(0, 0.55, -14.36); g.add(hole);
  const fire = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.7), candleGlow()); fire.position.set(0, 0.5, -14.3); g.add(fire);
  const fl = new THREE.PointLight(0xff7a2a, 1.9, 8, 1.6); fl.position.set(0, 0.7, -14.1); g.add(fl);
  g.userData.fire = fire; g.userData.fl = fl;
  interiorStage(3, g);
}
// 4 · a bed in the corner
{
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.32, 2.05), darkWood()); frame.position.set(-2.6, 0.18, -13.3); g.add(frame);
  const mat = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 1.9), cloth(0x3a3a44)); mat.position.set(-2.6, 0.42, -13.3); g.add(mat);
  const pil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.34), cloth(0x6a5a4a)); pil.position.set(-2.6, 0.55, -14.1); g.add(pil);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.6, 0.1), darkWood()); head.position.set(-2.6, 0.5, -14.3); g.add(head);
  interiorStage(4, g);
}
// 5 · a bookshelf, filled
{
  const g = new THREE.Group(), wood = darkWood();
  const shell = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.9, 1.5), wood); shell.position.set(3.12, 0.95, -12.4); g.add(shell);
  for (let i = 0; i < 4; i++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 1.44), wood); board.position.set(3.12, 0.35 + i * 0.46, -12.4); g.add(board);
    for (let k = 0; k < 7; k++) {
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.07), cloth([0x6a2a24, 0x2a4a3a, 0x3a3a6a, 0x6a5a2a][k % 4]));
      bk.position.set(3.12, 0.53 + i * 0.46, -13.02 + k * 0.15); g.add(bk);
    }
  }
  interiorStage(5, g);
}
// 6 · a lantern hung from the ceiling
{
  const g = new THREE.Group();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 4), hsGlow(0x3a2a20, 1));
  cord.position.set(0, 2.95, -11.2); g.add(cord);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.24), candleGlow()); body.position.set(0, 2.6, -11.2); g.add(body);
  const ll = new THREE.PointLight(0xffb265, 1.5, 9, 1.8); ll.position.set(0, 2.55, -11.2); g.add(ll);
  g.userData.lamp = body; g.userData.ll = ll;
  interiorStage(6, g);
}
// 7 · crates and supplies in the corner
{
  const g = new THREE.Group(), wood = darkWood();
  [[2.5, 0.3, -10.2, 0.6], [2.9, 0.3, -10.7, 0.5], [2.6, 0.85, -10.35, 0.45]].forEach(([x, y, z, s]) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), wood);
    c.position.set(x, y, z); c.rotation.y = Math.random(); g.add(c);
  });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.8, 10), wood);
  barrel.position.set(-2.9, 0.4, -10.1); g.add(barrel);
  interiorStage(7, g);
}
// 8 · a rocking chair and a candle on a side table
{
  const g = new THREE.Group(), wood = darkWood();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.5), wood); seat.position.set(-2.1, 0.46, -11.2); g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.07), wood); back.position.set(-2.1, 0.78, -11.45); back.rotation.x = -0.14; g.add(back);
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([lx, lz]) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.06), wood);
    l.position.set(-2.1 + lx, 0.23, -11.2 + lz); g.add(l);
  });
  [[-0.36, 0], [0.36, 0]].forEach(([lx]) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.8), wood);
    r.position.set(-2.1 + lx, 0.04, -11.2); g.add(r);
  });
  const st = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.42), wood); st.position.set(-1.35, 0.25, -12.0); g.add(st);
  const cd = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 6), candleGlow()); cd.position.set(-1.35, 0.63, -12.0); g.add(cd);
  const cl = new THREE.PointLight(0xffb265, 0.9, 5, 1.8); cl.position.set(-1.35, 0.75, -12.0); g.add(cl);
  g.userData.candle = cd; g.userData.cl = cl;
  interiorStage(8, g);
}
// 9 · pictures on the walls
{
  const g = new THREE.Group();
  const frameMat = darkWood();
  [[-2.4, 1.8, -9.13, 0], [1.9, 1.95, -9.13, 0], [-3.37, 1.75, -10.6, 1]].forEach(([x, y, z, side]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.46, 0.06), frameMat);
    const canvas = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.34), cloth([0x2a3a44, 0x44342a, 0x3a2a3a][Math.floor(Math.random() * 3)]));
    f.position.set(x, y, z); canvas.position.set(x, y, z + (side ? 0 : 0.04));
    if (side) { f.rotation.y = canvas.rotation.y = Math.PI / 2; canvas.position.x = x + 0.04; canvas.position.z = z; }
    g.add(f, canvas);
  });
  interiorStage(9, g);
}
// 10 · a chandelier, and the room properly lit
{
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.045, 6, 22), hsGlow(0x6a5a3a, 1));
  ring.position.set(0, 2.75, -12.1); ring.rotation.x = Math.PI / 2; g.add(ring);
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), hsGlow(0x6a5a3a, 1));
  chain.position.set(0, 3.05, -12.1); g.add(chain);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * 6.283;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 5), candleGlow());
    c.position.set(Math.cos(a) * 0.52, 2.86, -12.1 + Math.sin(a) * 0.52); g.add(c);
  }
  const cl2 = new THREE.PointLight(0xffc078, 2.4, 12, 1.5); cl2.position.set(0, 2.7, -12.1); g.add(cl2);
  g.userData.ring = ring; g.userData.cl2 = cl2;
  interiorStage(10, g);
}

function interiorVisual() {
  const lvl = interiorLv();
  for (const s of interiorStages) s.g.visible = lvl >= s.lvl;
}
function interiorAnimate(dt) {
  const lvl = interiorLv();
  if (lvl <= 0) return;
  const at = n => interiorStages.find(s => s.lvl === n);
  const s3 = at(3), s6 = at(6), s8 = at(8), s10 = at(10);
  if (lvl >= 3 && s3) {
    const flick = 0.75 + Math.sin(time * 9.3) * 0.16 + Math.sin(time * 23.1) * 0.09;
    s3.g.userData.fl.intensity = 1.9 * flick;
    s3.g.userData.fire.scale.y = 0.9 + flick * 0.2;
  }
  if (lvl >= 6 && s6) s6.g.userData.ll.intensity = 1.5 * (0.92 + Math.sin(time * 5.7) * 0.08);
  if (lvl >= 8 && s8) s8.g.userData.cl.intensity = 0.9 * (0.85 + Math.sin(time * 7.1) * 0.15);
  if (lvl >= 10 && s10) { s10.g.userData.cl2.intensity = 2.4 * (0.94 + Math.sin(time * 3.3) * 0.06); s10.g.userData.ring.rotation.z += dt * 0.2; }
}
function applyInterior() { interiorVisual(); }

function applyHouse() { applyUpgrades(); houseVisual(); interiorVisual(); }
function updateHouse(dt) {
  if (realm === 1 && !heaven) { houseAnimate(dt); interiorAnimate(dt); }
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

    const lvlI = interiorLv(), maxedI = lvlI >= INTERIOR_MAX, costI = interiorCost(lvlI);
    const headI = document.createElement('div');
    headI.className = 'houseHead';
    headI.textContent = 'THE INTERIOR';
    const rowI = document.createElement('div'); rowI.className = 'row';
    const bI = document.createElement('button');
    bI.innerHTML = 'FURNISH IT <span class="lvl">' + '\u25a0'.repeat(Math.max(0, lvlI)) + '\u25a1'.repeat(Math.max(0, INTERIOR_MAX - lvlI))
      + '</span><span class="desc">nothing but comfort \u00b7 every level puts something in the room</span>';
    bI.disabled = maxedI || shards < costI;
    bI.addEventListener('click', () => {
      const live = interiorLv(), c = interiorCost(live);
      if (live >= INTERIOR_MAX || shards < c) return;
      shards -= c; progress.interior = live + 1;
      applyInterior(); saveAll();
      gorePuff(0, 1.4, -12, 14, 0xffc070, 2.6, 3.2);
      sweepTone(300, 820, 0.35, 0.35, 'triangle');
      say('SOMETHING ELSE IN THE ROOM', 2000);
      buildForgeUI();
    });
    const cI = document.createElement('div'); cI.className = 'cost';
    cI.textContent = maxedI ? 'MAX' : costI + '\u25c6';
    rowI.append(bI, cI);
    box.append(headI, rowI);
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

