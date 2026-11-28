/* THE GRID — HUD element handles (health, message, crosshair, fade) and the ammo elements.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- HUD elements ----
const statsEl = document.getElementById('stats'), msgEl = document.getElementById('msg'), hurtEl = document.getElementById('hurt');
const fadeEl = document.getElementById('fade'), crossEl = document.getElementById('cross'), fireBtn = document.getElementById('fireBtn');
let hasGun = false, ammo = 0, health = 100, dead = false, won = false, heaven = false;
// Meta-progression. Shards and upgrades survive death and are saved.
let maxHp = 100, shards = 0, kills = 0, deathRealm = 1, runT = 0, loreFound = 0;
const up = {damage: 0, vitality: 0, swift: 0};
// Declared early because the Tall Man is spawned before the campaign block loads.
let progress = {max: 1, owned: {pistol: false, shotgun: false, rifle: false}, cycle: 0, lore: {}, alm: {}};
let shootCd = 0, recoil = 0, flashT = 0, hurtFlash = 0, camGround = 0, droneGain = null, padGain = null;
function say(t, ms){ msgEl.textContent = t; msgEl.style.opacity = 1; clearTimeout(say.t); say.t = setTimeout(() => { msgEl.style.opacity = 0; }, ms || 2500); }
const ammoBox = document.getElementById('ammoBox'), ammoNum = document.getElementById('ammoNum'), ammoRow = document.getElementById('ammoRow');
const bullets = [];
for (let i = 0; i < 30; i++) { const b = document.createElement('span'); ammoRow.appendChild(b); bullets.push(b); }

// Tall man health bar
const bossBar = document.getElementById('bossBar'), bossFill = document.getElementById('bossFill'), bossGhost = document.getElementById('bossGhost');
let ghostHp = 8, bossHide = 0;
const bossName = document.getElementById('bossName'), bossSeg = document.getElementById('bossSeg');
let barMax = 8;


