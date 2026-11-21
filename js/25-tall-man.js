/* THE GRID — THE TALL MAN — the boss of world 1.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- The tall man (7 ft) ----
const suitMat = new THREE.MeshStandardMaterial({color: 0x0d0d0e, roughness: 1});
const paleMat = new THREE.MeshStandardMaterial({color: 0xcfc8bd, roughness: 0.9});
const man = new THREE.Group(); scene.add(man);
function mpart(parent, w, h, d, mat, x, y, z, head){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.userData.man = true; if (head) m.userData.head = true; parent.add(m); return m;
}
function limb(x, y, w, len, mat, handMat){
  const p = new THREE.Group(); p.position.set(x, y, 0); man.add(p);
  mpart(p, w, len, w*1.1, mat, 0, -len/2, 0);
  if (handMat) mpart(p, 0.08, 0.16, 0.06, handMat, 0, -len - 0.05, 0);
  return p;
}
const legL = limb(-0.1, 1.0, 0.13, 1.0, suitMat), legR = limb(0.1, 1.0, 0.13, 1.0, suitMat);
const armL = limb(-0.26, 1.76, 0.07, 1.05, suitMat, paleMat), armR = limb(0.26, 1.76, 0.07, 1.05, suitMat, paleMat);
mpart(man, 0.42, 0.8, 0.24, suitMat, 0, 1.4, 0);
mpart(man, 0.07, 0.2, 0.07, paleMat, 0, 1.9, 0);
const manHead = mpart(man, 0.2, 0.26, 0.2, paleMat, 0, 2.0, 0, true);
let manHp = 8, manAlive = true, manHit = 0, manAtk = 0, manStagger = 0, manWalk = 0, manFall = 0;
function spawnMan(d){
  const a = Math.random()*6.283, lim = SIZE/2 - 3;
  man.position.set(Math.max(-lim, Math.min(lim, camera.position.x + Math.sin(a)*d)), 0, Math.max(-lim, Math.min(lim, camera.position.z + Math.cos(a)*d)));
  man.rotation.set(0, 0, 0); manHp = 8 * cyc(); manAlive = true; manFall = 0; manHit = 0; manStagger = 0; won = false;
}
spawnMan(55);
function manCollide(nx, nz){
  for (const t of treePos) { const ox = nx - t[0], oz = nz - t[1], r = t[2] + 0.35, d2 = ox*ox + oz*oz; if (d2 < r*r) { const d = Math.sqrt(d2) || 0.001; nx = t[0] + ox/d*r; nz = t[1] + oz/d*r; } }
  const boxes = doorAngle < 0.9 ? solids.concat([doorBox]) : solids;
  for (const b of boxes) { const cx = Math.max(b[0], Math.min(nx, b[2])), cz = Math.max(b[1], Math.min(nz, b[3])); const ox = nx - cx, oz = nz - cz, d2 = ox*ox + oz*oz; if (d2 > 1e-6 && d2 < 0.1225) { const d = Math.sqrt(d2); nx = cx + ox/d*0.35; nz = cz + oz/d*0.35; } }
  return [nx, nz];
}
function updateMan(dt){
  if (heaven || realm !== 1) return;
  if (!manAlive) {
    manFall = Math.min(1, manFall + dt*0.8); man.rotation.x = -1.5*manFall;
    if (manFall >= 1) man.position.y = Math.max(-2.4, man.position.y - dt*0.2);
    return;
  }
  manHit = Math.max(0, manHit - dt); manStagger = Math.max(0, manStagger - dt); manAtk = Math.max(0, manAtk - dt);
  suitMat.emissive.setHex(manHit > 0 ? 0x660000 : 0); paleMat.emissive.setHex(manHit > 0 ? 0x660000 : 0);
  const mx = man.position.x, mz = man.position.z;
  const pIn = insideHouse(), mIn = Math.abs(mx) < 3.4 && mz < -9.1 && mz > -14.9;
  let tx = camera.position.x, tz = camera.position.z;
  if (pIn && !mIn) { tx = 0; tz = -8.3; if (Math.hypot(mx - tx, mz - tz) < 0.5) tz = -12; }
  else if (!pIn && mIn) { tx = 0; tz = -7.5; }
  const dx = tx - mx, dz = tz - mz, dist = Math.hypot(dx, dz) || 0.001;
  const pd = Math.hypot(camera.position.x - mx, camera.position.z - mz);
  man.rotation.y = Math.atan2(dx, dz);
  let moving = false;
  if (manStagger <= 0 && pd > 1.3 && !dead) {
    const sp = (hasGun ? 2.0 : 1.5)*dt;
    const r = manCollide(mx + dx/dist*sp, mz + dz/dist*sp);
    man.position.x = r[0]; man.position.z = r[1]; moving = true;
  }
  if (!doorOpen && Math.hypot(man.position.x, man.position.z - (Z0 + 0.8)) < 1.6) { doorOpen = true; squeak(1.5); }
  if (pd < 1.6 && manAtk <= 0 && !dead && pIn === mIn) { manAtk = 1.0; hurt(34); }
  manWalk += moving ? dt*4 : 0;
  const sw = moving ? Math.sin(manWalk)*0.5 : 0;
  legL.rotation.x = sw; legR.rotation.x = -sw; armL.rotation.x = -sw*0.6; armR.rotation.x = sw*0.6;
  manHead.rotation.z = Math.sin(time*0.7)*0.15;
}
function hurtMan(d){
  if (!manAlive) return;
  manHp -= d; manHit = 0.12; manStagger = Math.max(manStagger, 0.35);
  if (manHp <= 0) { manAlive = false; won = true; kills++; spawnShards(man.position.x, 1.6, man.position.z, 12); say('THE TALL MAN FALLS', 4500); setTimeout(openPortalA, tm(2500)); }
}


