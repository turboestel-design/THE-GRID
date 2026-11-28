/* THE GRID — what lives in the Zombie Dimension.
   Six new kinds, each one built in code here, each with its own trick, plus the
   mix that decides what a given round throws at you. Everything registers into
   the enemy table the rest of the game already uses, so health, hit flashes,
   shards, gore and the kill counter all come for free.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ============================================================================
//  THE CRAWLER — low, fast, and impossible to see over a gravestone
// ============================================================================
function buildCrawler() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color: 0x7a6a58, roughness: 1, emissive: 0x0d0a07});
  const rag = new THREE.MeshStandardMaterial({color: 0x2a211a, roughness: 1});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.76), rag);
  torso.position.set(0, 0.3, 0); g.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.26), skin);
  head.position.set(0, 0.34, 0.44); head.userData.head = true; g.add(head);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.12), new THREE.MeshStandardMaterial({color: 0xd8cdb6, roughness: 1}));
  jaw.position.set(0, 0.24, 0.54); g.add(jaw);
  const arms = [];
  [-0.28, 0.28].forEach(x => {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.5), skin);
    a.position.set(x, 0.2, 0.24); g.add(a); arms.push(a);
  });
  const legs = [];
  [-0.3, 0.3].forEach(x => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.34), rag);
    l.position.set(x, 0.16, -0.3); g.add(l); legs.push(l);
  });
  g.userData.legs = legs; g.userData.arms = arms;
  g.userData.flash = skin; g.userData.baseEm = 0x0d0a07;
  return g;
}

// ============================================================================
//  THE BRUTE — slow, enormous, and it does not notice being shot
// ============================================================================
function buildBrute() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color: 0x5d6a4a, roughness: 1, emissive: 0x0a0f06});
  const rag = new THREE.MeshStandardMaterial({color: 0x241d16, roughness: 1});
  const bone = new THREE.MeshStandardMaterial({color: 0xa89c80, roughness: 1});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.96, 1.0, 0.62), rag);
  torso.position.y = 1.36; torso.rotation.x = 0.1; g.add(torso);
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), skin);
  belly.position.set(0, 1.02, 0.06); g.add(belly);
  [-0.52, 0.52].forEach(x => {
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.34), skin);
    sh.position.set(x, 1.74, 0); g.add(sh);
  });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skin);
  head.position.set(0, 2.06, 0.1); head.userData.head = true; g.add(head);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.16), bone);
  jaw.position.set(0, 1.92, 0.3); g.add(jaw);
  const arms = [];
  [-0.62, 0.62].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 1.66, 0.02);
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.0, 0.22), skin); a.position.y = -0.5; p.add(a);
    const fist = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.26), bone); fist.position.y = -1.02; p.add(fist);
    p.rotation.x = -0.35; g.add(p); arms.push(p);
  });
  const legs = [];
  [-0.28, 0.28].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 0.86, 0);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.86, 0.3), rag); l.position.y = -0.43; p.add(l);
    g.add(p); legs.push(p);
  });
  g.userData.legs = legs; g.userData.arms = arms;
  g.userData.flash = skin; g.userData.baseEm = 0x0a0f06;
  return g;
}

// ============================================================================
//  THE SCREAMER — it never touches you, it just tells the others where you are
// ============================================================================
function buildScreamer() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color: 0x8a8f9a, roughness: 1, emissive: 0x0e0e12});
  const rag = new THREE.MeshStandardMaterial({color: 0x2c2a30, roughness: 1});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.92, 0.22), rag);
  torso.position.y = 1.34; g.add(torso);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), skin);
  neck.position.y = 1.92; g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.24), skin);
  head.position.y = 2.16; head.userData.head = true; g.add(head);
  // the mouth is the whole point: a black hole with a light at the back of it
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.06), new THREE.MeshBasicMaterial({color: 0x120308}));
  mouth.position.set(0, 2.08, 0.13); g.add(mouth);
  const throat = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), new THREE.MeshBasicMaterial({color: 0xff3a4a}));
  throat.position.set(0, 2.08, 0.11); g.add(throat);
  const arms = [];
  [-0.26, 0.26].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 1.72, 0);
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.86, 0.08), skin); a.position.y = -0.43; p.add(a);
    p.rotation.x = -2.5; p.rotation.z = x > 0 ? -0.25 : 0.25;   // hands up at its own head
    g.add(p); arms.push(p);
  });
  const legs = [];
  [-0.12, 0.12].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 0.88, 0);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.88, 0.1), rag); l.position.y = -0.44; p.add(l);
    g.add(p); legs.push(p);
  });
  g.userData.legs = legs; g.userData.arms = arms; g.userData.throat = throat;
  g.userData.flash = skin; g.userData.baseEm = 0x0e0e12;
  return g;
}

// ============================================================================
//  THE BLOAT — kill it close and it takes the room with it
// ============================================================================
function buildBloat() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color: 0x8a8f4a, roughness: 1, emissive: 0x141406, transparent: true, opacity: 0.92});
  const dark = new THREE.MeshStandardMaterial({color: 0x4a4a22, roughness: 1, emissive: 0x0c0c04});
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), skin);
  body.position.y = 0.86; body.scale.set(1, 1.1, 0.95); g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.3), dark);
  head.position.set(0, 1.62, 0.24); head.userData.head = true; g.add(head);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.14), new THREE.MeshStandardMaterial({color: 0xc8bc9c, roughness: 1}));
  jaw.position.set(0, 1.5, 0.34); g.add(jaw);
  const arms = [], legs = [];
  [-0.62, 0.62].forEach(x => {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), dark);
    a.position.set(x, 1.0, 0.1); a.rotation.z = x > 0 ? 0.5 : -0.5; g.add(a); arms.push(a);
  });
  [-0.22, 0.22].forEach(x => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.18), dark);
    l.position.set(x, 0.17, 0); g.add(l); legs.push(l);
  });
  g.userData.legs = legs; g.userData.arms = arms; g.userData.body = body;
  g.userData.flash = skin; g.userData.baseEm = 0x141406;
  return g;
}

// ============================================================================
//  THE HOUND — it goes still, then it is on you
// ============================================================================
function buildHound() {
  const g = new THREE.Group();
  const flesh = new THREE.MeshStandardMaterial({color: 0x6a4a44, roughness: 1, emissive: 0x0e0606});
  const bone = new THREE.MeshStandardMaterial({color: 0xc0b49a, roughness: 1});
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 1.05), flesh);
  body.position.y = 0.62; g.add(body);
  const ribs = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.5), bone);
  ribs.position.set(0, 0.8, -0.05); g.add(ribs);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.3), flesh);
  neck.position.set(0, 0.66, 0.62); g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.42), flesh);
  head.position.set(0, 0.6, 0.9); head.userData.head = true; g.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.28), bone);
  snout.position.set(0, 0.53, 1.12); g.add(snout);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), bone);
  tail.position.set(0, 0.72, -0.66); tail.rotation.x = -0.4; g.add(tail);
  const legs = [];
  [[-0.2, 0.34], [0.2, 0.34], [-0.2, -0.36], [0.2, -0.36]].forEach(([x, z]) => {
    const p = new THREE.Group(); p.position.set(x, 0.42, z);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.12), flesh); l.position.y = -0.22; p.add(l);
    g.add(p); legs.push(p);
  });
  g.userData.legs = legs; g.userData.tail = tail;
  g.userData.flash = flesh; g.userData.baseEm = 0x0e0606;
  return g;
}

// ============================================================================
//  THE RATTLE — bone only, quick, and it comes apart if you look at it
// ============================================================================
function buildRattle() {
  const g = new THREE.Group();
  const bone = new THREE.MeshStandardMaterial({color: 0xd2c6a8, roughness: 1, emissive: 0x14110c});
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.86, 0.1), bone);
  spine.position.y = 1.16; g.add(spine);
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.46 - i * 0.02, 0.05, 0.14), bone);
    r.position.set(0, 1.5 - i * 0.14, 0); g.add(r);
  }
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.26), bone);
  skull.position.set(0, 1.8, 0.06); skull.userData.head = true; g.add(skull);
  const arms = [];
  [-0.28, 0.28].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 1.6, 0);
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), bone); a.position.y = -0.35; p.add(a);
    p.rotation.x = -1.1; g.add(p); arms.push(p);
  });
  const legs = [];
  [-0.14, 0.14].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 0.74, 0);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.74, 0.07), bone); l.position.y = -0.37; p.add(l);
    g.add(p); legs.push(p);
  });
  g.userData.legs = legs; g.userData.arms = arms;
  g.userData.flash = bone; g.userData.baseEm = 0x14110c;
  return g;
}

// ============================================================================
//  the table the rest of the game reads
// ============================================================================
const DIM_BUILD = {
  crawler: buildCrawler, brute: buildBrute, screamer: buildScreamer,
  bloat: buildBloat, hound: buildHound, rattle: buildRattle
};
Object.assign(MOB_DEF, {
  crawler: {hp: 3, spd: 2.45, dmg: 7, r: 0.42, shards: 2, style: 'melee', name: 'CRAWLER', eyeY: 0.36, eyeZ: 0.55},
  hound:   {hp: 4, spd: 1.15, dmg: 11, r: 0.45, shards: 3, style: 'melee', name: 'HOUND', eyeY: 0.63, eyeZ: 1.08},
  rattle:  {hp: 2, spd: 1.85, dmg: 8, r: 0.38, shards: 2, style: 'melee', name: 'RATTLE', eyeY: 1.82, eyeZ: 0.2},
  screamer:{hp: 6, spd: 1.05, dmg: 4, r: 0.45, shards: 4, style: 'melee', name: 'SCREAMER', eyeY: 2.16, eyeZ: 0.14},
  bloat:   {hp: 10, spd: 0.78, dmg: 6, r: 0.62, shards: 4, style: 'melee', name: 'BLOAT', eyeY: 1.62, eyeZ: 0.36},
  brute:   {hp: 18, spd: 0.66, dmg: 24, r: 0.78, shards: 9, style: 'melee', name: 'BRUTE', eyeY: 2.06, eyeZ: 0.24}
});

// their own animation, so nothing in 60-enemies needs to know they exist
function dimAnimate(mob, moving, dt) {
  const g = mob.g, u = g.userData;
  if (mob.kind === 'hound') {
    mob.ph += dt * (moving ? 13 : 2.2);
    const sw = Math.sin(mob.ph) * (moving ? 0.8 : 0.08);
    u.legs[0].rotation.x = sw; u.legs[3].rotation.x = sw;
    u.legs[1].rotation.x = -sw; u.legs[2].rotation.x = -sw;
    if (u.tail) u.tail.rotation.y = Math.sin(mob.ph * 0.6) * 0.5;
    g.position.y = Math.abs(Math.sin(mob.ph * 0.5)) * 0.03;
    g.rotation.x = mob.dashing ? -0.12 : 0;
    return;
  }
  if (mob.kind === 'crawler') {
    mob.ph += dt * (moving ? 9 : 2);
    const sw = Math.sin(mob.ph) * (moving ? 0.55 : 0.08);
    u.arms[0].rotation.x = -0.4 + sw; u.arms[1].rotation.x = -0.4 - sw;
    g.rotation.z = Math.sin(mob.ph * 0.7) * 0.09;
    g.position.y = Math.abs(Math.sin(mob.ph * 1.4)) * 0.03;
    return;
  }
  if (mob.kind === 'brute') {
    mob.ph += dt * (moving ? 2.2 : 0.8);
    const sw = Math.sin(mob.ph) * (moving ? 0.3 : 0.02);
    u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw;
    u.arms[0].rotation.x = -0.35 - sw * 0.4; u.arms[1].rotation.x = -0.35 + sw * 0.4;
    g.rotation.z = Math.sin(mob.ph * 0.5) * 0.05;
    return;
  }
  if (mob.kind === 'bloat') {
    mob.ph += dt * (moving ? 3 : 1.2);
    u.body.scale.set(1 + Math.sin(mob.ph) * 0.05, 1.1 + Math.cos(mob.ph) * 0.06, 0.95 + Math.sin(mob.ph) * 0.04);
    g.rotation.z = Math.sin(mob.ph * 0.6) * 0.12;
    return;
  }
  if (mob.kind === 'screamer') {
    mob.ph += dt * 1.4;
    g.position.y = Math.sin(mob.ph) * 0.04;
    const scream = mob.screamAnim || 0;
    if (u.throat) u.throat.scale.setScalar(1 + scream * 0.9 + Math.sin(time * 20) * 0.12 * scream);
    g.rotation.z = Math.sin(mob.ph * 0.9) * 0.03;
    return;
  }
  if (mob.kind === 'rattle') {
    mob.ph += dt * (moving ? 6 : 1.6);
    const sw = Math.sin(mob.ph) * (moving ? 0.6 : 0.06);
    u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw;
    u.arms[0].rotation.x = -1.1 + sw * 0.5; u.arms[1].rotation.x = -1.1 - sw * 0.5;
    g.rotation.y += Math.sin(mob.ph * 0.8) * 0.004;
  }
}

// ---- what each of them does besides walk at you ---------------------------
function dimKindTick(mob, dt) {
  if (mob.kind === 'hound') {
    if (mob.dashT == null) { mob.dashT = 1 + Math.random(); mob.baseSpd = mob.spd; }
    mob.dashT -= dt;
    if (mob.dashT <= 0) {
      mob.dashing = !mob.dashing;
      mob.dashT = mob.dashing ? 0.5 + Math.random() * 0.25 : 1.3 + Math.random() * 1.2;
      mob.spd = mob.baseSpd * (mob.dashing ? 3.1 : 0.55);
      if (mob.dashing) {
        const gp = panFor(mob.g.position.x, mob.g.position.z);
        if (volFor(mob.g.position.x, mob.g.position.z, 6) > 0.25) sweepNoise(900, 2600, 0.22, 0.18);
      }
    }
    return;
  }
  if (mob.kind === 'screamer') {
    mob.screamAnim = Math.max(0, (mob.screamAnim || 0) - dt * 1.6);
    mob.screamT = (mob.screamT == null ? 3 + Math.random() * 3 : mob.screamT) - dt;
    if (mob.screamT > 0) return;
    mob.screamT = 9 + Math.random() * 6;
    const d = Math.hypot(mob.g.position.x - camera.position.x, mob.g.position.z - camera.position.z);
    if (d > 34 || dead || paused || settings.ambience === false) return;
    mob.screamAnim = 1;
    screamSound(volFor(mob.g.position.x, mob.g.position.z, 4), panFor(mob.g.position.x, mob.g.position.z));
    // everything close enough to hear it comes faster for a few seconds
    for (const o of mobs) {
      if (o === mob || !o.alive || o.realm !== 5) continue;
      if (Math.hypot(o.g.position.x - mob.g.position.x, o.g.position.z - mob.g.position.z) < 17) o.buffT = 4.5;
    }
    return;
  }
  if (mob.kind === 'rattle') {
    mob.rattleT = (mob.rattleT == null ? 2 + Math.random() * 3 : mob.rattleT) - dt;
    if (mob.rattleT <= 0) {
      mob.rattleT = 4 + Math.random() * 4;
      if (volFor(mob.g.position.x, mob.g.position.z, 5) > 0.12) rattleSound(mob.g.position.x, mob.g.position.z);
    }
    return;
  }
  if (mob.kind === 'bloat') {
    // it swells as it gets close, so you can hear it coming
    mob.swell = mob.swell || 0;
    if (mob.hp < mob.max * 0.5) mob.swell = Math.min(1, mob.swell + dt * 0.8);
    mob.g.scale.setScalar(1 + mob.swell * 0.18);
  }
}

// it goes off when it dies, whether you were ready or not
function dimKindDeath(mob) {
  if (mob.kind !== 'bloat') return;
  const x = mob.g.position.x, z = mob.g.position.z;
  gorePuff(x, 1.0, z, 22, 0x7a8a30, 3.4, 3.2);
  gorePuff(x, 1.0, z, 10, 0x4a1010, 2.6, 2.4);
  sweepNoise(900, 120, 0.5, 0.7);
  sweepTone(160, 40, 0.5, 0.45, 'sawtooth');
  const d = Math.hypot(x - camera.position.x, z - camera.position.z);
  if (d < 4.6 && !dead) hurt(14 + 2 * Math.max(0, (mob.round || 1) - 1));
}

// ---- the mix: what a given round sends ------------------------------------
function dimWaveCrew(round, n) {
  const pool = ['zombie', 'zombie', 'zombie'];
  const unlock = (k, at) => { if (round >= at) pool.push(k); };
  unlock('crawler', 2);
  unlock('rattle', 3);
  unlock('hound', 4);
  unlock('spitter', 5);
  unlock('screamer', 6);
  unlock('bloat', 7);
  unlock('brute', 9);
  unlock('wisp', 11);
  unlock('brute', 14);
  const crew = [];
  // the first of anything new always shows up the round it unlocks
  for (const k of ['crawler', 'rattle', 'hound', 'screamer', 'bloat', 'brute'])
    if (round >= ({ crawler: 2, rattle: 3, hound: 4, screamer: 6, bloat: 7, brute: 9 })[k] &&
        round < ({ crawler: 3, rattle: 4, hound: 5, screamer: 7, bloat: 8, brute: 10 })[k]) crew.push(k);
  while (crew.length < n) crew.push(pool[Math.floor(Math.random() * pool.length)]);
  // the big ones are a moment, not a wall: cap them and let the crowd fill the rest
  const cap = {brute: 2, screamer: 2, bloat: 3};
  const seen = {};
  for (let i = 0; i < crew.length; i++) {
    const k = crew[i];
    seen[k] = (seen[k] || 0) + 1;
    if (cap[k] && seen[k] > cap[k]) crew[i] = 'zombie';
  }
  return crew.slice(0, n);
}

// a walker with an extra way of killing you, all set up and ready
function dimMakeMob(kind, x, z) {
  const m = makeMob(kind, x, z, 5);
  const D = MOB_DEF[kind];
  m.eyeY = D.eyeY; m.eyeZ = D.eyeZ;
  if (kind !== 'hound') m.rise = 0;
  m.tick = dimKindTick;
  m.onDeath = dimKindDeath;
  m.buffT = 0;
  return m;
}
