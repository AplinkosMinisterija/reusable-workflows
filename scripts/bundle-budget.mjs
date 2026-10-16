#!/usr/bin/env node
/**
 * Keeps a frontend from growing a megabyte at a time. Measures the built
 * assets GZIPPED (what the user actually downloads) and compares them against
 * a budget committed in the repo.
 *
 *   node ~/.claude/scripts/bundle-budget.mjs --init     # write the budget from today's build
 *   node ~/.claude/scripts/bundle-budget.mjs            # check against it
 *
 * Reads `dist/` (override with --dir). The budget lives in
 * `.bundle-budget.json` and `--init` sets it at the current size plus 10%
 * headroom, so the first commit never fails and the next careless import does.
 */
import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const at = (flag) => (argv.indexOf(flag) === -1 ? null : argv[argv.indexOf(flag) + 1]);
const dir = at('--dir') || 'dist';
const init = argv.includes('--init');
const BUDGET = '.bundle-budget.json';
const HEADROOM = 1.1;

if (!existsSync(dir)) {
  console.log(`bundle-budget: no ${dir}/ — run the build first`);
  process.exit(0);
}

const walk = (d, out = []) => {
  for (const entry of readdirSync(d)) {
    const full = path.join(d, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

/** Gzipped bytes per kind, which is what crosses the wire. */
const measured = { js: 0, css: 0 };
for (const file of walk(dir)) {
  const ext = path.extname(file).slice(1);
  if (ext !== 'js' && ext !== 'css') continue;
  measured[ext] += gzipSync(readFileSync(file)).length;
}

const kb = (bytes) => Math.round(bytes / 1024);

if (init) {
  const budget = {
    note: 'Gzipped KB. Raise it deliberately, in the PR that needs the room.',
    js: Math.ceil((measured.js * HEADROOM) / 1024),
    css: Math.ceil((measured.css * HEADROOM) / 1024),
  };
  writeFileSync(BUDGET, `${JSON.stringify(budget, null, 2)}\n`);
  console.log(`bundle-budget: wrote ${BUDGET} — js ${budget.js} KB, css ${budget.css} KB (now: ${kb(measured.js)} / ${kb(measured.css)})`);
  process.exit(0);
}

if (!existsSync(BUDGET)) {
  console.log(`bundle-budget: no ${BUDGET} — run with --init once and commit it`);
  process.exit(0);
}

const budget = JSON.parse(readFileSync(BUDGET, 'utf8'));
const over = [];
for (const kind of ['js', 'css']) {
  const limit = budget[kind];
  if (typeof limit !== 'number') continue;
  if (kb(measured[kind]) > limit) {
    over.push(`${kind}: ${kb(measured[kind])} KB gzipped, budget ${limit} KB`);
  }
}

if (!over.length) {
  console.log(`bundle-budget: js ${kb(measured.js)}/${budget.js} KB, css ${kb(measured.css)}/${budget.css} KB gzipped`);
  process.exit(0);
}
console.log('bundle-budget: over budget');
for (const line of over) console.log(`  - ${line}`);
console.log('  Either justify the growth and raise the budget in this PR, or lazy-load it.');
process.exit(1);
