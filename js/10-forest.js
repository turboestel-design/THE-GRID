/* THE GRID — World 1 scenery: the cabin, its door, and the E-to-interact prompt.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Old wooden house ----
function makeWood(){
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const tones = ['#3b2d21', '#34271d', '#43342a', '#2f241b'];
  for (let i = 0; i < 4; i++) {
    x.fillStyle = tones[i]; x.fillRect(0, i*32, 128, 32);
    for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(${Math.random()<.5?'0,0,0':'120,100,80'},${0.06+Math.random()*0.1})`; x.fillRect(0, i*32 + Math.random()*32, 128, 1); }
    x.fillStyle = '#0c0805'; x.fillRect(0, i*32, 128, 2);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(Math.random()*128, i*32 + 16, 5, 3, 0, 0, 6.3); x.fill();
    x.fillStyle = '#0c0805'; x.fillRect(Math.random()*128, i*32, 2, 32);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
}
const woodTex = makeWood();
const wallMat = new THREE.MeshStandardMaterial({map: woodTex, roughness: 1});
const roofMat = new THREE.MeshStandardMaterial({color: 0x1b1511, roughness: 1});
function woodBox(parent, w, h, d, mat, x, y, z){
  const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv;
  const su = Math.max(w, d)/2, sv = h/2;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)*su, uv.getY(i)*sv);
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m;
}
const H = 3, Z0 = -9, Z1 = -15;
const wallMeshes = [
  woodBox(scene, 7.2, H, 0.2, wallMat, 0, H/2, Z1),
  woodBox(scene, 0.2, H, 6.2, wallMat, -3.5, H/2, -12),
  woodBox(scene, 0.2, H, 6.2, wallMat, 3.5, H/2, -12),
  woodBox(scene, 2.95, H, 0.2, wallMat, -2.125, H/2, Z0),
  woodBox(scene, 2.95, H, 0.2, wallMat, 2.125, H/2, Z0),
  woodBox(scene, 1.3, 0.9, 0.2, wallMat, 0, 2.55, Z0)
];
// Floor
const floorTex = woodTex.clone(); floorTex.needsUpdate = true; floorTex.repeat.set(3, 3);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.8), new THREE.MeshStandardMaterial({map: floorTex, color: 0xaaaaaa, roughness: 1}));
floor.rotation.x = -Math.PI/2; floor.position.set(0, 0.02, -12); scene.add(floor);
// Gable roof
[-1, 1].forEach(s => { const r = woodBox(scene, 4.44, 0.12, 6.9, roofMat, s*1.95, 4.07, -12); r.rotation.z = -s*0.5; });
const gs = new THREE.Shape(); gs.moveTo(-3.6, 0); gs.lineTo(3.6, 0); gs.lineTo(0, 2.1); gs.closePath();
const gGeo = new THREE.ExtrudeGeometry(gs, {depth: 0.2, bevelEnabled: false});
[Z0, Z1].forEach(z => { const m = new THREE.Mesh(gGeo, wallMat); m.position.set(0, H, z - 0.1); scene.add(m); });
// Door (hinged on the left, swings inward)
const doorPivot = new THREE.Group(); doorPivot.position.set(-0.65, 0, Z0); scene.add(doorPivot);
woodBox(doorPivot, 1.3, 2.1, 0.07, new THREE.MeshStandardMaterial({map: woodTex, color: 0xb0a090, roughness: 1}), 0.65, 1.05, 0);
const doorKnob = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.14), new THREE.MeshStandardMaterial({color: 0x111111, metalness: 0.6, roughness: 0.6}));
doorKnob.position.set(1.15, 1.05, 0); doorPivot.add(doorKnob);
// Small coffee table — hidden once the bought furniture arrives
const TX = 0.9, TZ = -12.3;
const coffeeTable = new THREE.Group(); scene.add(coffeeTable);
woodBox(coffeeTable, 1.0, 0.06, 0.55, wallMat, TX, 0.45, TZ);
[[-0.44, -0.22], [0.44, -0.22], [-0.44, 0.22], [0.44, 0.22]].forEach(([lx, lz]) => woodBox(coffeeTable, 0.06, 0.42, 0.06, wallMat, TX + lx, 0.21, TZ + lz));
const TABLE_BOX = [TX-0.5, TZ-0.28, TX+0.5, TZ+0.28];
// Solid boxes: [minX, minZ, maxX, maxZ]
const solids = [
  [-3.6, -15.1, 3.6, -14.9], [-3.6, -15.1, -3.4, -8.9], [3.4, -15.1, 3.6, -8.9],
  [-3.6, -9.1, -0.65, -8.9], [0.65, -9.1, 3.6, -8.9]
];
const doorBox = [-0.65, -9.1, 0.65, -8.9];
let doorOpen = false, doorAngle = 0, nearDoor = false, action = null;
const prompt = document.getElementById('prompt');
function insideHouse(){ const p = camera.position; return Math.abs(p.x) < 3.4 && p.z < -9.1 && p.z > -14.9; }
function toggleDoor(){ doorOpen = !doorOpen; squeak(1.5); }
prompt.addEventListener('click', () => { useAction(); prompt.blur(); });
function updateDoor(dt){
  const diff = (doorOpen ? 1.75 : 0) - doorAngle;
  doorAngle += Math.sign(diff) * Math.min(Math.abs(diff), dt*1.2);
  doorPivot.rotation.y = doorAngle;
  const gunNear = !hasGun && Math.hypot(camera.position.x - TX, camera.position.z - TZ) < 1.8;
  const doorNear = Math.hypot(camera.position.x, camera.position.z - Z0) < 2.4;
  const gateNear = Math.hypot(camera.position.x - HX, camera.position.z + 25) < 3.2;
  const inside = interiorLv ? interiorLv() : 0;
  const bedNear = inside >= 4 && Math.hypot(camera.position.x + 2.6, camera.position.z + 13.3) < 1.75;
  const hutNear = typeof nearDimHut === 'function' && nearDimHut();
  const chairNear = inside >= 2 && (Math.hypot(camera.position.x + 0.95, camera.position.z + 12.1) < 0.95
    || Math.hypot(camera.position.x - 0.95, camera.position.z + 12.1) < 0.95);
  if (!paused && !dead && !heaven) scanInteractors(); else { nearLore = -1; nearForge = null; }
  action = (paused || dead) ? null : heaven ? (gateNear ? 'gate' : null) : (typeof resting !== 'undefined' && resting) ? 'rise'
    : gunNear ? 'gun' : doorNear ? 'door' : nearLore >= 0 ? 'lore' : nearForge ? 'forge'
    : hutNear ? 'dimshop' : bedNear ? 'bed' : chairNear ? 'chair' : (realm === 5 && nearRift) ? 'rift' : null;
  nearDoor = action === 'door';
  prompt.style.display = action ? 'block' : 'none';
  if (action) {
    const key = (isTouch ? 'TAP' : 'E') + ' · ';
    prompt.textContent = key + (
      action === 'gun' ? 'TAKE GUN' :
      action === 'gate' ? 'GO BACK' :
      action === 'lore' ? 'READ' :
      action === 'forge' ? 'THE FORGE' :
      action === 'rift' ? 'LEAVE THE DIMENSION' :
      action === 'rise' ? 'GET UP' :
      action === 'dimshop' ? 'TRADE SHARDS' :
      action === 'bed' ? 'LIE DOWN' :
      action === 'chair' ? 'SIT' :
      (doorOpen ? 'CLOSE' : 'OPEN') + ' DOOR');
  }
}

