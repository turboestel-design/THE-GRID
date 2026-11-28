/* THE GRID — The procedural audio engine — everything is synthesised, no sound files.
   Classic script: every file shares one global scope, loaded in the order used by
   index.html. Splitting this file cannot change behaviour. */
// ---- Audio (starts on first Enter click) ----
let ac = null, master = null, noiseBuf = null, rainGain = null, windGain = null, whiteBuf = null;
function startAudio(){
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (ac) { ac.resume(); master.gain.value = 1; return; }
  ac = new AC();
  volNode = ac.createGain(); volNode.connect(ac.destination); master = ac.createGain(); master.connect(volNode); applySettings();
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140; lp.connect(master);
  const dg = ac.createGain(); dg.gain.value = 0.22; dg.connect(lp); droneGain = dg;
  [38, 39.3, 57].forEach(f => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(dg); o.start(); });
  noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
  const nb = ac.createBuffer(1, ac.sampleRate*2, ac.sampleRate), nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random()*2-1;
  const mk = (type, freq) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; const gn = ac.createGain(); gn.gain.value = 0; s.connect(f); f.connect(gn); gn.connect(master); s.start(); return gn; };
  rainGain = mk('highpass', 1500); windGain = mk('lowpass', 350); whiteBuf = nb;
  r2Gain = ac.createGain(); r2Gain.gain.value = 0; r2Gain.connect(master);
  [55, 55.9, 82.4, 110.7].forEach(fr => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = fr; const og = ac.createGain(); og.gain.value = 0.3; o.connect(og); og.connect(r2Gain); o.start(); });
  padGain = ac.createGain(); padGain.gain.value = 0; padGain.connect(master);
  [261.6, 329.6, 392, 523.3].forEach((fr, i) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = fr*(1 + (i - 1.5)*0.0007); const og = ac.createGain(); og.gain.value = 0.25; o.connect(og); og.connect(padGain); o.start(); });
}
function thunder(delay){
  caption('[THUNDER]', delay*1000);
  if (!ac) return;
  const len = 4, b = ac.createBuffer(1, ac.sampleRate*len, ac.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { last = (last + (Math.random()*2-1)*0.05) * 0.996; d[i] = last * Math.pow(1 - i/d.length, 1.5) * (1 + Math.sin(i/ac.sampleRate*8)*0.5) * 3; }
  const s = ac.createBufferSource(); s.buffer = b;
  const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240;
  const v = ac.createGain(); v.gain.value = 1.3;
  s.connect(f); f.connect(v); v.connect(master); s.start(ac.currentTime + delay);
}
// Footstep on soft ground: dull thud + leafy rustle + a few small crunches
function step(run){
  if (!ac || !whiteBuf) return;
  const t = ac.currentTime, vol = (run ? 1 : 0.65) * (heaven ? 0.35 : 1) * settings.stepVol;
  const noise = (type, freq, q, peak, attack, decay, delay) => {
    const s = ac.createBufferSource(); s.buffer = whiteBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(), st = t + delay;
    g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(peak*vol, st + attack); g.gain.exponentialRampToValueAtTime(0.001, st + attack + decay);
    s.connect(f); f.connect(g); g.connect(master); s.start(st, Math.random()*0.7, attack + decay + 0.05);
  };
  noise('lowpass', 150 + Math.random()*60, 0.7, 3.2, 0.012, 0.13, 0);
  noise('bandpass', 1600 + Math.random()*1800, 0.7, 0.22, 0.035, 0.2, 0.01);
  for (let k = 0; k < 3; k++) noise('highpass', 2500 + Math.random()*2000, 0.7, 0.12 + Math.random()*0.1, 0.002, 0.03, 0.03 + Math.random()*0.14);
}
// Old door: long, uneven, rusty-hinge squeal with a low wooden groan under it
function squeak(dur){
  caption('[DOOR SQUEAKS]');
  if (!ac) return;
  const t = ac.currentTime, n = 16;
  const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(600, t);
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9; f.frequency.value = 1500;
  const g = ac.createGain(); g.gain.setValueAtTime(0, t);
  const o2 = ac.createOscillator(); o2.type = 'square'; o2.frequency.setValueAtTime(90, t); o2.frequency.linearRampToValueAtTime(55, t + dur);
  const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 260;
  const g2 = ac.createGain(); g2.gain.setValueAtTime(0, t);
  for (let k = 1; k <= n; k++) {
    const tk = t + k*dur/n, last = k === n;
    o.frequency.linearRampToValueAtTime(420 + Math.random()*1100, tk);
    g.gain.linearRampToValueAtTime(last ? 0 : 0.4 + Math.random()*1.2, tk);
    g2.gain.linearRampToValueAtTime(last ? 0 : 0.1 + Math.random()*0.35, tk);
  }
  o.connect(f); f.connect(g); g.connect(master);
  o2.connect(f2); f2.connect(g2); g2.connect(master);
  o.start(t); o.stop(t + dur + 0.05); o2.start(t); o2.stop(t + dur + 0.05);
}
// Short, low, breathy grunt for jumping
function grunt(){
  if (!ac || !settings.voice) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(120 + Math.random()*20, t); o.frequency.exponentialRampToValueAtTime(75, t + 0.22);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.6, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  [[450, 700, 4], [1100, 1000, 5]].forEach(([a, b, q]) => {
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(a, t); f.frequency.linearRampToValueAtTime(b, t + 0.14);
    o.connect(f); f.connect(g);
  });
  g.connect(master); o.start(t); o.stop(t + 0.28);
  if (whiteBuf) {
    const s = ac.createBufferSource(); s.buffer = whiteBuf;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.8;
    const bg = ac.createGain();
    bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.3, t + 0.02); bg.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    s.connect(f); f.connect(bg); bg.connect(master); s.start(t, Math.random()*0.7, 0.2);
  }
}


