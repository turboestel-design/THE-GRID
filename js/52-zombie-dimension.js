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
  new THREE.MeshStandardMaterial({map: dtex, roughness: 1, emissive: 0x2e0c16, emissiveIntensity: 1.1}));
ground5.rotation.x = -Math.PI / 2; dim.add(ground5);

// ---- the arena: ruined walls, crates and sandbags to break the dead's charge --
const dimBoxes = [];       // world AABBs [minX, minZ, maxX, maxZ], same shape as homeBoxes()
const dimMeshes = [];      // stop bullets
const dimProps = new THREE.Group(); dim.add(dimProps);
{
  let seed = 20261121;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const stoneM = new THREE.MeshStandardMaterial({color: 0x3a3442, roughness: 1, flatShading: true, emissive: 0x0b0610, emissiveIntensity: 1});
  const woodM  = new THREE.MeshStandardMaterial({color: 0x2b201b, roughness: 1, flatShading: true, emissive: 0x080505, emissiveIntensity: 1});
  const sackM  = new THREE.MeshStandardMaterial({color: 0x4b4132, roughness: 1, flatShading: true, emissive: 0x080604, emissiveIntensity: 1});
  const stone2 = new THREE.MeshStandardMaterial({color: 0x2c2735, roughness: 1, flatShading: true, emissive: 0x0a060c, emissiveIntensity: 1});
  // local x/z; dim itself sits at ZX
  const put = (w, h, d, x, z, mat, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y === undefined ? h / 2 : y, z);
    dimProps.add(m); dimMeshes.push(m);
    return m;
  };
  const solid = (w, d, x, z) => dimBoxes.push([ZX + x - w / 2, z - d / 2, ZX + x + w / 2, z + d / 2]);
  const rubble = (x, z, len, alongZ, spread) => {
    for (let i = 0; i < 6; i++) {
      const t = (rnd() - 0.5) * len, off = (rnd() < 0.5 ? -1 : 1) * (0.2 + rnd() * spread);
      const s = 0.14 + rnd() * 0.28;
      put(s, 0.12 + rnd() * 0.26, s, x + (alongZ ? off : t), z + (alongZ ? t : off), rnd() < 0.5 ? stoneM : stone2);
    }
  };
  const brokenWall = (x, z, len, h, alongZ) => {
    const w = alongZ ? 0.36 : len, d = alongZ ? len : 0.36;
    put(w, h, d, x, z, stoneM);
    solid(w, d, x, z);
    // a jagged stump left standing on top of the run
    const seg = 0.9 + rnd() * 1.2, sh = 0.3 + rnd() * 0.5;
    put(alongZ ? 0.36 : seg, sh, alongZ ? seg : 0.36,
      x + (alongZ ? 0 : (rnd() - 0.5) * (len - seg)), z + (alongZ ? (rnd() - 0.5) * (len - seg) : 0), stone2, h + sh / 2);
    rubble(x, z, len, alongZ, 0.7);
  };
  const crate = (x, z, s, h) => { put(s, h || s * 0.82, s, x, z, woodM); solid(s, s, x, z); };
  const sandbags = (x, z, len, alongZ) => {
    const w = alongZ ? 0.7 : len, d = alongZ ? len : 0.7;
    put(w, 0.8, d, x, z, sackM); solid(w, d, x, z);
    for (let i = 0; i < 4; i++) {
      const t = -len / 2 + 0.2 + i * (len - 0.4) / 3;
      put(alongZ ? 0.66 : 0.42, 0.24, alongZ ? 0.42 : 0.66, x + (alongZ ? 0 : t), z + (alongZ ? t : 0), sackM, 0.92);
    }
  };
  const cart = (x, z, rot) => {
    const w = rot ? 1.15 : 2.2, d = rot ? 2.2 : 1.15;
    put(w, 0.55, d, x, z, woodM, 0.42); solid(w, d, x, z);
    put(rot ? 0.5 : 2.3, 0.14, rot ? 2.3 : 0.5, x, z, woodM, 0.74);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 8), stone2);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x + sx * (w / 2 - 0.22), 0.34, z + sz * (d / 2 - 0.2));
      dimProps.add(wheel); dimMeshes.push(wheel);
    });
  };
  const railPanel = (x, z, len, alongZ) => {
    const w = alongZ ? 0.16 : len, d = alongZ ? len : 0.16;
    solid(w, d, x, z);
    [0.6, 1.1].forEach(y => put(alongZ ? 0.1 : len, 0.12, alongZ ? len : 0.1, x, z, woodM, y));
    [-len / 2, len / 2].forEach(t => put(0.16, 1.35, 0.16, x + (alongZ ? 0 : t), z + (alongZ ? t : 0), woodM));
  };

  // ringed around the rift so every approach has something to work with
  brokenWall(-13, 3, 4.2, 1.5, false);
  brokenWall(-15, 5.4, 0.36, 1.2, true);
  brokenWall(12.5, 20, 4.6, 1.6, false);
  brokenWall(14.8, 17.6, 3.4, 1.2, true);
  brokenWall(-9, 30, 5.0, 1.45, false);
  brokenWall(19, -1, 4.4, 1.5, true);
  brokenWall(16.6, -2.4, 3.2, 1.15, false);
  brokenWall(-21, 18, 3.6, 1.3, true);
  brokenWall(-23, 14, 3.0, 1.05, false);
  brokenWall(6, 33, 3.8, 1.25, false);
  brokenWall(-4, -3, 3.4, 1.3, false);
  brokenWall(22, 26, 3.2, 1.2, true);

  crate(-6.2, 10.4, 1.0); crate(-5.0, 11.6, 0.86); crate(-7.1, 11.5, 0.72);
  crate(6.4, 8.2, 0.95);  crate(7.6, 9.4, 0.8);
  crate(16.2, 12.4, 1.05); crate(-16.4, 24, 0.9); crate(4.2, 28.2, 1.1, 1.1);
  crate(-9.8, 20.6, 0.78); crate(11.4, 4.2, 0.92);

  sandbags(-8, 4.2, 2.6, false);
  sandbags(8.4, 24.2, 2.4, false);
  sandbags(-18.4, 8.6, 2.2, true);
  sandbags(12.6, 6.4, 2.0, false);

  cart(0.4, 24.8, false);
  cart(-24, 22, true);

  railPanel(-3.4, 18.6, 2.6, false);
  railPanel(3.8, 19.2, 2.2, false);
  railPanel(18, 30, 2.4, true);
  railPanel(-13, 26, 2.6, false);
}
// is this local point inside (or too near) an arena piece? used to keep the
// graveyard from growing out of a crate.
function inDimProp(x, z, pad) {
  for (const b of dimBoxes)
    if (ZX + x > b[0] - pad && ZX + x < b[2] + pad && z > b[1] - pad && z < b[3] + pad) return true;
  return false;
}


