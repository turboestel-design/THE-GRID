// Reusable boot harness: loads THE GRID's inline script in a jsdom realm with
// real Three.js and stubbed WebGL/2D-canvas/audio. Exposes `run(expr)`.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import * as THREE from 'three';

const ROOT = path.resolve(import.meta.dirname, '..');

export function boot(file = 'index.html', { quiet = true } = {}) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // Concatenate every local script in document order. Classic scripts share one
  // global scope, so this is exactly what the browser executes.
  const code = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>|<script[^>]*src="([^"]+)"[^>]*><\/script>/g)]
    .map(m => {
      if (m[1] !== undefined) {
        // the bundled build inlines three.js; the harness supplies THREE itself
        return /Three\.js Authors/.test(m[1]) ? '' : m[1];
      }
      const src = m[2];
      if (/^https?:/.test(src)) return '';               // external: never fetched
      if (/three(\.min)?\.js$/.test(src)) return '';      // THREE is supplied by the harness
      return fs.readFileSync(path.join(ROOT, src), 'utf8');
    }).join('\n');
  if (!code.trim()) throw new Error('no game script found');

  const errors = [];
  const dom = new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/g, ''), {
    url: 'https://the-grid.test/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const { window } = dom;

  const gradient = { addColorStop() {} };
  const ctx2d = () => new Proxy({}, {
    get(t, k) {
      if (k === 'canvas') return { width: 256, height: 256 };
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => gradient;
      if (k === 'createPattern') return () => ({});
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (k in t) return t[k];
      return typeof k === 'string' ? () => {} : undefined;
    },
    set(t, k, v) { t[k] = v; return true; },
  });
  window.HTMLCanvasElement.prototype.getContext = function (type) {
    if (type === '2d') return this.__ctx || (this.__ctx = ctx2d());
    return null;
  };
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:,';

  class FakeRenderer {
    constructor() {
      this.domElement = window.document.createElement('canvas');
      this.capabilities = { getMaxAnisotropy: () => 4 };
      this._pr = 1;
    }
    setPixelRatio(v) { this._pr = v; }
    getPixelRatio() { return this._pr; }
    setSize() {}
    render(scene) { this.renders = (this.renders || 0) + 1; if (scene && scene.updateMatrixWorld) scene.updateMatrixWorld(); }
    dispose() {}
  }
  const THREE_STUB = Object.create(null);
  for (const k of Object.keys(THREE)) THREE_STUB[k] = THREE[k];
  THREE_STUB.WebGLRenderer = FakeRenderer;

  if (!window.matchMedia) {
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  }
  window.devicePixelRatio = 1;
  window.innerWidth = 1280;
  window.innerHeight = 720;
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
  window.addEventListener('error', e => errors.push('window error: ' + e.message));
  window.addEventListener('unhandledrejection', e => errors.push('rejection: ' + e.reason));
  Object.assign(window, { THREE: THREE_STUB });
  window.console.error = (...a) => { errors.push('console.error: ' + a.join(' ')); };
  if (quiet) window.console.log = () => {};

  const context = dom.getInternalVMContext();
  function run(expr, label = expr.slice(0, 60)) {
    try { return vm.runInContext(expr, context, { filename: label }); }
    catch (e) { errors.push(`[${label}] ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`); return undefined; }
  }
  run(code, 'boot');
  return { run, errors, window, dom, context };
}