// ---- Menu sound: a small tick under the cursor ---------------------------------
function hoverSound(off) {
  if (!ac || !settings.uiSound) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(off ? 700 : 1500, t);
  o.frequency.exponentialRampToValueAtTime(off ? 520 : 2000, t + 0.04);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(off ? 0.018 : 0.05, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.09);
}
let hoverLast = null, hoverAt = 0;
document.addEventListener('pointerover', e => {
  const t = e.target;
  const el = t && t.closest && t.closest('button, label, summary, a, .navBtn, .row, .chk, .card, .saveCard, .panelBody, .creds, .nav, .menuCol, #menuTitle, #menuSub');
  if (!el || el === hoverLast) return;
  hoverLast = el;
  const now = performance.now();
  if (now - hoverAt < 35) return;
  hoverAt = now;
  hoverSound(!!el.disabled);
});
document.addEventListener('pointerout', e => { if (!e.relatedTarget) hoverLast = null; });


// ============================================================================
//  THE THROAT — how you get a voice without any samples.
//  A buzzy glottal saw with a bend, a wobble and jitter, pushed through three
//  formant bands (the shape of a mouth), roughened with breath noise and a
//  subharmonic, and gated by an envelope that gargles. That is the whole trick
//  a speech synthesiser uses, and it is why this sounds like a throat and the
//  old sweeps sounded like a robot.
// ============================================================================
const VOWEL = {
  uh: [520, 1150, 2500], oh: [450, 800, 2400], eh: [600, 1800, 2600],
  ah: [730, 1090, 2440], er: [470, 1320, 2350], aw: [600, 900, 2300]
};
const pickOne = a => a[Math.floor(Math.random() * a.length)];
function throat(o) {
  if (!ac) return;
  const t = ac.currentTime + (o.delay || 0);
  const dur = o.dur || 0.8, f0 = o.f0 || 95, gain = o.gain != null ? o.gain : 0.5;
  const out = ac.createGain();
  let dest = out;
  if (o.pan && ac.createStereoPanner) {
    const p = ac.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, o.pan));
    out.connect(p); dest = p;
  }
  dest.connect(master);

  // 1. the source: a glottal buzz that sags in pitch and never sits still
  const src = ac.createOscillator(); src.type = 'sawtooth';
  const bend = o.bend != null ? o.bend : -0.2, rise = o.rise || 0;
  src.frequency.setValueAtTime(f0 * (1 + rise), t);
  for (let k = 1; k <= 8; k++) {
    const pr = k / 8;
    const wob = 1 + Math.sin(pr * Math.PI * 2.4) * 0.04 + (Math.random() - 0.5) * 0.06;
    src.frequency.linearRampToValueAtTime(Math.max(18, f0 * (1 + rise + bend * pr) * wob), t + pr * dur);
  }
  const lfo = ac.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 4 + Math.random() * 3.5;
  const lfoG = ac.createGain(); lfoG.gain.value = f0 * 0.045;
  lfo.connect(lfoG); lfoG.connect(src.frequency);

  // 2. the mouth: three formant bands, sliding as the jaw moves
  const voice = ac.createGain(); voice.gain.value = 1;
  const F = (o.formants || VOWEL.uh).map(f => f * (o.throat || 1));
  const slide = o.slide != null ? o.slide : -0.12;
  F.forEach((freq, i) => {
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = [10, 12, 14][i] + Math.random() * 4;
    bp.frequency.setValueAtTime(freq, t);
    bp.frequency.linearRampToValueAtTime(Math.max(120, freq * (1 + slide * (i + 1))), t + dur);
    const g = ac.createGain(); g.gain.value = [1, 0.6, 0.3][i];
    src.connect(bp); bp.connect(g); g.connect(voice);
  });

  // 3. the wet: breath noise and a subharmonic under the pitch
  if (whiteBuf) {
    const n = ac.createBufferSource(); n.buffer = whiteBuf; n.loop = true;
    const nf = ac.createBiquadFilter(); nf.type = 'bandpass';
    nf.frequency.value = 1300 + Math.random() * 1100; nf.Q.value = 1.2;
    const ng = ac.createGain(); ng.gain.value = o.rasp != null ? o.rasp : 0.3;
    n.connect(nf); nf.connect(ng); ng.connect(voice);
    n.start(t); n.stop(t + dur + 0.2);
  }
  const sub = ac.createOscillator(); sub.type = 'square';
  sub.frequency.value = Math.max(20, f0 * 0.5);
  const sg = ac.createGain(); sg.gain.value = o.sub != null ? o.sub : 0.22;
  sub.connect(sg); sg.connect(voice);
  sub.start(t); sub.stop(t + dur + 0.2);

  // 4. the envelope, gargling all the way down
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(gain, t + Math.min(0.13, dur * 0.22));
  const wet = o.wet != null ? o.wet : 0.3, gurgles = o.gurgles || 1.4;
  const steps = Math.max(5, Math.round(dur / 0.06));
  for (let k = 1; k < steps; k++) {
    const pr = k / steps;
    const gurgle = 1 - wet * Math.abs(Math.sin(pr * Math.PI * gurgles * (1 + Math.random() * 0.15)));
    env.gain.linearRampToValueAtTime(Math.max(0.0003, gain * gurgle * (1 - 0.4 * pr)), t + pr * dur);
  }
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
  voice.connect(env); env.connect(out);
  src.start(t); src.stop(t + dur + 0.15);
  lfo.start(t); lfo.stop(t + dur + 0.15);
}

