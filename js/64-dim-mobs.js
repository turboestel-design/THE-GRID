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
//  THE TALL ECHO — world one, nine feet of it, and it does not hurry
// ============================================================================
function buildEchoTall() {
  const g = new THREE.Group();
  const black = new THREE.MeshStandardMaterial({color: 0x0b0a10, roughness: 1, emissive: 0x06040a});
  const coat = new THREE.MeshStandardMaterial({color: 0x0d0d0e, roughness: 1, emissive: 0x08060c});
  const pale = new THREE.MeshStandardMaterial({color: 0xcfc8bd, roughness: 0.9, emissive: 0x241f18});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.15, 0.3), coat);
  torso.position.y = 1.95; g.add(torso);
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.26), black);
  hips.position.y = 1.2; g.add(hips);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), black);
  neck.position.y = 2.62; g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.4, 0.24), pale);
  head.position.set(0, 2.94, 0.02); head.userData.head = true; g.add(head);
  const arms = [];
  [-0.3, 0.3].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 2.4, 0);
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), black); a.position.y = -0.75; p.add(a);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.19, 0.08), pale); hand.position.y = -1.58; p.add(hand);
    p.rotation.x = -0.15; g.add(p); arms.push(p);
  });
  const legs = [];
  [-0.13, 0.13].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 1.0, 0);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.0, 0.14), black); l.position.y = -0.5; p.add(l);
    g.add(p); legs.push(p);
  });
  g.userData.legs = legs; g.userData.arms = arms;
  g.userData.flash = coat; g.userData.baseEm = 0x08060c;
  return g;
}

// ============================================================================
//  THE GLOW ECHO — world two, hanging in the air, and it closes the gap fast
// ============================================================================
function buildEchoGlow() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10),
    new THREE.MeshBasicMaterial({color: 0xc46cff}));
  core.position.y = 1.35; g.add(core);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10),
    new THREE.MeshBasicMaterial({color: 0x7a2ec8, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false}));
  shell.position.y = 1.35; g.add(shell);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 6, 20),
    new THREE.MeshBasicMaterial({color: 0xd88cff, transparent: true, opacity: 0.8}));
  ring.position.y = 1.35; ring.rotation.x = 1.1; g.add(ring);
  const flesh = new THREE.MeshStandardMaterial({color: 0x5a3a72, roughness: 1, emissive: 0x2a1240});
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2;
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.7), flesh);
    t.position.set(Math.sin(a) * 0.22, 1.05, Math.cos(a) * 0.22);
    t.rotation.y = a; g.add(t);
  }
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), flesh);
  head.position.y = 1.78; head.userData.head = true; g.add(head);
  g.userData.ring = ring; g.userData.shell = shell;
  g.userData.flash = flesh; g.userData.baseEm = 0x2a1240;
  return g;
}

// ============================================================================
//  THE CINDER HOUND — world three, still burning, still running
// ============================================================================
function buildCinderHound() {
  const g = new THREE.Group();
  const char = new THREE.MeshStandardMaterial({color: 0x1a1412, roughness: 1, emissive: 0x1c0700});
  const ash = new THREE.MeshStandardMaterial({color: 0x6a6058, roughness: 1, emissive: 0x0a0806});
  const ember = new THREE.MeshStandardMaterial({color: 0xff6a20, emissive: 0xff4a10, emissiveIntensity: 1.7, roughness: 0.8});
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 1.1), char);
  body.position.y = 0.66; g.add(body);
  // the cracks that never went out
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.035, 0.06), ember);
    c.position.set(0, 0.5 + i * 0.075, -0.28 + i * 0.13); g.add(c);
  }
  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.34), ember);
  mane.position.set(0, 0.84, 0.5); g.add(mane);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.3), char);
  neck.position.set(0, 0.68, 0.66); g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.27, 0.44), char);
  head.position.set(0, 0.62, 0.94); head.userData.head = true; g.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.16, 0.3), ash);
  snout.position.set(0, 0.55, 1.16); g.add(snout);
  [-0.075, 0.075].forEach(x => {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.03), ember);
    e.position.set(x, 0.66, 1.16); g.add(e);
  });
  const tail = new THREE.Group(); tail.position.set(0, 0.74, -0.58);
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.42), char); t.position.z = -0.2; tail.add(t);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.44, 6),
    new THREE.MeshBasicMaterial({color: 0xff8a30, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false}));
  flame.position.z = -0.44; flame.rotation.x = -1.5708; tail.add(flame);
  g.add(tail);
  const legs = [];
  [[-0.22, 0.36], [0.22, 0.36], [-0.22, -0.38], [0.22, -0.38]].forEach(([x, z]) => {
    const p = new THREE.Group(); p.position.set(x, 0.46, z);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.46, 0.13), char); l.position.y = -0.23; p.add(l);
    g.add(p); legs.push(p);
  });
  g.userData.legs = legs; g.userData.tail = tail; g.userData.flame = flame;
  g.userData.flash = char; g.userData.baseEm = 0x1c0700;
  return g;
}

