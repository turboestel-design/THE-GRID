// Bundles the split source back into one self-contained file for sharing.
// Usage: npm run build   ->  the-grid.html
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// inline the stylesheet
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/, (_, href) => {
  const css = fs.readFileSync(path.join(ROOT, href), 'utf8');
  return `<style>\n${css}</style>`;
});

// inline every local script, keeping order
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  if (/^https?:/.test(src)) return m;                     // three.js stays on the CDN
  const js = fs.readFileSync(path.join(ROOT, src), 'utf8');
  return `<script>\n${js}</script>`;
});

const out = path.join(ROOT, 'the-grid.html');
fs.writeFileSync(out, html);
console.log(`built the-grid.html — ${(html.length / 1024).toFixed(0)} KB, ${html.split('\n').length} lines, single file`);
