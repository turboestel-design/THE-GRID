/* THE GRID — The title screen and pause menu.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Menu ----
const menu = document.getElementById('menu');
const PANELS = ['panelWorlds', 'panelSettings', 'panelCredits'];
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
  const el = document.getElementById('saveMeta');
  if (!el) return;
  if (!progress.owned.pistol) { el.textContent = 'NO SAVE'; return; }
  const loreN = progress.lore ? Object.keys(progress.lore).length : 0;
  el.textContent = 'WORLD ' + Math.max(1, progress.max) + ' · ◆' + shards + ' · LORE ' + loreN + '/12';
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
}

function setPaused(p) {
  paused = p;
  menu.classList.toggle('hidden', !p);
  if (p) {
    clearKeys(); joyReset(); closePanels(); refreshMenu();
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
document.getElementById('navWorlds').addEventListener('click', () => openPanel('panelWorlds'));
document.getElementById('navSettings').addEventListener('click', () => openPanel('panelSettings'));
document.getElementById('navCredits').addEventListener('click', () => openPanel('panelCredits'));
document.querySelectorAll('.panelClose').forEach(b => b.addEventListener('click', closePanels));

document.getElementById('reset').addEventListener('click', () => { enterRealmByIndex(heaven ? 1 : Math.max(1, realm)); yaw = 0; pitch = 0; });
document.getElementById('sens').addEventListener('input', e => { sens = parseFloat(e.target.value); });
document.getElementById('pauseBtn').addEventListener('click', () => setPaused(true));

// keyboard: Enter starts from the title, Escape backs out of a panel
document.addEventListener('keydown', e => {
  if (!paused) return;
  const open = anyPanelOpen();
  if (e.code === 'Escape' && open) { closePanels(); e.preventDefault(); return; }
  if ((e.code === 'Enter' || e.code === 'NumpadEnter') && !open) {
    const a = document.activeElement;
    if (a && a.tagName === 'BUTTON') return;   // let the browser click it
    document.getElementById('resume').click();
    e.preventDefault();
  }
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
