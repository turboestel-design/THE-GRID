/* THE GRID — World 2: THE HOLLOW GLOW — the fungus forest, its sky and THE BLOOM.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Second world: THE HOLLOW GLOW (glowing fungus forest, a different creature) ----
const RX = -1000;
let realm = 1, teleporting = false, r2Gain = null, chimeT = 4, warned = false;
const realm2 = new THREE.Group(); realm2.position.set(RX, 0, 0); realm2.visible = false; scene.add(realm2);
const glowLight = new THREE.PointLight(0x7a5cff, 0, 24, 1.5); camera.add(glowLight);
const portalLight = new THREE.PointLight(0x9a6cff, 0, 16, 1.6); scene.add(portalLight);
// Ground
const gc = document.createElement('canvas'); gc.width = gc.height = 256;
const gx = gc.getContext('2d');
gx.fillStyle = '#0f0b20'; gx.fillRect(0, 0, 256, 256);
for (let i = 0; i < 40; i++) { gx.fillStyle = `rgba(${60 + Math.random()*40|0},${30 + Math.random()*30|0},${110 + Math.random()*60|0},${0.08 + Math.random()*0.12})`; gx.beginPath(); gx.arc(Math.random()*256, Math.random()*256, 10 + Math.random()*30, 0, 6.3); gx.fill(); }
for (let i = 0; i < 26; i++) { gx.strokeStyle = `rgba(80,240,210,${0.1 + Math.random()*0.2})`; gx.beginPath(); let vx = Math.random()*256, vy = Math.random()*256; gx.moveTo(vx, vy); for (let k = 0; k < 5; k++) { vx += (Math.random() - .5)*50; vy += (Math.random() - .5)*50; gx.lineTo(vx, vy); } gx.stroke(); }
for (let i = 0; i < 150; i++) { gx.fillStyle = `rgba(${Math.random() < .5 ? '90,255,220' : '255,90,220'},${0.3 + Math.random()*0.5})`; gx.fillRect(Math.random()*256, Math.random()*256, 2, 2); }
const gtex = new THREE.CanvasTexture(gc); gtex.wrapS = gtex.wrapT = THREE.RepeatWrapping; gtex.repeat.set(16, 16); gtex.anisotropy = 4;
const ground2 = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({map: gtex, roughness: 1, emissive: 0x160e2a}));
ground2.rotation.x = -Math.PI/2;
// Giant glowing mushrooms
const shroomPos = [];
const N_BIG = 200, N_ALL = 580;
const stemGeo = new THREE.CylinderGeometry(0.28, 0.42, 1, 8); stemGeo.translate(0, 0.5, 0);
const capGeo = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI*2, 0, Math.PI/2);
const shroomStems = new THREE.InstancedMesh(stemGeo, new THREE.MeshStandardMaterial({color: 0xd9d2f0, roughness: 1, emissive: 0x2a2250}), N_ALL);
const shroomCaps = new THREE.InstancedMesh(capGeo, new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), N_ALL);
shroomStems.frustumCulled = shroomCaps.frustumCulled = false;
{
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
  const pal = [0x2de2c8, 0x2de2c8, 0xe03cc8, 0xe03cc8, 0xffb347, 0x4a7cff, 0x8affb0];
  for (let i = 0; i < N_ALL; i++) {
    const big = i < N_BIG;
    let x, z; do { x = (Math.random() - .5)*150; z = (Math.random() - .5)*150; } while (Math.hypot(x, z - 20) < 7);
    const h = big ? 2.5 + Math.random()*4.5 : 0.3 + Math.random()*0.8;
    const sr = big ? 0.6 + Math.random()*0.9 : 0.35 + Math.random()*0.3;
    const cr = big ? 1.4 + Math.random()*2.2 : 0.3 + Math.random()*0.5;
    if (big) shroomPos.push([RX + x, z, 0.42*sr + 0.05]);
    shroomStems.setMatrixAt(i, m4.compose(p.set(x, 0, z), q.identity(), sc.set(sr, h, sr)));
    shroomCaps.setMatrixAt(i, m4.compose(p.set(x, h, z), q.identity(), sc.set(cr, cr*0.55, cr)));
    shroomCaps.setColorAt(i, col.setHex(pal[Math.floor(Math.random()*pal.length)]));
  }
  shroomStems.instanceMatrix.needsUpdate = shroomCaps.instanceMatrix.needsUpdate = shroomCaps.instanceColor.needsUpdate = true;
}
realm2.add(ground2, shroomStems, shroomCaps);
// Ammo crates
const crates = [];
[[12, 8], [-15, -5], [5, -22], [-25, 18], [24, -14]].forEach(([x, z], i) => {
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.55), new THREE.MeshBasicMaterial({color: 0x7dffb0}));
  c.position.set(x, 0.7, z); c.userData.ph = i; realm2.add(c); crates.push(c);
});
// Sky: stars and a ringed planet that follow the camera
const starPos = new Float32Array(900*3);
for (let i = 0; i < 900; i++) { const u = Math.random()*6.283, v = 0.05 + Math.random()*0.95, s = Math.sqrt(1 - v*v); starPos.set([Math.cos(u)*s*170, v*170, Math.sin(u)*s*170], i*3); }
const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xdfe6ff, size: 1.8, sizeAttenuation: false, fog: false}));
stars.frustumCulled = false; stars.visible = false; scene.add(stars);
const pc = document.createElement('canvas'); pc.width = 256; pc.height = 128;
const px2 = pc.getContext('2d');
for (let y = 0; y < 128; y += 4) { px2.fillStyle = `hsl(${190 + Math.sin(y*0.15)*50 + Math.random()*10},60%,${35 + Math.sin(y*0.3)*12}%)`; px2.fillRect(0, y, 256, 4); }
const planetG = new THREE.Group();
planetG.add(new THREE.Mesh(new THREE.SphereGeometry(22, 32, 24), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(pc), fog: false})));
const pring = new THREE.Mesh(new THREE.RingGeometry(30, 46, 64), new THREE.MeshBasicMaterial({color: 0x9ab0ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide, fog: false}));
pring.rotation.x = 1.25; planetG.add(pring); planetG.visible = false; scene.add(planetG);
// Floating spores
const SP_N = 260, sporePos = new Float32Array(SP_N*3);
for (let i = 0; i < SP_N; i++) sporePos.set([(Math.random() - .5)*44, Math.random()*14, (Math.random() - .5)*44], i*3);
const sporeGeo = new THREE.BufferGeometry(); sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
const sporeMesh = new THREE.Points(sporeGeo, new THREE.PointsMaterial({color: 0xa0ffe8, size: 0.14, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending}));
sporeMesh.frustumCulled = false; sporeMesh.visible = false; scene.add(sporeMesh);
// THE BLOOM: a many-legged fungal beast with one huge eye
const beast = new THREE.Group(); beast.rotation.order = 'YXZ'; beast.visible = false; scene.add(beast);
const bodyMat = new THREE.MeshStandardMaterial({color: 0x2a1030, emissive: 0x2a0a30, roughness: 0.8});
const bCapMat = new THREE.MeshBasicMaterial({color: 0xd848c0, side: THREE.DoubleSide});
const bBasic = c => new THREE.MeshBasicMaterial({color: c});
function bpart(geo, mat, x, y, z, head){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.userData.beast = true; if (head) m.userData.head = true; beast.add(m); return m; }
bpart(new THREE.SphereGeometry(0.7, 14, 10), bodyMat, 0, 1.5, 0).scale.set(1, 1.2, 1.1);
bpart(new THREE.SphereGeometry(1.25, 16, 8, 0, 6.283, 0, 1.5708), bCapMat, 0, 2.05, 0).scale.y = 0.6;
const spotMat = bBasic(0xffd0f4);
for (let i = 0; i < 8; i++) { const a = Math.random()*6.283, r = 0.15 + Math.random()*0.85; bpart(new THREE.SphereGeometry(0.13, 8, 6), spotMat, Math.cos(a)*r, 2.05 + 0.6*Math.sqrt(1.5625 - r*r), Math.sin(a)*r).scale.y = 0.4; }
bpart(new THREE.SphereGeometry(0.34, 14, 12), bBasic(0xf2efc4), 0, 1.55, 0.62, true);
bpart(new THREE.BoxGeometry(0.05, 0.34, 0.04), bBasic(0x050505), 0, 1.55, 0.96, true);
const legGeo = new THREE.CylinderGeometry(0.05, 0.03, 1.8, 6); legGeo.translate(0, -0.9, 0);
const bLegs = [];
for (let i = 0; i < 6; i++) { const piv = new THREE.Group(); piv.position.y = 1.25; piv.rotation.y = i/6*6.283 + 0.5; beast.add(piv); const lm = new THREE.Mesh(legGeo, bodyMat); lm.rotation.z = 0.9; lm.userData.beast = true; piv.add(lm); bLegs.push(lm); }
const beastLight = new THREE.PointLight(0xff5ad8, 0, 14, 1.6); beastLight.position.set(0, 2, 0.5); beast.add(beastLight);
let beastHp = 10, beastAlive = true, bState = 'creep', bT = 2, bHit = 0, bFall = 0, bPhase = 0, bStagger = 0, bAtk = 0, bDashed = false, bDx = 0, bDz = 0;
function spawnBeast(){
  const a = Math.random()*6.283;
  beast.position.set(Math.max(RX - 60, Math.min(RX + 60, camera.position.x + Math.sin(a)*38)), 0, Math.max(-60, Math.min(60, camera.position.z + Math.cos(a)*38)));
  beast.rotation.set(0, 0, 0); beast.scale.set(1, 1, 1); beastHp = 10 * cyc(); beastAlive = true; bState = 'creep'; bT = 2.5; bFall = 0; bHit = 0; bStagger = 0; beast.visible = true;
}
function beastCollide(nx, nz){
  for (const t of shroomPos) { const ox = nx - t[0], oz = nz - t[1], r = t[2] + 0.9, d2 = ox*ox + oz*oz; if (d2 < r*r) { const d = Math.sqrt(d2) || 0.001; nx = t[0] + ox/d*r; nz = t[1] + oz/d*r; } }
  return [Math.max(RX - 74, Math.min(RX + 74, nx)), Math.max(-74, Math.min(74, nz))];
}
function updateBeast(dt){
  if (realm !== 2 || heaven || !beast.visible) { beastLight.intensity = 0; return; }
  if (!beastAlive) {
    bFall = Math.min(1, bFall + dt*0.9); beast.scale.y = 1 - bFall*0.85; bCapMat.color.setHex(0x4a2a48);
    beastLight.intensity = 1.2*(1 - bFall); return;
  }
  bHit = Math.max(0, bHit - dt); bStagger = Math.max(0, bStagger - dt); bAtk = Math.max(0, bAtk - dt);
  const mx = beast.position.x, mz = beast.position.z, dx = camera.position.x - mx, dz = camera.position.z - mz, dist = Math.hypot(dx, dz) || 0.001;
  let moving = 0;
  if (bState === 'dash') {
    const sp = 11*dt, r = beastCollide(mx + bDx*sp, mz + bDz*sp); beast.position.x = r[0]; beast.position.z = r[1]; moving = 3;
    if (!bDashed && dist < 1.8 && jumpH < 0.45 && !dead) { bDashed = true; hurt(30); }
    bT -= dt; if (bT <= 0) { bState = 'rest'; bT = 1.0; }
  } else {
    beast.rotation.y = Math.atan2(dx, dz);
    if (bState === 'creep' && bStagger <= 0 && !dead) {
      if (dist > 1.5) { const sp = (hasGun ? 1.3 : 1.0)*dt, r = beastCollide(mx + dx/dist*sp, mz + dz/dist*sp); beast.position.x = r[0]; beast.position.z = r[1]; moving = 1; }
      if (dist < 1.8 && bAtk <= 0) { bAtk = 1.3; hurt(25); }
      bT -= dt;
      if (bT <= 0) { if (dist < 16 && dist > 2.5) { bState = 'wind'; bT = 0.65; beastWind(); } else bT = 0.8; }
    } else if (bState === 'wind') {
      bT -= dt; if (bT <= 0) { bState = 'dash'; bT = 0.42; bDashed = false; bDx = dx/dist; bDz = dz/dist; beastDash(); }
    } else if (bState === 'rest') {
      bT -= dt; if (bT <= 0) { bState = 'creep'; bT = 1.8 + Math.random()*2; }
    }
  }
  bPhase += dt*(moving === 3 ? 20 : moving*6);
  bLegs.forEach((l, i) => { l.rotation.z = (bState === 'wind' ? 0.55 : 0.9) + Math.sin(bPhase + i*1.3)*0.22*(moving ? 1 : 0.15); });
  const lean = bState === 'wind' ? -0.35 : bState === 'dash' ? 0.25 : 0;
  beast.rotation.x += (lean - beast.rotation.x)*Math.min(1, dt*12);
  bCapMat.color.setHex(bHit > 0 ? 0xffffff : bState === 'wind' ? 0xffa0f4 : 0xd848c0);
  beastLight.intensity = (bState === 'wind' ? 3 : 1.1) + Math.sin(time*5)*0.2;
}

// Portals
function swirlTex(h1, h2){
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const grd = x.createRadialGradient(128, 128, 0, 128, 128, 126);
  grd.addColorStop(0, `hsla(${h2},100%,85%,.95)`); grd.addColorStop(0.45, `hsla(${h1},90%,50%,.65)`); grd.addColorStop(1, `hsla(${h1},90%,35%,.15)`);
  x.fillStyle = grd; x.beginPath(); x.arc(128, 128, 126, 0, 6.3); x.fill(); x.lineCap = 'round';
  for (let a = 0; a < 5; a++) { x.beginPath(); for (let t = 0; t <= 1; t += 0.02) { const ang = a*1.2566 + t*5, r = t*118, qx = 128 + Math.cos(ang)*r, qy = 128 + Math.sin(ang)*r; if (t === 0) x.moveTo(qx, qy); else x.lineTo(qx, qy); } x.strokeStyle = `hsla(${h2},100%,80%,.75)`; x.lineWidth = 6; x.stroke(); }
  return new THREE.CanvasTexture(c);
}
function makePortal(h1, h2){
  const g = new THREE.Group(), body = new THREE.Group(); body.position.y = 1.9; body.scale.y = 1.5; g.add(body);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 40), new THREE.MeshBasicMaterial({map: swirlTex(h1, h2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.09, 10, 48), new THREE.MeshBasicMaterial({color: new THREE.Color().setHSL(h2/360, 1, 0.75), fog: false}));
  body.add(disc, ring); g.userData = {disc, t: 0, hue: h1}; g.visible = false; scene.add(g); return g;
}
const portalA = makePortal(275, 170), portalB = makePortal(140, 50);
function openPortal(p, x, z){
  p.position.set(x, 0, z); p.rotation.y = Math.atan2(camera.position.x - x, camera.position.z - z);
  p.userData.t = 0; p.scale.setScalar(0.01); p.visible = true; portalSound();
}
function openPortalA(){
  if (realm !== 1 || heaven || dead || !won) return;
  const dx = camera.position.x - man.position.x, dz = camera.position.z - man.position.z, d = Math.hypot(dx, dz) || 1;
  openPortal(portalA, man.position.x + dx/d*2, man.position.z + dz/d*2);
  say('A PORTAL TEARS OPEN WHERE HE FELL', 5000);
}
function openPortalB(){
  if (realm !== 2 || heaven || dead) return;
  const dx = camera.position.x - beast.position.x, dz = camera.position.z - beast.position.z, d = Math.hypot(dx, dz) || 1;
  openPortal(portalB, beast.position.x + dx/d*2.5, beast.position.z + dz/d*2.5);
}






// Sounds for the second world
function sweepNoise(f0, f1, dur, gain){
  if (!ac || !whiteBuf) return;
  const t = ac.currentTime, s = ac.createBufferSource(); s.buffer = whiteBuf; s.loop = true;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(gain, t + dur*0.4); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
}
function sweepTone(f0, f1, dur, gain, type){
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(gain, t + dur*0.5); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function portalSound(){ caption('[PORTAL HUMS]'); sweepNoise(200, 3500, 1.4, 1.2); sweepTone(80, 420, 1.4, 0.5, 'sine'); }
function beastWind(){ caption('[SOMETHING RISES]'); sweepTone(60, 220, 0.65, 0.9, 'triangle'); if (!warned) { warned = true; say('IT LEAPS. JUMP OVER IT.', 3000); } }
function beastDash(){ sweepNoise(900, 300, 0.4, 1.6); }
function chime(){
  if (!ac || realm !== 2) return;
  const t = ac.currentTime, f = [392, 466, 523, 622, 698, 784][Math.floor(Math.random()*6)]*(Math.random() < 0.3 ? 0.5 : 1);
  [[f, 0.09], [f*2.01, 0.03]].forEach(([fr, v]) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = fr;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 3.6);
  });
}