// where a thing is, relative to where you are looking — for stereo
function panFor(x, z) {
  const dx = x - camera.position.x, dz = z - camera.position.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.001) return 0;
  return Math.max(-1, Math.min(1, (dx * Math.cos(yaw) - dz * Math.sin(yaw)) / d));
}
// how loud something is, from how far away it is
function volFor(x, z, near) {
  const d = Math.hypot(x - camera.position.x, z - camera.position.z);
  const n = near || 8;
  return Math.max(0, Math.min(1, 1 - (d - n) / 34));
}

// a breath: air through a throat that has forgotten how to breathe properly
function breathNoise(vol, pan, dur, from, to, delay) {
  if (!ac || !whiteBuf) return;
  const t = ac.currentTime + (delay || 0);
  const n = ac.createBufferSource(); n.buffer = whiteBuf; n.loop = true;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4;
  f.frequency.setValueAtTime(from, t);
  f.frequency.linearRampToValueAtTime(to, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.35);
  g.gain.linearRampToValueAtTime(vol * 0.45, t + dur * 0.78);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let dest = g;
  if (pan && ac.createStereoPanner) {
    const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan));
    g.connect(p); dest = p;
  }
  n.connect(f); f.connect(g); dest.connect(master);
  n.start(t); n.stop(t + dur + 0.06);
}

