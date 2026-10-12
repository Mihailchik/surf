// Tells Bing, Yandex and the other IndexNow search engines which pages changed.
// RUN IT AFTER A PUSH THAT ADDS OR CHANGES PAGES, once GitHub Pages has
// finished the deploy (about a minute):
//
//   node tools/indexnow.mjs            every address in sitemap.xml
//   node tools/indexnow.mjs /ru/x/     only the given paths
//
// The key is not a secret: it is the name of a file in the site root, which is
// how the search engine checks that the request comes from the site owner.
// Google does not take part in IndexNow; it reads sitemap.xml.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HOST = 'surf.voidstudio.top';
const KEY = 'af70a0d2ad725cae6ad1e5cc2fdb47ab';

const args = process.argv.slice(2);
const urlList = args.length
  ? args.map(p => 'https://' + HOST + p)
  : [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: 'https://' + HOST + '/' + KEY + '.txt', urlList })
});
console.log(r.status, r.statusText, '-', urlList.length, 'addresses');
