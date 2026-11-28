/* THE GRID — Shards — the currency that survives death.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Shards: the currency that survives death -------------------------------
const shardGeo = new THREE.OctahedronGeometry(0.14);
const shardMat = new THREE.MeshBasicMaterial({color: 0x9affe0});
const shardPicks = [];
let shardBlip = 0;
function spawnShards(x, y, z, n) {
  for (let i = 0; i < n; i++) {
    if (shardPicks.length > 150) break;
    const m = new THREE.Mesh(shardGeo, shardMat);
    m.position.set(x, y, z); m.scale.setScalar(0.8 + Math.random() * 0.6);
    shardLayer.add(m);
    shardPicks.push({m, vx: (Math.random() - .5) * 3, vy: 3 + Math.random() * 2.5, vz: (Math.random() - .5) * 3, t: 0});
  }
}
function updateShards(dt) {
  for (let i = shardPicks.length - 1; i >= 0; i--) {
    const s = shardPicks[i]; s.t += dt;
    if (s.t < 0.45) {
      s.vy -= 10 * dt;
      s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; s.m.position.z += s.vz * dt;
      if (s.m.position.y < 0.3) { s.m.position.y = 0.3; s.vy *= -0.35; s.vx *= 0.7; s.vz *= 0.7; }
    } else {
      const dx = camera.position.x - s.m.position.x, dy = (camera.position.y - 0.45) - s.m.position.y, dz = camera.position.z - s.m.position.z;
      const d = Math.hypot(dx, dy, dz) || 0.001, sp = Math.min(16, 5 + s.t * 12);
      s.m.position.x += dx / d * sp * dt; s.m.position.y += dy / d * sp * dt; s.m.position.z += dz / d * sp * dt;
      if (d < 1.1 || s.t > 5) {
        shardLayer.remove(s.m); shardPicks.splice(i, 1);
        shards++; updateStats();
        if ((shardBlip++ % 3) === 0) sweepTone(950, 1500, 0.05, 0.10, 'sine');
        continue;
      }
    }
    s.m.rotation.y += dt * 5; s.m.rotation.x += dt * 2.5;
  }
}

