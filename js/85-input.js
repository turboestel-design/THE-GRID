/* THE GRID — Keyboard, mouse, touch look and the on-screen joystick.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Input ----
const keys = Object.create(null);
function clearKeys(){ for (const k in keys) delete keys[k]; }
addEventListener('keydown', e => { keys[e.code] = true; if (e.metaKey) clearKeys(); if (e.code === 'KeyE' && !e.repeat && action && !paused) useAction(); });
addEventListener('keyup', e => { delete keys[e.code]; });
addEventListener('blur', clearKeys);
document.addEventListener('visibilitychange', () => { clearKeys(); if (document.hidden) setPaused(true); });
addEventListener('contextmenu', clearKeys);

let yaw = 0, pitch = 0, paused = true, sens = 1;
const isTouch = matchMedia('(pointer:coarse)').matches;
function look(dx, dy){
  if (paused) return;
  yaw -= dx * 0.0025 * sens;
  pitch = Math.max(-1.45, Math.min(1.45, pitch - dy * 0.0025 * sens * (invY ? -1 : 1)));
}
const cv = renderer.domElement;
document.addEventListener('mousemove', e => { if (document.pointerLockElement === cv) look(e.movementX, e.movementY); });
document.addEventListener('mousedown', e => { if (document.pointerLockElement === cv && e.button === 0) shoot(); });
let lookId = null, lx = 0, ly = 0;
cv.addEventListener('pointerdown', e => {
  if (document.pointerLockElement !== cv && lookId === null) {
    lookId = e.pointerId; lx = e.clientX; ly = e.clientY;
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  }
});
cv.addEventListener('pointermove', e => { if (e.pointerId === lookId) { look(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY; } });
const lookEnd = e => { if (e.pointerId === lookId) lookId = null; };
cv.addEventListener('pointerup', lookEnd);
cv.addEventListener('pointercancel', lookEnd);
cv.addEventListener('mousedown', e => { if (e.button === 0 && document.pointerLockElement !== cv && !paused && !dead && !heaven) shoot(); });
document.addEventListener('pointerlockerror', () => { if (!paused && !isTouch) say('POINTER LOCK BLOCKED · DRAG TO LOOK', 5000); });

// Joystick
const joyEl = document.getElementById('joy'), knob = document.getElementById('knob');
let joy = {x:0, y:0}, joyId = null;
function joyReset(){ joyId = null; joy = {x:0,y:0}; knob.style.transform = ''; }
function joyMove(e){
  const r = joyEl.getBoundingClientRect();
  let dx = (e.clientX - (r.left + 55)) / 55, dy = (e.clientY - (r.top + 55)) / 55;
  const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
  joy = {x:dx, y:dy};
  knob.style.transform = `translate(${dx*35}px,${dy*35}px)`;
}
joyEl.addEventListener('pointerdown', e => { joyId = e.pointerId; joyEl.setPointerCapture(joyId); joyMove(e); });
joyEl.addEventListener('pointermove', e => { if (e.pointerId === joyId) joyMove(e); });
['pointerup','pointercancel','lostpointercapture'].forEach(t => joyEl.addEventListener(t, e => { if (e.pointerId === joyId) joyReset(); }));
addEventListener('blur', joyReset);

