/* THE GRID — Shared prompt scanning and world-entry dispatch.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Interaction helpers shared by the prompt system ------------------------
let nearLore = -1, nearForge = null;
function scanInteractors() {
  nearLore = -1; nearForge = null;
  if (heaven) return;
  for (const g of loreItems) {
    if (g.userData.realm !== realm) continue;
    if (Math.hypot(camera.position.x - g.position.x, camera.position.z - g.position.z) < 2.0) { nearLore = g.userData.i; break; }
  }
  if (nearLore < 0) for (const f of forges) {
    if (f.userData.realm !== realm) continue;
    if (Math.hypot(camera.position.x - f.position.x, camera.position.z - f.position.z) < 2.3) { nearForge = f; break; }
  }
}
function hitFlash() {
  hurtFlash = Math.max(hurtFlash, 0.6);
}
function enterRealmByIndex(n) {
  if (n === 1) leaveRealm2();
  else if (n === 2) enterRealm2();
  else if (n === 3) enterRealm3();
  else enterRealm4();
}
function initActTwo() {
  spawnMobs(1);
  applyUpgrades();
  houseVisual();
}

