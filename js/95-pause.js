/* THE GRID — The title screen and pause menu.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Menu ----
const menu = document.getElementById('menu');
const PANELS = ['panelWorlds', 'panelSettings', 'panelCredits', 'panelHow', 'panelStatus'];
let started = false;                       // true once the player has entered the game

function closePanels() {
  for (const id of PANELS) document.getElementById(id).classList.remove('open');
}
function anyPanelOpen() {
  return PANELS.some(id => document.getElementById(id).classList.contains('open'));
}
function openPanel(id) {
  closePanels();
  if (id === 'panelStatus') buildStatus();
  document.getElementById(id).classList.add('open');
}

// ---- Status: everything you are carrying, in one screen ---------------------
function buildStatus() {
  const el = document.getElementById('statusBody');
  if (!el) return;
  const hp = Math.max(0, Math.round(health)), hpMax = Math.round(maxHp) || 100;
  const loreN = progress.lore ? Object.keys(progress.lore).length : 0;
  const where = REALM_NAME[realm] || 'THE GRID';
  const wpn = Object.keys(WEAPONS).filter(k => owned[k]).map(k => {
    const a = k === cur ? ammo : (store[k] || 0);
    return '<div class="statusRow"><span>' + WEAPONS[k].name + '</span><b>' + a + ' / ' + WEAPONS[k].max + '</b></div>';
  }).join('') || '<div class="statusRow"><span>Unarmed</span><b>&mdash;</b></div>';
  el.innerHTML =
    '<div class="statusHead">Vitals</div>'
    + '<div class="statusRow"><span>Health</span><b>' + hp + ' / ' + hpMax + '</b></div>'
    + '<div class="statusBar"><i style="width:' + Math.min(100, hp / hpMax * 100).toFixed(0) + '%"></i></div>'
    + '<div class="statusRow"><span>Standing in</span><b>' + where + '</b></div>'
    + '<div class="statusHead">Weapons</div>' + wpn
    + '<div class="statusHead">Carried</div>'
    + '<div class="statusRow"><span>Shards</span><b>' + shards + '</b></div>'
    + '<div class="statusRow"><span>Kills</span><b>' + kills + '</b></div>'
    + '<div class="statusRow"><span>Lore</span><b>' + loreN + '/12</b></div>'
    + '<div class="statusRow"><span>Cycle</span><b>' + (1 + (progress.cycle || 0)) + '</b></div>'
    + '<div class="statusRow"><span>The house</span><b>' + houseLv() + ' / ' + HOUSE_MAX + '</b></div>'
    + '<div class="statusRow"><span>The interior</span><b>' + interiorLv() + ' / ' + INTERIOR_MAX + '</b></div>'
    + '<div class="statusHead">Forge</div>'
    + '<div class="statusRow"><span>Damage</span><b>+' + (up.damage || 0) + '</b></div>'
    + '<div class="statusRow"><span>Vitality</span><b>+' + (up.vitality || 0) + '</b></div>'
    + '<div class="statusRow"><span>Swiftness</span><b>+' + (up.swift || 0) + '</b></div>';
}

function menuMeta() {
  const saved = !!(progress && progress.owned && progress.owned.pistol);
  const loreN = progress && progress.lore ? Object.keys(progress.lore).length : 0;
  const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
  set('statWorld', saved ? 'WORLD ' + Math.max(1, progress.max) : '—');
  set('statShards', saved ? String(shards) : '0');
  set('statLore', (saved ? loreN : 0) + '/12');
  set('statKills', saved ? String(kills) : '0');
  set('statCycle', String(1 + (progress && progress.cycle ? progress.cycle : 0)));
  const el = document.getElementById('saveMeta');
  if (el) el.textContent = saved ? 'SAVE FOUND' : 'NO SAVE';
  const w = document.getElementById('wipe');
  if (w) { w.hidden = !saved || started; w.classList.remove('arm'); w.textContent = 'Erase save'; }
}

// ---- keyboard selection over the main menu ----
const NAV_IDS = ['resume', 'navHow', 'navStatus', 'navDim', 'navWorlds', 'navSettings', 'navCredits'];
let navSel = 0;
function navBtns() {
  return NAV_IDS.map(id => document.getElementById(id)).filter(b => b && !b.hidden);
}
function markSel() {
  navBtns().forEach((b, j) => b.classList.toggle('sel', j === navSel));
}
function selectNav(i) {
  const b = navBtns();
  if (!b.length) return;
  navSel = (i + b.length) % b.length;
  if (b[navSel].focus) b[navSel].focus({ preventScroll: true });
  markSel();
}

function refreshMenu() {
  const t = document.getElementById('menuTitle');
  const s = document.getElementById('menuSub');
  const r = document.getElementById('resume');
  if (started) {
    t.textContent = 'PAUSED'; t.dataset.text = 'PAUSED';
    s.textContent = 'IT IS STILL OUT THERE';
    r.textContent = 'RESUME';
  } else {
    t.textContent = 'THE GRID'; t.dataset.text = 'THE GRID';
    s.textContent = 'DO NOT STOP WALKING';
    r.textContent = progress.owned.pistol ? 'CONTINUE' : 'ENTER THE GRID';
  }
  const nd = document.getElementById('navDim');
  if (nd) {
    const open = typeof dimUnlocked === 'function' ? dimUnlocked() : true;
    nd.disabled = !open;
    nd.textContent = open ? 'Zombie dimension' : 'Zombie dimension — locked';
    nd.title = open ? '' : 'Clear all four worlds first';
  }
  menuMeta();
  markSel();
}

function setPaused(p) {
  paused = p;
  menu.classList.toggle('hidden', !p);
  if (p) {
    clearKeys(); joyReset(); closePanels(); navSel = 0; refreshMenu();
    if (ac) master.gain.value = 0.25;
    if (document.pointerLockElement === cv) document.exitPointerLock();
  }
}

function resumeGame() {
  const first = !started;
  started = true;
  startAudio();
  setPaused(false);
  if (first) { camera.position.set(0, EYE, 5); yaw = 0; pitch = 0; }
  if (!isTouch && cv.requestPointerLock) cv.requestPointerLock();
}
document.getElementById('resume').addEventListener('click', resumeGame);
document.getElementById('navHow').addEventListener('click', () => openPanel('panelHow'));
document.getElementById('navStatus').addEventListener('click', () => openPanel('panelStatus'));
document.getElementById('navDim').addEventListener('click', () => {
  if (typeof dimUnlocked === 'function' && !dimUnlocked()) { say('CLEAR ALL FOUR WORLDS FIRST', 2600); return; }
  resumeGame();
  if (!hasGun) pickGun();
  setTimeout(enterDimension, 80);
});
document.getElementById('navWorlds').addEventListener('click', () => openPanel('panelWorlds'));
document.getElementById('navSettings').addEventListener('click', () => openPanel('panelSettings'));
document.getElementById('navCredits').addEventListener('click', () => openPanel('panelCredits'));
document.querySelectorAll('.panelClose').forEach(b => b.addEventListener('click', closePanels));

document.getElementById('reset').addEventListener('click', () => {
  if (realm === 5 && typeof resetDimension === 'function') resetDimension();
  heaven = false; enterRealmByIndex(1);
  camera.position.set(0, EYE, 5); yaw = 0; pitch = 0;
});
document.getElementById('sens').addEventListener('input', e => { sens = parseFloat(e.target.value); });
document.getElementById('pauseBtn').addEventListener('click', () => setPaused(true));
// if anything leaves the cursor loose mid-game, clicking the world takes it back
cv.addEventListener('mousedown', () => {
  if (isTouch || !started) return;
  if (paused || forgeOpen || (typeof dimShopOpen !== 'undefined' && dimShopOpen)) return;
  if (document.pointerLockElement !== cv && cv.requestPointerLock) cv.requestPointerLock();
});

// keyboard: arrows move the selection, Enter confirms, Escape backs out of a panel
document.addEventListener('keydown', e => {
  if (!paused) {
    if (e.code === 'Escape' && started && !forgeOpen && !endingUp) { setPaused(true); e.preventDefault(); }
    return;
  }
  const open = anyPanelOpen();
  if (e.code === 'Escape') {
    if (open) closePanels();
    else if (started) resumeGame();
    e.preventDefault();
    return;
  }
  if (open) return;
  if (e.code === 'ArrowDown') { selectNav(navSel + 1); e.preventDefault(); return; }
  if (e.code === 'ArrowUp') { selectNav(navSel - 1); e.preventDefault(); return; }
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    const b = navBtns()[navSel];
    if (b) b.click();
    e.preventDefault();
  }
});

// keep the highlight in step with the mouse
NAV_IDS.forEach(id => {
  const b = document.getElementById(id);
  if (!b) return;
  const sync = () => { const j = navBtns().indexOf(b); if (j >= 0) { navSel = j; markSel(); } };
  b.addEventListener('mouseenter', sync);
  b.addEventListener('focus', sync);
});

// erase the save: first click arms it, second click wipes and reloads
const wipeBtn = document.getElementById('wipe');
if (wipeBtn) wipeBtn.addEventListener('click', () => {
  if (!wipeBtn.classList.contains('arm')) {
    wipeBtn.classList.add('arm');
    wipeBtn.textContent = 'Click again to erase';
    return;
  }
  try { localStorage.removeItem(SKEY); } catch (e) {}
  // if the reload is blocked, the running game still has to be a new game
  wipeProgress();
  wipeBtn.textContent = 'SAVE ERASED';
  try { location.reload(); } catch (e) {}
});

// Losing focus pauses on its own, so you never come back to a death screen you
// did not see.
addEventListener('blur', () => {
  if (started && !paused && !forgeOpen && !endingUp) setPaused(true);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && started && !paused && !forgeOpen && !endingUp) setPaused(true);
});

const jb = document.getElementById('jumpBtn');
jb.addEventListener('pointerdown', e => { e.preventDefault(); keys.Space = true; });
['pointerup', 'pointercancel', 'pointerleave'].forEach(t => jb.addEventListener(t, () => { delete keys.Space; }));

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== cv) {
    clearKeys();
    if (!isTouch && !paused && !forgeOpen && !endingUp) setPaused(true);
  }
});