// ---- gravestones (collide, so the dead have something to shamble around) ----
const gravePos = [];
const stoneGeo = new THREE.BoxGeometry(0.78, 1.25, 0.2);
stoneGeo.translate(0, 0.62, 0);
const stones = new THREE.InstancedMesh(stoneGeo,
  new THREE.MeshStandardMaterial({color: 0x4a4453, roughness: 1, emissive: 0x140a12, emissiveIntensity: 0.8}), 240);
stones.frustumCulled = false;
{
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < 240; i++) {
    let x, z, tries = 0;
    do {
      const a = Math.random() * 6.283, r = 13 + Math.random() * 56;
      x = Math.sin(a) * r; z = Math.cos(a) * r; tries++;
    } while ((Math.hypot(x, z - 14) < 5 || inDimProp(x, z, 1.3)) && tries < 40);
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
    const tx = Math.sin(a) * r, tz = Math.cos(a) * r;
    if (inDimProp(tx, tz, 1.6)) { i--; continue; }
    trees.setMatrixAt(i, m4.compose(p.set(tx, 0, tz), q, sc.set(s, s * (0.7 + Math.random() * 0.8), s)));
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
let nearRift = false, dimActive = false, dimWave = 0, dimWaveT = 0, dimCleared = true;
const dimRoundEl = document.getElementById('dimRound');
const dimRoundNum = document.getElementById('dimRoundNum');
const dimLeftEl = document.getElementById('dimLeft');

// rounds get harder, but slowly: +12% health, +5% damage, +2% speed per round,
// and from round five some of them learn to run.
function tuneDimMob(m, round, runner) {
  const hpMul = Math.min(2.6, 1 + (round - 1) * 0.12);
  const dmgMul = Math.min(2.0, 1 + (round - 1) * 0.05);
  const spdMul = Math.min(1.35, 1 + (round - 1) * 0.02);
  m.hp = m.max = Math.max(1, Math.round(m.max * hpMul));
  m.dmg = Math.round(((MOB_DEF[m.kind] || MOB_DEF.zombie).dmg) * dmgMul);
  m.spd *= spdMul;
  m.round = round;
  if (runner) {
    m.runner = true;
    m.spd *= 1.8;
    m.g.scale.set(0.92, 1.04, 0.92);
    const eyeM = new THREE.MeshBasicMaterial({color: 0xff3418});
    [-0.13, 0.13].forEach(x => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.048, 6, 5), eyeM);
      e.position.set(x, 1.78, 0.22); m.g.add(e);
    });
  }
  return m;
}

