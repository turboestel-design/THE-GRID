/* THE GRID — THE DIMENSION'S VISITORS.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour.

   The Dimension already had echoes of the other places — things shaped like them.
   These are the real ones: world one's Tall Man in his suit, world three's cinder
   hounds with their own legs and glowing spine, and the Hollow King himself, robe,
   mask and crown of spikes, throwing the same light he throws in his own arena.

   They are borrowed whole rather than rebuilt, so what walks out of the fog here is
   the thing you fought out there. The only thing changed on them is the bookkeeping
   flags, so a bullet that lands on one hurts the one in front of you and not the
   boss standing in another world. */

// ---- world three's hound, taken as it is ------------------------------------
function buildDimVisitorHound() {
  const h = makeHound();                 // the real one: four legs, ember spine
  scene.remove(h.g);
  h.g.visible = true;
  h.g.traverse(o => { if (o.userData.hound) o.userData.hound = false; });
  h.g.userData.legs = h.legs;
  h.g.userData.flash = h.mat;
  h.g.userData.baseEm = 0x000000;
  return h.g;
}

// ---- world one's Tall Man --------------------------------------------------
function buildDimVisitorMan() {
  const g = man.clone(true);
  g.visible = true;                      // he is hidden everywhere but the forest
  g.position.set(0, 0, 0);
  g.rotation.set(0, 0, 0);
  const mats = new Map();
  g.traverse(o => {
    if (!o.isMesh) return;
    // his own materials, so a hit here does not light up the one in the forest
    if (!mats.has(o.material)) mats.set(o.material, o.material.clone());
    o.material = mats.get(o.material);
    o.userData.man = false;              // hits land on this mob, not on world one
  });
  // legL, legR, armL, armR, torso, neck, head — the order he was built in
  g.userData.legs = [g.children[0], g.children[1]];
  g.userData.arms = [g.children[2], g.children[3]];
  g.userData.headPart = g.children[6];
  g.userData.flash = [...mats.values()].find(m => m.color && m.color.getHex() === 0x0d0d0e) || [...mats.values()][0];
  g.userData.baseEm = 0x000000;
  g.children.forEach(c => { c.rotation.set(0, 0, 0); });
  return g;
}

// ---- the Hollow King -------------------------------------------------------
function buildDimVisitorKing() {
  const g = king.clone(true);
  g.position.set(0, 0, 0);
  g.rotation.set(0, 0, 0);
  g.scale.setScalar(1);
  g.visible = true;
  const mats = new Map();
  g.traverse(o => {
    if (!o.isMesh) return;
    if (!mats.has(o.material)) mats.set(o.material, o.material.clone());
    o.material = mats.get(o.material);
    o.userData.boss = false;             // the real king keeps his own hits
  });
  const arms = g.children.filter(c => c.isGroup);
  arms.forEach(a => { a.rotation.x = -0.6; });
  g.userData.arms = arms;
  g.userData.flash = [...mats.values()].find(m => m.color && m.color.getHex() === 0x08060e) || [...mats.values()][0];
  g.userData.baseEm = 0x120a24;
  return g;
}

