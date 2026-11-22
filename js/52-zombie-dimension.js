/* THE GRID — The Zombie Dimension: a fifth place that is not part of the story.
   It sits outside the four worlds and is reached from the menu or the rift, and
   it is a survival arena: waves of walkers that keep coming until you leave.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ============================================================================
//  THE ZOMBIE DIMENSION — graveyard, red moon, waves
// ============================================================================
const ZX = -3000;
const dim = new THREE.Group(); dim.position.set(ZX, 0, 0); dim.visible = false; scene.add(dim);

// ---- ground ----------------------------------------------------------------
const dcv = document.createElement('canvas'); dcv.width = dcv.height = 256;
const dcx = dcv.getContext('2d');
dcx.fillStyle = '#0c0a10'; dcx.fillRect(0, 0, 256, 256);
for (let i = 0; i < 1400; i++) {
  dcx.fillStyle = 'rgba(' + (30 + Math.random() * 40 | 0) + ',' + (22 + Math.random() * 26 | 0) + ',' + (30 + Math.random() * 30 | 0) + ',' + (Math.random() * 0.45).toFixed(2) + ')';
  dcx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 2 + Math.random() * 3);
}
for (let i = 0; i < 40; i++) {
  dcx.strokeStyle = 'rgba(90,20,30,.25)'; dcx.lineWidth = 1;
  let x = Math.random() * 256, y = Math.random() * 256;
  dcx.beginPath(); dcx.moveTo(x, y);
  for (let k = 0; k < 5; k++) { x += (Math.random() - .5) * 50; y += (Math.random() - .5) * 50; dcx.lineTo(x, y); }
  dcx.stroke();
}
const dtex = new THREE.CanvasTexture(dcv);
dtex.wrapS = dtex.wrapT = THREE.RepeatWrapping; dtex.repeat.set(15, 15); dtex.anisotropy = 4;
const ground5 = new THREE.Mesh(new THREE.PlaneGeometry(170, 170),
  new THREE.MeshStandardMaterial({map: dtex, roughness: 1, emissive: 0x140508, emissiveIntensity: 0.55}));
ground5.rotation.x = -Math.PI / 2; dim.add(ground5);

// ---- gravestones (collide, so the dead have something to shamble around) ----
const gravePos = [];
const stoneGeo = new THREE.BoxGeometry(0.78, 1.25, 0.2);
stoneGeo.translate(0, 0.62, 0);
const stones = new THREE.InstancedMesh(stoneGeo,
  new THREE.MeshStandardMaterial({color: 0x2b2733, roughness: 1, emissive: 0x0a0508}), 240);
stones.frustumCulled = false;
{
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < 240; i++) {
    let x, z, tries = 0;
    do {
      const a = Math.random() * 6.283, r = 13 + Math.random() * 56;
      x = Math.sin(a) * r; z = Math.cos(a) * r; tries++;
    } while (Math.hypot(x, z - 14) < 5 && tries < 30);
    e.set((Math.random() - .5) * 0.28, Math.random() * 6.28, (Math.random() - .5) * 0.32, 'XYZ');
    q.setFromEuler(e);
    const s = 0.75 + Math.random() * 0.75;
    stones.setMatrixAt(i, m4.compose(p.set(x, 0, z), q, sc.set(s, s * (0.8 + Math.random() * 0.5), s)));
    if (Math.hypot(x, z) > 6 && Math.hypot(x, z) < 66) gravePos.push([ZX + x, z, 0.55]);
  }
  stones.instanceMatrix.needsUpdate = true;
}
dim.add(stones);

// ---- dead trees ------------------------------------------------------------
{
  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.34, 7, 5);
  trunkGeo.translate(0, 3.5, 0);
  const woodMat = new THREE.MeshStandardMaterial({color: 0x1a151c, roughness: 1, flatShading: true});
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const trees = new THREE.InstancedMesh(trunkGeo, woodMat, 34);
  trees.frustumCulled = false;
  for (let i = 0; i < 34; i++) {
    const a = Math.random() * 6.283, r = 22 + Math.random() * 50;
    e.set((Math.random() - .5) * 0.22, Math.random() * 6.28, (Math.random() - .5) * 0.22, 'XYZ');
    q.setFromEuler(e);
    const s = 0.6 + Math.random() * 0.7;
    trees.setMatrixAt(i, m4.compose(p.set(Math.sin(a) * r, 0, Math.cos(a) * r), q, sc.set(s, s * (0.7 + Math.random() * 0.8), s)));
  }
  trees.instanceMatrix.needsUpdate = true;
  dim.add(trees);
}

// ---- the red moon ----------------------------------------------------------
const redMoon = new THREE.Mesh(new THREE.SphereGeometry(11, 18, 14), new THREE.MeshBasicMaterial({color: 0x9a1414}));
redMoon.position.set(-18, 30, -62); dim.add(redMoon);
const moonGlow = new THREE.Mesh(new THREE.SphereGeometry(17, 16, 12),
  new THREE.MeshBasicMaterial({color: 0x5a0810, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
moonGlow.position.copy(redMoon.position); dim.add(moonGlow);

// ---- the rift home ---------------------------------------------------------
const rift = new THREE.Group();
{
  const boneMat2 = new THREE.MeshStandardMaterial({color: 0xd8cdb6, roughness: 1, emissive: 0x2a2018});
  [-1.5, 1.5].forEach(x => {
    const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 3.4, 6), boneMat2);
    pil.position.set(x, 1.7, 0); rift.add(pil);
  });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.14, 8, 22, Math.PI), boneMat2);
  arch.position.set(0, 3.3, 0); rift.add(arch);
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.2),
    new THREE.MeshBasicMaterial({color: 0x8a2a4a, transparent: true, opacity: 0.3, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
  veil.position.set(0, 1.7, 0); rift.add(veil);
  rift.userData.veil = veil;
}
rift.position.set(0, 0, 14); dim.add(rift);

// ---- state -----------------------------------------------------------------
let nearRift = false, dimActive = false, dimWave = 0, dimWaveT = 0;

function clearDimensionMobs() {
  for (let i = mobs.length - 1; i >= 0; i--) if (mobs[i].realm === 5) { mobLayer.remove(mobs[i].g); mobs.splice(i, 1); }
  if (typeof lord !== 'undefined' && lord && lord.realm === 5) { lordLayer.remove(lord.g); lord = null; }
}
function resetDimension() { dimActive = false; dimWave = 0; dimWaveT = 0; clearDimensionMobs(); }

function enterDimension() {
  if (teleporting) return;
  teleporting = true; portalSound();
  fadeEl.style.transition = 'opacity .9s'; fadeEl.style.background = '#2a0408'; fadeEl.textContent = ''; fadeEl.style.opacity = '1';
  setTimeout(() => {
    setRealm(5);
    camera.position.set(ZX, EYE, 14); yaw = 0; pitch = 0;
    clearDimensionMobs();
    dimActive = true; dimWave = 0; dimWaveT = 3.2;
    fadeEl.style.transition = 'none'; void fadeEl.offsetWidth; fadeEl.style.transition = 'opacity 2s'; fadeEl.style.opacity = '0';
    teleporting = false;
    say('THE ZOMBIE DIMENSION', 3200);
    sweepTone(60, 28, 2, 0.6, 'sawtooth');
  }, tm(900));
}

function leaveDimension() {
  if (teleporting || realm !== 5) return;
  teleporting = true; portalSound();
  fadeEl.style.transition = 'opacity .9s'; fadeEl.style.background = '#000'; fadeEl.textContent = ''; fadeEl.style.opacity = '1';
  setTimeout(() => {
    resetDimension();
    setRealm(1);
    camera.position.set(0, EYE, 5); yaw = 0; pitch = 0;
    fadeEl.style.transition = 'none'; void fadeEl.offsetWidth; fadeEl.style.transition = 'opacity 2s'; fadeEl.style.opacity = '0';
    teleporting = false;
    say('BACK IN THE FOREST', 2600);
  }, tm(900));
}

function spawnDimWave() {
  dimWave++;
  dimWaveT = 6.5;
  const n = Math.min(2 + dimWave, 8);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, r = 11 + Math.random() * 9;
    const c = clampToRealm(ZX + Math.sin(a) * r, 14 + Math.cos(a) * r, 5);
    makeMob('zombie', c[0], c[1], 5);
  }
  if (dimWave % 5 === 0) { spawnLord(5); say('WAVE ' + dimWave + '  ·  IT FOUND YOU', 3000); }
  else say('WAVE ' + dimWave, 2200);
  sweepTone(120, 50, 0.6, 0.4, 'square');
}

function dimAlive() {
  let n = 0;
  for (const m of mobs) if (m.realm === 5 && m.alive) n++;
  if (lord && lord.alive && lord.realm === 5) n++;
  return n;
}

function updateDimension(dt) {
  if (realm !== 5) { nearRift = false; return; }
  nearRift = Math.hypot(camera.position.x - ZX, camera.position.z - 14) < 2.6;
  rift.userData.veil.rotation.y += dt * 0.8;
  rift.userData.veil.material.opacity = 0.22 + Math.sin(time * 2.1) * 0.08;
  if (!dimActive || dead || teleporting || heaven || paused) return;
  if (dimAlive() > 0) return;
  dimWaveT -= dt;
  if (dimWaveT <= 0) spawnDimWave();
}
