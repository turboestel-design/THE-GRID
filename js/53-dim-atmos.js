/* THE GRID — Atmosphere for the Zombie Dimension: drifting mist, embers, braziers,
   a bell tower, crows, bones, glowing cracks, and the pulse when a round begins.
   Sits on top of 52-zombie-dimension.js and only ever runs in realm five.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ============================================================================
//  THE DIMENSION BREATHES
// ============================================================================
const dimFx = (() => {
  let seed = 77031;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const rr = (a, b) => a + rnd() * (b - a);
  const clearOfThings = (x, z, pad) =>
    !(Math.hypot(x - ZX - DIM_HUT_AT.x, z - DIM_HUT_AT.z) < 6 + pad) && !inDimProp(x - ZX, z, pad);

  // ---- a ruined horizon, half eaten by the fog ------------------------------
  {
    const mat = new THREE.MeshStandardMaterial({color: 0x241220, roughness: 1, flatShading: true, emissive: 0x150610, emissiveIntensity: 0.8});
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const ruins = new THREE.InstancedMesh(geo, mat, 46);
    ruins.frustumCulled = false;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + rr(-0.06, 0.06), r = rr(52, 84);
      const w = rr(3, 9), h = rr(6, 26) * (i % 7 === 0 ? 1.7 : 1), d = rr(3, 9);
      e.set(0, rr(0, 6.28), rr(-0.03, 0.03), 'XYZ'); q.setFromEuler(e);
      ruins.setMatrixAt(i, m4.compose(p.set(Math.sin(a) * r, h / 2 - 0.4, 14 + Math.cos(a) * r), q, sc.set(w, h, d)));
    }
    ruins.instanceMatrix.needsUpdate = true;
    dim.add(ruins);
  }

  // ---- a bell tower, because the dark wants a silhouette ---------------------
  const tower = new THREE.Group();
  {
    const stone = new THREE.MeshStandardMaterial({color: 0x1d1220, roughness: 1, flatShading: true, emissive: 0x0c0410, emissiveIntensity: 0.7});
    const put = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
      m.position.set(x, y, z); tower.add(m); return m;
    };
    put(4.4, 22, 4.4, 0, 11, 0);
    put(6.0, 1.2, 6.0, 0, 22.4, 0);
    put(0.8, 6, 0.8, 0, 26, 0);
    put(3.0, 0.8, 0.8, 0, 26.4, 0);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.0, 1.5, 8, 1, true),
      new THREE.MeshStandardMaterial({color: 0x2a1f1a, metalness: 0.5, roughness: 0.7, side: THREE.DoubleSide}));
    bell.position.set(0, 20.6, 0); tower.add(bell);
    tower.userData.bell = bell;
    tower.position.set(26, 0, 50); tower.rotation.y = -0.4;
    dim.add(tower);
  }

  // ---- ground mist: two sheets drifting against each other ------------------
  const mistTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const px = Math.random() * 256, py = Math.random() * 256, r = 14 + Math.random() * 46;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(120,60,80,' + (0.14 + Math.random() * 0.16).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 6.3); x.fill();
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
  })();
  const mistLayers = [];
  [[0.3, 0.5, 0.32], [1.1, -0.34, 0.2]].forEach(([y, spd, op]) => {
    const tex = mistTex.clone(); tex.needsUpdate = true; tex.repeat.set(3, 3);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(190, 190),
      new THREE.MeshBasicMaterial({map: tex, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false}));
    m.rotation.x = -Math.PI / 2; m.position.set(0, y, 14); m.renderOrder = 2;
    dim.add(m); mistLayers.push({m, tex, spd});
  });

  // ---- embers coming off the ground -----------------------------------------
  const motes = (() => {
    const N = 320, pos = new Float32Array(N * 3), vel = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = rnd() * 6.283, r = rnd() * 62;
      pos[i * 3] = Math.sin(a) * r; pos[i * 3 + 1] = rnd() * 14; pos[i * 3 + 2] = 14 + Math.cos(a) * r;
      vel[i] = 0.18 + rnd() * 0.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({
      color: 0xff6a3a, size: 0.1, transparent: true, opacity: 0.75, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false
    }));
    m.frustumCulled = false;
    dim.add(m);
    return {m, pos, vel, N, geo: g};
  })();

  // ---- braziers at the edge of the ring (only two carry a real light) --------
  const braziers = [];
  [[-19, 26, true], [17, 6, true], [-9, -2, false], [24, 30, false]].forEach(([x, z, lit]) => {
    const g = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({color: 0x2a2230, roughness: 1, flatShading: true, emissive: 0x0c060c, emissiveIntensity: 1});
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.32, 0.7, 7), stone);
    bowl.position.y = 0.35; g.add(bowl);
    const fire = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3),
      new THREE.MeshBasicMaterial({color: 0xff7a2a}));
    fire.position.y = 0.86; g.add(fire);
    let light = null;
    if (lit) {
      light = new THREE.PointLight(0xff6a24, 2.2, 13, 1.7);
      light.position.y = 1.1; g.add(light);
    }
    g.position.set(x, 0, z);
    dim.add(g);
    braziers.push({g, fire, light, ph: rnd() * 6.3});
    dimBoxes.push([ZX + x - 0.42, z - 0.42, ZX + x + 0.42, z + 0.42]);
  });

  // ---- bones, because a graveyard needs the rest of a body ------------------
  {
    const geo = new THREE.IcosahedronGeometry(0.13, 0);
    const mat = new THREE.MeshStandardMaterial({color: 0xc4b6a2, roughness: 1, flatShading: true, emissive: 0x241c16, emissiveIntensity: 1});
    const bones = new THREE.InstancedMesh(geo, mat, 120);
    bones.frustumCulled = false;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    let n = 0, guard = 0;
    while (n < 120 && guard++ < 900) {
      const a = rnd() * 6.283, r = rr(7, 46);
      const x = Math.sin(a) * r, z = 14 + Math.cos(a) * r;
      if (!clearOfThings(ZX + x, z, 0.6)) continue;
      e.set(rr(0, 6.3), rr(0, 6.3), rr(0, 6.3), 'XYZ'); q.setFromEuler(e);
      const s = rr(0.7, 1.6);
      bones.setMatrixAt(n++, m4.compose(p.set(x, rr(0.04, 0.14), z), q, sc.set(s, s * 0.8, s * 1.3)));
    }
    bones.count = n;
    bones.instanceMatrix.needsUpdate = true;
    dim.add(bones);
  }

  // ---- crows wheeling around the moon ---------------------------------------
  const crows = (() => {
    const mat = new THREE.MeshStandardMaterial({color: 0x0d070a, roughness: 1, emissive: 0x080305, emissiveIntensity: 1});
    const list = [];
    const wingL = new THREE.BoxGeometry(0.9, 0.04, 0.24), body = new THREE.BoxGeometry(0.2, 0.12, 0.5);
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      const b = new THREE.Mesh(body, mat); g.add(b);
      const w1 = new THREE.Mesh(wingL, mat); w1.position.set(-0.5, 0, 0); g.add(w1);
      const w2 = new THREE.Mesh(wingL, mat); w2.position.set(0.5, 0, 0); g.add(w2);
      dim.add(g);
      list.push({g, w1, w2, a: rnd() * 6.283, r: rr(16, 38), y: rr(15, 26), spd: rr(0.08, 0.2) * (rnd() < 0.5 ? 1 : -1), ph: rnd() * 6.3});
    }
    return list;
  })();

  // ---- cracks in the ground, glowing faintly --------------------------------
  const cracks = [];
  for (let i = 0; i < 7; i++) {
    const a = rnd() * 6.283, r = rr(9, 34);
    const len = rr(3, 9);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.22, len),
      new THREE.MeshBasicMaterial({color: 0x8a1c10, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, fog: false}));
    m.rotation.x = -Math.PI / 2; m.rotation.z = rnd() * 6.283;
    m.position.set(Math.sin(a) * r, 0.03, 14 + Math.cos(a) * r);
    dim.add(m);
    cracks.push({m, base: 0.22 + rnd() * 0.4, ph: rnd() * 6.3});
  }

  // ---- the rift gets a light of its own -------------------------------------
  const riftLight = new THREE.PointLight(0x9a2a54, 2.0, 16, 1.6);
  riftLight.position.set(0, 1.8, 14);
  dim.add(riftLight);

  return {mist: mistLayers, motes, braziers, crows, cracks, riftLight, tower};
})();

// the toll when a round begins
function dimBell() {
  sweepTone(196, 92, 2.6, 0.34, 'sine');
  sweepTone(392, 184, 2.2, 0.12, 'sine');
  setTimeout(() => sweepTone(174, 82, 2.4, 0.22, 'sine'), 620);
  setTimeout(() => sweepTone(160, 76, 2.2, 0.16, 'sine'), 1180);
}
let dimPulse = 0, dimAmbT = 9, dimAmbN = 0;
// called when a round starts: the fog thickens, the moon flares, the bell rings
function dimRoundFx() {
  dimPulse = 1;
  dimBell();
  rumble(300, 1.4);
}
function dimAtmos(dt) {
  if (realm !== 5) return;
  // mist drifts
  for (const l of dimFx.mist) {
    l.tex.offset.x += l.spd * dt * 0.02;
    l.tex.offset.y -= l.spd * dt * 0.013;
  }
  // embers rise and wrap
  {
    const p = dimFx.motes.pos;
    for (let i = 0; i < dimFx.motes.N; i++) {
      p[i * 3 + 1] += dimFx.motes.vel[i] * dt;
      p[i * 3] += Math.sin(time * 0.6 + i) * dt * 0.22;
      if (p[i * 3 + 1] > 15) { p[i * 3 + 1] = 0.2; }
    }
    dimFx.motes.geo.attributes.position.needsUpdate = true;
    dimFx.motes.m.material.opacity = 0.55 + Math.sin(time * 1.7) * 0.16;
  }
  // braziers breathe
  for (const b of dimFx.braziers) {
    const f = 0.82 + Math.sin(time * 7.7 + b.ph) * 0.18 + Math.sin(time * 3.1 + b.ph) * 0.1;
    b.fire.scale.set(0.8 + f * 0.3, 0.7 + f * 0.55, 0.8 + f * 0.3);
    b.fire.material.color.setHex(f > 1 ? 0xffa040 : 0xff6a20);
    if (b.light) b.light.intensity = 1.9 + Math.sin(time * 9.3 + b.ph) * 0.75 + Math.sin(time * 4.1 + b.ph) * 0.35;
  }
  // crows
  for (const c of dimFx.crows) {
    c.a += c.spd * dt;
    const x = Math.sin(c.a) * c.r, z = 14 + Math.cos(c.a) * c.r;
    c.g.position.set(x, c.y + Math.sin(time * 1.6 + c.ph) * 0.7, z);
    c.g.rotation.y = -c.a + (c.spd > 0 ? Math.PI : 0);
    const flap = Math.sin(time * 7 + c.ph) * 0.55;
    c.w1.rotation.z = flap; c.w2.rotation.z = -flap;
  }
  // cracks pulse
  for (const c of dimFx.cracks) c.m.material.opacity = c.base * (0.55 + Math.sin(time * 1.7 + c.ph) * 0.45);
  // the rift light and veil
  dimFx.riftLight.intensity = 1.6 + Math.sin(time * 1.9) * 0.5 + dimPulse * 2.5;
  // the air gets thicker and redder the longer you last
  const deep = Math.min(1, Math.max(0, dimWave - 1) / 14);
  scene.fog.color.setRGB(0.165 + deep * 0.075, 0.039 + deep * 0.004, 0.086 - deep * 0.024);
  // the round pulse fades
  if (dimPulse > 0) {
    dimPulse = Math.max(0, dimPulse - dt * 0.55);
    scene.fog.density = 0.022 + dimPulse * 0.02;
    moon.intensity = 1.7 + dimPulse * 1.5;
  }
  // distant sounds so the quiet is never quite silent
  dimAmbT -= dt;
  if (dimAmbT <= 0) {
    dimAmbT = 9 + Math.random() * 13;
    dimAmbN++;
    if (dimAmbN % 3 === 0) sweepNoise(500, 120, 2.2, 0.16);          // a wind through the ruins
    else sweepTone(70 + Math.random() * 50, 42, 2.4, 0.13, 'sawtooth'); // something out there
    if (dimFx.tower) dimFx.tower.userData.bell.rotation.z = 0.22;
  }
  // the bell swings back after a toll
  const bell = dimFx.tower && dimFx.tower.userData.bell;
  if (bell && Math.abs(bell.rotation.z) > 0.002) bell.rotation.z *= Math.max(0, 1 - dt * 2.4);
}
