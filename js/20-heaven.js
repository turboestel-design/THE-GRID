/* THE GRID — The Cloud Stairs: where you wait when you die.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Cloud stairs (the place you go when you die) ----
const HX = 1000;
const heavenGroup = new THREE.Group(); heavenGroup.position.set(HX, 0, 0); heavenGroup.visible = false; scene.add(heavenGroup);
const cloudMat = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xb8c4d4, emissiveIntensity: 0.6, roughness: 1});
const hFloor = new THREE.Mesh(new THREE.CircleGeometry(40, 48), cloudMat); hFloor.rotation.x = -Math.PI/2; heavenGroup.add(hFloor);
function puff(x, y, z, r){ const p = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), cloudMat); p.position.set(x, y, z); p.scale.y = 0.7; heavenGroup.add(p); }
for (let i = 0; i < 46; i++) { const a = i/46*6.283, r = 36 + Math.random()*5; puff(Math.cos(a)*r, -0.5 + Math.random()*1.2, Math.sin(a)*r, 2.5 + Math.random()*3.5); }
for (let i = 1; i <= 14; i++) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(6.4, i*0.35, 1.1), cloudMat);
  s.position.set(0, i*0.175, -5 - (i - 0.5)*1.1); heavenGroup.add(s);
  puff(-3.4, i*0.35 - 0.1, -5 - (i - 0.5)*1.1, 0.7); puff(3.4, i*0.35 - 0.1, -5 - (i - 0.5)*1.1, 0.7);
}
const topPlat = new THREE.Mesh(new THREE.BoxGeometry(6.4, 4.9, 6.6), cloudMat); topPlat.position.set(0, 2.45, -23.7); heavenGroup.add(topPlat);
const gold = new THREE.MeshStandardMaterial({color: 0xffd36b, emissive: 0xaa7a10, emissiveIntensity: 0.8, roughness: 0.4, metalness: 0.6});
[-2.3, 2.3].forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6, 0.35), gold); m.position.set(x, 7.9, -26); heavenGroup.add(m); });
const beam = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 0.4), gold); beam.position.set(0, 11, -26); heavenGroup.add(beam);
const glow = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 6), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, fog: false}));
glow.position.set(0, 7.9, -26.05); heavenGroup.add(glow);
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 12), new THREE.MeshBasicMaterial({color: 0xfff2b0, fog: false})); sunBall.position.set(60, 70, -120); heavenGroup.add(sunBall);
const people = [];
function person(x, y, z, col){
  const g = new THREE.Group(), skin = new THREE.MeshStandardMaterial({color: 0xf2d6bd, emissive: 0x332a22});
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.25, 10), new THREE.MeshStandardMaterial({color: col, emissive: col, emissiveIntensity: 0.2, roughness: 1})); robe.position.y = 0.62;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), skin); head.position.y = 1.42;
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.015, 6, 20), gold); halo.position.y = 1.72; halo.rotation.x = Math.PI/2;
  const eyeMat = new THREE.MeshBasicMaterial({color: 0x222222});
  [-0.06, 0.06].forEach(ex => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat); e.position.set(ex, 1.44, 0.15); g.add(e); });
  g.add(robe, head, halo); g.position.set(x, y, z); g.userData.y0 = y; g.userData.ph = Math.random()*6; heavenGroup.add(g); people.push(g);
}
const robes = [0xf2e9ff, 0xe6f2ff, 0xfff0d6, 0xe6ffe9, 0xffe6ef];
[[-6, 0, 10], [7, 0, 12], [-12, 0, 2], [11, 0, -2], [-4, 0, 17], [4, 0, 6]].forEach((p, i) => person(p[0], p[1], p[2], robes[i % 5]));
[[-2.6, 3], [2.6, 5], [-2.6, 8], [2.6, 11], [-2.6, 13]].forEach((p, i) => person(p[0], p[1]*0.35, -5 - (p[1] - 0.5)*1.1, robes[(i + 2) % 5]));
person(-2.0, 4.9, -23, robes[1]); person(2.2, 4.9, -22, robes[3]);
function heavenH(x, z){
  if (Math.abs(x - HX) > 3.3 || z > -5) return 0;
  return Math.min(14, Math.max(0, Math.ceil((-5 - z)/1.1))) * 0.35;
}
function updateHeaven(dt){
  if (!heaven) return;
  for (const p of people) {
    p.position.y = p.userData.y0 + Math.sin(time*1.5 + p.userData.ph)*0.03;
    p.rotation.y = Math.atan2(camera.position.x - (HX + p.position.x), camera.position.z - p.position.z);
  }
}

function enterHeaven(){
  heaven = true; dead = false; health = maxHp; jumpH = 0; vy = 0; camGround = 0; landDip = 0;
  setRealm(1); beast.visible = false; heavenGroup.visible = true; gunView.visible = false; crossEl.style.display = 'none'; man.visible = false;
  camera.position.set(HX, EYE, 22); yaw = 0; pitch = 0;
  scene.background.setHex(0x8fcbff); scene.fog.color.setHex(0xcfe7ff); scene.fog.density = 0.008;
  ambient.color.setHex(0xffffff); ambient.intensity = 0.9; moon.color.setHex(0xfff2d0); moon.intensity = 1.3;
  document.getElementById('vig').style.display = 'none'; document.getElementById('grain').style.display = 'none';
  setHeavenAudio(); updateStats();
  fadeEl.style.transition = 'none'; fadeEl.style.background = '#fff'; fadeEl.style.opacity = '1'; fadeEl.textContent = '';
  void fadeEl.offsetWidth; fadeEl.style.transition = 'opacity 3s'; fadeEl.style.opacity = '0';
  say('YOU ARE SAFE HERE. CLIMB THE STAIRS TO GO BACK TO ' + REALM_NAME[Math.max(1, Math.min(4, deathRealm))] + '.', 6500);
}

function die(){
  dead = true; deathRealm = heaven ? 1 : realm; clearKeys(); joyReset(); recoil = 0; firing = false;
  fadeEl.style.transition = 'opacity 1.2s'; fadeEl.style.background = '#000'; fadeEl.style.color = '#8a1c14'; fadeEl.textContent = 'YOU DIED'; fadeEl.style.opacity = '1';
  setTimeout(settings.quickResp ? respawnHere : enterHeaven, tm(2800));
}