// ---- the sounds a dead thing makes -----------------------------------------
function zombieGroan(vol, pan, long) {
  if (!ac) return;
  const v = vol == null ? 0.6 : vol;
  if (v <= 0.02) return;
  // most of the time it drags the air in first, and that is the sound people remember
  const inhale = Math.random() < 0.5;
  if (inhale) breathNoise(0.16 * v, pan || 0, 0.3 + Math.random() * 0.14, 400 + Math.random() * 200, 900 + Math.random() * 400, 0);
  throat({
    f0: 72 + Math.random() * 42,
    formants: pickOne([VOWEL.uh, VOWEL.oh, VOWEL.ah, VOWEL.er]),
    dur: (long ? 2.2 : 0.9) + Math.random() * 1.3,
    gain: 0.52 * v, pan: pan || 0, delay: inhale ? 0.26 + Math.random() * 0.1 : 0,
    bend: -0.28 - Math.random() * 0.22,
    rise: 0.1,
    rasp: 0.26 + Math.random() * 0.3,
    wet: 0.32 + Math.random() * 0.2,
    gurgles: 1.2 + Math.random() * 1.4,
    slide: -0.16,
    throat: 0.88 + Math.random() * 0.22
  });
}
function zombieBite(vol, pan) {
  if (!ac) return;
  const v = vol == null ? 0.7 : vol, t = ac.currentTime;
  throat({f0: 135 + Math.random() * 35, formants: VOWEL.eh, dur: 0.3, gain: 0.72 * v, pan: pan || 0,
    bend: -0.3, rasp: 0.5, wet: 0.5, gurgles: 2.2, slide: 0.2});
  // and the actual bite: a wet click under it
  if (whiteBuf) {
    const s = ac.createBufferSource(); s.buffer = whiteBuf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 620;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.9 * v, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.6, 0.2);
  }
}
function zombieDeath(vol, pan) {
  if (!ac) return;
  const v = vol == null ? 0.8 : vol;
  throat({f0: 120 + Math.random() * 30, formants: pickOne([VOWEL.ah, VOWEL.uh]), dur: 1.15, gain: 0.74 * v, pan: pan || 0,
    bend: -0.55, rise: 0.15, rasp: 0.45, wet: 0.45, gurgles: 2.6, slide: -0.3});
}
function spitterHiss(vol, pan) {
  if (!ac || !whiteBuf) return;
  const v = vol == null ? 0.7 : vol, t = ac.currentTime;
  const n = ac.createBufferSource(); n.buffer = whiteBuf; n.loop = true;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.2;
  f.frequency.setValueAtTime(3400, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.42);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.6 * v, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.5);
}
function wispWhisper(vol, pan) {
  if (!ac) return;
  throat({f0: 210, formants: [900, 1900, 3000], dur: 0.9, gain: 0.3 * (vol || 0.6), pan: pan || 0,
    bend: 0.2, rasp: 0.7, wet: 0.15, sub: 0.05, gurgles: 0.6, slide: 0.4});
}
// a whole crowd of them, drifting in and out of the mix
function hordeGroans(n, vol) {
  for (let i = 0; i < (n || 4); i++) {
    setTimeout(() => zombieGroan((vol || 0.5) * (0.6 + Math.random() * 0.5), Math.random() * 1.4 - 0.7, true),
      i * (140 + Math.random() * 320));
  }
}
// the thing that runs the rounds: three throats, a sub and a long decay
function lordRoar() {
  if (!ac) return;
  [[46, [400, 720, 2100], 2.4, 0.3], [58, [520, 900, 2400], 2.6, 0.2], [72, [610, 1400, 2600], 2.1, 0.13]].forEach(([f0, F, dur, g], i) =>
    throat({f0, formants: F, dur, gain: g, delay: i * 0.06, bend: -0.35, rise: 0.25, rasp: 0.5, wet: 0.28, sub: 0.4, slide: -0.2, gurgles: 1.6}));
  breathNoise(0.4, 0, 0.5, 300, 700, 0);
  sweepTone(42, 26, 2.6, 0.32, 'sawtooth');
  if (whiteBuf) {
    const t = ac.currentTime;
    const n = ac.createBufferSource(); n.buffer = whiteBuf; n.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.6, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 2.7);
  }
}
// something out in the dark, too far to see
function farMoan() {
  if (!ac) return;
  throat({f0: 58 + Math.random() * 30, formants: pickOne([VOWEL.uh, VOWEL.oh]), dur: 3.4 + Math.random() * 1.6,
    gain: 0.16, bend: -0.3, rasp: 0.3, wet: 0.3, gurgles: 1.1, slide: -0.1});
}

