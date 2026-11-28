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

  // ---- a ruined city you can never walk to --------------------------------
  // The playable arena stops at forty-eight metres. Everything below is further
  // out than that, so it is skyline and nothing else: the dead city this place
  // used to be, still standing, still lit in a few windows.
  {
    const mat = new THREE.MeshStandardMaterial({color: 0x2b1626, roughness: 1, flatShading: true, emissive: 0x180818, emissiveIntensity: 0.9});
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    // the close ring: broken blocks, near enough to read as buildings
    const blocks = [];
    const put = (x, z, w, h, d, ry) => blocks.push([x, z, w, h, d, ry || 0]);
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2 + rr(-0.14, 0.14), r = rr(56, 78);
      const x = Math.sin(a) * r, z = 14 + Math.cos(a) * r;
      const w = rr(9, 17), d = rr(9, 17), h = rr(12, 34);
      const ry = a + rr(-0.2, 0.2);
      put(x, z, w, h, d, ry);
      // the top has come off one corner, so the outline is never a clean box
      put(x + rr(-w * 0.4, w * 0.4), z + rr(-d * 0.4, d * 0.4), w * rr(0.35, 0.6), h * rr(0.12, 0.3), d * rr(0.35, 0.6), ry);
      // a stub of a lower wing, and a broken stair tower
      if (rnd() < 0.7) put(x + w * 0.7, z + rr(-3, 3), w * 0.55, h * rr(0.3, 0.55), d * 0.7, ry);
      if (rnd() < 0.5) put(x - w * 0.55, z + d * 0.4, w * 0.3, h * rr(0.5, 0.9), d * 0.3, ry);
    }
    // two chimneys and a spire, so the skyline has landmarks
    put(38, 92, 4.5, 46, 4.5, 0);
    put(-46, 78, 4, 39, 4, 0.3);
    put(-6, 104, 5.5, 52, 5.5, 0.1);
    put(-6, 104, 2.2, 14, 2.2, 0.1);
    const ruins = new THREE.InstancedMesh(geo, mat, blocks.length);
    ruins.frustumCulled = false;
    blocks.forEach(([x, z, w, h, d, ry], i) => {
      e.set(0, ry, 0, 'XYZ'); q.setFromEuler(e);
      ruins.setMatrixAt(i, m4.compose(p.set(x, h / 2 - 0.3, z), q, sc.set(w, h, d)));
    });
    ruins.instanceMatrix.needsUpdate = true;
    dim.add(ruins);

    // windows: a grid of them on the inward face of each block, a few still lit
    const winGeo = new THREE.BoxGeometry(0.34, 0.5, 0.08);
    const litMat = new THREE.MeshBasicMaterial({color: 0xffb45c});
    const darkMat = new THREE.MeshBasicMaterial({color: 0x0a0409});
    const lit = new THREE.InstancedMesh(winGeo, litMat, 60);
    const dark = new THREE.InstancedMesh(winGeo, darkMat, 320);
    lit.frustumCulled = dark.frustumCulled = false;
    let ln = 0, dn = 0;
    for (const [x, z, w, h, d, ry] of blocks) {
      if (h < 8) continue;
      const dl = Math.hypot(x, 14 - z) || 1;
      const dirX = -x / dl, dirZ = (14 - z) / dl;           // straight at the arena
      const ux = -dirZ, uz = dirX;                          // along the face
      const toC = Math.atan2(dirX, dirZ);
      const cols = Math.max(2, Math.floor(w / 2.6)), rows = Math.max(2, Math.floor(h / 3.6));
      for (let cx = 0; cx < cols; cx++) for (let cyy = 0; cyy < rows; cyy++) {
        const off = (cx - (cols - 1) / 2) * (w / cols);
        const ex = x + dirX * (d / 2 + 0.1) + ux * off;
        const ez = z + dirZ * (d / 2 + 0.1) + uz * off;
        e.set(0, toC, 0, 'XYZ'); q.setFromEuler(e);
        const m = m4.compose(p.set(ex, 3 + cyy * (h / rows), ez), q, sc.set(1, 1, 1));
        if (Math.random() < 0.12 && ln < 60) lit.setMatrixAt(ln++, m);
        else if (dn < 320) dark.setMatrixAt(dn++, m);
      }
    }
    lit.count = ln; dark.count = dn;
    lit.instanceMatrix.needsUpdate = dark.instanceMatrix.needsUpdate = true;
    dim.add(dark, lit);

    // the far ring: flat black shapes with no fog on them, so there is depth
    const farMat = new THREE.MeshBasicMaterial({color: 0x140a13, fog: false});
    const far = new THREE.InstancedMesh(geo, farMat, 26);
    far.frustumCulled = false;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + rr(-0.09, 0.09), r = rr(118, 152);
      const w = rr(10, 26), h = rr(14, 44) * (i % 5 === 0 ? 1.6 : 1), d = rr(10, 26);
      e.set(0, rr(0, 6.28), 0, 'XYZ'); q.setFromEuler(e);
      far.setMatrixAt(i, m4.compose(p.set(Math.sin(a) * r, h / 2 - 1, 14 + Math.cos(a) * r), q, sc.set(w, h, d)));
    }
    far.instanceMatrix.needsUpdate = true;
    dim.add(far);
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
  sweepTone(196, 92, 2.6, 0.24, 'sine');
  sweepTone(392, 184, 2.2, 0.09, 'sine');
  setTimeout(() => sweepTone(174, 82, 2.4, 0.15, 'sine'), 620);
  setTimeout(() => sweepTone(160, 76, 2.2, 0.11, 'sine'), 1180);
}
let dimPulse = 0, dimAmbT = 9, dimAmbN = 0;
// called when a round starts: the fog thickens, the moon flares, the bell rings
function dimRoundFx() {
  dimPulse = 1;
  // the full toll is for the first round and every fifth; the rest get one note,
  // because a bell on every single round stops being a bell and starts being a timer
  if (dimWave === 1 || dimWave % 5 === 0) {
    dimBell();
    rumble(240, 0.9);
  } else {
    sweepTone(180, 96, 1.6, 0.17, 'sine');
  }
}
function dimAtmos(dt) {
  if (realm !== 5) return;
  // mist drifts, and drifts faster when the wind gets up
  const gust = 0.75 + Math.sin(time * 0.37) * 0.55;
  for (const l of dimFx.mist) {
    l.tex.offset.x += l.spd * dt * 0.02 * gust;
    l.tex.offset.y -= l.spd * dt * 0.013 * gust;
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
  // distant sounds so the quiet is never quite silent
  dimAmbT -= dt;
  if (dimAmbT <= 0) {
    dimAmbT = 26 + Math.random() * 22;
    dimAmbN++;
    if (dimAmbN % 3 === 0) sweepNoise(500, 120, 2.2, 0.16);          // a wind through the ruins
    else sweepTone(70 + Math.random() * 50, 42, 2.4, 0.13, 'sawtooth'); // something out there
    if (dimFx.tower) dimFx.tower.userData.bell.rotation.z = 0.22;
  }
  // the bell swings back after a toll
  const bell = dimFx.tower && dimFx.tower.userData.bell;
  if (bell && Math.abs(bell.rotation.z) > 0.002) bell.rotation.z *= Math.max(0, 1 - dt * 2.4);
}

// ============================================================================
//  A RUINED CHAPEL — a landmark to hold, and the only roof out here
// ============================================================================
const dimChapel = (() => {
  const C = DIM_CHAPEL_AT;
  const W = C.w, D = C.d, H = 4.8, T = 0.5;
  const xL = C.x - W / 2, xR = C.x + W / 2, zB = C.z + D / 2, zF = C.z - D / 2;
  const stoneM = new THREE.MeshStandardMaterial({color: 0x38313e, roughness: 1, flatShading: true, emissive: 0x0d0812, emissiveIntensity: 1});
  const darkM  = new THREE.MeshStandardMaterial({color: 0x241f2a, roughness: 1, flatShading: true, emissive: 0x090610, emissiveIntensity: 1});
  const woodM  = new THREE.MeshStandardMaterial({color: 0x2a201c, roughness: 1, flatShading: true, emissive: 0x070404, emissiveIntensity: 1});
  const box = (w, h, d, x, y, z, mat, ry) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); if (ry) m.rotation.z = ry;
    dim.add(m); dimMeshes.push(m); return m;
  };
  const block = (w, h, d, x, y, z, mat) => {
    const m = box(w, h, d, x, y, z, mat);
    dimBoxes.push([ZX + x - w / 2, z - d / 2, ZX + x + w / 2, z + d / 2]);
    return m;
  };
  // walls: back and sides whole, the front broken open either side of a doorway
  block(W, H, T, C.x, H / 2, zB, stoneM);
  block(T, H, D, xL, H / 2, C.z, stoneM);
  block(T, H, D, xR, H / 2, C.z, stoneM);
  block(3.0, H, T, xL + 1.5, H / 2, zF, stoneM);
  block(3.0, H, T, xR - 1.5, H / 2, zF, stoneM);
  // the front wall has lost its middle: two stumps either side of the way in
  box(0.8, 1.1, T, C.x - 1.9, 0.55, zF, darkM);
  box(0.8, 1.1, T, C.x + 1.9, 0.55, zF, darkM);
  // buttresses, so it reads as a church from a distance
  [-1, 1].forEach(s => {
    [zF + 2.6, C.z, zB - 2.6].forEach(z => block(0.8, H * 0.8, 1.2, C.x + s * (W / 2 + 0.3), H * 0.4, z, darkM));
  });
  // a pitched roof, half of the far side fallen in
  [[-1, 5.6], [1, 5.6]].forEach(([s, wz]) => {
    const len = s < 0 ? 6.2 : 8.4;
    const slab = box(6.0, 0.3, len, C.x + s * 2.3, H + 1.5, zB - len / 2 - 0.4, darkM);
    slab.rotation.z = s < 0 ? 0.6 : -0.6;
  });
  // the ridge beam, and a cross that survived the roof
  box(0.5, 0.35, 8.8, C.x, H + 2.9, zB - 4.0, woodM);
  box(0.22, 1.5, 0.22, C.x, H + 3.7, zF + 0.5, woodM);
  box(0.9, 0.22, 0.22, C.x, H + 3.9, zF + 0.5, woodM);
  // the window: the only light inside, and it is the colour of the sky
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2),
    new THREE.MeshBasicMaterial({color: 0xb8324e, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}));
  win.position.set(C.x, 2.5, zB - T / 2 - 0.02); win.rotation.y = Math.PI; dim.add(win);
  [-1, 1].forEach(s => box(0.3, 3.8, 0.24, C.x + s * 1.35, 2.4, zB - T / 2, darkM));
  box(3.2, 0.3, 0.24, C.x, 4.35, zB - T / 2, darkM);
  // altar, candles, and a light that is almost nothing
  block(2.6, 1.0, 0.9, C.x, 0.5, zB - 1.9, stoneM);
  const candles = [];
  [-0.8, 0, 0.8].forEach((dx, i) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.3 + i * 0.08, 6),
      new THREE.MeshStandardMaterial({color: 0xd8c8a8, emissive: 0x2a1e10}));
    c.position.set(C.x + dx, 1.15 + i * 0.04, zB - 1.9); dim.add(c);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), new THREE.MeshBasicMaterial({color: 0xffb060}));
    f.position.set(C.x + dx, 1.34 + i * 0.08, zB - 1.9); dim.add(f);
    candles.push(f);
  });
  const candleLight = new THREE.PointLight(0xffa24a, 0.9, 11, 1.7);
  candleLight.position.set(C.x, 2.0, zB - 2.0); dim.add(candleLight);
  // pews either side of a centre aisle, shove out of line by whatever came through
  [[-3.0, 0.10], [-1.2, -0.06], [0.6, 0.16]].forEach(([dz, rot]) => {
    [-2.25, 2.25].forEach(sx => {
      const p = block(2.6, 0.5, 0.6, C.x + sx, 0.25, C.z + dz, woodM);
      p.rotation.y = rot;
      box(2.6, 0.9, 0.16, C.x + sx, 0.75, C.z + dz + 0.32, woodM).rotation.y = rot;
    });
  });
  // rubble at the door and a fallen slab across the aisle
  box(1.6, 0.4, 1.0, C.x - 1.4, 0.2, zF - 0.8, darkM).rotation.y = 0.3;
  box(1.2, 0.35, 0.9, C.x + 1.6, 0.17, zF - 1.1, darkM).rotation.y = -0.5;
  return {win, candles, candleLight, xL, xR, zF, zB, C};
})();