// ============================================================================
//  THE KING'S ECHO — world four, in plate, and it does not care about body shots
// ============================================================================
function buildEchoKing() {
  const g = new THREE.Group();
  const plate = new THREE.MeshStandardMaterial({color: 0x3a3550, metalness: 0.55, roughness: 0.5, emissive: 0x0a0816});
  const cloth = new THREE.MeshStandardMaterial({color: 0x1a1428, roughness: 1, emissive: 0x080512});
  const gold = new THREE.MeshStandardMaterial({color: 0xb89a48, metalness: 0.7, roughness: 0.45, emissive: 0x2a2008});
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.46), plate);
  torso.position.y = 1.45; g.add(torso);
  [-0.22, 0.22].forEach(x => {
    const pl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.14), gold);
    pl.position.set(x, 1.5, 0.26); g.add(pl);
  });
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.4), cloth);
  skirt.position.y = 0.84; g.add(skirt);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.32), plate);
  head.position.y = 2.12; head.userData.head = true; g.add(head);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), gold);
  crown.position.y = 2.36; g.add(crown);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 4), gold);
    sp.position.set(Math.sin(a) * 0.18, 2.47, Math.cos(a) * 0.18); g.add(sp);
  }
  const arms = [], legs = [];
  [-0.46, 0.46].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 1.78, 0);
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.86, 0.18), plate); a.position.y = -0.43; p.add(a);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.22), gold); f.position.y = -0.9; p.add(f);
    p.rotation.x = -0.25; g.add(p); arms.push(p);
  });
  [-0.2, 0.2].forEach(x => {
    const p = new THREE.Group(); p.position.set(x, 0.72, 0);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.24), plate); l.position.y = -0.36; p.add(l);
    g.add(p); legs.push(p);
  });
  g.userData.legs = legs; g.userData.arms = arms;
  g.userData.flash = plate; g.userData.baseEm = 0x0a0816;
  return g;
}

// ============================================================================
//  THE ANGEL — heaven, and the last thing to turn up out here
// ============================================================================
function buildAngel() {
  const g = new THREE.Group();
  const robe = new THREE.MeshStandardMaterial({color: 0xd8d2c0, roughness: 0.9, emissive: 0x2a2620});
  const skin = new THREE.MeshStandardMaterial({color: 0xe8d8c4, roughness: 0.9, emissive: 0x2a241c});
  const gold = new THREE.MeshStandardMaterial({color: 0xffd36b, metalness: 0.6, roughness: 0.4, emissive: 0x8a6a10});
  const wingMat = new THREE.MeshStandardMaterial({color: 0xf4eedc, roughness: 1, emissive: 0x3a3428, side: THREE.DoubleSide});
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.3, 10), robe);
  body.position.y = 0.95; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), skin);
  head.position.y = 1.78; head.userData.head = true; g.add(head);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.018, 6, 18), gold);
  halo.position.y = 2.05; halo.rotation.x = Math.PI / 2; g.add(halo);
  const wings = [];
  [-1, 1].forEach(sx => {
    const w = new THREE.Group(); w.position.set(sx * 0.14, 1.4, -0.12); w.rotation.y = sx * 0.6;
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.9, 0.04), wingMat);
    f.position.set(sx * 0.34, 0.1, 0); f.rotation.z = sx * 0.35; w.add(f);
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.04), wingMat);
    f2.position.set(sx * 0.5, -0.42, 0); f2.rotation.z = sx * 0.55; w.add(f2);
    g.add(w); wings.push(w);
  });
  const eyes = new THREE.MeshBasicMaterial({color: 0xffe9a8});
  [-0.06, 0.06].forEach(x => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), eyes);
    e.position.set(x, 1.8, 0.15); g.add(e);
  });
  g.userData.halo = halo; g.userData.wings = wings;
  g.userData.flash = robe; g.userData.baseEm = 0x2a2620;
  return g;
}

