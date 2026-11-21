/* THE GRID — Renderer, scene, camera, lights, ground and the dead trees.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030605);
scene.fog = new THREE.FogExp2(0x030605, 0.05);
const camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.1, 200);
camera.rotation.order = 'YXZ';
scene.add(camera);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0x2a3a44, 0.35); scene.add(ambient);
const moon = new THREE.DirectionalLight(0x6f8fb0, 0.18); moon.position.set(-20, 40, 10); scene.add(moon);

// Flashlight
const torch = new THREE.SpotLight(0xffe2b0, 2.4, 38, 0.5, 0.65, 1.4);
torch.position.set(0.25, -0.2, 0);
torch.target.position.set(0, 0, -5);
camera.add(torch, torch.target);

// Ground: dead grass and mud
const SIZE = 140;
const tc = document.createElement('canvas'); tc.width = tc.height = 256;
const g = tc.getContext('2d');
g.fillStyle = '#0e1a0f'; g.fillRect(0,0,256,256);
for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(30,20,12,${0.15+Math.random()*0.25})`; g.beginPath(); g.arc(Math.random()*256, Math.random()*256, 6+Math.random()*18, 0, 6.3); g.fill(); }
for (let i = 0; i < 2800; i++) {
  const x = Math.random()*256, y = Math.random()*256, l = 4+Math.random()*9, a = (Math.random()-.5)*0.9;
  g.strokeStyle = `rgb(${14+Math.random()*24|0},${28+Math.random()*42|0},${10+Math.random()*16|0})`; g.lineWidth = 1+Math.random();
  g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.sin(a)*l, y-Math.cos(a)*l); g.stroke();
}
const tex = new THREE.CanvasTexture(tc);
tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
tex.repeat.set(SIZE/5, SIZE/5);
tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), new THREE.MeshStandardMaterial({map:tex, roughness:1, metalness:0}));
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Dead trees
const treePos = [];
const N_TREES = 280;
const trunkGeo = new THREE.CylinderGeometry(0.18, 0.4, 9, 6); trunkGeo.translate(0, 4.5, 0);
const limbGeo = new THREE.CylinderGeometry(0.03, 0.12, 2.6, 5); limbGeo.translate(0, 1.3, 0);
const barkMat = new THREE.MeshStandardMaterial({color:0x2a1f16, roughness:1, flatShading:true});
const trunks = new THREE.InstancedMesh(trunkGeo, barkMat, N_TREES);
const limbs = new THREE.InstancedMesh(limbGeo, barkMat, N_TREES*4);
trunks.frustumCulled = limbs.frustumCulled = false;
{
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  let li = 0;
  for (let i = 0; i < N_TREES; i++) {
    let x, z;
    do { x = (Math.random()-.5)*(SIZE-4); z = (Math.random()-.5)*(SIZE-4); } while (Math.hypot(x, z-5) < 7 || (Math.abs(x) < 9 && z > -21 && z < -5));
    const s = 0.8 + Math.random()*0.7;
    treePos.push([x, z, 0.5*s]);
    e.set((Math.random()-.5)*0.1, Math.random()*6.28, (Math.random()-.5)*0.1, 'XYZ');
    q.setFromEuler(e); p.set(x, 0, z); sc.set(s, s, s);
    trunks.setMatrixAt(i, m4.compose(p, q, sc));
    for (let k = 0; k < 4; k++) {
      const h = (3.5 + Math.random()*5.5)*s, ls = s*(0.8 + Math.random()*0.8);
      e.set(0, Math.random()*6.28, 0.7 + Math.random()*0.8, 'YXZ');
      q.setFromEuler(e); p.set(x, h, z); sc.set(ls, ls, ls);
      limbs.setMatrixAt(li++, m4.compose(p, q, sc));
    }
  }
  trunks.instanceMatrix.needsUpdate = limbs.instanceMatrix.needsUpdate = true;
}
scene.add(trunks, limbs);

