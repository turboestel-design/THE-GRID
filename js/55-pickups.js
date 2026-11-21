/* THE GRID — Floating pickups: weapons, ammo crates and health.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Pickups: weapons, ammo crates, health ----
const items = [];
function addItem(group, kind, type, x, z){
  const m = kind === 'weapon' ? (type === 'shotgun' ? makeShotgun() : makeRifle()) : kind === 'ammo' ? box(0.4, 0.3, 0.55, bBasic(0x7dffb0), 0, 0, 0) : box(0.45, 0.45, 0.45, bBasic(0xff4a4a), 0, 0, 0);
  if (kind === 'weapon') m.scale.setScalar(1.6);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 6, 8, 1, true), new THREE.MeshBasicMaterial({color: kind === 'weapon' ? 0xffe28a : kind === 'ammo' ? 0x7dffb0 : 0xff6a6a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}));
  beam.position.y = 3;
  const g = new THREE.Group(); g.add(m, beam); g.position.set(x, 0.8, z); group.add(g);
  items.push({g, m, kind, type, group, wx: group.position.x + x, wz: z, cd: 0});
}
function resetItems(group){ items.forEach(it => { if (it.group === group) { it.cd = 0; it.g.visible = !(it.kind === 'weapon' && owned[it.type]); } }); }
crates.forEach(c => { c.visible = false; });
addItem(realm2, 'weapon', 'shotgun', 7, 11);
[[12, 8], [-15, -5], [5, -22], [-25, 18], [24, -14]].forEach(p => addItem(realm2, 'ammo', '', p[0], p[1]));
[[-8, 2], [18, -10]].forEach(p => addItem(realm2, 'health', '', p[0], p[1]));
addItem(realm3, 'weapon', 'rifle', -6, 14);
[[15, 5], [-20, -10], [8, -25], [-28, 20], [30, -18]].forEach(p => addItem(realm3, 'ammo', '', p[0], p[1]));
[[0, -8], [-12, 30]].forEach(p => addItem(realm3, 'health', '', p[0], p[1]));
[[14, 0], [-14, 0], [0, 14], [0, -14]].forEach(p => addItem(realm4, 'ammo', '', p[0], p[1]));
[[10, 10], [-10, -10], [10, -10]].forEach(p => addItem(realm4, 'health', '', p[0], p[1]));
function updatePickups(dt){
  for (const it of items) {
    if (!it.group.visible) continue;
    if (it.cd > 0) { it.cd -= dt; if (it.cd <= 0) it.g.visible = true; else continue; }
    if (!it.g.visible) continue;
    it.m.rotation.y += dt*1.5; it.g.position.y = 0.8 + Math.sin(time*2 + it.wx)*0.1;
    if (Math.hypot(camera.position.x - it.wx, camera.position.z - it.wz) > 1.3) continue;
    if (it.kind === 'weapon') {
      if (owned[it.type]) { it.g.visible = false; continue; }
      owned[it.type] = true; selectWeapon(it.type); refill(); it.g.visible = false;
      say(WEAPONS[it.type].name + ' ACQUIRED  ·  Q OR 1-3 TO SWITCH', 4500); sweepTone(300, 900, 0.4, 0.5, 'triangle');
    } else if (it.kind === 'ammo') {
      if (!needAmmo()) continue;
      giveAmmo(); say('AMMO', 1200); clickSound(); it.g.visible = false; it.cd = 25;
    } else {
      if (health >= maxHp) continue;
      health = Math.min(maxHp, health + 40); updateStats(); say('+40 HP', 1200); sweepTone(500, 1000, 0.3, 0.4, 'sine'); it.g.visible = false; it.cd = 40;
    }
  }
}