// the orbs and the ground wave, pools of our own so the arena's stay untouched
const dimKingOrbs = [];
{
  const geo = new THREE.SphereGeometry(0.34, 10, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffb060 });
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.visible = false; scene.add(m);
    dimKingOrbs.push({ m, vx: 0, vy: 0, vz: 0, life: 0, dmg: 0 });
  }
}
const dimKingRing = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 64),
  new THREE.MeshBasicMaterial({ color: 0xff8040, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
dimKingRing.rotation.x = -Math.PI / 2;
dimKingRing.visible = false;
scene.add(dimKingRing);
let dimRingR = 0, dimRingHit = false, dimRingX = 0, dimRingZ = 0;

function dimKingVolley(g) {
  const px = camera.position.x, pz = camera.position.z;
  const base = Math.atan2(px - g.position.x, pz - g.position.z);
  const dist = Math.hypot(px - g.position.x, pz - g.position.z) || 1;
  const n = dist > 14 ? 5 : 3;
  sweepTone(220, 90, 0.35, 0.8, 'sawtooth');
  for (let i = 0; i < n; i++) {
    const o = dimKingOrbs.find(x => x.life <= 0);
    if (!o) return;
    const a = base + (i - (n - 1) / 2) * 0.22, t = dist / 9.5;
    o.m.position.set(g.position.x + Math.sin(a) * 1.6, 3.6, g.position.z + Math.cos(a) * 1.6);
    o.vx = Math.sin(a) * 9.5; o.vz = Math.cos(a) * 9.5; o.vy = (1.1 - 3.6) / t;
    o.life = 4; o.dmg = 20; o.m.visible = true;
  }
}

function dimKingWave(g) {
  dimKingRing.visible = true;
  dimKingRing.position.set(g.position.x, 0.06, g.position.z);
  dimRingR = 1; dimRingHit = false;
  dimRingX = g.position.x; dimRingZ = g.position.z;
  sweepNoise(60, 1200, 0.8, 2);
}

// ---- what they do ----------------------------------------------------------
function dimManTick(mob, dt) {
  if (mob.baseSpd == null) mob.baseSpd = mob.spd;
  // he stops for a moment when you put one in him, exactly as he does at home
  mob.spd = mob.hit > 0 ? 0.3 : mob.baseSpd;
  // and he breathes, slowly, through something that is not quite a mouth
  mob.voiceT = (mob.voiceT == null ? 3 + Math.random() * 3 : mob.voiceT) - dt;
  if (mob.voiceT > 0) return;
  mob.voiceT = 8 + Math.random() * 6;
  const v = volFor(mob.g.position.x, mob.g.position.z, 8);
  if (v > 0.1 && !paused && settings.ambience !== false)
    throat({f0: 84, formants: [520, 1120], dur: 1.5, gain: 0.3 * v,
            pan: panFor(mob.g.position.x, mob.g.position.z), rasp: 0.2, wet: 0.35, bend: -0.1});
}

function dimKingTick(mob, dt) {
  const g = mob.g;
  // it circles you at nine metres, the way it circles the arena
  if (mob.ang == null) mob.ang = Math.random() * 6.283;
  mob.ang += dt * 0.22;
  const tx = camera.position.x + Math.cos(mob.ang) * 9, tz = camera.position.z + Math.sin(mob.ang) * 9;
  const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz) || 1;
  if (d > 0.5) { const sp = Math.max(2.5, Math.min(7, d * 3)); mobMove(mob, dx / d * sp * dt, dz / d * sp * dt); }
  g.position.y = Math.sin(time * 1.3) * 0.24;
  mob.fireT = (mob.fireT == null ? 2.5 : mob.fireT) - dt;
  mob.slamT = (mob.slamT == null ? 8 : mob.slamT) - dt;
  mob.armSwing = Math.max(0, (mob.armSwing || 0) - dt * 1.2);
  if (mob.slamT <= 0) {
    mob.slamT = 9; mob.slamIn = 0.9; mob.armSwing = 1;
    sweepTone(50, 140, 0.9, 1, 'sawtooth');
  } else if (mob.slamIn > 0) {
    mob.slamIn -= dt;
    if (mob.slamIn <= 0) dimKingWave(g);
  } else if (mob.fireT <= 0) {
    mob.fireT = 2.4;
    dimKingVolley(g);
  }
  const ax = mob.armSwing > 0 ? -2.8 : -0.6;
  (g.userData.arms || []).forEach(a => { a.rotation.x += (ax - a.rotation.x) * Math.min(1, dt * 8); });
}

// anything of theirs that keeps moving after they are dead
function dimVisitorUpdate(dt) {
  if (realm !== 5) {
    if (dimKingRing.visible) dimKingRing.visible = false;
    for (const o of dimKingOrbs) { if (o.life > 0) { o.life = 0; o.m.visible = false; } }
    return;
  }
  for (const o of dimKingOrbs) {
    if (o.life <= 0) continue;
    o.life -= dt;
    o.m.position.x += o.vx * dt; o.m.position.y += o.vy * dt; o.m.position.z += o.vz * dt;
    const m = o.m.position;
    if (m.y < 0.05 || o.life <= 0) { o.life = 0; o.m.visible = false; continue; }
    if (!dead && Math.hypot(m.x - camera.position.x, m.z - camera.position.z) < 0.7
      && Math.abs(m.y - (camera.position.y - 0.4)) < 1.2) {
      o.life = 0; o.m.visible = false; hurt(o.dmg); hitFlash();
    }
  }
  if (dimKingRing.visible) {
    dimRingR += dt * 11;
    dimKingRing.scale.setScalar(dimRingR);
    if (!dimRingHit && !dead && jumpH < 0.5
      && Math.abs(Math.hypot(camera.position.x - dimRingX, camera.position.z - dimRingZ) - dimRingR) < 0.7) {
      dimRingHit = true; hurt(25);
    }
    if (dimRingR > 34) dimKingRing.visible = false;
  }
}

// ---- animation -------------------------------------------------------------
function dimVisitorAnimate(mob, moving, dt) {
  const g = mob.g, u = g.userData;
  if (mob.kind === 'tall_man') {
    // long legs, long arms, and the head that never quite looks at you
    mob.ph += dt * (moving ? 4 : 0.8);
    const sw = moving ? Math.sin(mob.ph) * 0.5 : 0;
    if (u.legs) { u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw; }
    if (u.arms) { u.arms[0].rotation.x = -sw * 0.6; u.arms[1].rotation.x = sw * 0.6; }
    if (u.headPart) u.headPart.rotation.z = Math.sin(time * 0.7) * 0.15;
    return true;
  }
  if (mob.kind === 'hollow_king') {
    g.rotation.z = Math.sin(time * 0.9) * 0.02;
    return true;
  }
  return false;
}

function dimVisitorDeath(mob) {
  const x = mob.g.position.x, z = mob.g.position.z;
  if (mob.kind === 'tall_man') {
    gorePuff(x, 1.6, z, 16, 0x1a1a1c, 2.4, 2.6);
    gorePuff(x, 1.8, z, 6, 0x8a8378, 1.8, 2.0);
    zombieDeath(volFor(x, z, 6), panFor(x, z));
    return true;
  }
  if (mob.kind === 'hollow_king') {
    gorePuff(x, 3.2, z, 30, 0x6a40b0, 4.2, 3.6);
    gorePuff(x, 3.0, z, 14, 0xe8e4f0, 3.0, 3.0);
    sweepNoise(100, 3000, 2.4, 2);
    sweepTone(120, 40, 1.4, 0.6, 'sawtooth');
    if (dimKingRing.visible) dimKingRing.visible = false;
    say('THE HOLLOW KING FALLS', 4200);
    return true;
  }
  return false;
}

// the HUD asks for him by name, so he gets his own health bar out here
function dimKingMob() {
  for (const m of mobs) if (m.kind === 'hollow_king') return m;
  return null;
}

// leaving, dying, or wiping the room takes his light with him
function dimVisitorClear() {
  dimKingRing.visible = false;
  for (const o of dimKingOrbs) { if (o.life > 0) { o.life = 0; o.m.visible = false; } }
}

// ---- spawning the king on his own rounds -----------------------------------
function dimKingRound(round) { return round >= 20 && round % 10 === 0; }

function dimSpawnKing(round) {
  const c = dimSpawnPoint(15, 20);
  const m = dimMakeMob('hollow_king', c[0], c[1]);
  const cycM = 1 + (progress.cycle || 0) * 0.28;
  m.hp = m.max = Math.round(170 * cycM * (1 + Math.max(0, round - 20) * 0.04));
  m.dmg = Math.round(22 * Math.min(2, 1 + Math.max(0, round - 20) * 0.04));
  m.round = round;
  m.ang = Math.atan2(c[1] - camera.position.z, c[0] - camera.position.x);
  if (typeof dimLordFx === 'function') dimLordFx();
  lordRoar();
  return m;
}

// ---- the table the Dimension reads -----------------------------------------
Object.assign(DIM_BUILD, {
  cinder_hound: buildDimVisitorHound,
  tall_man: buildDimVisitorMan,
  hollow_king: buildDimVisitorKing
});
Object.assign(MOB_DEF, {
  tall_man:    {hp: 55, spd: 1.9, dmg: 22, r: 0.45, shards: 16, style: 'melee', name: 'THE TALL MAN', eyeY: 2.0, eyeZ: 0.1},
  hollow_king: {hp: 170, spd: 0, dmg: 22, r: 1.7, shards: 40, style: 'melee', name: 'THE HOLLOW KING', eyeY: 6.2, eyeZ: 0.5}
});
// what the rest of the Dimension asks about, without knowing any of the above
window.DIM_VIS = {
  kinds: {cinder_hound: true, tall_man: true, hollow_king: true},
  animate: dimVisitorAnimate,
  death: dimVisitorDeath,
  tickFor: kind => (kind === 'tall_man' ? dimManTick : kind === 'hollow_king' ? dimKingTick : null)
};
