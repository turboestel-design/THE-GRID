/* THE GRID — The knife. Press V anywhere, in any realm, and a blade comes out
   for one second and goes away again. It hits once, hard, at arm's length.
   Deliberately not as strong as the guns: it is for when something is already
   on top of you, or when you have run dry.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- the blade, in the corner of your eye ------------------------------------
const knifeView = new THREE.Group();
knifeView.position.set(0.24, -0.26, -0.38);
knifeView.rotation.set(-0.15, 0.25, 0.12);
knifeView.visible = false;
camera.add(knifeView);
{
  const steel = new THREE.MeshStandardMaterial({color: 0xc9ced6, metalness: 0.72, roughness: 0.3, emissive: 0x0e1014});
  const grip = new THREE.MeshStandardMaterial({color: 0x231913, roughness: 0.95});
  const guard = new THREE.MeshStandardMaterial({color: 0x3d3630, metalness: 0.55, roughness: 0.55});
  const glove = new THREE.MeshStandardMaterial({color: 0x2a2622, roughness: 1});
  const kb = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); knifeView.add(m); return m;
  };
  kb(0.05, 0.052, 0.17, grip, 0, 0, 0.045);            // handle
  kb(0.095, 0.026, 0.028, guard, 0, 0.002, -0.045);    // guard
  kb(0.03, 0.011, 0.3, steel, 0, 0.004, -0.2);         // blade
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.021, 0.09, 4), steel);
  tip.rotation.x = -Math.PI / 2; tip.position.set(0, 0.004, -0.39); knifeView.add(tip);
  kb(0.075, 0.02, 0.05, steel, 0, 0.012, -0.08);       // the little ridge along the back
  kb(0.1, 0.1, 0.13, glove, 0, -0.005, 0.1);           // fist around it
  kb(0.085, 0.05, 0.1, glove, 0.055, 0.02, 0.02);      // thumb
}

// ---- the swing ---------------------------------------------------------------
const KNIFE_TIME = 1.0;      // how long it is out, in seconds
const KNIFE_CD = 1.05;
const KNIFE_DMG = 2.6;       // a pistol body shot is 1, a shotgun blast is 4.8
const KNIFE_REACH = 2.5;
let knifeT = 0, knifeCd = 0, knifeDealt = false, knifeHits = 0;
const knifeBaseY = knifeView.position.y, knifeBaseZ = knifeView.position.z, knifeBaseX = knifeView.position.x;

function knifeStab() {
  if (paused || dead || heaven || teleporting || knifeCd > 0) return;
  const a = document.activeElement;
  if (a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) return;
  knifeCd = KNIFE_CD; knifeT = KNIFE_TIME; knifeDealt = false; knifeHits = 0;
  knifeView.visible = true;
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
  if (knifeT <= 0) { if (knifeView.visible) knifeView.visible = false; return; }
  knifeT -= dt;
  const p = 1 - knifeT / KNIFE_TIME;        // 0 at the press, 1 when it is gone
  knifeView.visible = knifeT > 0.05;
  // out of the bottom of the screen, hard forward, then back
  const inT = Math.min(1, p / 0.12);
  const thrust = p < 0.12 ? -(1 - inT) * 0.35 : p < 0.24 ? (p - 0.12) / 0.12 : 1 - Math.min(1, (p - 0.24) / 0.5);
  knifeView.position.y = knifeBaseY + (1 - inT) * -0.3;
  knifeView.position.z = knifeBaseZ - thrust * 0.3;
  knifeView.position.x = knifeBaseX - thrust * 0.05;
  knifeView.rotation.z = 0.12 - thrust * 0.5;
  knifeView.rotation.x = -0.15 + thrust * 0.35;
  if (!knifeDealt && p >= 0.19) { knifeDealt = true; knifeStrike(); }
}

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'KeyV') knifeStab();
});