function clearDimensionMobs() {
  for (let i = mobs.length - 1; i >= 0; i--) if (mobs[i].realm === 5) { mobLayer.remove(mobs[i].g); mobs.splice(i, 1); }
  if (typeof lord !== 'undefined' && lord && lord.realm === 5) { lordLayer.remove(lord.g); lord = null; }
}
function resetDimension() { dimActive = false; dimWave = 0; dimWaveT = 0; dimCleared = true; clearDimensionMobs(); }

function enterDimension() {
  if (teleporting) return;
  teleporting = true; portalSound();
  fadeEl.style.transition = 'opacity .9s'; fadeEl.style.background = '#2a0408'; fadeEl.textContent = ''; fadeEl.style.opacity = '1';
  setTimeout(() => {
    setRealm(5);
    camera.position.set(ZX, EYE, 14); yaw = 0; pitch = 0;
    clearDimensionMobs();
    dimActive = true; dimWave = 0; dimWaveT = 3.2; dimCleared = true;
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
  const round = dimWave;
  const n = Math.min(3 + round, 12);
  const runners = round >= 10 ? n : round >= 5 ? Math.min(round - 4, Math.ceil(n / 2)) : 0;
  const spits = round >= 7 ? Math.min(2, round - 6) : 0;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, r = 11 + Math.random() * 9;
    const c = clampToRealm(ZX + Math.sin(a) * r, 14 + Math.cos(a) * r, 5);
    tuneDimMob(makeMob('zombie', c[0], c[1], 5), round, i < runners);
  }
  for (let i = 0; i < spits; i++) {
    const a = Math.random() * 6.283, r = 15 + Math.random() * 6;
    const c = clampToRealm(ZX + Math.sin(a) * r, 14 + Math.cos(a) * r, 5);
    tuneDimMob(makeMob('spitter', c[0], c[1], 5), round, false);
  }
  dimWaveT = Math.max(4, 8 - round * 0.2);
  if (round % 5 === 0) { spawnLord(5); say('ROUND ' + round + '  ·  IT FOUND YOU', 3000); }
  else say('ROUND ' + round + (runners ? '  ·  THEY RUN' : ''), 2400);
  sweepTone(120, 50, 0.6, 0.4, 'square');
}

function dimAlive() {
  let n = 0;
  for (const m of mobs) if (m.realm === 5 && m.alive) n++;
  if (lord && lord.alive && lord.realm === 5) n++;
  return n;
}

function updateDimension(dt) {
  if (realm !== 5) { nearRift = false; if (dimRoundEl) dimRoundEl.style.display = 'none'; return; }
  nearRift = Math.hypot(camera.position.x - ZX, camera.position.z - 14) < 2.6;
  rift.userData.veil.rotation.y += dt * 0.8;
  rift.userData.veil.material.opacity = 0.22 + Math.sin(time * 2.1) * 0.08;
  const alive = dimAlive();
  if (dimRoundEl) {
    dimRoundEl.style.display = dimActive ? 'block' : 'none';
    dimRoundNum.textContent = 'ROUND ' + Math.max(1, dimWave);
    dimLeftEl.textContent = alive ? alive + ' LEFT' : dimWave ? 'CLEAR' : '';
  }
  if (!dimActive || dead || teleporting || heaven || paused) return;
  if (alive > 0) { dimCleared = false; return; }
  if (!dimCleared) {
    dimCleared = true;
    if (dimWave > 0) {
      health = Math.min(maxHp, health + 6);
      shards += 2; updateStats();
      say('ROUND ' + dimWave + ' CLEARED  ·  +6 HP  ·  +2 SHARDS', 2400);
      sweepTone(420, 880, 0.5, 0.35, 'sine');
    }
  }
  dimWaveT -= dt;
  if (dimWaveT <= 0) spawnDimWave();
}
