/* THE GRID — Objective compass, health regen, save/load and hit markers.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Quality of life: settings, saving, objective compass, hit markers, regen ----
const SKEY = 'grid-walker-save';
let settings = {sens: 1, fov: 72, vol: 1, invY: false, bob: true, grain: true};
let volNode = null, bobScale = 1, invY = false, lastHurt = -99, hpShown = 100, muted = false, objKey = '';
const objEl = document.getElementById('obj'), objArrow = document.getElementById('objArrow'), objText = document.getElementById('objText');
function saveAll(){
  try {
    progress.up = {damage: up.damage, vitality: up.vitality, swift: up.swift};
    progress.shards = shards; progress.kills = kills;
    localStorage.setItem(SKEY, JSON.stringify({settings, progress}));
  } catch (e) {}
}
function loadAll(){
  try {
    const d = JSON.parse(localStorage.getItem(SKEY) || 'null');
    if (d) { Object.assign(settings, d.settings || {}); if (d.progress) progress = Object.assign(progress, d.progress); }
  } catch (e) {}
  if (progress.up) Object.assign(up, progress.up);
  shards = progress.shards || 0; kills = progress.kills || 0;
  maxHp = 100 + up.vitality * 25 + houseBonus();
  loreFound = progress.lore ? Object.keys(progress.lore).length : 0;
}

function toggleMute(){ muted = !muted; applySettings(); say(muted ? 'MUTED' : 'SOUND ON', 1200); }
function recordProgress(){ progress.max = Math.max(progress.max, Math.min(4, realm)); for (const k in owned) if (owned[k]) progress.owned[k] = true; saveAll(); buildWarp(); }
function buildWarp(){
  const w = document.getElementById('warp'); w.innerHTML = '';
  for (let n = 1; n <= 4; n++) {
    if (n > 1 && progress.max < n) continue;
    const b = document.createElement('button');
    b.textContent = n === 1 ? 'Warp: World 1 \u00b7 the forest (start)' : 'Warp: World ' + n;
    b.addEventListener('click', () => { if (heaven) exitHeaven(); document.getElementById('resume').click(); setTimeout(() => teleport(n), 50); });
    w.appendChild(b);
  }
}
function restoreProgress(){
  if (!progress.owned.pistol) return;
  hasGun = true; Object.assign(owned, progress.owned);
  scene.remove(gunPickup); gunView.visible = true; crossEl.style.display = 'block'; if (isTouch) fireBtn.style.display = 'block';
  cur = 'pistol'; store.pistol = ammo = 0;
  selectWeapon(owned.rifle ? 'rifle' : owned.shotgun ? 'shotgun' : 'pistol'); refill();
  say('PROGRESS RESTORED', 2500);
}

// Erasing the save has to erase the running game with it: shards to nothing, the
// gun back on the table, the upgrades gone, the dimension shut again.
function wipeProgress() {
  // settings live in the same save, so erasing it puts them back to default too —
  // that includes the playtesting switches, or infinite shards would refill them
  // on the very next frame and it would look like nothing happened
  if (typeof DEF !== 'undefined') Object.assign(settings, DEF);
  if (typeof applySettings === 'function') applySettings();
  if (typeof buildSettingsUI === 'function') buildSettingsUI();
  progress = {max: 1, owned: {pistol: false, shotgun: false, rifle: false}, cycle: 0, lore: {}};
  shards = 0; kills = 0; hasGun = false; ammo = 0; loreFound = 0; runTime = 0;
  for (const k in owned) owned[k] = false;
  for (const k in store) store[k] = 0;
  up.damage = up.vitality = up.swift = 0;
  if (typeof dropDimGear === 'function') dropDimGear();
  if (typeof resetDimension === 'function') resetDimension();
  if (typeof applyUpgrades === 'function') applyUpgrades();
  // the house and its furniture go back to bare planks
  if (typeof houseVisual === 'function') houseVisual();
  if (typeof interiorVisual === 'function') interiorVisual();
  // the gun goes back to the cabin table, the view model and crosshair away
  if (typeof gunView !== 'undefined') gunView.visible = false;
  if (typeof gunPickup !== 'undefined' && !gunPickup.parent) { gunPickup.visible = true; scene.add(gunPickup); }
  if (typeof crossEl !== 'undefined') crossEl.style.display = 'none';
  // back to the tree line, in world one, with the Tall Man out there
  heaven = false; dead = false; won = false;
  if (typeof enterRealmByIndex === 'function') enterRealmByIndex(1);
  camera.position.set(0, EYE, 5); yaw = 0; pitch = 0; jumpH = 0; vy = 0; camGround = 0; landDip = 0;
  health = maxHp;
  if (typeof refreshMenu === 'function') refreshMenu();
  updateStats();
  saveAll();          // write the clean save now; no reload needed for this to stick
}
function hitMark(head){
  crossEl.classList.add('hit'); crossEl.classList.toggle('head', !!head);
  clearTimeout(hitMark.t); hitMark.t = setTimeout(() => crossEl.classList.remove('hit'), 110);
  sweepTone(head ? 1600 : 900, head ? 1200 : 700, 0.07, 0.18, 'triangle');
}
function objective(){
  if (heaven) return {t: 'CLIMB THE STAIRS TO THE GATE', x: HX, z: -25};
  if (realm === 5) return {t: 'ROUND ' + Math.max(0, dimWave) + '  \u00b7  HOLD THE DIMENSION', x: ZX, z: 14};
  if (realm === 1) {
    if (!hasGun) return {t: 'FIND THE GUN IN THE HOUSE', x: TX, z: TZ};
    if (manAlive) return {t: 'KILL THE TALL MAN', x: man.position.x, z: man.position.z};
    if (portalA.visible) return {t: 'ENTER THE PORTAL', x: portalA.position.x, z: portalA.position.z};
    return null;
  }
  if (realm === 2) {
    if (beastAlive) return {t: 'KILL THE BLOOM', x: beast.position.x, z: beast.position.z};
    return portalB.visible ? {t: 'ENTER THE PORTAL', x: portalB.position.x, z: portalB.position.z} : null;
  }
  if (realm === 3) {
    const live = hounds.filter(h => h.alive);
    if (live.length) return {t: 'KILL THE HOUNDS (' + live.length + ' LEFT)', x: live[0].g.position.x, z: live[0].g.position.z};
    return portalC.visible ? {t: 'ENTER THE PORTAL', x: portalC.position.x, z: portalC.position.z} : null;
  }
  return kingAlive ? {t: 'KILL THE HOLLOW KING', x: king.position.x, z: king.position.z} : null;
}

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'KeyM') toggleMute();
  else if (e.code === 'KeyP' && !paused) setPaused(true);
});

