/* THE GRID — The title screen and pause menu.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Menu ----
const menu = document.getElementById('menu');
const PANELS = ['panelWorlds', 'panelSettings', 'panelCredits', 'panelHow'];
let started = false;                       // true once the player has entered the game

function closePanels() {
  for (const id of PANELS) document.getElementById(id).classList.remove('open');
}
function anyPanelOpen() {
  return PANELS.some(id => document.getElementById(id).classList.contains('open'));
}
function openPanel(id) {
  closePanels();
  document.getElementById(id).classList.add('open');
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
const NAV_IDS = ['resume', 'navHow', 'navWorlds', 'navSettings', 'navCredits'];
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

document.getElementById('resume').addEventListener('click', () => {
  const first = !started;
  started = true;
  startAudio();
  setPaused(false);
  if (first) { camera.position.set(0, EYE, 5); yaw = 0; pitch = 0; }
  if (!isTouch && cv.requestPointerLock) cv.requestPointerLock();
});
document.getElementById('navHow').addEventListener('click', () => openPanel('panelHow'));
document.getElementById('navWorlds').addEventListener('click', () => openPanel('panelWorlds'));
document.getElementById('navSettings').addEventListener('click', () => openPanel('panelSettings'));
document.getElementById('navCredits').addEventListener('click', () => openPanel('panelCredits'));
document.querySelectorAll('.panelClose').forEach(b => b.addEventListener('click', closePanels));

document.getElementById('reset').addEventListener('click', () => { enterRealmByIndex(heaven ? 1 : Math.max(1, realm)); yaw = 0; pitch = 0; });
document.getElementById('sens').addEventListener('input', e => { sens = parseFloat(e.target.value); });
document.getElementById('pauseBtn').addEventListener('click', () => setPaused(true));

// keyboard: arrows move the selection, Enter confirms, Escape backs out of a panel
document.addEventListener('keydown', e => {
  if (!paused) return;
  const open = anyPanelOpen();
  if (e.code === 'Escape' && open) { closePanels(); e.preventDefault(); return; }
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
  wipeBtn.textContent = 'SAVE ERASED';
  try { location.reload(); } catch (e) {}
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
