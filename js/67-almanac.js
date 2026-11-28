/* THE GRID — THE ALMANAC.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour.

   Everything that walks, floats or waits out there, with its own portrait. The
   portraits are not drawings: each one is the real model, rendered once into a
   small offscreen canvas the first time you open the book, then kept. If the
   browser will not give us a second WebGL context the card falls back to a plate
   with the creature's initial on it, so the page still works. */

// ---- pictures --------------------------------------------------------------
// one hidden renderer, one tiny scene, reused for every portrait
let almGL = null, almGLDead = false;

function almanacRenderer() {
  if (almGL || almGLDead) return almGL;
  try {
    almGL = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    almGL.setPixelRatio(1);
    almGL.setSize(240, 240, false);
    if (!almGL.getContext || !almGL.getContext()) { almGL = null; almGLDead = true; }
  } catch (e) { almGL = null; almGLDead = true; }
  return almGL;
}

function almanacClone(src) {
  const g = src.clone(true);
  g.traverse(o => { o.visible = true; });
  g.visible = true;
  g.position.set(0, 0, 0);
  g.rotation.set(0, 0, 0);
  return g;
}

function almanacPlate(entry) {
  // no picture available: a plate with the first letter, so nothing looks broken
  const ch = (entry.name || '?').replace(/[^A-Z]/g, '').slice(0, 1) || '?';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">'
    + '<rect width="240" height="240" fill="#0a0706"/>'
    + '<rect x="8" y="8" width="224" height="224" fill="none" stroke="#241811"/>'
    + '<text x="120" y="150" font-family="Courier New,monospace" font-size="92" fill="#39241c" text-anchor="middle">'
    + ch + '</text></svg>');
}

function almanacPortrait(entry) {
  if (entry._pic) return entry._pic;
  const r = almanacRenderer();
  let g = null;
  if (r) { try { g = entry.model(); } catch (e) { g = null; } }
  if (!r || !g) { entry._pic = almanacPlate(entry); return entry._pic; }
  let url = null;
  try {
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xffffff, 0x22242e, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 4); sc.add(key);
    const rim = new THREE.DirectionalLight(0x8a2a1c, 1.1); rim.position.set(-4, 2.5, -3); sc.add(rim);
    sc.add(g);
    g.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g);
    const size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
    g.position.sub(mid);
    const span = Math.max(size.x, size.y, size.z) || 1;
    const cam = new THREE.PerspectiveCamera(30, 1, span * 0.02, span * 40);
    cam.position.set(span * 0.7, span * 0.22, span * 1.85);
    cam.lookAt(0, 0, 0);
    r.setClearColor(0x000000, 0);
    r.render(sc, cam);
    url = r.domElement.toDataURL('image/png');
    if (!url || url.length < 64) url = null;
  } catch (e) { url = null; }
  entry._pic = url || almanacPlate(entry);
  return entry._pic;
}

// ---- the models, exactly as they are built in the world --------------------
function almanacAmmoBox() {
  return box(0.4, 0.3, 0.55, bBasic(0x7dffb0), 0, 0, 0);
}
function almanacHealthBox() {
  return box(0.45, 0.45, 0.45, bBasic(0xff4a4a), 0, 0, 0);
}
function almanacHound() {
  const h = makeHound();
  scene.remove(h.g);
  h.g.visible = true;
  h.g.position.set(0, 0, 0);
  return h.g;
}
// the shelter has no single group — it is walls and a roof laid straight into the
// forest — so the portrait rebuilds it out of the same materials and the same shape
function almanacHouse() {
  const g = new THREE.Group();
  woodBox(g, 7.2, 3, 0.2, wallMat, 0, 1.5, -3);
  woodBox(g, 0.2, 3, 6.2, wallMat, -3.5, 1.5, 0);
  woodBox(g, 0.2, 3, 6.2, wallMat, 3.5, 1.5, 0);
  woodBox(g, 2.95, 3, 0.2, wallMat, -2.125, 1.5, 3);
  woodBox(g, 2.95, 3, 0.2, wallMat, 2.125, 1.5, 3);
  woodBox(g, 1.3, 2.1, 0.08, new THREE.MeshStandardMaterial({ map: woodTex, color: 0xb0a090, roughness: 1 }), 0, 1.05, 3);
  [-1, 1].forEach(s => {
    const r = woodBox(g, 4.44, 0.12, 6.9, roofMat, s * 1.95, 4.07, 0);
    r.rotation.z = -s * 0.5;
  });
  const gs = new THREE.Shape();
  gs.moveTo(-3.6, 0); gs.lineTo(3.6, 0); gs.lineTo(0, 2.1); gs.closePath();
  const gGeo = new THREE.ExtrudeGeometry(gs, { depth: 0.2, bevelEnabled: false });
  [3, -3].forEach(z => { const m = new THREE.Mesh(gGeo, wallMat); m.position.set(0, 3, z - 0.1); g.add(m); });
  return g;
}

