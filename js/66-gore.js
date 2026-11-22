/* THE GRID — Gore: blood, dirt and bone that comes apart when the dead fall.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ============================================================================
//  GORE — a fixed pool of little cubes. Nothing is created or destroyed while
//  playing; a "puff" just recycles the oldest ones, so a busy horde costs nothing.
// ============================================================================
const goreLayer = new THREE.Group(); scene.add(goreLayer);
const gorePool = [];
const goreGeo = new THREE.BoxGeometry(1, 1, 1);
for (let i = 0; i < 96; i++) {
  const m = new THREE.Mesh(goreGeo, new THREE.MeshBasicMaterial({color: 0x4a1010}));
  m.visible = false;
  goreLayer.add(m);
  gorePool.push({m, vx: 0, vy: 0, vz: 0, life: 0, spin: 0});
}
let goreNext = 0;

function gorePuff(x, y, z, n, color, spread, up) {
  const sp = spread || 3, u = up || 3;
  for (let i = 0; i < n; i++) {
    const p = gorePool[goreNext++ % gorePool.length];
    p.m.scale.setScalar(0.05 + Math.random() * 0.13);
    p.m.material.color.setHex(color);
    p.m.position.set(x, y, z);
    p.m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    p.vx = (Math.random() - 0.5) * sp;
    p.vz = (Math.random() - 0.5) * sp;
    p.vy = u * (0.45 + Math.random());
    p.life = 0.9 + Math.random() * 0.8;
    p.spin = (Math.random() - 0.5) * 11;
    p.m.visible = true;
  }
}

function updateGore(dt) {
  for (const p of gorePool) {
    if (p.life <= 0) continue;
    p.life -= dt;
    if (p.life <= 0) { p.m.visible = false; continue; }
    p.vy -= 9.8 * dt;
    p.m.position.x += p.vx * dt;
    p.m.position.y += p.vy * dt;
    p.m.position.z += p.vz * dt;
    if (p.m.position.y < 0.05) { p.m.position.y = 0.05; p.vy *= -0.3; p.vx *= 0.55; p.vz *= 0.55; p.spin *= 0.5; }
    p.m.rotation.x += p.spin * dt;
    p.m.rotation.z += p.spin * 0.7 * dt;
  }
}
