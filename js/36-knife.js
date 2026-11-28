/* THE GRID — The knife. Press V anywhere, in any realm, and a blade comes out
   for one second and goes away again. It hits once, hard, at arm's length.
   Deliberately not as strong as the guns: it is for when something is already
   on top of you, or when you have run dry.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- the hand and the arm that holds it -------------------------------------
// Everything is built around a wrist at the origin of knifeView, blade pointing
// down -z. The forearm runs from the wrist back past the bottom-right corner of
// the screen, so the hand is attached to a person rather than floating in the air.
const knifeView = new THREE.Group();
knifeView.position.set(0.22, -0.24, -0.58);
knifeView.visible = false;
camera.add(knifeView);
const knifeArm = new THREE.Group();     // everything that swings
knifeArm.scale.setScalar(1.3);          // a hand this close to the eye needs to be a bit bigger
knifeView.add(knifeArm);
{
  const steel = new THREE.MeshStandardMaterial({color: 0xc6ccd6, metalness: 0.78, roughness: 0.24, emissive: 0x0c0f14});
  const edge = new THREE.MeshStandardMaterial({color: 0xe8eef8, metalness: 0.9, roughness: 0.12, emissive: 0x141a22});
  const grip = new THREE.MeshStandardMaterial({color: 0x1d1611, roughness: 0.92, emissive: 0x050403});
  const brass = new THREE.MeshStandardMaterial({color: 0x8a7348, metalness: 0.6, roughness: 0.55});
  const skin = new THREE.MeshStandardMaterial({color: 0x8a6349, roughness: 0.85, emissive: 0x120a07});
  const sleeve = new THREE.MeshStandardMaterial({color: 0x2a2724, roughness: 0.95, emissive: 0x070605});
  const kb = (w, h, d, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); (parent || knifeArm).add(m); return m;
  };

  // ---- the knife, angled forward and a little up --------------------------
  const knife = new THREE.Group();
  knife.position.set(0.005, 0.012, -0.02);
  knife.rotation.set(-0.06, -0.1, 0.1);
  knifeArm.add(knife);
  kb(0.034, 0.046, 0.17, grip, 0, 0, 0.05, knife);          // handle
  [-0.005, 0.03, 0.065].forEach(z => kb(0.036, 0.048, 0.008, brass, 0, 0, z, knife));  // grips
  kb(0.098, 0.024, 0.03, brass, 0, 0.002, -0.055, knife);   // guard
  kb(0.028, 0.009, 0.3, steel, 0, 0.008, -0.2, knife);      // blade
  kb(0.009, 0.006, 0.29, edge, 0.013, 0.008, -0.2, knife);  // the ground edge, catching light
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.019, 0.085, 4), steel);
  tip.rotation.x = -Math.PI / 2; tip.position.set(0, 0.008, -0.385); knife.add(tip);

  // ---- the hand, curled around the handle --------------------------------
  const hand = new THREE.Group();
  hand.position.set(0, -0.006, 0.06);
  knifeArm.add(hand);
  kb(0.082, 0.088, 0.115, skin, 0.012, -0.012, 0.02, hand);      // palm
  kb(0.02, 0.07, 0.1, skin, 0.05, -0.014, 0.0, hand);            // the outside of the hand
  // four fingers wrapping over the top of the handle
  [0.005, 0.031, 0.057, 0.083].forEach((z, i) => {
    const f = kb(0.072, 0.026, 0.024, skin, -0.006, 0.024 - i * 0.002, z, hand);
    f.rotation.z = 0.06;
    kb(0.022, 0.03, 0.024, skin, -0.042, 0.006, z, hand);        // fingertip coming back down
  });
  // the thumb across the near side
  const thumb = kb(0.028, 0.028, 0.085, skin, -0.036, -0.03, 0.03, hand);
  thumb.rotation.set(0.25, 0.3, -0.2);
  // knuckles, so the back of the hand is not a flat plate
  [0.005, 0.031, 0.057, 0.083].forEach(z => kb(0.03, 0.022, 0.02, skin, 0.046, 0.036, z, hand));

  // ---- the forearm, running off the bottom right of the frame ------------
  const wrist = new THREE.Vector3(0.012, -0.03, 0.11);
  // out to the right, not straight down: straight down leaves the frame two
  // centimetres past the wrist and the hand ends up looking like it floats
  const elbow = new THREE.Vector3(0.62, -0.05, 0.15);
  const dir = elbow.clone().sub(wrist);
  const len = dir.length();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.088, len, 12), skin);
  forearm.position.copy(wrist).addScaledVector(dir, 0.5);
  forearm.quaternion.copy(q);
  knifeArm.add(forearm);
  // sleeve, cuffed halfway down the forearm
  const sleeveMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.094, 0.112, len * 0.7, 12), sleeve);
  sleeveMesh.position.copy(wrist).addScaledVector(dir, 0.66);
  sleeveMesh.quaternion.copy(q);
  knifeArm.add(sleeveMesh);
  // and the cuff itself, a thicker band where the sleeve ends
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.05, 12), sleeve);
  cuff.position.copy(wrist).addScaledVector(dir, 0.33);
  cuff.quaternion.copy(q);
  knifeArm.add(cuff);
  // a wrist bone, so the join reads
  const wristMesh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skin);
  wristMesh.position.copy(wrist);
  knifeArm.add(wristMesh);
}

// ---- the swing ---------------------------------------------------------------
const KNIFE_TIME = 1.0;      // how long it is out, in seconds
const KNIFE_CD = 1.05;
const KNIFE_DMG = 2.6;       // a pistol body shot is 1, a shotgun blast is 4.8
const KNIFE_REACH = 2.5;
let knifeT = 0, knifeCd = 0, knifeDealt = false, knifeHits = 0, knifeGunWas = false;
const kbx = knifeView.position.x, kby = knifeView.position.y, kbz = knifeView.position.z;

function knifeStab() {
  if (paused || dead || heaven || teleporting || knifeCd > 0) return;
  const a = document.activeElement;
  if (a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) return;
  knifeCd = KNIFE_CD; knifeT = KNIFE_TIME; knifeDealt = false; knifeHits = 0;
  knifeView.visible = true;
  // the gun has to go: two hands full of different things at once is what made it
  // look wrong in the first place
  if (typeof gunView !== 'undefined') { knifeGunWas = gunView.visible; gunView.visible = false; }
  knifeSound();
}

// one hit, at the moment the blade gets there
function knifeStrike() {
  const dmg = KNIFE_DMG * (1 + (up.damage || 0) * 0.15);
  const tg = targetsFor();
  let hit = null;
  const oldFar = ray.far;
  ray.far = KNIFE_REACH;
  ray.setFromCamera({x: 0, y: 0}, camera);
  hit = ray.intersectObjects(tg, true)[0] || null;
  ray.far = oldFar;
  // a knife should not need a pixel-perfect aim, so if the ray missed, take the
  // closest living thing inside the arc in front of you
  if (!hit) {
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    let best = null, bestD = KNIFE_REACH;
    const consider = (obj, pos) => {
      const dx = pos.x - camera.position.x, dz = pos.z - camera.position.z;
      const d = Math.hypot(dx, dz);
      if (d > bestD || d < 0.001) return;
      if ((dx / d) * fx + (dz / d) * fz < 0.55) return;      // must be in front
      best = obj; bestD = d;
    };
    for (const m of mobs) if (m.alive && m.realm === realm) consider({userData: {mob: m}}, m.g.position);
    if (lord && lord.alive && lord.realm === realm) consider({userData: {lord: true}}, lord.g.position);
    if (best) hit = { object: best, point: null };
  }
  if (!hit) {
    knifeMissSound();
    return;
  }
  const o = hit.object.userData;
  let d = dmg;
  if (o.head) d *= 1.4;
  if (o.man) hurtMan(d); else if (o.beast) hurtBeast(d);
  else if (o.hound) hurtHound(o.hound, d);
  else if (o.boss) hurtKing(o.head ? d : d * 0.7);
  else if (o.mob) hurtMob(o.mob, d, o.head);
  else if (o.lord) hurtLord(d);
  else { knifeMissSound(); return; }
  knifeHits = 1;
  if (typeof hitMark === 'function') hitMark(o.head);
  const px = hit.point ? hit.point.x : camera.position.x - Math.sin(yaw) * 1.2;
  const pz = hit.point ? hit.point.z : camera.position.z - Math.cos(yaw) * 1.2;
  const py = hit.point ? hit.point.y : 1.2;
  if (typeof gorePuff === 'function') gorePuff(px, py, pz, 5, 0x5a1014, 1.8, 1.6);
  knifeHitSound(0.9);
  rumble(80, 0.5);
}

function updateKnife(dt) {
  knifeCd = Math.max(0, knifeCd - dt);
  if (knifeT <= 0) {
    if (knifeView.visible) knifeView.visible = false;
    if (knifeGunWas) {
      knifeGunWas = false;
      if (typeof gunView !== 'undefined') gunView.visible = !!hasGun && !heaven;
    }
    return;
  }
  knifeT -= dt;
  const p = 1 - knifeT / KNIFE_TIME;        // 0 at the press, 1 when it is gone
  knifeView.visible = knifeT > 0.02;
  if (typeof gunView !== 'undefined' && gunView.visible) { knifeGunWas = true; gunView.visible = false; }

  // 0 - 0.12   the arm comes up from below
  // 0.12 - 0.26 it goes forward
  // 0.26 - 0.6  it is out there
  // 0.6 - 1     it drops away again
  const rise = p < 0.12 ? p / 0.12 : 1;                 // 0 below the frame, 1 up
  const stab = p < 0.12 ? 0 : p < 0.26 ? (p - 0.12) / 0.14 : p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.4);
  const away = p > 0.62 ? (p - 0.62) / 0.38 : 0;
  const wobble = Math.sin(time * 9) * 0.006 * (1 - away);

  knifeView.position.y = kby - (1 - rise) * 0.55 - away * 0.5 + wobble;
  knifeView.position.z = kbz - stab * 0.2 + away * 0.06;
  knifeView.position.x = kbx - stab * 0.045 - (1 - rise) * 0.1;
  knifeView.rotation.z = 0.22 - rise * 0.2 + stab * 0.1 - away * 0.3;
  knifeView.rotation.x = 0.55 - rise * 0.55 + stab * 0.22 - away * 0.5;
  knifeView.rotation.y = 0.06 - stab * 0.14;              // the wrist turns the blade in
  // the arm extends as it goes forward, so the reach is the arm's, not the knife's
  knifeArm.position.z = -stab * 0.06;
  knifeArm.rotation.x = stab * 0.06;

  if (!knifeDealt && p >= 0.22) { knifeDealt = true; knifeStrike(); }
}

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'KeyV') knifeStab();
});