function almanacPortal() {
  const p = makePortal(275, 170);
  scene.remove(p);
  p.visible = true;
  p.position.set(0, -1.9, 0);
  p.scale.setScalar(1);
  return p;
}

const ALM_MODEL = {
  zombie: () => buildZombie(),
  husk: () => buildHusk(),
  spitter: () => buildSpitter(),
  wisp: () => buildWisp(),
  crawler: () => buildCrawler(),
  hound: () => buildHound(),
  rattle: () => buildRattle(),
  screamer: () => buildScreamer(),
  bloat: () => buildBloat(),
  brute: () => buildBrute(),
  glow_echo: () => buildEchoGlow(),
  tall_echo: () => buildEchoTall(),
  king_echo: () => buildEchoKing(),
  angel: () => buildAngel(),
  cinder_hound: almanacHound,
  tall_man: () => buildDimVisitorMan(),
  hollow_king: () => buildDimVisitorKing(),
  lord: () => buildLord(),
  man: () => almanacClone(man),
  bloom: () => almanacClone(beast),
  king: () => almanacClone(king),
  hounds3: almanacHound,
  portal: almanacPortal,
  shard: () => { const m = new THREE.Mesh(shardGeo, shardMat); m.scale.setScalar(2.6); return m; },
  ammo: almanacAmmoBox,
  health: almanacHealthBox,
  rift: () => almanacClone(rift),
  house: almanacHouse
};

// ---- what the book knows ---------------------------------------------------
// live numbers come from the game tables, so the book can never drift from them
const ALM_SPEED = s => s >= 2.6 ? 'fast' : s >= 1.7 ? 'quick' : s >= 1.0 ? 'steady' : 'slow';
const ALM_STYLE = s => s === 'range' ? 'keeps its distance and shoots'
  : s === 'dash' ? 'dashes in and out' : 'walks at you and bites';

function mobStats(kind) {
  const D = MOB_DEF[kind];
  if (!D) return null;
  return [
    ['HEALTH', D.hp],
    ['DAMAGE', 'up to ' + D.dmg + ' a hit'],
    ['SPEED', D.spd.toFixed(2) + ' — ' + ALM_SPEED(D.spd)],
    ['SHARDS', D.shards + ' on death'],
    ['BEHAVIOUR', ALM_STYLE(D.style)]
  ];
}

// the round a dimension creature starts on is read from the spawn table, not written down
const DIM_ROUND = k => 'Starts at round ' + DIM_UNLOCK[k] + '.';

