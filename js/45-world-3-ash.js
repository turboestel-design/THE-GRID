/* THE GRID — World 3: THE ASHEN WASTE — the black sun and the Cinder Hounds.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- World 3: THE ASHEN WASTE ----
const AX = 2000, BX = -2000;
const realm3 = new THREE.Group(); realm3.position.set(AX, 0, 0); realm3.visible = false; scene.add(realm3);
const a3 = document.createElement('canvas'); a3.width = a3.height = 256; const a3x = a3.getContext('2d');
a3x.fillStyle = '#140b0a'; a3x.fillRect(0, 0, 256, 256);
for (let i = 0; i < 500; i++) { a3x.fillStyle = `rgba(${40 + Math.random()*30|0},${30 + Math.random()*20|0},${28 + Math.random()*20|0},${Math.random()*0.4})`; a3x.fillRect(Math.random()*256, Math.random()*256, 3, 3); }
for (let i = 0; i < 22; i++) {
  let x = Math.random()*256, y = Math.random()*256; const pts = [[x, y]];
  for (let k = 0; k < 6; k++) { x += (Math.random() - .5)*60; y += (Math.random() - .5)*60; pts.push([x, y]); }
  [[8, 'rgba(255,90,20,.12)'], [3, 'rgba(255,150,50,.9)']].forEach(([w, c]) => { a3x.lineWidth = w; a3x.strokeStyle = c; a3x.beginPath(); pts.forEach((p, j) => j ? a3x.lineTo(p[0], p[1]) : a3x.moveTo(p[0], p[1])); a3x.stroke(); });
}
const a3tex = new THREE.CanvasTexture(a3); a3tex.wrapS = a3tex.wrapT = THREE.RepeatWrapping; a3tex.repeat.set(14, 14); a3tex.anisotropy = 4;
const ground3 = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), new THREE.MeshStandardMaterial({map: a3tex, emissiveMap: a3tex, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 1}));
ground3.rotation.x = -Math.PI/2; realm3.add(ground3);
const rockPos = [], N_ROCK = 260, N_BIGR = 120;
const rockGeo = new THREE.ConeGeometry(1, 1, 5); rockGeo.translate(0, 0.5, 0);
const rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({color: 0x1d1517, flatShading: true, roughness: 0.5, metalness: 0.3, emissive: 0x200a04}), N_ROCK);
rocks.frustumCulled = false;
{
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < N_ROCK; i++) {
    const big = i < N_BIGR; let x, z;
    do { x = (Math.random() - .5)*160; z = (Math.random() - .5)*160; } while (Math.hypot(x, z - 20) < 8);
    const h = big ? 4 + Math.random()*10 : 0.6 + Math.random()*1.4, r = big ? 0.7 + Math.random()*1.5 : 0.3 + Math.random()*0.5;
    if (big) rockPos.push([AX + x, z, r*0.8]);
    e.set((Math.random() - .5)*0.15, Math.random()*6.28, (Math.random() - .5)*0.15, 'XYZ'); q.setFromEuler(e);
    rocks.setMatrixAt(i, m4.compose(p.set(x, 0, z), q, sc.set(r, h, r)));
  }
  rocks.instanceMatrix.needsUpdate = true;
}
realm3.add(rocks);
const boneMat = new THREE.MeshStandardMaterial({color: 0xd8cfc0, emissive: 0x2a2018, roughness: 1});
[[-30, -25, 0.4], [35, 10, 2.2], [-10, 50, 1.1]].forEach(([x, z, ry]) => {
  const g = new THREE.Group();
  for (let i = 0; i < 8; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(4.5 - Math.abs(i - 3.5)*0.35, 0.3, 6, 20, Math.PI), boneMat); t.position.z = i*2; g.add(t); }
  g.add(box(0.6, 0.5, 16, boneMat, 0, 0, 7)); g.position.set(x, 0, z); g.rotation.y = ry; realm3.add(g);
});
const ASH_N = 500, EMB_N = 150, ashPos = new Float32Array(ASH_N*3), embPos = new Float32Array(EMB_N*3);
for (let i = 0; i < ASH_N; i++) ashPos.set([(Math.random() - .5)*60, Math.random()*22, (Math.random() - .5)*60], i*3);
for (let i = 0; i < EMB_N; i++) embPos.set([(Math.random() - .5)*60, Math.random()*20, (Math.random() - .5)*60], i*3);
const ashGeo = new THREE.BufferGeometry(), emberGeo = new THREE.BufferGeometry();
ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPos, 3)); emberGeo.setAttribute('position', new THREE.BufferAttribute(embPos, 3));
const ashMesh = new THREE.Points(ashGeo, new THREE.PointsMaterial({color: 0xd8c8bc, size: 0.12, transparent: true, opacity: 0.8, depthWrite: false}));
const emberMesh = new THREE.Points(emberGeo, new THREE.PointsMaterial({color: 0xff8a40, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending}));
ashMesh.frustumCulled = emberMesh.frustumCulled = false; ashMesh.visible = emberMesh.visible = false; scene.add(ashMesh, emberMesh);
// The black sun (worlds 3 and 4)
const sc2 = document.createElement('canvas'); sc2.width = sc2.height = 256; const sx = sc2.getContext('2d');
const sgr = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
[[0, 'rgba(255,140,40,0)'], [0.34, 'rgba(255,150,50,0)'], [0.38, 'rgba(255,170,70,1)'], [0.5, 'rgba(255,90,20,.5)'], [1, 'rgba(255,60,10,0)']].forEach(s => sgr.addColorStop(s[0], s[1]));
sx.fillStyle = sgr; sx.fillRect(0, 0, 256, 256);
const sunG = new THREE.Group();
sunG.add(new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(sc2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false})));
const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(20.6, 40), new THREE.MeshBasicMaterial({color: 0x000000, fog: false})); sunDisc.position.z = 0.2; sunG.add(sunDisc);
sunG.visible = false; scene.add(sunG);
// Cinder hounds
const hounds = [];
function makeHound(){
  const h = {hp: 3, max: 3, alive: true, state: 'circle', t: 2, ang: 0, dir: 1, hit: 0, atk: 0, fall: 0, ph: Math.random()*6, legs: []};
  const g = new THREE.Group(); h.g = g; h.mat = new THREE.MeshStandardMaterial({color: 0x241a18, roughness: 0.9});
  const glow = new THREE.MeshBasicMaterial({color: 0xff7a20});
  const part = (w, hh, d, mat, x, y, z, head, parent) => { const m = box(w, hh, d, mat, x, y, z); m.userData.hound = h; if (head) m.userData.head = true; (parent || g).add(m); return m; };
  part(0.45, 0.5, 1.0, h.mat, 0, 0.75, 0); part(0.35, 0.32, 0.45, h.mat, 0, 0.9, 0.65, true);
  part(0.07, 0.07, 0.07, glow, -0.1, 0.95, 0.88, true); part(0.07, 0.07, 0.07, glow, 0.1, 0.95, 0.88, true);
  part(0.08, 0.04, 0.8, glow, 0, 1.02, 0); part(0.08, 0.08, 0.5, h.mat, 0, 0.9, -0.7);
  [[-0.17, 0.35], [0.17, 0.35], [-0.17, -0.35], [0.17, -0.35]].forEach(([x, z]) => { const piv = new THREE.Group(); piv.position.set(x, 0.55, z); g.add(piv); part(0.12, 0.55, 0.12, h.mat, 0, -0.275, 0, false, piv); h.legs.push(piv); });
  g.visible = false; scene.add(g); return h;
}
for (let i = 0; i < 5; i++) hounds.push(makeHound());
function spawnHounds(){
  hounds.forEach((h, i) => {
    const a = i/hounds.length*6.283 + Math.random();
    h.g.position.set(AX + Math.sin(a)*30, 0, Math.max(-70, Math.min(70, 20 + Math.cos(a)*30)));
    h.g.rotation.set(0, 0, 0); h.g.visible = true; h.hp = h.max; h.alive = true; h.state = 'circle'; h.t = 2 + Math.random()*3; h.ang = a; h.dir = Math.random() < 0.5 ? 1 : -1; h.fall = 0; h.atk = 0; h.hit = 0;
  });
}
function hurtHound(h, d){
  if (!h.alive) return;
  h.hp -= d; h.hit = 0.15; h.state = 'back'; h.t = 0.5;
  if (h.hp <= 0) { h.alive = false; kills++; spawnShards(h.g.position.x, 1.1, h.g.position.z, 2); if (hounds.every(x => !x.alive)) { say('THE PACK IS DEAD. A PORTAL OPENS.', 5000); setTimeout(openPortalC, tm(2200)); } }
}
function updateHounds(dt){
  if (realm !== 3 || heaven) return;
  const px = camera.position.x, pz = camera.position.z; let rushing = hounds.filter(h => h.alive && h.state === 'rush').length;
  for (const h of hounds) {
    const g = h.g;
    if (!h.alive) { h.fall = Math.min(1, h.fall + dt*2.5); g.rotation.z = h.fall*1.5; g.position.y = -h.fall*0.1; continue; }
    h.hit = Math.max(0, h.hit - dt); h.atk = Math.max(0, h.atk - dt); h.t -= dt;
    h.mat.emissive.setHex(h.hit > 0 ? 0x992200 : 0);
    const dx = px - g.position.x, dz = pz - g.position.z, dist = Math.hypot(dx, dz) || 0.001;
    let tx, tz, sp;
    if (h.state === 'circle') {
      h.ang += dt*0.5*h.dir; tx = px + Math.cos(h.ang)*8; tz = pz + Math.sin(h.ang)*8; sp = 5;
      if (h.t <= 0 && rushing < 2 && dist < 18) { h.state = 'rush'; h.t = 2.4; rushing++; sweepNoise(700, 250, 0.25, 0.8); }
    } else if (h.state === 'rush') {
      tx = px; tz = pz; sp = 8.5;
      if (dist < 1.2 && h.atk <= 0 && !dead) { h.atk = 1; hurt(15); h.state = 'back'; h.t = 1.3; }
      else if (h.t <= 0) { h.state = 'back'; h.t = 1.0; }
    } else {
      tx = g.position.x - dx; tz = g.position.z - dz; sp = 5;
      if (h.t <= 0) { h.state = 'circle'; h.t = 2 + Math.random()*3; h.ang = Math.atan2(g.position.z - pz, g.position.x - px); }
    }
    const ddx = tx - g.position.x, ddz = tz - g.position.z, dd = Math.hypot(ddx, ddz) || 0.001;
    if (dd > 0.3) { const r = pushC(g.position.x + ddx/dd*sp*dt, g.position.z + ddz/dd*sp*dt, rockPos, 0.5); g.position.x = r[0]; g.position.z = r[1]; }
    g.rotation.y = Math.atan2(dx, dz);
    h.ph += dt*sp*1.6; const sw = Math.sin(h.ph)*0.7;
    h.legs[0].rotation.x = sw; h.legs[1].rotation.x = -sw; h.legs[2].rotation.x = -sw; h.legs[3].rotation.x = sw;
  }
}

