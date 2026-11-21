/* THE GRID — The pause menu.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Pause ----
const menu = document.getElementById('menu');
function setPaused(p){
  paused = p;
  menu.classList.toggle('hidden', !p);
  if (p) {
    clearKeys(); joyReset();
    document.getElementById('resume').textContent = 'Resume';
    document.getElementById('menuTitle').textContent = 'Paused';
    document.getElementById('menuSub').textContent = 'IT IS STILL OUT THERE';
    if (ac) master.gain.value = 0.25;
    if (document.pointerLockElement === cv) document.exitPointerLock();
  }
}
document.getElementById('resume').addEventListener('click', () => {
  startAudio(); setPaused(false);
  if (!isTouch && cv.requestPointerLock) cv.requestPointerLock();
});
document.getElementById('reset').addEventListener('click', () => { enterRealmByIndex(heaven ? 1 : Math.max(1, realm)); yaw = 0; pitch = 0; });
document.getElementById('sens').addEventListener('input', e => { sens = parseFloat(e.target.value); });
document.getElementById('pauseBtn').addEventListener('click', () => setPaused(true));
const jb = document.getElementById('jumpBtn');
jb.addEventListener('pointerdown', e => { e.preventDefault(); keys.Space = true; });
['pointerup','pointercancel','pointerleave'].forEach(t => jb.addEventListener(t, () => { delete keys.Space; }));
document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement !== cv) { clearKeys(); if (!isTouch && !paused && !forgeOpen && !endingUp) setPaused(true); } });
document.addEventListener('pointerlockerror', () => setPaused(true));

