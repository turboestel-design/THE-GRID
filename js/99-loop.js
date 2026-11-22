/* THE GRID — Movement, jumping, head bob and the main frame loop. Boots the game at the end.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Loop ----
const EYE = 1.65;
// Slow drift past the cabin while the title screen is up. Resumes at the real
// spawn point the first time the player enters.
let titleT = 0;
function titleCam(dt){
  titleT += dt;
  const t = titleT * 0.11;
  camera.position.set(Math.sin(t) * 4.2, EYE + 0.06 + Math.sin(t * 1.7) * 0.03, 6.4 + Math.cos(t) * 1.5);
  camera.lookAt(0, 1.52, -12);
  camera.rotation.z = Math.sin(t * 0.8) * 0.004;
}
const clock = new THREE.Clock();
let bobT = 0, lastStep = 0, time = 0, dip = 0, jumpH = 0, vy = 0, landDip = 0;
camera.position.set(0, EYE, 5);

// Rain
const RAIN_N = 2400;
const rainGeo = new THREE.BufferGeometry();
const rp = new Float32Array(RAIN_N*6);
for (let i = 0; i < RAIN_N; i++) {
  const x = (Math.random()-.5)*32, y = Math.random()*16, z = (Math.random()-.5)*32;
  rp.set([x, y, z, x+0.08, y-0.6, z], i*6);
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
rainGeo.setDrawRange(0, 0);
const rainMat = new THREE.LineBasicMaterial({color:0x9db0c0, transparent:true, opacity:0});
const rainMesh = new THREE.LineSegments(rainGeo, rainMat);
rainMesh.frustumCulled = false;
scene.add(rainMesh);

// Weather: clear, drizzle or storm, changing every so often
let rain = 0, rainTarget = 0, weatherT = 20, flash = 0, boltT = 3, boltQueue = 0;
function updateWeather(dt){
  if (heaven || realm > 1) { rainMat.opacity = 0; rainMesh.visible = false; if (rainGain) { rainGain.gain.value = 0; windGain.gain.value = 0; } return; }
  rainMesh.visible = settings.rain;
  weatherT -= dt;
  if (weatherT <= 0) {
    const opts = [0, 0.4, 1].filter(v => v !== rainTarget);
    rainTarget = opts[Math.floor(Math.random()*opts.length)];
    weatherT = 35 + Math.random()*40;
  }
  rain += (rainTarget - rain) * Math.min(1, dt*0.25);
  if (rain > 0.7) {
    boltT -= dt;
    if (boltT <= 0) { flash = 1; thunder(0.4 + Math.random()*2.2); boltT = 5 + Math.random()*14; if (Math.random() < 0.5) boltQueue = 0.12; }
  }
  if (boltQueue > 0) { boltQueue -= dt; if (boltQueue <= 0) flash = 0.9; }
  flash = Math.max(0, flash - dt*3.5);
  const fl = flash*flash*(settings.reduceFlash ? 0.25 : 1);
  ambient.intensity = 0.35 + fl*3.2;
  moon.intensity = 0.18 + fl*3.5;
  scene.background.setRGB(0.012 + 0.4*fl, 0.024 + 0.45*fl, 0.02 + 0.55*fl);
  scene.fog.color.copy(scene.background);
  scene.fog.density = 0.05 + rain*0.02;
  if (rainGain) { const m = insideHouse() ? 0.3 : 1; rainGain.gain.value = rain*0.12*m; windGain.gain.value = (0.05 + rain*0.1 + Math.sin(time*0.4)*0.02)*m; }
  rainMat.opacity = Math.min(1, rain*1.2)*0.45*(insideHouse() ? 0 : 1);
  rainGeo.setDrawRange(0, Math.floor(RAIN_N*rain)*2);
  if (rain > 0.02) {
    const pos = rainGeo.attributes.position.array, fall = 26*dt;
    for (let i = 0; i < RAIN_N; i++) {
      const j = i*6;
      pos[j+1] -= fall; pos[j+4] -= fall;
      if (pos[j+1] < 0) { const y = 16 + Math.random()*2; pos[j+1] = y; pos[j+4] = y - 0.6; }
    }
    rainGeo.attributes.position.needsUpdate = true;
    rainMesh.position.set(camera.position.x, 0, camera.position.z);
  }
}
function loop(){
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05) * settings.speed;
  time += dt;
  updateWeather(dt);
  updateDoor(dt);
  // Flashlight flicker: mostly steady, occasional stutters
  if (dip > 0) dip -= dt; else if (Math.random() < dt * 0.25) dip = 0.05 + Math.random()*0.25;
  torch.intensity = (heaven || (realm > 1 && realm !== 5)) ? 0 : (dip > 0 && settings.flicker) ? 0.3 + Math.random()*1.2 : 2.3 + Math.sin(time*7)*0.08;
  torch.intensity *= settings.torch;
  if (paused) { if (!started) titleCam(dt); renderer.render(scene, camera); return; }
  shootCd = Math.max(0, shootCd - dt); recoil = Math.max(0, recoil - dt*6); hurtFlash = Math.max(0, hurtFlash - dt*1.5);
  hurtEl.style.opacity = Math.max(hurtFlash, (health < 30 && !heaven) ? 0.25 + Math.sin(time*6)*0.1 : 0);
  updateMan(dt); updateHeaven(dt); updateBars(dt); updateBeast(dt); updateRealm2(dt); updatePortals(dt);
  updateHounds(dt); updateKing(dt); updateWorlds(dt); updatePickups(dt);
  updateMobs(dt); updateMobShots(dt); updateShards(dt); updateForge(dt); updateLoreItems(dt); updateWaves();
  updateHorde(dt); updateHordeLord(dt); updateGore(dt); updateDimension(dt); updateHouse(dt);
  if (firing && WEAPONS[cur].auto) shoot();
  updateQoL(dt);
  const rc = settings.recoil ? 1 : 0; gunView.position.z = -0.45 + recoil*0.1*rc; gunView.rotation.x = recoil*0.25*rc;
  muzzle.intensity = flashT > 0 ? 6*(settings.reduceFlash ? 0.3 : 1) : 0; flashT -= dt;
  if (teleporting) { renderer.render(scene, camera); return; }
  if (dead) {
    camera.position.y += (0.35 - camera.position.y)*Math.min(1, dt*3);
    camera.rotation.z += (0.9 - camera.rotation.z)*Math.min(1, dt*3);
    renderer.render(scene, camera); return;
  }

  let fx = (keys.KeyD||keys.ArrowRight?1:0) - (keys.KeyA||keys.ArrowLeft?1:0);
  let fz = (keys.KeyW||keys.ArrowUp?1:0) - (keys.KeyS||keys.ArrowDown?1:0);
  if (Math.hypot(joy.x, joy.y) > 0.15) { fx += joy.x; fz -= joy.y; }
  const len = Math.hypot(fx, fz);
  if (len > 1) { fx /= len; fz /= len; }
  const moving = len > 0.01;
  const run = settings.runMode === 'always' ? true : settings.runMode === 'toggle' ? runToggled : !!(keys.ShiftLeft || keys.ShiftRight);
  const speed = (run ? 7 : 3.6) * Math.min(len, 1) * (1 + up.swift * 0.06);

  if (moving) {
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    const dx = -sy*fz + cy*fx, dz = -cy*fz - sy*fx;
    const lim = SIZE/2 - 0.5, cx0 = heaven ? HX : [0, 0, RX, AX, BX, ZX][realm], lm = heaven ? 36 : [lim, lim, 70, 70, 26, 48][realm];
    let nx = Math.max(cx0 - lm, Math.min(cx0 + lm, camera.position.x + dx*speed*dt));
    let nz = Math.max(-lm, Math.min(lm, camera.position.z + dz*speed*dt));
    if (heaven) { nz = Math.max(-27, nz); if (nz < -5) nx = HX + Math.max(-3.1, Math.min(3.1, nx - HX)); }
    else if (realm === 4) { const dx4 = nx - BX, d4 = Math.hypot(dx4, nz); if (d4 > 27) { nx = BX + dx4/d4*27; nz = nz/d4*27; } }
    for (const t of colliders()) {
      const ox = nx - t[0], oz = nz - t[1], r = t[2] + 0.35, d2 = ox*ox + oz*oz;
      if (d2 < r*r) { const d = Math.sqrt(d2) || 0.001; nx = t[0] + ox/d*r; nz = t[1] + oz/d*r; }
    }
    const tableSolid = (typeof interiorLv === 'function' && interiorLv() < 2) ? [TABLE_BOX] : [];
    const boxes = realm > 1 ? [] : (doorAngle < 0.9 ? solids.concat([doorBox]) : solids).concat(tableSolid);
    for (const b of boxes) {
      const cx = Math.max(b[0], Math.min(nx, b[2])), cz = Math.max(b[1], Math.min(nz, b[3]));
      const ox = nx - cx, oz = nz - cz, d2 = ox*ox + oz*oz, r = 0.32;
      if (d2 < r*r) {
        if (d2 > 1e-6) { const d = Math.sqrt(d2); nx = cx + ox/d*r; nz = cz + oz/d*r; }
        else {
          const l = nx - b[0], rr = b[2] - nx, tp = nz - b[1], bt = b[3] - nz, m = Math.min(l, rr, tp, bt);
          if (m === l) nx = b[0] - r; else if (m === rr) nx = b[2] + r; else if (m === tp) nz = b[1] - r; else nz = b[3] + r;
        }
      }
    }
    camera.position.x = nx; camera.position.z = nz;
    if (jumpH === 0) {
      bobT += dt * speed * 1.9;
      const st = Math.floor(bobT / Math.PI);
      if (st !== lastStep) { lastStep = st; step(run); }
    }
  }
  // Jump
  if (keys.Space && jumpH === 0 && vy === 0) { vy = 5.2; grunt(); }
  if (vy !== 0 || jumpH > 0) {
    vy -= 14*dt; jumpH += vy*dt;
    if (jumpH <= 0) { jumpH = 0; vy = 0; landDip = 0.14; step(true); }
  }
  landDip *= Math.max(0, 1 - dt*9);
  const bobY = (moving && jumpH === 0) ? Math.sin(bobT) * 0.06 * bobScale : Math.sin(time*1.2) * 0.008;
  const groundTarget = heaven ? heavenH(camera.position.x, camera.position.z) : 0;
  camGround += (groundTarget - camGround) * Math.min(1, dt*14);
  camera.position.y = EYE + camGround + jumpH + bobY - landDip;
  camera.rotation.set(pitch, yaw, moving ? Math.sin(bobT*0.5) * 0.008 * bobScale : 0);
  torch.position.x = 0.25 + (moving ? Math.sin(bobT*0.5) * 0.03 : 0);
  renderer.render(scene, camera);
}
addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
initSettings();
restoreProgress();
initActTwo();
refreshMenu();
loop();
