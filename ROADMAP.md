# THE GRID — audit, what I shipped, and where I'd take it

> Play it: the preview tab (`index.html`). Controls: **WASD** move · **SHIFT** run · **SPACE** jump ·
> **E** interact · **CLICK** shoot · **Q / 1-3** weapons · **P** pause · **M** mute.

---

## 1. What you actually have (honest audit)

Four realms, four bosses, three weapons, roughly 15 minutes of game — and a genuinely strong mood:
procedural WebAudio (no audio files at all), film grain, lightning, a flashlight that flickers, and
zero art assets. That's a rare and good foundation. One HTML file, no build step.

But it's **a corridor of four arenas**. Every world is: empty plane → one enemy type → kill it →
portal. The combat has one shape, the levels have no structure, and the only thing worth finding is a
gun the first time you walk into a shed.

So the problem isn't "not enough stuff". Adding a fifth arena would add four minutes. The game needs
three things: **structure**, **a reason to fight**, and **a reason to wander off the path**.

While reading the code I also found three progression bugs that actively punish players:

| Bug | Effect |
|---|---|
| Death sent you to the Cloud Stairs, and leaving them always dumped you back in **World 1** | Dying at the final boss = replay the whole game |
| Killing the Hollow King ran `leaveRealm2()` | "THE END" → dropped back at the start, Tall Man alive |
| `updateMan()` only early-returned in realm 2 | The Tall Man kept simulating (and could injure you) in worlds 3 and 4 |

Plus 18 functions were declared twice (world 3/4 were bolted on top of an earlier draft), so the
first definition of each was dead code.

---

## 2. What I shipped today (playable now)

**Foundations**
- Removed the 18 shadowed declarations — last-wins magic is gone, one source of truth per function.
- Built `tools/smoke.mjs`: a jsdom + real-Three.js harness that boots the game with stubbed WebGL and
  drives every realm, weapon, boss kill, death and menu path. `npm test`. You can now break things
  without finding out three days later.
- Renamed the file to `index.html` so it hosts and previews anywhere.

**Progression that survives death**
- Death now drops you back at the start of **the world that killed you**, with that world's boss reset.
  The Cloud Stairs still exist and now tell you which world you're returning to.
- Shards (◆) drop from everything and **persist through death** — dying costs you time, not progress.
- The Forge: a pedestal in each world. Spend shards on **Hollow Rounds** (+15% damage ×5),
  **Second Skin** (+25 max HP ×4), **Light Step** (+6% speed ×3). Saved to `localStorage`.
- A real ending screen: cycle, time, kills, shards, lore found, upgrades. Then **begin a new cycle** —
  enemies scale up and keep scaling. That's New Game+.

**The worlds have inhabitants now**
- Three enemy types with distinct verbs: **Husks** (shamble, melee), **Spitters** (kite, fire
  projectiles), **Wisps** (orbit fast, then dive). 6 per world, plus a **wave when the boss hits 50%**.
- Everything is shootable with headshot multipliers, drops shards, and falls over when it dies.
- **12 lore fragments** — three per world, glowing books on pedestals. They tell one story and the last
  one names a fifth door. Tracked and saved.

---

## 3. Where I'd take it

### Phase 1 — Turn four arenas into four worlds
This is the highest-leverage change and nothing else matters as much.

- **Give every world a landmark you can see from the spawn point.** You already do this with the cabin;
  do it with a silhouette on the horizon (the Bloom's cap glowing through fog, a broken tower in the
  ash, the King's arena ring).
- **Split each world into 3 zones + a boss arena behind a gate.** Example for World 1: cabin (safe
  zone, forge, the gun) → a treeline you have to navigate by flashlight → the clearing where he waits.
  Breaking three "tether nodes" opens the gate, so the boss is a destination, not the whole level.
- **Use the jump.** It exists and does nothing. Cliffs, a collapsed footbridge in the ash, mushroom
  terraces in the glow. Verticality is the cheapest way to make a flat plane feel designed.
- Keep the scale: 3 short zones ≈ 4 minutes each per world is already triple the current playtime.

### Phase 2 — Make the four weapons matter
Right now every gun kills everything, so you use the one with the biggest number.

- **Counters:** armoured husks that shrug off pistol rounds but the rifle pierces; spitters that punish
  standing still; wisps that need the shotgun's spread at close range.
- **Elites** (1 in 8): glowing, 3× health, drop a **weapon mod** — choke, scope, overpressure.
- **Two more weapons:** the **Nail Gun** (pins enemies to walls — you already have the raycast) and the
  **Ash Thrower** (area denial, an environmental weapon that only works in World 3).

### Phase 3 — Give people a reason to leave the path
- **Four secret rooms**, one per world, each behind something you have to *shoot* (a rope, a chain, a
  wasp nest). You already raycast every shot — "shoot the thing to open the door" is nearly free.
- Payoff: a weapon mod, a lore fragment, or a big shard cache.
- **The fifth door.** The lore already promises it. A hidden realm that only opens if you found all 12
  fragments — that's the true ending, and it gives completionists a reason to replay.

### Phase 4 — Feel (the part that makes it look expensive)
- Boss phase 2s for the Tall Man and the Bloom (only the King has one today).
- Damage numbers, camera shake on hits, muzzle smoke, shell casings, bullet decals on trees.
- Footstep surfaces: wood inside the cabin, ash in World 3, spongy fungus in World 2.
- A title card per world ("THE ASHEN WASTE") on arrival.

### Phase 5 — Meta
- Challenge modifiers for new cycles: *no forge*, *one weapon*, *permadeath* — higher shard rates.
- Endless mode: the arena, forever, with a leaderboard in `localStorage`.
- A codex screen for the lore you've found.

### Technical notes
- **Keep it one file.** Instant load, no build, easy to share. It's a feature, not a limitation.
- Add `?dev=1`: a console with noclip, spawn, god mode, warp. You'll iterate 5× faster.
- Performance budget: instanced scenery (already done), pooled projectiles, one point light per region.
  The new enemies are ~20 small groups — cheap.

---

## 4. If I only got three more moves

1. **Rebuild World 1 as a real level** (cabin → treeline → clearing, three tether nodes, a gate) and
   template the other three from it. This is what makes it feel like a *game*.
2. **Enemy counters + elites**, so the four weapons become a decision instead of a preference.
3. **The fifth door**, as the thing all the exploration pays into.

Everything else is content on top of that skeleton.

---

## Repo

```
index.html          the whole game (single file, no assets, no build)
tools/harness.mjs   boots the game headless with real Three.js + jsdom
tools/smoke.mjs     regression suite across all 4 realms  → npm test
```

Save data lives in `localStorage` under `grid-walker-save`.
