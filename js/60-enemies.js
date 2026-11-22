/* THE GRID — Act II enemies: husks, spitters and wisps, plus the mid-boss wave.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ============================================================================
//  ACT II — inhabitants, shards, the forge and the history of the Grid
//  Everything below is additive: the four realms keep working even if none of
//  this exists, but with it they stop being empty boss arenas.
// ============================================================================

const mobLayer = new THREE.Group(), shardLayer = new THREE.Group(), lordLayer = new THREE.Group();
const loreLayer = new THREE.Group(), forgeLayer = new THREE.Group();
scene.add(mobLayer, shardLayer, loreLayer, forgeLayer, lordLayer);

const REALM_X = {1: 0, 2: RX, 3: AX, 4: BX, 5: ZX};
const REALM_NAME = {1: 'THE DEAD FOREST', 2: 'THE HOLLOW GLOW', 3: 'THE ASHEN WASTE', 4: 'THE ECLIPSE', 5: 'THE ZOMBIE DIMENSION'};

// ---- Enemies -----------------------------------------------------------------
function cyc(){ return 1 + (progress.cycle || 0) * 0.35; }
const MOB_DEF = {
  husk:    {hp: 3, spd: 2.15, dmg: 10, r: 0.45, shards: 1, style: 'melee',  name: 'HUSK'},
  spitter: {hp: 2, spd: 1.45, dmg: 10, r: 0.50, shards: 1, style: 'range',  name: 'SPITTER'},
  wisp:    {hp: 2, spd: 3.60, dmg: 9,  r: 0.40, shards: 2, style: 'dash',   name: 'WISP'},
  zombie:  {hp: 5, spd: 1.00, dmg: 15, r: 0.50, shards: 3, style: 'melee',  name: 'ZOMBIE'}
};
// [kind, local x, local z] per realm
const SPAWNS = {
  1: [['husk', -18, -6], ['husk', 16, -14], ['husk', -22, 18], ['husk', 24, 22], ['husk', -8, 30], ['husk', 6, -32],
      ['zombie', 30, -24], ['zombie', -30, -26]],
  2: [['spitter', 14, -6], ['spitter', -16, 4], ['husk', 22, 18], ['husk', -20, -18], ['spitter', 4, -26], ['husk', -4, 30]],
  3: [['husk', 18, -10], ['husk', -18, 12], ['spitter', 26, 6], ['husk', -24, -14], ['zombie', 8, 26], ['zombie', -30, 0]],
  4: [['wisp', 10, 8], ['wisp', -10, 8], ['wisp', 0, -10], ['wisp', 12, -8], ['zombie', -14, -6], ['zombie', 16, 4]],
  5: []
};
const mobs = [];
const waveDone = {1: false, 2: false, 3: false, 4: false};

// ---- The horde: the dead claw out of the ground on a timer -------------------
const HORDE_FIRST = 34, HORDE_EVERY = 42, HORDE_CAP = 7, HORDE_RISE = 1.6;
let hordeT = HORDE_FIRST, hordeN = 0;
function hordeAlive() {
  let n = 0;
  for (const m of mobs) if (m.alive && m.kind === 'zombie' && m.realm === realm) n++;
  return n;
}
function updateHorde(dt) {
  const tag = document.getElementById('hordeTag'), num = document.getElementById('hordeNum');
  if (realm === 5) { if (tag) tag.style.display = 'none'; return; }
  if (heaven || dead || teleporting || paused) { if (tag) tag.style.display = 'none'; return; }
  const alive = hordeAlive();
  if (tag) { tag.style.display = alive ? 'block' : 'none'; if (num) num.textContent = alive; }
  if (alive >= HORDE_CAP) return;
  hordeT -= dt;
  if (hordeT > 0) return;
  hordeT = HORDE_EVERY;
  hordeN++;
  if (hordeN % 3 === 0 && !lord) { spawnLord(realm); return; }
  const pack = Math.min(2 + hordeN, 5);
  for (let i = 0; i < pack; i++) {
    const a = Math.random() * 6.283, r = 8 + Math.random() * 6;
    const c = clampToRealm(camera.position.x + Math.sin(a) * r, camera.position.z + Math.cos(a) * r, realm);
    makeMob('zombie', c[0], c[1], realm);
  }
  say('HORDE ' + hordeN + '  \u00b7  THE GROUND MOVES', 2800);
  sweepTone(90, 38, 1.1, 0.5, 'sawtooth');
}
function resetHorde() {
  hordeT = HORDE_FIRST; hordeN = 0;
  if (lord) { lordLayer.remove(lord.g); lord = null; }
}

// ---- THE CONGREGATION: what a horde becomes when it gets big enough ----------
const LORD_HP = 60, LORD_DMG = 26, LORD_NAME = 'THE CONGREGATION';
let lord = null, lordRing = null;

function buildLord() {
  const g = new THREE.Group();
  const flesh = new THREE.MeshStandardMaterial({color: 0x54613f, roughness: 1, emissive: 0x0d1207});
  const rag = new THREE.MeshStandardMaterial({color: 0x231c12, roughness: 1});
  const bone = new THREE.MeshStandardMaterial({color: 0xb0a488, roughness: 1});
  const eye = new THREE.MeshBasicMaterial({color: 0xd6ff72});
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.0), flesh); chest.position.y = 1.75; g.add(chest);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * 6.283, r = 0.62;
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.05, 0.34), i % 2 ? rag : flesh);
    t.position.set(Math.cos(a) * r, 1.35 + (i % 2 ? 0.14 : 0), Math.sin(a) * r * 0.8);
    t.rotation.y = a; t.rotation.z = Math.cos(a) * 0.3; g.add(t);
  }
  const ribs = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.16), bone); ribs.position.set(0, 1.85, 0.5); g.add(ribs);
  // three heads, all looking at you
  const heads = [];
  [[-0.38, 0.28], [0.02, 0.42], [0.4, 0.24]].forEach(([hx, hz]) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.34), flesh);
    h.position.set(hx, 2.62, hz); h.rotation.z = hx * 0.5; heads.push(h); g.add(h);
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.03), eye);
    e.position.set(hx, 2.65, hz + 0.18); g.add(e);
  });
  const limbs = [];
  [[-1.0, 1], [1.0, -1]].forEach(([ax, sgn]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.3), flesh);
    arm.position.set(ax, 1.5, 0.1); arm.rotation.z = sgn * 0.22; g.add(arm); limbs.push(arm);
  });
  [-0.42, 0.42].forEach(x => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.9, 0.36), rag);
    leg.position.set(x, 0.45, 0); g.add(leg); limbs.push(leg);
  });
  g.userData.heads = heads;
  g.scale.setScalar(1.22);
  return g;
}

function spawnLord(r) {
  if (lord) return lord;
  const g = buildLord();
  const a = Math.random() * 6.283;
  const c = clampToRealm(camera.position.x + Math.sin(a) * 11, camera.position.z + Math.cos(a) * 11, r);
  g.position.set(c[0], 0, c[1]);
  const l = {g, realm: r, hp: LORD_HP * cyc(), max: LORD_HP * cyc(), alive: true, atk: 2.5, summon: 4, ph: 0, hit: 0, fall: 0};
  g.traverse(o => { if (o.isMesh) o.userData.lord = l; });
  lordLayer.add(g);
  lord = l;
  say(LORD_NAME + ' RISES', 3200);
  sweepTone(70, 30, 1.6, 0.7, 'sawtooth');
  return l;
}

function hurtLord(d) {
  if (!lord || !lord.alive) return;
  lord.hp -= d; lord.hit = 0.15;
  gorePuff(lord.g.position.x, 2.2, lord.g.position.z, 3, 0x4a1010, 2, 2);
  if (lord.hp > 0) return;
  lord.alive = false; lord.fall = 0; kills++;
  gorePuff(lord.g.position.x, 1.9, lord.g.position.z, 34, 0x4a1010, 6, 5);
  spawnShards(lord.g.position.x, 1.4, lord.g.position.z, 25);
  say(LORD_NAME + ' COMES APART', 3500);
  sweepTone(220, 34, 1.4, 0.7, 'sawtooth');
  hordeT = HORDE_EVERY * 1.5;
}

function updateHordeLord(dt) {
  if (lordRing) {
    lordRing.t -= dt;
    if (lordRing.t <= 0) {
      lordLayer.remove(lordRing.m); lordRing.m.geometry.dispose(); lordRing = null;
    } else {
      const k = 1 - lordRing.t / 0.6;
      lordRing.m.scale.setScalar(1 + k * 5.5);
      lordRing.m.material.opacity = 0.7 * (1 - k);
    }
  }
  if (!lord) return;
  const g = lord.g;
  if (!lord.alive) {
    lord.fall = Math.min(1, lord.fall + dt * 0.7);
    g.rotation.x = -lord.fall * 1.35; g.position.y = -lord.fall * 0.7;
    if (lord.fall >= 1) { lordLayer.remove(g); lord = null; }
    return;
  }
  if (lord.realm !== realm) { g.visible = false; return; }
  g.visible = true;
  if (heaven || dead || teleporting || paused) return;
  const dx = camera.position.x - g.position.x, dz = camera.position.z - g.position.z;
  const dist = Math.hypot(dx, dz) || 0.001;
  g.rotation.y = Math.atan2(dx, dz);
  lord.hit = Math.max(0, lord.hit - dt);
  lord.atk = Math.max(0, lord.atk - dt);
  lord.summon = Math.max(0, lord.summon - dt);
  lord.ph += dt * (1.1 + (dist < 20 ? 1.3 : 0));
  if (dist > 3.4) {
    const c = clampToRealm(g.position.x + dx / dist * 1.6 * dt, g.position.z + dz / dist * 1.6 * dt, lord.realm);
    g.position.x = c[0]; g.position.z = c[1];
  } else if (lord.atk <= 0 && !dead) {
    lord.atk = 2.4; hurt(LORD_DMG);
    gorePuff(g.position.x, 1.0, g.position.z, 12, 0x3a1010, 3.6, 3.2);
  }
  if (lord.summon <= 0) {
    lord.summon = 9.5;
    for (let i = 0; i < 2; i++) {
      const a = Math.random() * 6.283;
      makeMob('zombie', g.position.x + Math.sin(a) * 3, g.position.z + Math.cos(a) * 3, lord.realm);
    }
    say('IT CALLS THEM UP', 1600);
  }
  g.position.y = Math.abs(Math.sin(lord.ph * 2.6)) * 0.14;
  g.rotation.z = Math.sin(lord.ph * 1.3) * 0.05;
}

function buildHusk() {
  const g = new THREE.Group();
  const flesh = new THREE.MeshStandardMaterial({color: 0x6b6455, roughness: 1, emissive: 0x120f0a});
  const rag = new THREE.MeshStandardMaterial({color: 0x241f19, roughness: 1});
  const eye = new THREE.MeshBasicMaterial({color: 0xffb060});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.78, 0.28), rag); torso.position.y = 1.16; g.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.31, 0.27), flesh); head.position.y = 1.69; head.userData.head = true; g.add(head);
  [-0.06, 0.06].forEach(x => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.03), eye); e.position.set(x, 1.71, 0.14); g.add(e); });
  const legs = [], arms = [];
  [-0.13, 0.13].forEach(x => { const p = new THREE.Group(); p.position.set(x, 0.8, 0); const l = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.8, 0.14), rag); l.position.y = -0.4; p.add(l); g.add(p); legs.push(p); });
  [-0.33, 0.33].forEach(x => { const p = new THREE.Group(); p.position.set(x, 1.45, 0); const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), flesh); a.position.y = -0.35; p.add(a); g.add(p); arms.push(p); });
  g.userData.legs = legs; g.userData.arms = arms;
  g.userData.flash = flesh; g.userData.baseEm = 0x120f0a;
  return g;
}
function buildSpitter() {
  const g = new THREE.Group();
  const sacMat = new THREE.MeshStandardMaterial({color: 0x3a1450, emissive: 0x50186a, roughness: 0.7});
  const sac = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), sacMat);
  sac.position.y = 1.3; g.add(sac);
  g.userData.flash = sacMat; g.userData.baseEm = 0x50186a;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.64, 14, 8, 0, 6.283, 0, 1.5708), new THREE.MeshBasicMaterial({color: 0xc45cff, side: THREE.DoubleSide}));
  cap.position.y = 1.36; cap.scale.y = 0.72; g.add(cap);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshBasicMaterial({color: 0xf2efc4}));
  eye.position.set(0, 1.32, 0.46); eye.userData.head = true; g.add(eye);
  const tent = new THREE.MeshStandardMaterial({color: 0x6a3a8a, roughness: 1});
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * 6.283;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.012, 0.85, 5), tent);
    t.position.set(Math.cos(a) * 0.3, 0.78, Math.sin(a) * 0.3);
    t.rotation.z = -Math.cos(a) * 0.35; t.rotation.x = Math.sin(a) * 0.35; g.add(t);
  }
  return g;
}
function buildWisp() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.33), new THREE.MeshBasicMaterial({color: 0xa88cff}));
  core.position.y = 1.45; core.userData.head = true; g.add(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.035, 6, 24), new THREE.MeshBasicMaterial({color: 0xd8c8ff}));
  ring.position.y = 1.45; ring.rotation.x = 1.15; g.add(ring);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshBasicMaterial({color: 0x6a50c0, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
  halo.position.y = 1.45; g.add(halo);
  g.userData.core = core; g.userData.ring = ring;
  return g;
}
function buildZombie() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color: 0x6a7a52, roughness: 1, emissive: 0x0d1207});
  const rag = new THREE.MeshStandardMaterial({color: 0x2b2419, roughness: 1});
  const bone = new THREE.MeshStandardMaterial({color: 0xb8ad90, roughness: 1});
  const eye = new THREE.MeshBasicMaterial({color: 0x9fe85a});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.8, 0.3), rag); torso.position.y = 1.2; torso.rotation.x = 0.16; g.add(torso);
  const ribs = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.06), bone); ribs.position.set(0, 1.26, 0.16); ribs.rotation.x = 0.16; g.add(ribs);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), skin); neck.position.set(0.02, 1.63, 0.1); g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.28), skin);
  head.position.set(0.03, 1.82, 0.14); head.rotation.z = 0.24; head.userData.head = true; g.add(head);
  [-0.05, 0.05].forEach(x => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.03), eye); e.position.set(x + 0.03, 1.84, 0.29); g.add(e); });
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.1), bone); jaw.position.set(0.03, 1.72, 0.26); jaw.rotation.x = 0.5; g.add(jaw);
  const legs = [], arms = [];
  [-0.14, 0.14].forEach(x => { const p = new THREE.Group(); p.position.set(x, 0.82, 0); const l = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 0.15), rag); l.position.y = -0.41; p.add(l); g.add(p); legs.push(p); });
  [-0.34, 0.34].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 1.52, 0.04);
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.66, 0.1), skin); a.position.y = -0.33; p.add(a);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.08), bone); hand.position.y = -0.7; p.add(hand);
    p.rotation.x = -1.3; g.add(p); arms.push(p);
  });
  g.userData.legs = legs; g.userData.arms = arms;
  g.userData.flash = skin; g.userData.baseEm = 0x0d1207;
  return g;
}
function makeMob(kind, x, z, r) {
  const D = MOB_DEF[kind];
  const g = kind === 'husk' ? buildHusk() : kind === 'spitter' ? buildSpitter() : kind === 'zombie' ? buildZombie() : buildWisp();
  g.position.set(x, kind === 'zombie' ? -1.5 : 0, z);
  const scale = 1 + (progress.cycle || 0) * 0.28;
  const mob = {
    kind, realm: r, g, hp: D.hp * scale, max: D.hp * scale, alive: true,
    atk: 1 + Math.random(), hit: 0, fall: 0, ph: Math.random() * 6,
    spd: D.spd, r: D.r, t: 1.5 + Math.random() * 2, ox: 0, oz: 0, ang: Math.random() * 6.283,
    rise: kind === 'zombie' ? HORDE_RISE : 0, lunged: 0
  };
  g.traverse(o => { if (o.isMesh) o.userData.mob = mob; });
  mobLayer.add(g); mobs.push(mob);
  return mob;
}
function spawnMobs(n) {
  for (let i = mobs.length - 1; i >= 0; i--) if (mobs[i].realm === n) { mobLayer.remove(mobs[i].g); mobs.splice(i, 1); }
  for (const [kind, lx, lz] of SPAWNS[n]) makeMob(kind, REALM_X[n] + lx, lz, n);
  waveDone[n] = false; resetHorde();
  for (const s of mobShots) { s.life = 0; s.m.visible = false; }
}
function clampToRealm(x, z, n) {
  if (n === 1) return [Math.max(-68, Math.min(68, x)), Math.max(-68, Math.min(68, z))];
  if (n === 2) return [Math.max(RX - 72, Math.min(RX + 72, x)), Math.max(-72, Math.min(72, z))];
  if (n === 3) return [Math.max(AX - 78, Math.min(AX + 78, x)), Math.max(-78, Math.min(78, z))];
  if (n === 5) return [Math.max(ZX - 48, Math.min(ZX + 48, x)), Math.max(-48, Math.min(48, z))];
  const dx = x - BX, d = Math.hypot(dx, z) || 0.001, lim = 25.5;
  return d > lim ? [BX + dx / d * lim, z / d * lim] : [x, z];
}
function mobMove(mob, dx, dz) {
  const g = mob.g;
  let nx = g.position.x + dx, nz = g.position.z + dz;
  for (const t of colliders()) {
    const ox = nx - t[0], oz = nz - t[1], r = t[2] + mob.r, d2 = ox * ox + oz * oz;
    if (d2 < r * r) { const d = Math.sqrt(d2) || 0.001; nx = t[0] + ox / d * r; nz = t[1] + oz / d * r; }
  }
  if (mob.realm === 1 && typeof homeBoxes === 'function') {
    for (const b of homeBoxes()) {
      const bx = Math.max(b[0], Math.min(nx, b[2])), bz = Math.max(b[1], Math.min(nz, b[3]));
      const ox = nx - bx, oz = nz - bz, d2 = ox * ox + oz * oz, rr = mob.r;
      if (d2 < rr * rr) {
        if (d2 > 1e-6) { const d = Math.sqrt(d2); nx = bx + ox / d * rr; nz = bz + oz / d * rr; }
        else { const l = nx - b[0], r = b[2] - nx, tp = nz - b[1], bt = b[3] - nz, m = Math.min(l, r, tp, bt);
          if (m === l) nx = b[0] - rr; else if (m === r) nx = b[2] + rr; else if (m === tp) nz = b[1] - rr; else nz = b[3] + rr; }
      }
    }
  }
  const c = clampToRealm(nx, nz, mob.realm);
  nx = c[0]; nz = c[1];
  if (mob.realm === 1 && Math.abs(nx) < 3.7 && nz < -8.8 && nz > -15.2) nz = nz > -12 ? -8.8 : -15.2;
  g.position.x = nx; g.position.z = nz;
}
function hurtMob(mob, d, head) {
  if (!mob.alive) return;
  if (head && mob.kind === 'zombie') d = mob.hp + 1;   // a headshot puts a walker down for good
  mob.hp -= d; mob.hit = 0.14;
  if (mob.hp > 0) {
    if (mob.kind === 'zombie') gorePuff(mob.g.position.x, 1.3, mob.g.position.z, 3, 0x4a1010, 1.8, 1.6);
    return;
  }
  mob.alive = false; mob.fall = 0; kills++;
  gorePuff(mob.g.position.x, 1.15, mob.g.position.z, mob.kind === 'zombie' ? 15 : 7,
    mob.kind === 'zombie' ? 0x4a1010 : 0x30201a, 3.4, 3.6);
  spawnShards(mob.g.position.x, 1.1, mob.g.position.z, MOB_DEF[mob.kind].shards);
  sweepTone(mob.kind === 'wisp' ? 900 : 380, 110, 0.3, 0.45, 'triangle');
}
const mobShots = [];
const shotGeo = new THREE.SphereGeometry(0.17, 8, 6);
for (let i = 0; i < 26; i++) {
  const m = new THREE.Mesh(shotGeo, new THREE.MeshBasicMaterial({color: 0xff70c0}));
  m.visible = false; scene.add(m);
  mobShots.push({m, vx: 0, vy: 0, vz: 0, life: 0});
}
function fireMobShot(from, dmg) {
  const s = mobShots.find(o => o.life <= 0); if (!s) return;
  const tx = camera.position.x - from.x, ty = (camera.position.y - 0.3) - from.y, tz = camera.position.z - from.z;
  const d = Math.hypot(tx, ty, tz) || 1, sp = 13;
  s.m.position.copy(from); s.m.visible = true;
  s.vx = tx / d * sp; s.vy = ty / d * sp; s.vz = tz / d * sp;
  s.life = 4; s.dmg = dmg * (1 + (progress.cycle || 0) * 0.2);
  sweepTone(320, 180, 0.18, 0.35, 'square');
}
function updateMobShots(dt) {
  for (const s of mobShots) {
    if (s.life <= 0) continue;
    s.life -= dt;
    s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; s.m.position.z += s.vz * dt;
    if (s.m.position.y < 0.1 || s.life <= 0) { s.life = 0; s.m.visible = false; continue; }
    if (!dead && !heaven && Math.hypot(s.m.position.x - camera.position.x, s.m.position.z - camera.position.z) < 0.55
      && Math.abs(s.m.position.y - (camera.position.y - 0.4)) < 1.1) {
      s.life = 0; s.m.visible = false; hurt(s.dmg); hitFlash();
    }
  }
}
function updateMobs(dt) {
  if (heaven || teleporting || dead) return;
  const pxReal = camera.position.x, pzReal = camera.position.z;
  for (const mob of mobs) {
    const g = mob.g;
    if (mob.realm !== realm) { g.visible = false; continue; }
    if (!mob.alive) {
      if (mob.fall < 1) {
        mob.fall = Math.min(1, mob.fall + dt * 2.2);
        g.rotation.x = -mob.fall * 1.45; g.position.y = -mob.fall * 0.3;
        if (mob.fall >= 0.7) g.scale.setScalar(Math.max(0.02, 1 - (mob.fall - 0.7) / 0.3));
        if (mob.fall >= 1) g.visible = false;
      } else g.visible = false;
      continue;
    }
    g.visible = true;
    if (mob.rise > 0) {
      mob.rise = Math.max(0, mob.rise - dt);
      const k = 1 - mob.rise / HORDE_RISE;
      g.position.y = -1.5 + 1.5 * k;
      g.rotation.z = Math.sin(k * 9) * 0.12 * (1 - k);
      if (mob.rise <= 0) {
        g.position.y = 0; g.rotation.z = 0;
        gorePuff(g.position.x, 0.25, g.position.z, 9, 0x3a2a16, 2.2, 2.6);
        sweepTone(140, 60, 0.4, 0.3, 'triangle');
      }
      continue;
    }
    mob.hit = Math.max(0, mob.hit - dt); mob.atk = Math.max(0, mob.atk - dt);
    const dx = pxReal - g.position.x, dz = pzReal - g.position.z, dist = Math.hypot(dx, dz) || 0.001;
    const D = MOB_DEF[mob.kind];
    g.rotation.y = Math.atan2(dx, dz);
    let moving = 0;
    if (D.style === 'melee') {
      const sp = (mob.kind === 'zombie' && dist < 5) ? mob.spd * 2.3 : mob.spd;
      if (dist < 38 && dist > 1.25) { mobMove(mob, dx / dist * sp * dt, dz / dist * sp * dt); moving = 1; }
      if (dist < 1.5 && mob.atk <= 0 && !dead) {
        mob.atk = mob.kind === 'zombie' ? 1.6 : 1.25;
        hurt(D.dmg);
        if (mob.kind === 'zombie') { gorePuff(g.position.x, 1.4, g.position.z, 2, 0x4a1010, 1.2, 1.2); sweepTone(200, 60, 0.3, 0.3, 'square'); }
      }
    } else if (D.style === 'range') {
      if (dist < 8) mobMove(mob, -dx / dist * mob.spd * dt, -dz / dist * mob.spd * dt);
      else if (dist > 15 && dist < 45) mobMove(mob, dx / dist * mob.spd * dt, dz / dist * mob.spd * dt);
      if (mob.atk <= 0 && dist < 26 && !dead) {
        mob.atk = 2.4 + Math.random();
        const from = new THREE.Vector3(g.position.x, 1.35, g.position.z);
        fireMobShot(from, D.dmg);
      }
      moving = 1;
    } else {
      mob.ang += dt * 1.5;
      if (mob.t > 0) {
        mob.t -= dt;
        const tx = pxReal + Math.cos(mob.ang) * 6.5, tz = pzReal + Math.sin(mob.ang) * 6.5;
        const ddx = tx - g.position.x, ddz = tz - g.position.z, dd = Math.hypot(ddx, ddz) || 0.001;
        mobMove(mob, ddx / dd * mob.spd * dt, ddz / dd * mob.spd * dt);
      } else if (dist > 1.3) {
        mobMove(mob, dx / dist * mob.spd * 2.2 * dt, dz / dist * mob.spd * 2.2 * dt);
        if (dist < 1.8 && mob.atk <= 0) { mob.atk = 1.4; hurt(D.dmg); mob.t = 2 + Math.random() * 2; }
      } else mob.t = 2 + Math.random() * 2;
    }
    // animation
    if (g.userData.flash) g.userData.flash.emissive.setHex(mob.hit > 0 ? 0x772200 : g.userData.baseEm);
    if (mob.kind === 'zombie') {
      mob.ph += dt * (moving ? 3.6 : 1);
      const sw = Math.sin(mob.ph) * (moving ? 0.44 : 0.05);
      g.userData.legs[0].rotation.x = sw; g.userData.legs[1].rotation.x = -sw;
      g.userData.arms[0].rotation.x = -1.3 + Math.sin(mob.ph * 0.8) * 0.09;
      g.userData.arms[1].rotation.x = -1.3 - Math.sin(mob.ph * 0.8) * 0.09;
      g.rotation.z = Math.sin(mob.ph * 0.55) * 0.075;
      g.position.y = Math.abs(Math.sin(mob.ph * 0.9)) * 0.05;
    } else if (mob.kind === 'husk') {
      mob.ph += dt * (moving ? 7 : 1);
      const sw = Math.sin(mob.ph) * (moving ? 0.55 : 0.05);
      g.userData.legs[0].rotation.x = sw; g.userData.legs[1].rotation.x = -sw;
      g.userData.arms[0].rotation.x = -sw * 0.7 - 0.3; g.userData.arms[1].rotation.x = sw * 0.7 - 0.3;
    } else if (mob.kind === 'spitter') {
      g.position.y = Math.sin(time * 1.8 + mob.ph) * 0.12;
      g.rotation.z = Math.sin(time * 0.9 + mob.ph) * 0.06;
    } else {
      g.position.y = 0.25 + Math.sin(time * 2.2 + mob.ph) * 0.18;
      g.userData.ring.rotation.z += dt * 3.2;
      g.userData.ring.rotation.y += dt * 1.7;
    }
  }
}
function spawnWave(n) {
  const kinds = n === 4 ? ['wisp', 'wisp', 'zombie'] : n === 2 ? ['spitter', 'husk', 'husk', 'zombie']
    : n === 3 ? ['husk', 'husk', 'spitter', 'zombie'] : ['husk', 'husk', 'husk', 'zombie'];
  kinds.forEach((k, i) => {
    const a = Math.random() * 6.283, r = 12 + Math.random() * 5;
    const mob = makeMob(k, camera.position.x + Math.sin(a) * r, camera.position.z + Math.cos(a) * r, n);
    spawnShards(mob.g.position.x, 1.4, mob.g.position.z, 1);
  });
  say('MORE OF THEM. THEY COME WHEN IT BLEEDS.', 3000);
}
function updateWaves() {
  if (heaven || dead || teleporting || !WEAPONS) return;
  if (waveDone[realm]) return;
  const b = bossInfo();
  if (!b.alive || b.hp > b.max * 0.5) return;
  waveDone[realm] = true;
  spawnWave(realm);
}

