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