// ============================================================================
//  WEATHER — ash that never stops, a moon with clouds over it, and lightning
// ============================================================================
const dimWx = (() => {
  let seed = 90210;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const rr = (a, b) => a + rnd() * (b - a);

  // ash: a box of it that travels with you
  const N = 460, pos = new Float32Array(N * 3), vy = new Float32Array(N), ph = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = rr(-24, 24); pos[i * 3 + 1] = rr(0, 26); pos[i * 3 + 2] = rr(-24, 24);
    vy[i] = 0.7 + rnd() * 1.5; ph[i] = rnd() * 6.283;
  }
  const ashGeo = new THREE.BufferGeometry();
  ashGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const ash = new THREE.Points(ashGeo, new THREE.PointsMaterial({
    color: 0xcfc0c8, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true
  }));
  ash.frustumCulled = false;
  dim.add(ash);

  // clouds drifting across the moon
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const cx = c.getContext('2d');
  for (let i = 0; i < 70; i++) {
    const px = Math.random() * 256, py = Math.random() * 128, r = 16 + Math.random() * 44;
    const g = cx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(30,10,20,' + (0.5 + Math.random() * 0.5).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(30,10,20,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(px, py, r, 0, 6.3); cx.fill();
  }
  const ctex = new THREE.CanvasTexture(c); ctex.wrapS = ctex.wrapT = THREE.RepeatWrapping; ctex.repeat.set(2, 1);
  const clouds = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(70, 30),
      new THREE.MeshBasicMaterial({map: ctex, transparent: true, opacity: 0.55, depthWrite: false, fog: false}));
    m.position.set(rr(-30, 10), 26 + i * 6, -50 - i * 2);
    dim.add(m); clouds.push({m, spd: rr(0.25, 0.8) * (i === 1 ? -1 : 1)});
  }

  // blood on the ground, still wet
  const pools = [];
  for (let i = 0; i < 8; i++) {
    const a = rnd() * 6.283, r = rr(6, 40);
    const x = Math.sin(a) * r, z = 14 + Math.cos(a) * r;
    if (inDimProp(x, z, 1.5) || inChapel(x, z, 0.5)) continue;
    const m = new THREE.Mesh(new THREE.CircleGeometry(rr(0.7, 2.2), 12),
      new THREE.MeshBasicMaterial({color: 0x4a0810, transparent: true, opacity: 0.6, depthWrite: false}));
    m.rotation.x = -Math.PI / 2; m.rotation.z = rnd() * 6.283;
    m.position.set(x, 0.015, z); m.scale.set(1, rr(0.6, 1.2), 1);
    dim.add(m); pools.push({m, base: 0.4 + rnd() * 0.3, ph: rnd() * 6.3});
  }

  // fallen slabs and toppled stones
  {
    const geo = new THREE.BoxGeometry(0.9, 0.16, 1.5);
    const mat = new THREE.MeshStandardMaterial({color: 0x413b4a, roughness: 1, emissive: 0x100a12, emissiveIntensity: 0.8});
    const slabs = new THREE.InstancedMesh(geo, mat, 22);
    slabs.frustumCulled = false;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    let n = 0, guard = 0;
    while (n < 22 && guard++ < 400) {
      const a = rnd() * 6.283, r = rr(6, 44);
      const x = Math.sin(a) * r, z = 14 + Math.cos(a) * r;
      if (inDimProp(x, z, 1.0) || inChapel(x, z, 1.0)) continue;
      e.set(rr(-0.16, 0.16), rnd() * 6.283, rr(-0.2, 0.2), 'XYZ'); q.setFromEuler(e);
      slabs.setMatrixAt(n++, m4.compose(p.set(x, rr(0.06, 0.14), z), q, sc.set(rr(0.8, 1.5), 1, rr(0.8, 1.4))));
    }
    slabs.count = n; slabs.instanceMatrix.needsUpdate = true;
    dim.add(slabs);
  }
  return {ash, ashGeo, pos, vy, ph, N, clouds, pools};
})();

