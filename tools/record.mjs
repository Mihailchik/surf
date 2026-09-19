// Daily history recorder. Run by .github/workflows/history.yml at 05:00 Bangkok.
//
//   node tools/record.mjs                   forecast for today + actual for yesterday
//   node tools/record.mjs forecast          only today's forecast (kept if already recorded)
//   node tools/record.mjs actual 2026-09-14 actual for one day
//   node tools/record.mjs actual 2026-09-01 2026-09-14   a range (up to 90 days back)
//
// "forecast" is what the site showed that morning. "actual" is the model data for a
// day that has already passed, as Open-Meteo serves it afterwards. Both are scored
// with core.js, the same code the page runs.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HIST = path.join(ROOT, 'history');
const UA = 'surf.voidstudio.top (github.com/Mihailchik/surf)';

// load the shared scoring code
const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'core.js'), 'utf8') +
  '\n;globalThis.__core={REGIONS,ALL_SPOTS,spotsOf,TUNE,WAVE_MODELS,WIND_MODELS,pointsOf,metIndex,buildSpots};', ctx);
const C = ctx.__core;

const COLS = ['h', 'swell', 'period', 'sdir', 'wind', 'wdir', 'gust', 'tide', 'score'];
const r2 = v => v == null || Number.isNaN(v) ? null : Math.round(v * 100) / 100;
const bkkDate = (d = new Date()) => d.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).slice(0, 10);
const addDays = (date, n) => { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5);

async function jget(url, headers = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url.slice(0, 80));
      return await r.json();
    } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise(res => setTimeout(res, 5000 * attempt));
    }
  }
}

// the main Open-Meteo forecast host can go down while others stay up (19 Sep 2026)
// ask both hosts at once, first good answer wins
function jgetOM(url) {
  return Promise.any([jget(url), jget(url.replace('https://api.open-meteo.com/', 'https://previous-runs-api.open-meteo.com/'))]);
}

// span: extra query string, e.g. '&forecast_days=10' or '&past_days=3&forecast_days=1'
async function fetchRegion(region, span, withMet) {
  const spots = C.spotsOf(region);
  const { pts, base } = C.pointsOf(spots, span);
  const [m, w, tSea, mn] = await Promise.all([
    jget('https://marine-api.open-meteo.com/v1/marine?' + base +
      '&hourly=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,wind_wave_height&models=' + C.WAVE_MODELS.join(',')),
    jgetOM('https://api.open-meteo.com/v1/forecast?' + base +
      '&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation&wind_speed_unit=ms&models=' + C.WIND_MODELS.join(',')),
    jget('https://marine-api.open-meteo.com/v1/marine?' + base + '&hourly=sea_surface_temperature,sea_level_height_msl').catch(() => null),
    withMet ? jget('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' +
      C.REGIONS[region].wxLat.toFixed(2) + '&lon=' + C.REGIONS[region].wxLon.toFixed(2)).catch(() => null) : null
  ]);
  // NOAA WaveWatch III joins the wave median, as on the page
  const ww = await loadWW3(region, m[0].hourly.time).catch(() => null);
  let models = null;
  if (ww) {
    models = C.WAVE_MODELS.concat('ww3');
    for (const loc of m) {
      const h = loc.hourly;
      h.wave_height_ww3 = h.time.map(t => ww[t]?.h ?? null);
      h.wave_period_ww3 = h.time.map(t => ww[t]?.p ?? null);
      h.wave_direction_ww3 = h.time.map(t => ww[t]?.d ?? null);
    }
  }
  return C.buildSpots(spots, pts, { m, w, tSea }, C.metIndex(mn), null, models);
}

// WW3 series for the region's node over the given local hours, keyed like Open-Meteo times
async function loadWW3(region, times) {
  const P = C.REGIONS[region].ww3;
  const utc = t => new Date(new Date(t + ':00+07:00').getTime()).toISOString().slice(0, 13) + ':00:00Z';
  const idx = `%5B(${utc(times[0])}):1:(${utc(times[times.length - 1])})%5D%5B(0.0)%5D%5B(${P.lat})%5D%5B(${P.lon})%5D`;
  const j = await jget('https://pae-paha.pacioos.hawaii.edu/erddap/griddap/ww3_global.json?' +
    ['Thgt', 'Tper', 'Tdir'].map(v => v + idx).join(','));
  const cols = j.table.columnNames, ci = n => cols.indexOf(n), out = {};
  for (const r of j.table.rows) {
    const k = new Date(r[ci('time')]).toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).slice(0, 13).replace(' ', 'T') + ':00';
    const hgt = r[ci('Thgt')];
    out[k] = { h: hgt == null ? null : hgt * P.k, p: r[ci('Tper')], d: r[ci('Tdir')] };
  }
  return out;
}