// ============================================================================
//  the table the rest of the game reads
// ============================================================================
const DIM_BUILD = {
  crawler: buildCrawler, brute: buildBrute, screamer: buildScreamer,
  bloat: buildBloat, hound: buildHound, rattle: buildRattle,
  tall_echo: buildEchoTall, glow_echo: buildEchoGlow, king_echo: buildEchoKing,
  cinder_hound: buildCinderHound, angel: buildAngel
};
Object.assign(MOB_DEF, {
  crawler: {hp: 3, spd: 2.45, dmg: 7, r: 0.42, shards: 2, style: 'melee', name: 'CRAWLER', eyeY: 0.36, eyeZ: 0.55},
  hound:   {hp: 4, spd: 1.15, dmg: 11, r: 0.45, shards: 3, style: 'melee', name: 'HOUND', eyeY: 0.63, eyeZ: 1.08},
  rattle:  {hp: 2, spd: 1.85, dmg: 8, r: 0.38, shards: 2, style: 'melee', name: 'RATTLE', eyeY: 1.82, eyeZ: 0.2},
  screamer:{hp: 6, spd: 1.05, dmg: 4, r: 0.45, shards: 4, style: 'melee', name: 'SCREAMER', eyeY: 2.16, eyeZ: 0.14},
  bloat:   {hp: 10, spd: 0.78, dmg: 6, r: 0.62, shards: 4, style: 'melee', name: 'BLOAT', eyeY: 1.62, eyeZ: 0.36},
  brute:   {hp: 18, spd: 0.66, dmg: 24, r: 0.78, shards: 9, style: 'melee', name: 'BRUTE', eyeY: 2.06, eyeZ: 0.24},
  // the guests: everything the other places have, arriving late and in order
  cinder_hound:{hp: 7, spd: 2.3, dmg: 13, r: 0.45, shards: 6, style: 'melee', name: 'CINDER HOUND', eyeY: 0.66, eyeZ: 1.16},
  tall_echo:{hp: 14, spd: 0.5, dmg: 24, r: 0.6, shards: 10, style: 'melee', name: 'TALL ECHO', eyeY: 2.96, eyeZ: 0.16},
  glow_echo:{hp: 9, spd: 1.05, dmg: 12, r: 0.5, shards: 8, style: 'melee', name: 'GLOW ECHO', eyeY: 1.78, eyeZ: 0.2},
  king_echo:{hp: 24, spd: 0.55, dmg: 22, r: 0.75, shards: 12, style: 'melee', name: "KING'S ECHO", eyeY: 2.12, eyeZ: 0.22},
  angel:   {hp: 11, spd: 1.5, dmg: 11, r: 0.45, shards: 12, style: 'range', name: 'ANGEL', eyeY: 1.8, eyeZ: 0.18}
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
  if (mob.kind === 'tall_echo') {
    mob.ph += dt * (moving ? 1.5 : 0.6);
    const sw = Math.sin(mob.ph) * (moving ? 0.2 : 0.02);
    u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw;
    u.arms[0].rotation.x = -0.15 + Math.sin(mob.ph * 0.7) * 0.06;
    u.arms[1].rotation.x = -0.15 - Math.sin(mob.ph * 0.7) * 0.06;
    g.rotation.z = Math.sin(mob.ph * 0.4) * 0.03;
    return;
  }
  if (mob.kind === 'glow_echo') {
    mob.ph += dt * 2.2;
    g.position.y = 0.12 + Math.sin(mob.ph) * 0.14;
    if (u.ring) { u.ring.rotation.z += dt * 1.6; u.ring.rotation.x = 1.1 + Math.sin(mob.ph * 0.7) * 0.3; }
    if (u.shell) u.shell.scale.setScalar(1 + Math.sin(mob.ph * 1.7) * 0.08);
    return;
  }
  if (mob.kind === 'king_echo') {
    mob.ph += dt * (moving ? 2.4 : 0.9);
    const sw = Math.sin(mob.ph) * (moving ? 0.26 : 0.02);
    u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw;
    u.arms[0].rotation.x = -0.25 - sw * 0.3; u.arms[1].rotation.x = -0.25 + sw * 0.3;
    return;
  }
  if (mob.kind === 'cinder_hound') {
    mob.ph += dt * (moving ? 9 : 1.5);
    const sw = Math.sin(mob.ph) * (moving ? 0.7 : 0.06);
    u.legs[0].rotation.x = sw; u.legs[2].rotation.x = sw;
    u.legs[1].rotation.x = -sw; u.legs[3].rotation.x = -sw;
    if (u.tail) u.tail.rotation.y = Math.sin(mob.ph * 0.5) * 0.5;
    if (u.flame) { u.flame.scale.setScalar(0.8 + Math.sin(mob.ph * 2.4) * 0.25); u.flame.rotation.z = Math.sin(mob.ph * 3) * 0.3; }
    g.position.y = Math.abs(Math.sin(mob.ph)) * (moving ? 0.05 : 0.01);
    return;
  }
  if (mob.kind === 'angel') {
    mob.ph += dt * 1.8;
    g.position.y = 0.3 + Math.sin(mob.ph) * 0.16;
    if (u.halo) u.halo.rotation.z += dt * 1.2;
    if (u.wings) u.wings.forEach((w, i) => { w.rotation.z = Math.sin(mob.ph * 2.2 + i * Math.PI) * 0.18; });
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
  if (mob.kind === 'hound' || mob.kind === 'glow_echo' || mob.kind === 'cinder_hound') {
    if (mob.dashT == null) { mob.dashT = 1 + Math.random(); mob.baseSpd = mob.spd; }
    mob.dashT -= dt;
    if (mob.dashT <= 0) {
      mob.dashing = !mob.dashing;
      mob.dashT = mob.dashing ? 0.5 + Math.random() * 0.25 : 1.3 + Math.random() * 1.2;
      mob.spd = mob.baseSpd * (mob.dashing ? 3.1 : 0.55);
      if (mob.dashing) {
        const gv = volFor(mob.g.position.x, mob.g.position.z, 6);
        if (gv > 0.25) {
          if (mob.kind === 'glow_echo') wispWhisper(gv, panFor(mob.g.position.x, mob.g.position.z));
          else sweepNoise(900, 2600, 0.22, 0.18);
        }
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
  if (mob.kind === 'tall_echo' || mob.kind === 'king_echo') {
    // the old bosses do not shout, they breathe out something enormous
    const big = mob.kind === 'king_echo';
    mob.voiceT = (mob.voiceT == null ? 2 + Math.random() * 3 : mob.voiceT) - dt;
    if (mob.voiceT > 0) return;
    mob.voiceT = (big ? 6 : 7) + Math.random() * 5;
    const v = volFor(mob.g.position.x, mob.g.position.z, 6);
    if (v > 0.12 && !paused && settings.ambience !== false)
      throat({f0: big ? 52 : 63, formants: [big ? 380 : 430, big ? 820 : 960], dur: big ? 2.1 : 1.6,
              gain: (big ? 0.5 : 0.42) * v, pan: panFor(mob.g.position.x, mob.g.position.z),
              rasp: 0.4, wet: 0.55, bend: -0.18});
    return;
  }
  if (mob.kind === 'angel') {
    // it never stops drifting sideways, so it will not sit behind a wall forever
    mob.drift = (mob.drift == null ? Math.random() * 6.283 : mob.drift + dt * 0.55);
    mobMove(mob, Math.cos(mob.drift) * 0.95 * dt, Math.sin(mob.drift) * 0.95 * dt);
    // one held note, too clean to be a throat down here
    mob.voiceT = (mob.voiceT == null ? 3 + Math.random() * 4 : mob.voiceT) - dt;
    if (mob.voiceT > 0) return;
    mob.voiceT = 7 + Math.random() * 6;
    const v = volFor(mob.g.position.x, mob.g.position.z, 7);
    if (v > 0.12 && !paused && settings.ambience !== false)
      throat({f0: 288, formants: [740, 1900], dur: 1.9, gain: 0.26 * v,
              pan: panFor(mob.g.position.x, mob.g.position.z), wet: 0.9, rise: 0.1, rasp: 0.12});
    return;
  }
  if (mob.kind === 'cinder_hound') {
    // sparks drop off it, and now and then it barks through a burnt throat
    mob.sparkT = (mob.sparkT == null ? 0.4 : mob.sparkT) - dt;
    if (mob.sparkT <= 0) {
      mob.sparkT = 0.32 + Math.random() * 0.3;
      const gx = mob.g.position.x, gz = mob.g.position.z;
      if (volFor(gx, gz, 14) > 0.05) gorePuff(gx + (Math.random() - 0.5) * 0.4, 0.5, gz + (Math.random() - 0.5) * 0.4, 1, 0xff7a28, 0.5, 1.1);
    }
    mob.voiceT = (mob.voiceT == null ? 1.5 + Math.random() * 2 : mob.voiceT) - dt;
    if (mob.voiceT > 0) return;
    mob.voiceT = 4 + Math.random() * 4;
    const v = volFor(mob.g.position.x, mob.g.position.z, 6);
    if (v > 0.12 && !paused && settings.ambience !== false)
      throat({f0: 138, formants: [620, 1180], dur: 0.42, gain: 0.4 * v,
              pan: panFor(mob.g.position.x, mob.g.position.z), rasp: 0.7, wet: 0.5, bend: -0.45});
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
  const x = mob.g.position.x, z = mob.g.position.z;
  if (mob.kind === 'tall_echo' || mob.kind === 'king_echo') {
    const big = mob.kind === 'king_echo';
    gorePuff(x, 1.6, z, big ? 18 : 13, big ? 0x2c2a34 : 0x1c1a22, 2.6, 2.6);
    gorePuff(x, 1.2, z, 6, 0x4a1010, 2.0, 2.0);
    if (big) gorePuff(x, 2.0, z, 9, 0xd8b45a, 2.2, 2.4);
    zombieDeath(volFor(x, z, 6), panFor(x, z));
    return;
  }
  if (mob.kind === 'cinder_hound') {
    gorePuff(x, 0.8, z, 14, 0xff7a28, 2.6, 3.0);
    gorePuff(x, 0.8, z, 10, 0x2a2420, 2.0, 2.2);
    return;
  }
  if (mob.kind === 'glow_echo') {
    gorePuff(x, 1.0, z, 16, 0x8a4cf0, 2.8, 3.0);
    gorePuff(x, 1.0, z, 8, 0xd8c8ff, 1.8, 2.2);
    return;
  }
  if (mob.kind === 'angel') {
    const v = volFor(x, z, 7);
    gorePuff(x, 1.7, z, 20, 0xfff0c4, 3.2, 3.4);
    gorePuff(x, 1.4, z, 10, 0xe8d49a, 2.2, 2.4);
    if (v > 0.1 && settings.ambience !== false)
      throat({f0: 330, formants: [700, 1800], dur: 1.1, gain: 0.3 * v, pan: panFor(x, z), wet: 0.9, bend: -0.55});
    return;
  }
  if (mob.kind !== 'bloat') return;
  gorePuff(x, 1.0, z, 22, 0x7a8a30, 3.4, 3.2);
  gorePuff(x, 1.0, z, 10, 0x4a1010, 2.6, 2.4);
  sweepNoise(900, 120, 0.5, 0.7);
  sweepTone(160, 40, 0.5, 0.45, 'sawtooth');
  const d = Math.hypot(x - camera.position.x, z - camera.position.z);
  if (d < 4.6 && !dead) hurt(14 + 2 * Math.max(0, (mob.round || 1) - 1));
}

// ---- the mix: what a given round sends ------------------------------------
// when each thing starts turning up. everything the other places have, in order of
// how much trouble it is: the forest's walkers and the glow's lights first, then the
// old bosses as echoes, and heaven last because heaven is the worst of them.
const DIM_UNLOCK = {
  crawler: 2, rattle: 3, husk: 4, hound: 5, spitter: 6, screamer: 7,
  bloat: 8, brute: 9, wisp: 10,
  glow_echo: 11, cinder_hound: 13, tall_echo: 15, king_echo: 17, angel: 19
};
function dimWaveCrew(round, n) {
  const pool = ['zombie', 'zombie', 'zombie'];
  for (const k in DIM_UNLOCK) {
    if (round < DIM_UNLOCK[k]) continue;
    // the guests stay rare: one slot of weight each, however late it gets
    const weight = DIM_UNLOCK[k] >= 12 ? 1 : 2;
    for (let i = 0; i < weight; i++) pool.push(k);
  }
  const crew = [];
  // the first of anything new always shows up the round it unlocks, so you meet a
  // thing on its own before it becomes part of the crowd
  for (const k in DIM_UNLOCK) if (round === DIM_UNLOCK[k]) crew.push(k);
  while (crew.length < n) crew.push(pool[Math.floor(Math.random() * pool.length)]);
  // the big ones are a moment, not a wall: cap them and let the crowd fill the rest
  const cap = {brute: 2, screamer: 2, bloat: 3, glow_echo: 2, cinder_hound: 2, tall_echo: 1, king_echo: 1, angel: 1};
  const seen = {};
  for (let i = 0; i < crew.length; i++) {
    const k = crew[i];
    seen[k] = (seen[k] || 0) + 1;
    if (cap[k] && seen[k] > cap[k]) crew[i] = 'zombie';
  }
  return crew.slice(0, n);
}
// is this one of the things that came in from the other places?
const DIM_GUEST = {husk: true, wisp: true, glow_echo: true, cinder_hound: true, tall_echo: true, king_echo: true, angel: true};

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