// a screamer: everything wrong with a human voice at once
function screamSound(vol, pan) {
  if (!ac) return;
  const v = vol == null ? 0.7 : vol;
  if (v <= 0.03) return;
  throat({f0: 240 + Math.random() * 60, formants: [800, 1800, 2900], dur: 1.0 + Math.random() * 0.5,
    gain: 0.34 * v, pan: pan || 0, rise: 0.45, bend: -0.1, rasp: 0.55, wet: 0.12, sub: 0.1, gurgles: 0.7, slide: 0.35});
  breathNoise(0.16 * v, pan || 0, 0.9, 1400, 2600, 0.05);
  setTimeout(() => throat({f0: 300, formants: [900, 2000, 3000], dur: 0.7, gain: 0.2 * v, pan: pan || 0,
    rise: 0.3, bend: -0.4, rasp: 0.6, wet: 0.1, sub: 0.05, gurgles: 0.6, slide: 0.2}), 420);
}
// bones knocking together: dry clicks, no pitch
function rattleSound(x, z) {
  if (!ac || !whiteBuf) return;
  const v = (typeof volFor === 'function' ? volFor(x, z, 4) : 0.6);
  if (v <= 0.02) return;
  const pan = (typeof panFor === 'function' ? panFor(x, z) : 0);
  const t0 = ac.currentTime;
  for (let i = 0; i < 7; i++) {
    const t = t0 + i * (0.045 + Math.random() * 0.05);
    const s = ac.createBufferSource(); s.buffer = whiteBuf;
    const f = ac.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = 1800 + Math.random() * 2600; f.Q.value = 6 + Math.random() * 8;
    const g = ac.createGain();
    const pk = (0.09 + Math.random() * 0.13) * v;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pk, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    let dest = g;
    if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); dest = p; }
    s.connect(f); f.connect(g); dest.connect(master);
    s.start(t, Math.random() * 1.5, 0.09);
  }
}

// ---- the knife -------------------------------------------------------------
function knifeSound() {
  if (!ac || !whiteBuf) return;
  const t = ac.currentTime;
  const s = ac.createBufferSource(); s.buffer = whiteBuf; s.loop = true;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.6;
  f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(3400, t + 0.13);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.2, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.2);
  const o = ac.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(3300, t); o.frequency.exponentialRampToValueAtTime(2200, t + 0.07);
  const og = ac.createGain();
  og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.05, t + 0.008);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.12);
}
function knifeHitSound(vol) {
  if (!ac || !whiteBuf) return;
  const v = vol == null ? 0.8 : vol, t = ac.currentTime;
  // the punch through
  const s = ac.createBufferSource(); s.buffer = whiteBuf;
  const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 480;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.75 * v, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5, 0.2);
  // and the wet part
  const s2 = ac.createBufferSource(); s2.buffer = whiteBuf; s2.loop = true;
  const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 3.5;
  f2.frequency.setValueAtTime(1500, t + 0.02); f2.frequency.exponentialRampToValueAtTime(500, t + 0.22);
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0.0001, t + 0.02); g2.gain.linearRampToValueAtTime(0.22 * v, t + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
  s2.connect(f2); f2.connect(g2); g2.connect(master); s2.start(t + 0.02); s2.stop(t + 0.3);
}
function knifeMissSound() {
  if (!ac || !whiteBuf) return;
  const t = ac.currentTime;
  const s = ac.createBufferSource(); s.buffer = whiteBuf; s.loop = true;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.2;
  f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.18);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.24);
}
