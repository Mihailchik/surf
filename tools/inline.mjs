// Copies core.js and grid.js into index.html. RUN IT AFTER EVERY CHANGE TO
// core.js, and after tools/grid.mjs (which runs it by itself).
//
//   node tools/inline.mjs           write the copy
//   node tools/inline.mjs --check   say whether the copy is up to date, change nothing
//
// Why a copy: GitHub Pages hands out every file in a separate round trip of
// about 0.3 s, and the page could not ask for the forecast until core.js and
// grid.js had arrived. Inside the page they cost nothing. core.js stays the one
// place to edit: history.html and tools/record.mjs load the file itself, so a
// stale copy would make the page score differently from the history. The
// pre-commit check in .git/hooks refuses a commit with a stale copy.
//
// The tool also stamps the address of core.js in history.html with a hash of
// its content, so a browser never keeps an old core.js after a change.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const FILES = ['core.js', 'grid.js'];
const BEGIN = '<!-- inline:begin -->', END = '<!-- inline:end -->';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const parts = FILES.map(f => {
  const src = read(f);
  if (/<\/script/i.test(src)) throw new Error(f + ' contains </script and cannot be put inside the page');
  return '/* ---- ' + f + ' ---- */\n' + src.trimEnd() + '\n';
});
const block = BEGIN + '\n<script>\n' +
  '/* core.js and grid.js, copied in by tools/inline.mjs so that the first forecast\n' +
  '   does not wait for two more files. DO NOT EDIT HERE: edit core.js, or run\n' +
  '   tools/grid.mjs, then run  node tools/inline.mjs */\n' +
  parts.join('') + '</script>\n' + END;

const out = {};
const index = read('index.html');
const a = index.indexOf(BEGIN), b = index.indexOf(END);
if (a < 0 || b < a) throw new Error('index.html has no ' + BEGIN + ' ... ' + END + ' markers');
out['index.html'] = index.slice(0, a) + block + index.slice(b + END.length);

const stamp = crypto.createHash('sha1').update(read('core.js')).digest('hex').slice(0, 8);
const history = read('history.html');
if (!/core\.js\?v=\w+/.test(history)) throw new Error('history.html does not load core.js?v=...');
out['history.html'] = history.replace(/core\.js\?v=\w+/, 'core.js?v=' + stamp);

const stale = Object.keys(out).filter(f => out[f] !== read(f));
if (process.argv.includes('--check')) {
  if (stale.length) {
    console.error('The copy of core.js and grid.js inside the page is out of date (' + stale.join(', ') + ').\n' +
      'Run:  node tools/inline.mjs   and commit ' + Object.keys(out).join(' and ') + ' with your change.');
    process.exit(1);
  }
  console.log('inline copy is up to date');
} else {
  for (const f of stale) fs.writeFileSync(path.join(ROOT, f), out[f]);
  console.log(stale.length ? 'updated ' + stale.join(', ') : 'nothing to update');
}
