/* THE GRID — The Dead Forge: the hut in the Zombie Dimension where shards buy
   weapons, grenades and a nuclear bomb. Nothing bought here survives the trip
   back to the other worlds — the hut keeps its stock.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ============================================================================
//  THE HUT — a shop that only exists in the Zombie Dimension
// ============================================================================
const DIM_HUT = {x: DIM_HUT_AT.x, z: DIM_HUT_AT.z, w: 4.4, d: 3.4, wall: 2.35};
const dimHutMesh = new THREE.Group();
dim.add(dimHutMesh);
const dimDeal = new THREE.Vector2(0, 32.6);       // local: where you stand to trade
{
  const plank = new THREE.MeshStandardMaterial({color: 0x2d211a, roughness: 1, flatShading: true, emissive: 0x0a0505, emissiveIntensity: 1});
  const plank2 = new THREE.MeshStandardMaterial({color: 0x3a2a20, roughness: 1, flatShading: true, emissive: 0x0c0707, emissiveIntensity: 1});
  const iron = new THREE.MeshStandardMaterial({color: 0x24242a, roughness: 0.9, metalness: 0.4, emissive: 0x090909, emissiveIntensity: 1});
  const put = (w, h, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); dimHutMesh.add(m); return m;
  };
  const H = DIM_HUT.wall, Z0 = DIM_HUT.z - DIM_HUT.d / 2, Z1 = DIM_HUT.z + DIM_HUT.d / 2;
  // floor and back
  put(DIM_HUT.w, 0.1, DIM_HUT.d, 0, 0.05, DIM_HUT.z, plank2);
  put(DIM_HUT.w, H, 0.18, 0, H / 2, Z1, plank);
  dimBoxes.push([ZX - DIM_HUT.w / 2, Z1 - 0.09, ZX + DIM_HUT.w / 2, Z1 + 0.09]);
  // sides
  [-1, 1].forEach(s => {
    put(0.18, H, DIM_HUT.d, s * (DIM_HUT.w / 2 - 0.09), H / 2, DIM_HUT.z, plank);
    dimBoxes.push([ZX + s * (DIM_HUT.w / 2 - 0.09) - 0.09, Z0, ZX + s * (DIM_HUT.w / 2 - 0.09) + 0.09, Z1]);
    // a window hole, boarded
    put(0.14, 0.7, 1.2, s * (DIM_HUT.w / 2 - 0.1), 1.55, DIM_HUT.z, plank2);
  });
  // front, with a doorway in the middle
  [-1, 1].forEach(s => {
    put(DIM_HUT.w / 2 - 0.7, H, 0.18, s * (DIM_HUT.w / 2 + 0.7) / 2, H / 2, Z0, plank);
    const cx = s * (DIM_HUT.w / 2 + 0.7) / 2;
    dimBoxes.push([ZX + cx - (DIM_HUT.w / 2 - 0.7) / 2, Z0 - 0.09, ZX + cx + (DIM_HUT.w / 2 - 0.7) / 2, Z0 + 0.09]);
  });
  put(DIM_HUT.w, 0.5, 0.18, 0, H - 0.25, Z0, plank2);
  // roof
  put(DIM_HUT.w + 0.5, 0.16, DIM_HUT.d + 0.5, 0, H + 0.08, DIM_HUT.z, plank2);
  // the counter, the anvil and the fire
  put(2.0, 0.95, 0.62, 0, 0.48, DIM_HUT.z + 1.1, plank2);
  dimBoxes.push([ZX - 1.0, DIM_HUT.z + 1.1 - 0.31, ZX + 1.0, DIM_HUT.z + 1.1 + 0.31]);
  put(0.7, 0.32, 0.3, -1.2, 1.1, DIM_HUT.z + 1.2, iron);
  const fire = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.34, 0.4),
    new THREE.MeshStandardMaterial({color: 0xff8a2a, emissive: 0xff5a10, emissiveIntensity: 2.4}));
  fire.position.set(1.35, 1.05, DIM_HUT.z + 1.2); dimHutMesh.add(fire);
  const fireLight = new THREE.PointLight(0xff7a2a, 2.4, 11, 1.7);
  fireLight.position.set(1.35, 1.5, DIM_HUT.z + 1.2); dimHutMesh.add(fireLight);
  dimHutMesh.userData.fire = fire; dimHutMesh.userData.fireLight = fireLight;
  // guns on the wall, so it reads as a shop before you are close enough to read
  for (let i = 0; i < 4; i++) {
    put(0.09, 0.5, 0.09, -1.5 + i * 0.42, 1.5, Z1 - 0.16, iron).rotation.x = 0.25;
    put(0.06, 0.06, 0.44, -1.5 + i * 0.42, 1.32, Z1 - 0.34, iron);
  }
}
// one solid block as far as the dead are concerned: they cannot follow you in
const dimHutSolid = [ZX + DIM_HUT.x - DIM_HUT.w / 2, DIM_HUT.z - DIM_HUT.d / 2, ZX + DIM_HUT.x + DIM_HUT.w / 2, DIM_HUT.z + DIM_HUT.d / 2];
function nearDimHut() {
  if (realm !== 5) return false;
  return Math.hypot(camera.position.x - ZX - dimDeal.x, camera.position.z - dimDeal.y) < 2.7;
}

// ============================================================================
//  STOCK — everything here is spent and lost when you leave the dimension
// ============================================================================
const dimGear = {scatter: false, ripper: false, hot: false, gre: 0, bomb: 0};
const DIM_STOCK = [
  {k: 'gre', name: 'GRENADE', desc: 'carry one more · G to throw · max 5', cost: 12, repeat: true},
  {k: 'scatter', name: 'SCATTERGUN', desc: 'two fat barrels, ten pellets, twice the punch', cost: 60},
  {k: 'ripper', name: 'RIPPER', desc: 'automatic, thirty rounds, faster than the rifle', cost: 90},
  {k: 'hot', name: 'HOT LOADS', desc: '+25% damage, this run only', cost: 45},
  {k: 'bomb', name: 'NUCLEAR BOMB', desc: 'flattens the dimension · B to detonate · comes with a price', cost: 250, repeat: true}
];
const dimShopEl = document.getElementById('dimShop');
const dimShopRows = document.getElementById('dimShopRows');
const dimGearEl = document.getElementById('dimGear');
let dimShopOpen = false;

function dimBought(k) {
  const it = DIM_STOCK.find(s => s.k === k);
  if (!it) return true;
  if (it.repeat) return (k === 'gre' ? dimGear.gre : dimGear.bomb) >= (k === 'gre' ? 5 : 3);
  return !!dimGear[k];
}
function dimPrice(k) { return DIM_STOCK.find(s => s.k === k).cost; }
let dimLegsShown = 100;
function updateDimGear() {
  if (!dimGearEl) return;
  const bits = [];
  if (dimGear.gre) bits.push('GRENADE \u00d7' + dimGear.gre);
  if (dimGear.bomb) bits.push('NUKE \u00d7' + dimGear.bomb);
  const legs = Math.round((typeof dimFatigue === 'function' ? dimFatigue() : 1) * 100);
  dimLegsShown = legs;
  if (realm === 5 && legs < 100) bits.push('LEGS ' + legs + '%');
  dimGearEl.textContent = bits.join('   \u00b7   ');
}
function buildDimShop() {
  if (!dimShopEl) return;
  dimShopEl.querySelector('.sh').textContent = '\u25c6 ' + shards + ' SHARDS   \u00b7   ROUND ' + Math.max(1, dimWave)
    + '   \u00b7   NOTHING LEAVES THIS PLACE';
  dimShopRows.innerHTML = '';
  for (const it of DIM_STOCK) {
    const sold = dimBought(it.k), cost = it.cost;
    const row = document.createElement('div'); row.className = 'row';
    const b = document.createElement('button');
    const tag = it.repeat ? (it.k === 'gre' ? dimGear.gre + '/5' : dimGear.bomb + '/3') : (dimGear[it.k] ? 'OWNED' : '');
    b.innerHTML = it.name + (tag ? ' <span class="lvl">' + tag + '</span>' : '')
      + '<span class="desc">' + it.desc + '</span>';
    b.disabled = sold || shards < cost;
    b.addEventListener('click', () => buyDim(it.k));
    const c = document.createElement('div'); c.className = 'cost';
    c.textContent = sold ? 'HELD' : cost + '\u25c6';
    row.append(b, c); dimShopRows.appendChild(row);
  }
}
function buyDim(k) {
  const it = DIM_STOCK.find(s => s.k === k);
  if (!it || dimBought(k) || shards < it.cost) return;
  shards -= it.cost;
  if (k === 'gre') dimGear.gre++;
  else if (k === 'bomb') dimGear.bomb++;
  else if (k === 'hot') dimGear.hot = true;
  else if (k === 'scatter') { dimGear.scatter = true; owned.scatter = true; store.scatter = WEAPONS.scatter.max; selectWeapon('scatter'); }
  else if (k === 'ripper') { dimGear.ripper = true; owned.ripper = true; store.ripper = WEAPONS.ripper.max; selectWeapon('ripper'); }
  sweepTone(320, 900, 0.35, 0.45, 'triangle');
  updateStats(); updateDimGear(); saveAll(); buildDimShop();
}
function openDimShop() {
  if (paused || realm !== 5 || heaven) return;
  dimShopOpen = true;
  setPaused(true);
  menu.classList.add('hidden');
  dimShopEl.style.display = 'block';
  buildDimShop();
}
function closeDimShop() {
  dimShopEl.style.display = 'none';
  dimShopOpen = false;
  setPaused(false);
  startAudio();
  if (!isTouch && cv.requestPointerLock) cv.requestPointerLock();   // take the cursor back, or you cannot aim
}
if (dimShopEl) {
  document.getElementById('dimShopClose').addEventListener('click', closeDimShop);
  dimShopEl.addEventListener('click', e => { if (e.target === dimShopEl) closeDimShop(); });
}

// nothing bought here travels
function dropDimGear() {
  dimGear.scatter = dimGear.ripper = dimGear.hot = false;
  dimGear.gre = dimGear.bomb = 0;
  owned.scatter = owned.ripper = false;
  store.scatter = 0; store.ripper = 0;
  if (cur === 'scatter' || cur === 'ripper') cur = owned.rifle ? 'rifle' : owned.shotgun ? 'shotgun' : 'pistol';
  for (const k in views) views[k].visible = (k === cur);
  ammo = store[cur] || 0;
  if (dimShopOpen) closeDimShop();
  dimGrenades.length = 0;
  updateDimGear(); updateStats();
}

// ============================================================================
//  GRENADES AND THE BOMB
// ============================================================================
const dimGrenades = [], dimBlasts = [];
const nukeEl = document.getElementById('nuke');
function throwGrenade() {
  if (realm !== 5 || paused || dead || teleporting || heaven || !dimGear.gre) return;
  dimGear.gre--;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshStandardMaterial({color: 0x2a2a22, emissive: 0x221a08, emissiveIntensity: 1.4, roughness: 1}));
  m.position.copy(camera.position);
  scene.add(m);
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dimGrenades.push({m, v: dir.multiplyScalar(13).setY(3.4), t: 1.7, spin: 6});
  clickSound(); updateDimGear();
}
function dimBlast(x, z, r, dmg) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.34, 22),
    new THREE.MeshBasicMaterial({color: 0xffb060, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, fog: false}));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.3, z); scene.add(ring);
  const light = new THREE.PointLight(0xffa040, 6, 16, 1.6);
  light.position.set(x, 1.6, z); scene.add(light);
  dimBlasts.push({ring, light, t: 0});
  sweepTone(90, 26, 0.5, 0.7, 'sawtooth'); rumble(400, 1.1);
  for (const m of mobs) if (m.realm === 5 && m.alive && Math.hypot(m.g.position.x - x, m.g.position.z - z) < r) hurtMob(m, dmg);
  if (lord && lord.realm === 5 && lord.alive && Math.hypot(lord.g.position.x - x, lord.g.position.z - z) < r + 1) hurtLord(dmg);
  if (Math.hypot(camera.position.x - x, camera.position.z - z) < r * 0.7) hurt(Math.round(dmg * 1.6));
}
function detonateNuke() {
  if (realm !== 5 || paused || dead || teleporting || heaven || !dimGear.bomb) return;
  dimGear.bomb--;
  updateDimGear();
  if (nukeEl) {
    nukeEl.style.transition = 'none'; nukeEl.style.opacity = '0.96';
    void nukeEl.offsetWidth;
    nukeEl.style.transition = 'opacity 2.4s'; nukeEl.style.opacity = '0';
  }
  for (const m of mobs.slice()) if (m.realm === 5 && m.alive) hurtMob(m, 999);
  if (lord && lord.realm === 5 && lord.alive) hurtLord(999);
  dimBlast(camera.position.x, camera.position.z + 6, 40, 40);
  if (Math.hypot(camera.position.x - ZX, camera.position.z - 14) > 60) hurt(10);
  say('THE DIMENSION BURNS  \u00b7  ROUND ' + Math.max(1, dimWave) + ' CLEARED', 4000);
  sweepTone(48, 16, 3.4, 0.9, 'sawtooth'); rumble(1400, 2.6);
}
function updateDimGearFx(dt) {
  if (realm === 5 && dimGearEl && Math.round(dimFatigue() * 100) !== dimLegsShown) updateDimGear();
  for (let i = dimGrenades.length - 1; i >= 0; i--) {
    const g = dimGrenades[i];
    g.t -= dt; g.v.y -= 18 * dt;
    g.m.position.addScaledVector(g.v, dt);
    g.m.rotation.x += g.spin * dt; g.m.rotation.z += g.spin * 0.7 * dt;
    if (g.m.position.y < 0.13) { g.m.position.y = 0.13; g.v.y *= -0.36; g.v.x *= 0.72; g.v.z *= 0.72; g.spin *= 0.7; }
    if (g.t > 0) for (const m of mobs) {
      if (!m.alive || m.realm !== 5) continue;
      if (Math.hypot(m.g.position.x - g.m.position.x, m.g.position.z - g.m.position.z) < 0.95) { g.t = 0; break; }
    }
    if (g.t <= 0) { dimBlast(g.m.position.x, g.m.position.z, 4.2, 7); scene.remove(g.m); dimGrenades.splice(i, 1); }
  }
  for (let i = dimBlasts.length - 1; i >= 0; i--) {
    const b = dimBlasts[i];
    b.t += dt;
    const k = b.t / 0.55;
    b.ring.scale.setScalar(1 + k * 14);
    b.ring.material.opacity = Math.max(0, 0.9 * (1 - k));
    b.light.intensity = Math.max(0, 6 * (1 - k));
    if (k >= 1) { scene.remove(b.ring); scene.remove(b.light); b.ring.geometry.dispose(); b.ring.material.dispose(); dimBlasts.splice(i, 1); }
  }
  if (dimHutMesh.userData.fire) {
    const f = 1 + Math.sin(time * 7.3) * 0.12 + Math.sin(time * 3.1) * 0.07;
    dimHutMesh.userData.fire.scale.set(f, f, f);
    dimHutMesh.userData.fireLight.intensity = 2.1 + Math.sin(time * 9.1) * 0.5;
  }
}
addEventListener('keydown', e => {
  if (paused || e.repeat) return;
  if (e.code === 'KeyG') throwGrenade();
  else if (e.code === 'KeyB') detonateNuke();
});
updateDimGear();
