/* THE GRID — The full settings schema, the settings UI and how it is applied.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Settings: the big list ----
const SCHEMA = [
  ['Gameplay', [
    ['diff', 'select', 'Difficulty', [['story', 'Story (half damage)'], ['normal', 'Normal'], ['hard', 'Hard (1.5x damage)']], 'normal'],
    ['god', 'check', 'Invincible', null, false],
    ['infAmmo', 'check', 'Infinite ammo', null, false],
    ['aimAssist', 'check', 'Aim assist', null, false],
    ['autoDoor', 'check', 'Auto-open the house door', null, false],
    ['autoGun', 'check', 'Auto-pickup the gun', null, false],
    ['quickResp', 'check', 'Respawn where you die (skip cloud stairs)', null, false],
    ['speed', 'range', 'Game speed', [0.5, 1.5, 0.05], 1],
    ['runMode', 'select', 'Run mode', [['hold', 'Hold Shift'], ['toggle', 'Toggle with Shift'], ['always', 'Always run']], 'hold']]],
  ['Cutscenes and transitions', [
    ['instant', 'check', 'Skip fades, death screen and ending', null, false]]],
  ['Display', [
    ['bright', 'range', 'Brightness', [0.6, 2, 0.05], 1],
    ['contrast', 'range', 'Contrast', [0.7, 1.5, 0.05], 1],
    ['filter', 'select', 'Color filter', [['none', 'None'], ['highcon', 'High contrast'], ['gray', 'Grayscale'], ['warm', 'Warm'], ['cool', 'Cool']], 'none'],
    ['torch', 'range', 'Flashlight brightness', [0.5, 2, 0.1], 1],
    ['vig', 'check', 'Screen vignette', null, true],
    ['rain', 'check', 'Rain and storm effects', null, true],
    ['scale', 'select', 'Render resolution', [['0.5', '50%'], ['0.75', '75%'], ['1', '100%']], '1'],
    ['fps', 'check', 'Show FPS and play timer', null, false]]],
  ['Accessibility', [
    ['reduceFlash', 'check', 'Reduce flashing (lightning, muzzle, damage)', null, false],
    ['flicker', 'check', 'Flashlight flicker', null, true],
    ['recoil', 'check', 'Weapon recoil animation', null, true],
    ['captions', 'check', 'Sound captions', null, false]]],
  ['HUD and text', [
    ['noText', 'check', 'No text at all', null, false],
    ['showMsg', 'check', 'On-screen messages', null, true],
    ['showHint', 'check', 'Control hints', null, true],
    ['showObj', 'check', 'Objective compass', null, true],
    ['showStats', 'check', 'Health and ammo', null, true],
    ['showBoss', 'check', 'Boss health bar', null, true],
    ['showPrompt', 'check', 'Interaction prompts', null, true],
    ['xhStyle', 'select', 'Crosshair', [['dot', 'Dot'], ['plus', 'Plus'], ['ring', 'Ring'], ['none', 'Hidden']], 'dot'],
    ['xhSize', 'range', 'Crosshair size', [3, 24, 1], 5],
    ['xhColor', 'select', 'Crosshair color', [['white', 'White'], ['red', 'Red'], ['green', 'Green'], ['cyan', 'Cyan'], ['yellow', 'Yellow']], 'white'],
    ['hudScale', 'range', 'HUD size', [0.7, 1.6, 0.05], 1]]],
  ['Audio', [
    ['stepVol', 'range', 'Footstep volume', [0, 1.5, 0.05], 1],
    ['voice', 'check', 'Player grunts', null, true],
    ['vibration', 'check', 'Controller vibration', null, true]]],
  ['Controls and touch', [
    ['gamepad', 'check', 'Gamepad support', null, true],
    ['gpSens', 'range', 'Gamepad look speed', [0.5, 3, 0.1], 1.5],
    ['touchScale', 'range', 'Touch button size', [0.7, 1.5, 0.05], 1],
    ['lefty', 'check', 'Left-handed touch layout', null, false]]]
];
const DEF = {}; SCHEMA.forEach(sec => sec[1].forEach(r => { DEF[r[0]] = r[4]; }));
Object.assign(settings, DEF);
const BASE_DEF = {sens: 1, fov: 72, vol: 1, invY: false, bob: true, grain: true};
const DMG = {story: 0.5, normal: 1, hard: 1.5};
const XHC = {white: '#ddd5c4', red: '#e84a3a', green: '#58e07a', cyan: '#4ae0e0', yellow: '#ffd36b'};
const FILTERS = {none: '', highcon: 'contrast(1.35) saturate(1.2)', gray: 'grayscale(1)', warm: 'sepia(.35) saturate(1.2)', cool: 'hue-rotate(-20deg) saturate(.9)'};
const capEl = document.getElementById('cap'), fpsEl = document.getElementById('fps');
let fpsT = performance.now(), fpsN = 0, runTime = 0, padT = performance.now(), padPrev = {}, padHeld = false, runToggled = false;
function tm(x){ return settings.instant ? 60 : x; }
function caption(t, delay){
  if (!settings.captions) return;
  setTimeout(() => { capEl.textContent = t; capEl.style.opacity = 1; clearTimeout(caption.t); caption.t = setTimeout(() => { capEl.style.opacity = 0; }, 1800); }, delay || 0);
}
function rumble(ms, s){
  if (!settings.vibration || !settings.gamepad || !navigator.getGamepads) return;
  try { const g = Array.from(navigator.getGamepads()).find(x => x && x.connected); if (g && g.vibrationActuator) g.vibrationActuator.playEffect('dual-rumble', {duration: ms, strongMagnitude: s, weakMagnitude: s}); } catch (e) {}
}
function respawnHere(){
  dead = false; health = maxHp; jumpH = 0; vy = 0; camGround = 0; landDip = 0; yaw = 0; pitch = 0; camera.rotation.z = 0;
  const dr = deathRealm || realm;
  if (dr === 5) { resetDimension(); enterRealmByIndex(1); } else enterRealmByIndex(Math.max(1, Math.min(4, dr)));
  fadeEl.style.transition = 'opacity 1s'; fadeEl.style.opacity = '0'; fadeEl.textContent = '';
  say('YOU WAKE WHERE YOU FELL', 2500);
}
function applySettings(){
  const s = settings, b = document.body.classList, st = document.documentElement.style;
  sens = s.sens; invY = s.invY; bobScale = s.bob ? 1 : 0;
  camera.fov = s.fov; camera.updateProjectionMatrix();
  b.toggle('nograin', !s.grain); b.toggle('novig', !s.vig); b.toggle('hide-msg', !s.showMsg); b.toggle('hide-hint', !s.showHint);
  b.toggle('hide-obj', !s.showObj); b.toggle('hide-stats', !s.showStats); b.toggle('hide-boss', !s.showBoss); b.toggle('hide-prompt', !s.showPrompt);
  b.toggle('hide-fade', !!s.instant); b.toggle('lefty', !!s.lefty); b.toggle('notext', !!s.noText);
  b.toggle('noxh', s.xhStyle === 'none'); b.toggle('xh-plus', s.xhStyle === 'plus'); b.toggle('xh-ring', s.xhStyle === 'ring');
  st.setProperty('--hud', s.hudScale); st.setProperty('--touch', s.touchScale); st.setProperty('--xh', s.xhSize + 'px'); st.setProperty('--xhc', XHC[s.xhColor] || XHC.white);
  const plain = s.bright === 1 && s.contrast === 1 && s.filter === 'none';
  renderer.domElement.style.filter = plain ? '' : 'brightness(' + s.bright + ') contrast(' + s.contrast + ') ' + (FILTERS[s.filter] || '');
  const pr = Math.min(devicePixelRatio, 2)*parseFloat(s.scale);
  if (renderer.getPixelRatio() !== pr) { renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight); }
  if (volNode) volNode.gain.value = muted ? 0 : s.vol;
  fpsEl.style.display = s.fps ? 'block' : 'none';
}
function syncStatic(){
  const $ = id => document.getElementById(id);
  $('sens').value = settings.sens; $('fov').value = settings.fov; $('vol').value = settings.vol;
  $('invY').checked = settings.invY; $('bobT').checked = settings.bob; $('grainT').checked = settings.grain;
}
function buildSettingsUI(){
  const box = document.getElementById('settingsBox'); box.innerHTML = '';
  SCHEMA.forEach(([title, rows]) => {
    const d = document.createElement('details'), sm = document.createElement('summary'); sm.textContent = title; d.appendChild(sm);
    rows.forEach(([key, type, label, opt]) => {
      const l = document.createElement('label');
      if (type === 'check') {
        const i = document.createElement('input'); i.type = 'checkbox'; i.checked = !!settings[key]; l.className = 'chk';
        i.addEventListener('input', () => { settings[key] = i.checked; applySettings(); saveAll(); });
        l.append(i, ' ' + label.toUpperCase()); d.appendChild(l);
      } else if (type === 'range') {
        const v = document.createElement('span'), i = document.createElement('input'); i.type = 'range'; i.min = opt[0]; i.max = opt[1]; i.step = opt[2]; i.value = settings[key]; v.textContent = settings[key];
        i.addEventListener('input', () => { settings[key] = parseFloat(i.value); v.textContent = i.value; applySettings(); saveAll(); });
        l.textContent = label.toUpperCase() + '  '; l.appendChild(v); d.append(l, i);
      } else {
        const s = document.createElement('select');
        opt.forEach(([val, txt]) => { const o = document.createElement('option'); o.value = val; o.textContent = txt; s.appendChild(o); });
        s.value = String(settings[key]);
        s.addEventListener('change', () => { settings[key] = s.value; applySettings(); saveAll(); });
        l.textContent = label.toUpperCase(); d.append(l, s);
      }
    });
    box.appendChild(d);
  });
  const presets = [
    ['Comfort preset', () => Object.assign(settings, {reduceFlash: true, flicker: false, recoil: false, bob: false, grain: false, vig: false})],
    ['No text preset', () => Object.assign(settings, {noText: true, showMsg: false, showHint: false, showObj: false, showPrompt: false, instant: true})],
    ['Reset all settings', () => { settings = Object.assign({}, BASE_DEF, DEF); }],
    ['Clear saved progress', () => { progress = {max: 1, owned: {pistol: false, shotgun: false, rifle: false}}; buildWarp(); say('SAVED PROGRESS CLEARED', 2000); }]
  ];
  presets.forEach(([name, fn]) => {
    const b = document.createElement('button'); b.textContent = name;
    b.addEventListener('click', () => { fn(); buildSettingsUI(); syncStatic(); applySettings(); saveAll(); });
    box.appendChild(b);
  });
}
function initSettings(){
  loadAll();
  const $ = id => document.getElementById(id);
  syncStatic();
  const bind = (id, key, fn) => $(id).addEventListener('input', e => { settings[key] = fn(e.target); applySettings(); saveAll(); });
  bind('sens', 'sens', t => parseFloat(t.value)); bind('fov', 'fov', t => parseFloat(t.value)); bind('vol', 'vol', t => parseFloat(t.value));
  bind('invY', 'invY', t => t.checked); bind('bobT', 'bob', t => t.checked); bind('grainT', 'grain', t => t.checked);
  if (!document.documentElement.requestFullscreen) $('fs').style.display = 'none';
  $('fs').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); });
  buildSettingsUI(); applySettings(); buildWarp();
  const padLoop = () => { requestAnimationFrame(padLoop); pollPad(); };
  padLoop();
}
function pollPad(){
  const now = performance.now(), dt = Math.min(0.05, (now - padT)/1000); padT = now;
  if (!settings.gamepad || !navigator.getGamepads) return;
  const gp = Array.from(navigator.getGamepads()).find(g => g && g.connected); if (!gp) return;
  const B = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const edge = i => { const p = B(i), r = p && !padPrev[i]; padPrev[i] = p; return r; };
  if (edge(9)) { if (paused) document.getElementById('resume').click(); else setPaused(true); }
  if (paused) return;
  const dz = v => Math.abs(v) < 0.15 ? 0 : v;
  if (joyId === null) joy = {x: dz(gp.axes[0] || 0), y: dz(gp.axes[1] || 0)};
  look(dz(gp.axes[2] || 0)*dt*settings.gpSens*400, dz(gp.axes[3] || 0)*dt*settings.gpSens*400);
  if (B(0)) { keys.Space = true; padHeld = true; } else if (padHeld) { delete keys.Space; padHeld = false; }
  if (B(4)) keys.ShiftLeft = true; else if (padPrev.run) delete keys.ShiftLeft; padPrev.run = B(4);
  if (gp.buttons[7] && gp.buttons[7].value > 0.4) shoot();
  if (edge(2) || edge(5)) cycleWeapon();
  if (edge(3) && action) useAction();
}
function updateQoL(dt){
  if (realm > progress.max || Object.keys(owned).some(k => owned[k] && !progress.owned[k])) recordProgress();
  if (!dead && !heaven && !teleporting && health < 60 && time - lastHurt > 6) {
    health = Math.min(60, health + dt*3);
    const r = Math.round(health); if (r !== hpShown) { hpShown = r; updateStats(); }
  }
  if (settings.infAmmo && hasGun && ammo < WEAPONS[cur].max) { ammo = WEAPONS[cur].max; updateStats(); }
  if (settings.autoDoor && realm === 1 && !doorOpen && !dead && !teleporting && !insideHouse() && Math.hypot(camera.position.x, camera.position.z - Z0) < 1.7) toggleDoor();
  if (settings.autoGun && realm === 1 && !hasGun && Math.hypot(camera.position.x - TX, camera.position.z - TZ) < 1.5) pickGun();
  runTime += dt; fpsN++;
  const np = performance.now();
  if (np - fpsT > 500) {
    if (settings.fps) { const s = Math.floor(runTime); fpsEl.textContent = Math.round(fpsN*1000/(np - fpsT)) + ' FPS  ·  ' + Math.floor(s/60) + ':' + String(s % 60).padStart(2, '0'); }
    fpsN = 0; fpsT = np;
  }
  const o = (dead || teleporting) ? null : objective();
  if (!o) { objEl.style.display = 'none'; return; }
  objEl.style.display = 'flex';
  const dx = o.x - camera.position.x, dz = o.z - camera.position.z;
  objArrow.style.transform = 'rotate(' + ((Math.atan2(dx, -dz) + yaw)*180/Math.PI).toFixed(0) + 'deg)';
  const txt = o.t + '  ·  ' + Math.round(Math.hypot(dx, dz)) + 'M';
  if (txt !== objKey) { objKey = txt; objText.textContent = txt; }
}
document.addEventListener('keydown', e => { if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat && settings.runMode === 'toggle') runToggled = !runToggled; });

