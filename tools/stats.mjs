// Visits and search numbers for surf.voidstudio.top, read with the service
// account. Changes nothing anywhere.
//
//   node tools/stats.mjs            from 2026-09-13 (first day of data) to today
//   node tools/stats.mjs 7          the last 7 days
//
// Needs the key file outside the repo: ~/.config/sitesurf/ga-key.json. The
// account must be a Viewer of the Analytics property and a user of the Search
// Console domain. The property also collects voidstudio.top and Glazomer, so
// every Analytics request here is filtered to the surf host.

import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';

const PROPERTY = '553928951';
const HOST = 'surf.voidstudio.top';
const GSC_SITE = 'sc-domain:voidstudio.top';

const key = JSON.parse(fs.readFileSync(os.homedir() + '/.config/sitesurf/ga-key.json', 'utf8'));
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
async function token(scope) {
  const now = Math.floor(Date.now() / 1000);
  const u = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: key.client_email, scope, aud: key.token_uri, iat: now, exp: now + 3000 });
  const sig = crypto.sign('RSA-SHA256', Buffer.from(u), key.private_key).toString('base64url');
  const r = await fetch(key.token_uri, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + u + '.' + sig });
  const j = await r.json();
  if (!j.access_token) throw new Error(JSON.stringify(j));
  return j.access_token;
}

const days = Number(process.argv[2]) || 0;
const iso = d => d.toISOString().slice(0, 10);
const end = iso(new Date());
const start = days ? iso(new Date(Date.now() - days * 864e5)) : '2026-09-13';
console.log(`${HOST}, ${start} to ${end}\n`);

// ---- Analytics ----
const ga = await token('https://www.googleapis.com/auth/analytics.readonly');
const range = { dateRanges: [{ startDate: start, endDate: end }] };
const host = { filter: { fieldName: 'hostName', stringFilter: { value: HOST } } };
const m = (...n) => n.map(name => ({ name }));
const desc = name => [{ metric: { metricName: name }, desc: true }];
const requests = [
  { ...range, dimensionFilter: host, metrics: m('totalUsers', 'newUsers', 'sessions', 'screenPageViews', 'averageSessionDuration') },
  { ...range, dimensionFilter: host, dimensions: m('date'), metrics: m('activeUsers', 'newUsers', 'sessions'), orderBys: [{ dimension: { dimensionName: 'date' } }], limit: 400 },
  { ...range, dimensionFilter: host, dimensions: m('sessionSource', 'sessionMedium'), metrics: m('sessions', 'totalUsers'), orderBys: desc('sessions'), limit: 15 },
  { ...range, dimensionFilter: host, dimensions: m('pagePath'), metrics: m('screenPageViews', 'totalUsers'), orderBys: desc('screenPageViews'), limit: 25 },
  { ...range, dimensionFilter: host, dimensions: m('eventName'), metrics: m('eventCount', 'totalUsers'), orderBys: desc('eventCount'), limit: 40 }
];
const rep = await (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:batchRunReports`,
  { method: 'POST', headers: { authorization: 'Bearer ' + ga, 'content-type': 'application/json' }, body: JSON.stringify({ requests }) })).json();
if (!rep.reports) throw new Error(JSON.stringify(rep));
const titles = ['TOTALS', 'BY DAY', 'SOURCES', 'PAGES', 'EVENTS'];
rep.reports.forEach((x, i) => {
  console.log('== ' + titles[i]);
  console.log([...(x.dimensionHeaders || []).map(d => d.name), ...x.metricHeaders.map(h => h.name)].join('\t'));
  for (const w of x.rows || []) console.log([...(w.dimensionValues || []).map(v => v.value), ...w.metricValues.map(v => v.value)].join('\t'));
  console.log();
});

// ---- Search Console ----
const sc = await token('https://www.googleapis.com/auth/webmasters.readonly');
const base = 'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(GSC_SITE);
const H = { authorization: 'Bearer ' + sc, 'content-type': 'application/json' };
const only = [{ filters: [{ dimension: 'page', operator: 'contains', expression: HOST }] }];
for (const dim of ['page', 'query', 'date']) {
  const r = await (await fetch(base + '/searchAnalytics/query', { method: 'POST', headers: H,
    body: JSON.stringify({ startDate: start, endDate: end, dimensions: [dim], dimensionFilterGroups: only, rowLimit: 50 }) })).json();
  const rows = (r.rows || []).filter(x => x.impressions > 0);
  console.log(`== GOOGLE SEARCH BY ${dim.toUpperCase()}` + (rows.length ? '' : ': nothing shown yet'));
  for (const x of rows) console.log(`${x.keys[0]}\tclicks ${x.clicks}\tshown ${x.impressions}\tposition ${x.position.toFixed(1)}`);
  console.log();
}
const maps = await (await fetch(base + '/sitemaps', { headers: H })).json();
console.log('== SITEMAPS');
for (const s of maps.sitemap || []) console.log(`${s.path}\tread ${s.lastDownloaded || 'not yet'}\terrors ${s.errors}\t` +
  (s.contents || []).map(c => `${c.type}: ${c.submitted} sent, ${c.indexed ?? '?'} indexed`).join('; '));
