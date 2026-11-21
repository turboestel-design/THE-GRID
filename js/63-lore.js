/* THE GRID — Twelve lore fragments and the card that shows them.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Lore: twelve fragments of what the Grid is -----------------------------
const LORE = [
  {r: 1, x: -14, z: 8,   t: 'THE WALK',        b: 'The Grid is not a place. It is a habit. Something walks it because walking is all it remembers.'},
  {r: 1, x: 12, z: -24,  t: 'THE KNOCKING',    b: 'The Tall Man sold doors before the sky closed. He still knocks. Nobody has answered him in a very long time.'},
  {r: 1, x: -30, z: -22, t: 'THE CARPENTER',   b: 'This cabin was built by the last person who tried to leave. They got as far as the porch.'},
  {r: 2, x: 10, z: -4,   t: 'THE GLOW',        b: 'The mushrooms are not plants. They are the forest remembering itself where the trees fell.'},
  {r: 2, x: -18, z: -12, t: 'THE HUM',         b: 'The Bloom keeps every voice it has eaten. It hums them at night. It is not cruel. It is lonely.'},
  {r: 2, x: 22, z: 6,    t: 'A NOTE, WET',     b: 'Do not run from the light. Run toward the hum. The hum is a way out.'},
  {r: 3, x: -16, z: 6,   t: 'THE ASH',         b: 'The ash is a person. All of it. The hounds were people too, until they forgot which way was out.'},
  {r: 3, x: 24, z: -12,  t: 'THE SCENT',       b: 'Cinder hounds hunt by smell. They cannot smell you if you stand perfectly still. You have not stood still in years.'},
  {r: 3, x: 0, z: 34,    t: 'THE LOOP',        b: 'THE GRID IS A LOOP. Four doors. One key. You are the key.'},
  {r: 4, x: 14, z: 6,    t: 'THE ARENA',       b: 'The Hollow King built the arena to keep something in. The pillars face inward. So does the mask.'},
  {r: 4, x: -14, z: 8,   t: 'THE FACE',        b: 'Every cycle the King wears a new face. This cycle he is wearing yours.'},
  {r: 4, x: 0, z: -16,   t: 'THE FIFTH DOOR',  b: 'There is a fifth world. The Grid does not want you to know that. — the carpenter'}
];
const loreItems = [];
function buildLoreItem(c, i) {
  const g = new THREE.Group();
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.32), new THREE.MeshStandardMaterial({color: 0x2a1f16, emissive: 0x2a1a08, roughness: 1}));
  book.position.y = 1.1; book.rotation.x = -0.28; g.add(book);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({color: 0xffd36b, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.05; g.add(glow);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.02, 3.4, 6, 1, true), new THREE.MeshBasicMaterial({color: 0xffd36b, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}));
  beam.position.y = 1.75; g.add(beam);
  g.position.set(REALM_X[c.r] + c.x, 0, c.z);
  g.userData = {i, realm: c.r, book, beam, glow};
  loreLayer.add(g); loreItems.push(g);
}
LORE.forEach(buildLoreItem);
const loreEl = document.getElementById('loreCard');
function readLore(i) {
  const c = LORE[i], g = loreItems[i];
  if (!c) return;
  if (!progress.lore) progress.lore = {};
  const isNew = !progress.lore[i];
  progress.lore[i] = true;
  loreFound = Object.keys(progress.lore).length;
  loreEl.querySelector('h3').textContent = (isNew ? 'NEW — LORE ' : 'LORE ') + loreFound + '/' + LORE.length + ' — ' + c.t;
  loreEl.querySelector('p').textContent = c.b;
  loreEl.style.display = 'block';
  clearTimeout(readLore.t);
  readLore.t = setTimeout(() => { loreEl.style.display = 'none'; }, 12000);
  if (g) { g.userData.beam.material.opacity = 0.04; g.userData.glow.material.opacity = 0.12; }
  sweepTone(520, 780, 0.5, 0.22, 'sine');
  if (isNew) { shards += 3; say('+3 SHARDS', 1600); }
  saveAll(); updateStats();
}
function updateLoreItems(dt) {
  for (const g of loreItems) {
    const on = g.userData.realm === realm && !heaven;
    g.visible = on;
    if (!on) continue;
    const found = !!(progress.lore && progress.lore[g.userData.i]);
    g.userData.book.rotation.y += dt * 0.9;
    g.userData.book.position.y = 1.1 + Math.sin(time * 1.6 + g.userData.i) * 0.08;
    g.userData.beam.material.opacity = found ? 0.04 : 0.15 + Math.sin(time * 2) * 0.05;
  }
}