const ALMANAC = [
  // ---------------- the horde: what the four worlds send -------------------
  {
    id: 'zombie', name: 'WALKER', tag: 'THE HORDE', section: 'The dead',
    model: ALM_MODEL.zombie, stats: () => mobStats('zombie'),
    where: 'Every world, in the set waves, and in every horde that rises behind you.',
    rounds: 'In the zombie dimension: from round 1, and called up by the Congregation forever.',
    text: 'The one you already know. A body that has stopped being a person and kept walking. '
      + 'It is slow until it is close, then it is not slow, and it does not stop for walls or for you.',
    tip: 'It is faster than it looks within five metres. Two shots to the head, or one to the body with anything bigger than the pistol.'
  },
  {
    id: 'husk', name: 'HUSK', tag: 'THE HORDE', section: 'The dead',
    model: ALM_MODEL.husk, stats: () => mobStats('husk'),
    where: 'World 1, 2 and 3 set waves. Nowhere in world 4.',
    rounds: 'In the zombie dimension: from round ' + DIM_UNLOCK.husk + '.',
    text: 'Dry, light and quick. The husk is what is left when there is nothing left to rot — '
      + 'a frame in a rag, moving at the speed of something that still wants to be alive.',
    tip: 'It closes faster than a walker. Do not treat it like one.'
  },
  {
    id: 'spitter', name: 'SPITTER', tag: 'THE HORDE', section: 'The dead',
    model: ALM_MODEL.spitter, stats: () => mobStats('spitter'),
    where: 'World 2 and world 3 set waves.',
    rounds: 'In the zombie dimension: from round ' + DIM_UNLOCK.spitter + '.',
    text: 'It will not come to you. It stands off at twenty metres and throws whatever is left inside it, '
      + 'and it only has two hit points, which is the only mercy in the whole thing.',
    tip: 'Break line of sight. Its shots stop on walls, and it will keep wasting them.'
  },
  {
    id: 'wisp', name: 'WISP', tag: 'THE HORDE', section: 'The dead',
    model: ALM_MODEL.wisp, stats: () => mobStats('wisp'),
    where: 'World 4, around the arena, and wherever a horde gets strange.',
    rounds: 'In the zombie dimension: from round ' + DIM_UNLOCK.wisp + '.',
    text: 'A light with a temper. It circles, then crosses the distance in one dash and hits you for it. '
      + 'Barely anything to kill, but you have to hit something that is never still.',
    tip: 'Wait for the dash to end. It hangs for a moment before it goes again.'
  },

  // ---------------- the zombie dimension's own dead ------------------------
  {
    id: 'crawler', name: 'CRAWLER', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.crawler, stats: () => mobStats('crawler'),
    where: 'The zombie dimension only.',
    rounds: DIM_ROUND('crawler'), roundNote: 'One arrives alone that round, so you meet it before it joins the crowd.',
    text: 'Low to the ground and quick about it. It comes in under your aim and stays there.',
    tip: 'Look down before you shoot. It is the reason the first rounds feel easy right up until they do not.'
  },
  {
    id: 'rattle', name: 'RATTLE', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.rattle, stats: () => mobStats('rattle'),
    where: 'The zombie dimension only.',
    rounds: DIM_ROUND('rattle'),
    text: 'Bone with nothing holding it together but momentum. It clatters when it walks and comes apart when it does not.',
    tip: 'It has two hit points. Almost anything puts it down; the problem is how many of them there are.'
  },
  {
    id: 'hound', name: 'HOUND', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.hound, stats: () => mobStats('hound'),
    where: 'The zombie dimension only.',
    rounds: DIM_ROUND('hound'),
    text: 'Four legs and a ribcage, and it runs at you in bursts — a slow stalk, then a sprint, then a slow stalk.',
    tip: 'The sprint is short. Let it come, take the shot, and step out of the last metre.'
  },
  {
    id: 'screamer', name: 'SCREAMER', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.screamer, stats: () => mobStats('screamer'),
    where: 'The zombie dimension only.',
    rounds: DIM_ROUND('screamer'),
    text: 'It barely hurts you itself. What it does is scream, and everything within seventeen metres of it '
      + 'starts moving faster for a few seconds. Kill it or fight a faster crowd.',
    tip: 'It is the most dangerous thing in a wave it does not touch you in.'
  },
  {
    id: 'bloat', name: 'BLOAT', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.bloat, stats: () => mobStats('bloat'),
    where: 'The zombie dimension only.',
    rounds: DIM_ROUND('bloat'),
    text: 'Slow, swollen, and it gets bigger as it gets closer. When it dies it goes off, and everything within '
      + 'four and a half metres of it takes the blast.',
    tip: 'Kill it early and from range, or use the blast on the crowd around it and take the hit yourself.'
  },
  {
    id: 'brute', name: 'BRUTE', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.brute, stats: () => mobStats('brute'),
    where: 'The zombie dimension only.',
    rounds: DIM_ROUND('brute'), roundNote: 'Two at most in a wave.',
    text: 'Eighteen hit points of muscle wearing a butcher, and it hits for twenty-four a swing. '
      + 'It is slow, and it does not need to be quick.',
    tip: 'Never in the open with it. Put something between you and it and shoot around the corner.'
  },
  {
    id: 'glow_echo', name: 'GLOW ECHO', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.glow_echo, stats: () => mobStats('glow_echo'),
    where: 'The zombie dimension only. It is what the hollow glow left behind.',
    rounds: DIM_ROUND('glow_echo'),
    text: 'A purple core with a ring turning around it, a hand above the ground, with the tentacles of that '
      + 'fungal thing hanging underneath. It drifts at you, then rushes the last gap.',
    tip: 'It is fragile. The danger is the rush, which is fast enough to catch you reloading.'
  },
  {
    id: 'cinder_hound', name: 'CINDER HOUND', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.cinder_hound, stats: () => mobStats('cinder_hound'),
    where: 'The zombie dimension, and it is world three\'s hound — the same one, not a copy.',
    rounds: DIM_ROUND('cinder_hound'),
    text: 'Still burning. Charred black with the ember spine glowing through, and it drops sparks the whole way '
      + 'it runs. In the ashen waste they come in packs; out here one turns up at a time.',
    tip: 'You will hear it before you see it. Fastest thing in the fog, so shoot the legs — aim low.'
  },
  {
    id: 'tall_echo', name: 'TALL ECHO', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.tall_echo, stats: () => mobStats('tall_echo'),
    where: 'The zombie dimension only. A memory of the tall man, nine feet of it.',
    rounds: DIM_ROUND('tall_echo'), roundNote: 'One at most.',
    text: 'A suit with too much body inside it. Pale head, pale hands hanging past its knees, and it walks at '
      + 'the speed of something that has never once had to hurry.',
    tip: 'It hurts more than a brute when it reaches you. Shoot it the whole way in, and do not let it corner you.'
  },
  {
    id: 'king_echo', name: "KING'S ECHO", tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.king_echo, stats: () => mobStats('king_echo'),
    where: 'The zombie dimension only. The Hollow King, in effigy.',
    rounds: DIM_ROUND('king_echo'), roundNote: 'One at most.',
    text: 'Plate, cloth and gold, with a crown of spikes that were never meant to be cheerful. '
      + 'Twenty-four hit points, and body shots barely matter to it.',
    tip: 'Head only. It is slow enough to line up; it is not slow enough to do it twice.'
  },
  {
    id: 'angel', name: 'ANGEL', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.angel, stats: () => mobStats('angel'),
    where: 'The zombie dimension only, and the last thing to arrive.',
    rounds: DIM_ROUND('angel'), roundNote: 'One at most.',
    text: 'Out of heaven, and it did not come to help. Robe, halo, wings that beat, gold eyes. It hangs about ten '
      + 'metres out, drifts sideways so it never sits still, and throws its light at you.',
    tip: 'It will not let you close the distance on its own terms. Shoot it at range, and keep moving sideways.'
  },
  {
    id: 'tall_man', name: 'THE TALL MAN', tag: 'THE DIMENSION', section: 'The dimension',
    model: ALM_MODEL.tall_man, stats: () => mobStats('tall_man'),
    where: 'World 1 — and in the zombie dimension it is the real one, suit and all.',
    rounds: DIM_ROUND('tall_man'), roundNote: 'One at most.',
    text: 'The boss of the forest, walking out of the fog like the last few worlds never happened. '
      + 'Black suit, long arms, a pale head that turns to you a little more slowly than it should.',
    tip: 'Every hit staggers him for a moment. Keep firing in rhythm and he never closes the last few metres.'
  },

  // ---------------- the bosses ---------------------------------------------
  {
    id: 'boss_man', name: 'THE TALL MAN (BOSS)', tag: 'WORLD 1', section: 'The bosses',
    model: ALM_MODEL.man,
    stats: () => [['HEALTH', Math.round(8 * cyc())], ['DAMAGE', '34 a hit'], ['SPEED', '1.5 — 2.0 while you carry a gun'],
      ['BEHAVIOUR', 'follows you into the house, and out of it']],
    where: 'World 1, the forest. He is already out there when you arrive.',
    rounds: 'Not in the dimension as a boss — his real self turns up there from round ' + DIM_UNLOCK.tall_man + '.',
    text: 'Seven feet of suit and patience. He walks, he does not run, and he opens doors. '
      + 'He is the one who put the whole thing in motion and he is still here.',
    tip: 'He staggers on every hit, so the pistol rhythm works. The house is not a hiding place — it is a corridor with one exit.'
  },
  {
    id: 'boss_bloom', name: 'THE BLOOM', tag: 'WORLD 2', section: 'The bosses',
    model: ALM_MODEL.bloom,
    stats: () => [['HEALTH', Math.round(10 * cyc())], ['DAMAGE', '30 on a dash'], ['SPEED', '3.0 when it commits'],
      ['BEHAVIOUR', 'circles the ring, then dashes through you']],
    where: 'World 2, the hollow glow. In the middle of the ring of mushrooms.',
    rounds: 'Not in the dimension.',
    text: 'A many-legged fungal beast with one enormous eye, grown in a ring of glowing caps. '
      + 'It circles, it watches, and then it comes through you in a straight line.',
    tip: 'The dash is the only attack. Move perpendicular to it — never backwards, you will not outrun it.'
  },
  {
    id: 'boss_hounds', name: 'THE CINDER PACK', tag: 'WORLD 3', section: 'The bosses',
    model: ALM_MODEL.hounds3,
    stats: () => [['HEALTH', '3 each, five of them'], ['DAMAGE', '15 a lunge'], ['SPEED', '8.5 on the rush'],
      ['BEHAVIOUR', 'circle you, two rush at a time']],
    where: 'World 3, the ashen waste. The pack that opens the way out.',
    rounds: 'The dimension takes one of them and sends it at you from round ' + DIM_UNLOCK.cinder_hound + '.',
    text: 'Five of them, burning, circling at eight metres and never all attacking at once. '
      + 'Only two commit at a time, which is the only reason a person survives them.',
    tip: 'Watch the two that break formation. The other three will keep circling until one of those dies.'
  },
  {
    id: 'boss_king', name: 'THE HOLLOW KING', tag: 'WORLD 4', section: 'The bosses',
    model: ALM_MODEL.king,
    stats: () => [['HEALTH', Math.round(45 * cyc())], ['DAMAGE', '20 an orb, 25 the ground wave'],
      ['SPEED', 'circles at nine metres'], ['BEHAVIOUR', 'orbs in a fan, and a slam you jump']],
    where: 'World 4, the eclipse arena — and out in the dimension on his own rounds.',
    rounds: 'The real one comes out in the dimension on rounds 20, 30, 40, with a health bar.',
    text: 'The last thing in the last world: a robe seven metres tall, a pale mask, a crown of spikes and arms '
      + 'that lift over his head before the floor goes out from under you. Under half health he gets angry and '
      + 'starts blinking across the arena.',
    tip: 'Shoot the mask. When the arms go up, jump — the wave runs along the ground and cannot reach you in the air.'
  },
  {
    id: 'boss_lord', name: 'THE CONGREGATION', tag: 'EVERYWHERE', section: 'The bosses',
    model: ALM_MODEL.lord,
    stats: () => [['HEALTH', LORD_HP], ['DAMAGE', LORD_DMG + ' a hit'], ['SPEED', 'slow, and it does not stop'],
      ['BEHAVIOUR', 'calls up two walkers every ten seconds']],
    where: 'Every third horde in worlds 1 to 4, and the boss rounds of the dimension.',
    rounds: 'In the zombie dimension: every fifth round, except 20, 30 and 40 — those belong to the Hollow King.',
    text: 'Three heads, all looking at you, on a body made of the people it has already collected. '
      + 'It never stops calling more of them up while you are trying to put it down.',
    tip: 'Kill the summoned walkers first or you will run out of ammo before you run out of Congregation.'
  },

  // ---------------- things, not creatures ----------------------------------
  {
    id: 'portal', name: 'PORTAL', tag: 'THE WAY ON', section: 'Things out there',
    model: ALM_MODEL.portal,
    stats: () => [['USED FOR', 'leaving a world behind'], ['STAYS OPEN', 'until you step through']],
    where: 'One opens when a world is finished — kill the boss, and it appears.',
    rounds: 'Not in the dimension. The way in and out there is the rift.',
    text: 'A ring of light with something turning inside it that is not quite a place. Walk into it and you are '
      + 'somewhere else, and the somewhere else is worse.',
    tip: 'There is no way back through. Spend your ammo and your shards first.'
  },
  {
    id: 'shard', name: 'SHARD', tag: 'THE WAY ON', section: 'Things out there',
    model: ALM_MODEL.shard,
    stats: () => [['WORTH', 'ammo, upgrades, the house, the forge'], ['COMES FROM', 'everything that dies']],
    where: 'Dropped by every kill, and left lying in the worlds.',
    rounds: 'Every kill in the dimension drops them. Brutes and kings drop a lot.',
    text: 'A pale green splinter of something that was never alive. The only currency anything out here respects.',
    tip: 'They pull toward you when you get close. Walk over a fight after it is over rather than during it.'
  },
  {
    id: 'ammo', name: 'AMMO CRATE', tag: 'THE WAY ON', section: 'Things out there',
    model: ALM_MODEL.ammo,
    stats: () => [['GIVES', 'a full top-up of what you carry'], ['COMES BACK', 'after a while']],
    where: 'Every world, including six of them spread across the dimension.',
    rounds: 'In the dimension they are the reason you can afford long rounds.',
    text: 'A green box with a light on it. It refills what you are holding; it does not give you a weapon you do not have.',
    tip: 'Learn where they are before you need them. Round fourteen is not the time to go looking.'
  },
  {
    id: 'health', name: 'RED BOX', tag: 'THE WAY ON', section: 'Things out there',
    model: ALM_MODEL.health,
    stats: () => [['GIVES', 'health back'], ['COMES BACK', 'after a while']],
    where: 'Every world, five of them in the dimension.',
    rounds: 'In the dimension, clearing a round also gives +6 health.',
    text: 'A red cube with a light on it. The only thing out here that is on your side.',
    tip: 'Leave one standing when you can. Coming back to a known red box beats hoping for one.'
  },
  {
    id: 'rift', name: 'THE RIFT', tag: 'THE WAY ON', section: 'Things out there',
    model: ALM_MODEL.rift,
    stats: () => [['LEADS TO', 'the zombie dimension'], ['LOCKED UNTIL', 'all four worlds are cleared']],
    where: 'World 1, in the forest, a little way from where you start.',
    rounds: 'Standing in it starts the rounds. Round 1 begins the moment you walk through.',
    text: 'Two pillars and an arch of bone with a veil of red hanging in it. Something on the other side has been '
      + 'waiting for the door to be worth opening.',
    tip: 'It is inside the forest from the beginning. It will not let you in until you have finished all four worlds.'
  },
  {
    id: 'house', name: 'THE SHELTER', tag: 'YOURS', section: 'Things out there',
    model: ALM_MODEL.house,
    stats: () => [['UPGRADES', 'ten levels'], ['GIVES', 'a roof, a bed, and more health']],
    where: 'World 1, at the edge of the forest. You start in front of it.',
    rounds: 'Not in the dimension. Nothing you build follows you out there.',
    text: 'A leaking shack that you can make into something. Each level adds light, walls and health to you, '
      + 'and the walls stop the dead for a while — the door does not, if you leave it open.',
    tip: 'Upgrade it before you spend on weapons. The health it gives you is health you keep in every world.'
  }
];