let dimFlash = 0, dimBoltT = 48, dimBoltQ = 0, dimMoanT = 0;
function dimLordFx() {
  dimPulse = 1.4;
  dimFlash = 0.7;
  sweepTone(58, 26, 3.4, 0.5, 'sawtooth');
  sweepTone(116, 52, 3.0, 0.2, 'square');
  thunder(1.4);
}
function dimWeather(dt) {
  if (realm !== 5) return;
  dimPulse = Math.max(0, dimPulse - dt * 0.55);
  // lightning: three flashes in a row, and the thunder comes after it
  dimBoltT -= dt;
  if (dimBoltT <= 0) {
    dimFlash = 1; dimBoltQ = 0.14; dimBoltT = 55 + Math.random() * 65;
    thunder(0.5 + Math.random() * 2.2);
    for (const c of dimFx.crows) c.y = Math.min(31, c.y + 5);
  }
  if (dimBoltQ > 0) { dimBoltQ -= dt; if (dimBoltQ <= 0) dimFlash = 0.85; }
  dimFlash = Math.max(0, dimFlash - dt * 3.2);
  const fl = dimFlash * dimFlash * (settings.reduceFlash ? 0.25 : 1);
  moon.intensity = 1.7 + dimPulse * 1.4 + fl * 3.4;
  ambient.intensity = 1.25 + dimPulse * 0.3 + fl * 2.6;
  scene.fog.density = 0.022 + dimPulse * 0.02 + fl * 0.008 + Math.sin(time * 0.55) * 0.0012;  // it breathes
  // ash keeps falling, and it blows sideways
  {
    const p = dimWx.pos, gust = 0.5 + Math.sin(time * 0.37) * 0.9;
    for (let i = 0; i < dimWx.N; i++) {
      const j = i * 3;
      p[j + 1] -= dimWx.vy[i] * dt;
      p[j] += Math.sin(time * 0.9 + dimWx.ph[i]) * dt * 0.6 + gust * dt * 0.5;
      if (p[j + 1] < 0) { p[j + 1] = 26; p[j] = (Math.random() - 0.5) * 48; p[j + 2] = (Math.random() - 0.5) * 48; }
      if (p[j] > 24) p[j] -= 48; else if (p[j] < -24) p[j] += 48;
    }
    dimWx.ashGeo.attributes.position.needsUpdate = true;
    dimWx.ash.position.set(camera.position.x, 0, camera.position.z);
  }
  for (const c of dimWx.clouds) {
    c.m.position.x += c.spd * dt;
    if (c.m.position.x > 40) c.m.position.x = -46; else if (c.m.position.x < -46) c.m.position.x = 40;
  }
  for (const p of dimWx.pools) p.m.material.opacity = p.base * (0.85 + Math.sin(time * 0.9 + p.ph) * 0.15);
  // candles gutter, the window breathes
  dimChapel.candleLight.intensity = 0.75 + Math.sin(time * 11.3) * 0.12 + Math.sin(time * 5.1) * 0.08;
  dimChapel.win.material.opacity = 0.3 + Math.sin(time * 1.3) * 0.1 + dimPulse * 0.3;
  // now and then, the whole graveyard moans
  dimMoanT -= dt;
  if (dimMoanT <= 0) {
    dimMoanT = 55 + Math.random() * 55;
    if (settings.ambience !== false && typeof farMoan === 'function') farMoan();
  }
}
