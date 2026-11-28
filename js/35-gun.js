/* THE GRID — The pistol view model, muzzle light and the raycaster every shot uses.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Gun ----
const gunMat = new THREE.MeshStandardMaterial({color: 0x3d3d42, emissive: 0x1a1a1e, metalness: 0.5, roughness: 0.5});
function makeGun(){
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.26), gunMat));
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.3), gunMat); s.position.set(0, 0.045, -0.03); g.add(s);
  const r = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.12, 0.06), gunMat); r.position.set(0, -0.08, 0.09); r.rotation.x = 0.2; g.add(r);
  return g;
}
const gunPickup = makeGun(); gunPickup.position.set(TX, 0.53, TZ); gunPickup.rotation.set(0, 0.7, Math.PI/2); gunPickup.scale.setScalar(1.15); scene.add(gunPickup);
const gunView = new THREE.Group(); gunView.position.set(0.2, -0.2, -0.45); gunView.visible = false; camera.add(gunView);
const muzzle = new THREE.PointLight(0xffcc88, 0, 12); muzzle.position.set(0.2, -0.1, -0.9); camera.add(muzzle);

const ray = new THREE.Raycaster();

fireBtn.addEventListener('pointerdown', e => { e.preventDefault(); shoot(); });
function useAction(){ if (action === 'gun') pickGun(); else if (action === 'door') toggleDoor(); else if (action === 'gate') exitHeaven(); else if (action === 'lore') readLore(nearLore); else if (action === 'forge') openForge(); else if (action === 'rift') leaveDimension(); else if (action === 'dimshop') openDimShop(); else if (action === 'bed') sitDown('bed'); else if (action === 'chair') sitDown('chair'); else if (action === 'rise') standUp(); }

function clickSound(){
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'square'; o.frequency.value = 1700; g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.04);
}
function ouch(){
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
  g.gain.setValueAtTime(1.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.32);
}