// ---- the book itself -------------------------------------------------------
let almanacBuilt = false;

function almanacSections() {
  const order = ['The dead', 'The dimension', 'The bosses', 'Things out there'];
  return order.map(s => ({
    name: s,
    entries: ALMANAC.filter(e => e.section === s)
  })).filter(s => s.entries.length);
}

function almanacStatsRows(entry) {
  try {
    const rows = entry.stats ? entry.stats() : null;
    return (rows || []).filter(Boolean);
  } catch (e) { return []; }
}

// portraits are drawn a few at a time between frames, so opening the book does not
// freeze the game while twenty-eight shapes are rendered
const almanacQueue = [];
let almanacPumping = false;

function almanacQueuePic(entry, img, done) {
  if (entry._pic) { if (img) img.src = entry._pic; if (done) done(entry._pic); return; }
  almanacQueue.push({ entry, img, done });
  if (almanacPumping) return;
  almanacPumping = true;
  const step = () => {
    const t0 = Date.now();
    while (almanacQueue.length && Date.now() - t0 < 12) {
      const job = almanacQueue.shift();
      const pic = almanacPortrait(job.entry);
      if (job.img) job.img.src = pic;
      if (job.done) job.done(pic);
    }
    if (almanacQueue.length) requestAnimationFrame(step);
    else almanacPumping = false;
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(step);
  else while (almanacQueue.length) { const job = almanacQueue.shift(); const pic = almanacPortrait(job.entry); if (job.img) job.img.src = pic; }
}

function almanacCard(entry) {
  const b = document.createElement('button');
  b.className = 'almCard';
  b.dataset.alm = entry.id;
  b.innerHTML = '<span class="almPic"><img alt="" src="' + almanacPlate(entry) + '"></span>'
    + '<span class="almName">' + entry.name + '</span>'
    + '<span class="almTag">' + entry.tag + '</span>';
  const img = b.querySelector('img');
  almanacQueuePic(entry, img);
  b.addEventListener('click', () => openAlmanacEntry(entry.id));
  return b;
}

function buildAlmanac() {
  const list = document.getElementById('almanacList');
  const detail = document.getElementById('almanacDetail');
  if (!list || !detail) return;
  if (almanacBuilt) { almanacShowList(); return; }
  list.textContent = '';
  for (const sec of almanacSections()) {
    const h = document.createElement('h3');
    h.className = 'almHead';
    h.textContent = sec.name;
    list.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'almGrid';
    for (const e of sec.entries) grid.appendChild(almanacCard(e));
    list.appendChild(grid);
  }
  almanacBuilt = true;
  almanacShowList();
}

function almanacShowList() {
  const home = document.getElementById('almanacHome');
  const detail = document.getElementById('almanacDetail');
  if (!home || !detail) return;
  detail.hidden = true;
  home.hidden = false;
}

function openAlmanacEntry(id) {
  const entry = ALMANAC.find(e => e.id === id);
  const list = document.getElementById('almanacList');
  const detail = document.getElementById('almanacDetail');
  if (!entry || !list || !detail) return;
  const rows = almanacStatsRows(entry).map(r =>
    '<div class="almStat"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('');
  detail.innerHTML =
    '<button class="almBack" type="button">&larr; all of them</button>'
    + '<div class="almHero"><img alt="" src="' + (entry._pic || almanacPlate(entry)) + '"></div>'
    + '<h3 class="almTitle">' + entry.name + '</h3>'
    + '<p class="almWhere">' + entry.tag + '</p>'
    + '<div class="almStats">' + rows + '</div>'
    + '<h4>Where it spawns</h4><p data-alm="where">' + entry.where + '</p>'
    + '<h4>In the zombie dimension</h4><p data-alm="rounds">' + entry.rounds
      + (entry.roundNote ? ' ' + entry.roundNote : '') + '</p>'
    + '<h4>What it is</h4><p data-alm="text">' + entry.text + '</p>'
    + '<h4>What to do about it</h4><p data-alm="tip">' + entry.tip + '</p>';
  detail.hidden = false;
  const home = document.getElementById('almanacHome');
  if (home) home.hidden = true;
  const back = detail.querySelector('.almBack');
  if (back) back.addEventListener('click', almanacShowList);
  const hero = detail.querySelector('.almHero img');
  if (hero) almanacQueuePic(entry, null, pic => { hero.src = pic; });
  detail.scrollTop = 0;
}

// the dimension's own little summary, used by the panel footer
function almanacCount() { return ALMANAC.length; }