// daylight rows of one date, compact
function pick(rowsBySpot, date, region) {
  const { dayFrom, dayTo } = C.REGIONS[region];
  const out = {};
  for (const [id, rows] of Object.entries(rowsBySpot)) {
    out[id] = rows.filter(r => r.t.startsWith(date))
      .filter(r => { const h = +r.t.slice(11, 13); return h >= dayFrom && h <= dayTo; })
      .map(r => [+r.t.slice(11, 13), r2(r.swell), r2(r.period), r2(r.sdir), r2(r.wind), r2(r.wdir), r2(r.gust), r2(r.tide), r2(r.score)]);
  }
  return out;
}

const dayFile = date => path.join(HIST, 'days', date + '.json');
const readDay = date => fs.existsSync(dayFile(date)) ? JSON.parse(fs.readFileSync(dayFile(date), 'utf8')) : { date, cols: COLS };
function writeDay(d) {
  fs.mkdirSync(path.dirname(dayFile(d.date)), { recursive: true });
  d.cols = COLS;
  fs.writeFileSync(dayFile(d.date), JSON.stringify(d) + '\n');
}

async function recordForecast(date) {
  const day = readDay(date);
  if (day.forecast) { console.log('forecast', date, 'already recorded'); return; }
  const spots = {};
  for (const region of Object.keys(C.REGIONS))
    Object.assign(spots, pick(await fetchRegion(region, '&forecast_days=10', true), date, region));
  day.forecast = { recordedAt: new Date().toISOString(), tune: C.TUNE, spots };
  writeDay(day);
  console.log('forecast', date, Object.keys(spots).length, 'spots');
}

async function recordActual(from, to) {
  const today = bkkDate();
  const past = daysBetween(from, today);
  if (past < 1 || past > 90) throw new Error('actual: ' + from + ' is out of range (1..90 days back)');
  const byRegion = {};
  for (const region of Object.keys(C.REGIONS))
    byRegion[region] = await fetchRegion(region, '&past_days=' + past + '&forecast_days=1', false);
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const day = readDay(date), spots = {};
    for (const region of Object.keys(C.REGIONS)) Object.assign(spots, pick(byRegion[region], date, region));
    day.actual = { recordedAt: new Date().toISOString(), tune: C.TUNE, spots };
    writeDay(day);
    console.log('actual', date);
  }
}

// index of days and one CSV per month for spreadsheets
function rebuildIndex() {
  const dir = path.join(HIST, 'days');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort().reverse() : [];
  const days = [], months = {};
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    days.push({ date: d.date, forecast: !!d.forecast, actual: !!d.actual });
    (months[d.date.slice(0, 7)] ||= []).push(d);
  }
  fs.writeFileSync(path.join(HIST, 'index.json'), JSON.stringify({ updated: new Date().toISOString(), days }, null, 1) + '\n');
  fs.mkdirSync(path.join(HIST, 'csv'), { recursive: true });
  const regionOf = id => C.ALL_SPOTS.find(s => s.id === id)?.region || 'phuket';
  for (const [month, list] of Object.entries(months)) {
    const lines = ['date,kind,region,spot,' + COLS.join(',')];
    for (const d of list.sort((a, b) => a.date.localeCompare(b.date)))
      for (const kind of ['forecast', 'actual'])
        for (const [id, rows] of Object.entries(d[kind]?.spots || {}))
          for (const row of rows) lines.push([d.date, kind, regionOf(id), id, ...row.map(v => v ?? '')].join(','));
    fs.writeFileSync(path.join(HIST, 'csv', month + '.csv'), lines.join('\n') + '\n');
  }
  console.log('index', days.length, 'days');
}

const [mode, a, b] = process.argv.slice(2);
const today = bkkDate();
if (!mode) {
  await recordForecast(today);
  await recordActual(addDays(today, -1), addDays(today, -1));
} else if (mode === 'forecast') {
  await recordForecast(today);
} else if (mode === 'actual') {
  const from = a || addDays(today, -1);
  await recordActual(from, b || from);
} else {
  throw new Error('unknown mode ' + mode);
}
rebuildIndex();
