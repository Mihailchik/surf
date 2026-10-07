// Horizon profiles for the sunset places in sky.js. Run by hand after the list
// of places changes; the result is horizon.js, which the page loads.
//
//   node tools/horizon.mjs            only places that have no profile yet
//   node tools/horizon.mjs --force    everything again
//   node tools/horizon.mjs kata karon these places again
//
// For each point and each compass direction from 240° to 300° it walks out to
// 30 km over elevation tiles (Mapzen Terrarium on AWS Open Data: SRTM, about
// 38 m a pixel here, no key) and keeps how high the land stands above the sea
// horizon, in degrees. Zero means open sea: the sun goes down into the water.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'horizon.js');
const UA = 'surf.voidstudio.top (github.com/Mihailchik/surf)';

const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'core.js'), 'utf8') + '\n' + fs.readFileSync(path.join(ROOT, 'sky.js'), 'utf8') +
  '\n;globalThis.__sky={SUNSET_PLACES,HZ};', ctx);
const { SUNSET_PLACES, HZ } = ctx.__sky;

// distances along each ray, km: every 40 m near the shore, where the headlands
// are, growing by 8% a step out to 30 km
const DIST = []; for (let d = 0.1; d <= 30; d = Math.max(d + 0.04, d * 1.08)) DIST.push(+d.toFixed(3));
const AZ = []; for (let a = HZ.from; a <= HZ.to; a += HZ.step) AZ.push(a);
// Earth radius stretched by 7/6: air bends light, so we see a little past the curve
const R_EFF = 6371 * 7 / 6;
const EYE = 2;            // metres above the ground you stand on
const NEAR_KM = 0.5, NEAR_MIN = 10, FAR_MIN = 4;   // land lower than this is noise, metres
const rad = Math.PI / 180;
const Z = 12, N = 2 ** Z;

// minimal PNG reader: 8-bit RGB or RGBA, not interlaced, which is what the tiles are
function decodePng(buf) {
  let pos = 8, w = 0, h = 0, bpp = 3; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('latin1', pos + 4, pos + 8), body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = body.readUInt32BE(0); h = body.readUInt32BE(4);
      if (body[8] !== 8 || (body[9] !== 2 && body[9] !== 6) || body[12] !== 0) throw new Error('unexpected PNG format');
      bpp = body[9] === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(body);
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[dst + x - bpp] : 0, b = y ? out[dst - stride + x] : 0, c = x >= bpp && y ? out[dst - stride + x - bpp] : 0;
      let p = 0;
      if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[dst + x] = (raw[src + x] + p) & 255;
    }
  }
  return { w, h, bpp, data: out };
}

const tiles = new Map();
async function tile(x, y) {
  const key = x + '/' + y;
  if (!tiles.has(key)) tiles.set(key, (async () => {
    for (let attempt = 1; ; attempt++) {
      try {
        const r = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`,
          { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
        if (!r.ok) throw new Error('HTTP ' + r.status + ' tile ' + key);
        return decodePng(Buffer.from(await r.arrayBuffer()));
      } catch (e) {
        if (attempt >= 4) throw e;
        await new Promise(res => setTimeout(res, 3000 * attempt));
      }
    }
  })());
  return tiles.get(key);
}
// metres above sea level; the sea floor comes back negative and counts as 0
async function elevations(points) {
  const out = [];
  for (const [lat, lon] of points) {
    const fx = (lon + 180) / 360 * N, fy = (1 - Math.asinh(Math.tan(lat * rad)) / Math.PI) / 2 * N;
    const t = await tile(Math.floor(fx), Math.floor(fy));
    const px = Math.min(t.w - 1, Math.floor((fx % 1) * t.w)), py = Math.min(t.h - 1, Math.floor((fy % 1) * t.h)), i = (py * t.w + px) * t.bpp;
    out.push(t.data[i] * 256 + t.data[i + 1] + t.data[i + 2] / 256 - 32768);
  }
  return out;
}

async function profile(place, pt) {
  const pts = [[pt.lat, pt.lon]];
  for (const az of AZ) for (const d of DIST)
    pts.push([pt.lat + d * Math.cos(az * rad) / 111.19, pt.lon + d * Math.sin(az * rad) / (111.19 * Math.cos(pt.lat * rad))]);
  const el = await elevations(pts);
  const raw = (i, j) => j < 0 || j >= DIST.length ? 0 : Math.max(0, el[1 + i * DIST.length + j] ?? 0);
  // a lone pixel far above both neighbours is a hole in the data, not a hill
  const ray = (i, j) => { const h = raw(i, j), side = Math.max(raw(i, j - 1), raw(i, j + 1)); return h > side * 3 + 30 ? side : h; };
  // On a beach you stand at the water. On a viewpoint you stand on the highest
  // ground within 100 m: the elevation grid can put the platform itself a few
  // metres below its own rim.
  let ground = 0;
  if (place.kind === 'view') { ground = Math.max(0, el[0] ?? 0); AZ.forEach((_, i) => { ground = Math.max(ground, ray(i, 0)); }); }
  const eye = ground + EYE;
  const dip = -Math.acos(R_EFF / (R_EFF + eye / 1000)) / rad;      // where the sea horizon sits
  const a = [], d = [];
  AZ.forEach((_, i) => {
    let best = 0, at = 0;
    DIST.forEach((km, j) => {
      const h = ray(i, j);
      // The elevation data is blurred along the shore: sand and shallow water
      // read as a few metres of land. Next to you only a real headland counts.
      if (h < (km < NEAR_KM ? NEAR_MIN : FAR_MIN) || (place.kind === 'view' && j === 0)) return;
      const ang = Math.atan2(h - eye - km * km * 1000 / (2 * R_EFF), km * 1000) / rad - dip;
      if (ang > best) { best = ang; at = km; }
    });
    a.push(Math.round(best * 10) / 10); d.push(at);
  });
  return { h: Math.round(ground), a, d };
}

const args = process.argv.slice(2), force = args.includes('--force'), only = args.filter(x => !x.startsWith('--'));
let have = {};
if (fs.existsSync(OUT) && !force) {
  const m = fs.readFileSync(OUT, 'utf8').match(/const HORIZON=(\{[\s\S]*\});/);
  if (m) have = JSON.parse(m[1]);
}
for (const place of SUNSET_PLACES) {
  if (only.length ? !only.includes(place.id) : have[place.id]) continue;
  const rec = {};
  for (const pt of place.pts) rec[pt.k || 'p'] = await profile(place, pt);
  have[place.id] = rec;
  console.log(place.id.padEnd(13), Object.entries(rec).map(([k, r]) => k + ' ' + r.h + 'm [' + r.a.join(' ') + ']').join('\n' + ' '.repeat(14)));
}
// keep the order of sky.js and drop places that are gone
const result = {};
for (const place of SUNSET_PLACES) if (have[place.id]) result[place.id] = have[place.id];
fs.writeFileSync(OUT, '/* Generated by tools/horizon.mjs from SRTM elevation tiles. Do not edit by hand.\n' +
  '   Per place and standing point: h = ground height in metres, a = how many degrees the\n' +
  '   land rises above the sea horizon for each direction from ' + HZ.from + '° to ' + HZ.to + '° in steps of ' + HZ.step + '°\n' +
  '   (0 = open sea), d = distance to that land in km. */\n' +
  'const HORIZON=' + JSON.stringify(result).replace(/"(\w+)":\{"/g, '\n"$1":{"') + ';\n');
console.log('written', Object.keys(result).length, 'places');
