// Remove shadowed top-level function declarations (earlier duplicates are dead
// code, since the last declaration of a name wins for the whole script).
import fs from 'node:fs';
import * as acorn from 'acorn';

const path = process.argv[2];
const src = fs.readFileSync(path, 'utf8');
const m = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop();
const codeStart = m.index + m[0].indexOf('>') + 1;
const code = m[1];
const ast = acorn.parse(code, { ecmaVersion: 2022 });

const fns = ast.body.filter(n => n.type === 'FunctionDeclaration' && n.id && n.id.name);
const last = new Map();
for (const f of fns) last.set(f.id.name, f);
const dead = fns.filter(f => last.get(f.id.name) !== f);

// cut from the start of the line to the end of the line that closes the decl
const ranges = dead.map(f => {
  let s = f.start; while (s > 0 && code[s - 1] !== '\n') s--;
  let e = f.end; while (e < code.length && code[e] !== '\n') e++;
  return { s, e, name: f.id.name };
}).sort((a, b) => b.s - a.s);

let out = code;
for (const r of ranges) out = out.slice(0, r.s) + out.slice(r.e);

fs.writeFileSync(path, src.slice(0, codeStart) + out + src.slice(codeStart + code.length));
console.log('removed', ranges.length, 'shadowed declarations:');
console.log(ranges.map(r => r.name).reverse().join(', '));
