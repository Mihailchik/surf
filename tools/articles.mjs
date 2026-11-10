// Builds the article pages. RUN IT AFTER ADDING OR EDITING AN ARTICLE.
//
//   node tools/articles.mjs
//
// An article is one file, articles/<lang>/<slug>.html: a JSON header inside an
// HTML comment, then the body as plain HTML. The tool wraps it in the page
// frame and writes <lang>/<slug>/index.html, the list at <lang>/index.html and
// sitemap.xml. The built pages are committed: GitHub Pages serves the files as
// they are, there is no build on the server.
//
// Header fields: title (the <title>, with the search phrase first), h1,
// description, date (YYYY-MM-DD), updated (optional), faq: [[question, answer]],
// key: the same word in every translation of one article, which is how the
// pages find each other for the language link and hreflang.
// The FAQ is printed at the end of the page and repeated as FAQPage data, which
// is what search engines and AI assistants quote.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://surf.voidstudio.top';
const GA = 'G-72CS4WJ571';
// Last substantive navigation/template update, not the build date.
const PAGE_UPDATED = '2026-11-10';
// pages that are not articles, kept in the sitemap
const STATIC = [['/', 'hourly'], ['/how.html', 'monthly'], ['/history.html', 'daily']];

const L = {
  ru: { back: '← Прогноз сейчас', section: 'Статьи', sectionTitle: 'Пляжи Пхукета: волны, веб-камеры, серфинг и закаты · Surf',
        sectionDesc: 'Волны по месяцам, сезон серфинга, пляжи и закаты Пхукета: коротко и с цифрами.',
        cta: 'Что на пляжах прямо сейчас', ctaSub: 'Волна, ветер, прилив и камеры по каждому пляжу',
        faq: 'Коротко', more: 'Ещё по теме', contents: 'В этой статье', hubTitle: 'Пляжи и море на Пхукете', hubLead: 'Выберите, что нужно для поездки: сезон волн, пляж для серфинга, камера перед выходом или место для заката.', updated: 'Обновлено', how: 'Как считаются баллы', locale: 'ru-RU' },
  en: { back: '← Forecast now', section: 'Guides', sectionTitle: 'Phuket beach guides: waves, webcams, surfing and sunsets · Surf',
        sectionDesc: 'Waves by month, the surf season, beaches and sunsets in Phuket, short and with numbers.',
        cta: 'What the beaches look like right now', ctaSub: 'Wave, wind, tide and live cams for every beach',
        faq: 'In short', more: 'Related guides', contents: 'On this page', hubTitle: 'Phuket beach and sea guides', hubLead: 'Plan a beach visit: check the wave season, choose a surf beach, look at a webcam or find a sunset spot.', updated: 'Updated', how: 'How the score works', locale: 'en-GB' }
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '');
const ld = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
const day = (d, lang) => new Date(d + 'T00:00:00Z').toLocaleDateString(L[lang].locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const CSS = `*{box-sizing:border-box}
:root{--bg:#f2f5f9;--card:#fff;--card2:#f7f9fc;--line:#e3e9f0;--tx:#0f1b2d;--dim:#4a5a6e;--acc:#0b7fc7;--sea:#bfe3fa;
--go:#00a5a5;--ok:#3d9b2f;--fair:#9d7c05;--bad:#d43a26;--shadow:0 1px 2px rgba(15,27,45,.05),0 2px 10px rgba(15,27,45,.05)}
:root[data-theme="dark"]{--bg:#0a0e14;--card:#121822;--card2:#0e141d;--line:#1e2836;--tx:#e8eef6;--dim:#94a3b8;--acc:#38b6ff;--sea:#123a55;
--go:#2fd8d8;--ok:#7ede4a;--fair:#f2d43a;--bad:#f0604a;--shadow:none}
html,body{margin:0;background:var(--bg);color:var(--tx)}
body{font:16px/1.6 -apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:640px;margin:0 auto;padding:10px 16px 60px}
.top{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0 4px;font-size:14px;font-weight:650}
.top span a{margin-left:14px}
a{color:var(--acc);text-decoration:none}
article a{text-decoration:underline;text-underline-offset:2px}
h1{font-size:27px;line-height:1.2;margin:16px 0 8px;letter-spacing:-.3px}
h2{font-size:20px;line-height:1.25;margin:32px 0 8px}
h3{font-size:16px;margin:18px 0 4px}
p{margin:0 0 12px}
ul{margin:0 0 12px;padding-left:20px}
li{margin:0 0 6px}
.lead{color:var(--dim);font-size:17px}
.meta{font-size:13px;color:var(--dim);margin:0 0 14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);padding:14px;margin:14px 0}
.tw{overflow-x:auto;margin:14px 0;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow)}
table{border-collapse:collapse;width:100%;font-size:14px;font-variant-numeric:tabular-nums}
th,td{padding:8px 10px;text-align:right;border-bottom:1px solid var(--line);white-space:nowrap}
th:first-child,td:first-child{text-align:left}
th{font-size:12px;font-weight:650;color:var(--dim);white-space:normal;vertical-align:bottom}
tr:last-child td{border-bottom:0}
td[style*="white-space:normal"]{min-width:140px}
tr.hi td{background:var(--card2);font-weight:600}
.bar{display:inline-block;height:8px;border-radius:4px;background:var(--acc);vertical-align:middle;margin-right:6px}
.small{font-size:13px;color:var(--dim)}
.cta{display:block;background:var(--acc);color:#fff;border-radius:14px;padding:14px 16px;margin:22px 0;font-weight:700}
.cta span{display:block;font-weight:500;font-size:14px;opacity:.9}
.faq h3{margin-top:14px}
.cam{position:relative;background:#000;aspect-ratio:16/9;width:100%;border-radius:14px;overflow:hidden;margin:10px 0 6px}
.cam iframe{width:100%;height:100%;border:0;display:block}
.cam img{width:100%;height:100%;object-fit:cover;display:block}
.list a{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);padding:12px 14px;margin:10px 0;font-weight:650}
.list a span{display:block;font-weight:400;font-size:14px;color:var(--dim)}
.contents{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:16px 0 22px;font-size:14px}
.contents b{display:block;margin-bottom:6px}
.contents ul{margin:0}
h2[id]{scroll-margin-top:16px}
a:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
.foot{margin-top:34px;font-size:13px;color:var(--dim)}`;

const head = ({ lang, title, description, url, extra = '' }) => `<!doctype html>
<html lang="${lang}">
<head>
<!-- Built by tools/articles.mjs from articles/. DO NOT EDIT HERE. -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  // a local test run is not a visit
  if(/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)) window['ga-disable-${GA}']=true;
  gtag('js', new Date());
  var up={ui_lang:'${lang}',ui_theme:'light',app_mode:'browser'};
  try{ up.ui_theme=localStorage.getItem('theme')||'light'; }catch(e){}
  gtag('set','user_properties',up);
  gtag('config', '${GA}');
  addEventListener('load',function(){ setTimeout(function(){
    if(window['ga-disable-${GA}']) return;
    var s=document.createElement('script'); s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id=${GA}'; document.head.appendChild(s); },0); });
  try{ if(localStorage.getItem('theme')==='dark') document.documentElement.dataset.theme='dark'; }catch(e){}
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="/surf-logo-icon-smooth.svg">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Surf">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title.replace(/ · Surf$/, ''))}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
${extra}<style>
${CSS}
</style>
</head>
<body>
<div class="wrap">
`;

const foot = lang => `<div class="foot"><a href="/">Surf</a> · <a href="/${lang}/">${L[lang].section}</a> · <a href="/how.html">${L[lang].how}</a> · made by <a href="https://voidstudio.top" rel="noopener">voidstudio.top</a></div>
</div>
</body>
</html>
`;

function load(lang) {
  const dir = path.join(ROOT, 'articles', lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = src.match(/^\s*<!--([\s\S]*?)-->/);
    if (!m) throw new Error(`${lang}/${f}: no JSON header`);
    const meta = JSON.parse(m[1]);
    for (const k of ['title', 'h1', 'description', 'date']) if (!meta[k]) throw new Error(`${lang}/${f}: no ${k}`);
    return { ...meta, lang, slug: f.replace(/\.html$/, ''), body: src.slice(m[0].length).trim() };
  }).sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.slug.localeCompare(b.slug));
}

const urls = [...STATIC.map(([p, f]) => ({ loc: SITE + p, freq: f, ...(p === '/' ? { mod: PAGE_UPDATED } : {}) }))];
const ALL = Object.fromEntries(Object.keys(L).map(l => [l, load(l)]));
const LANGS = Object.keys(L).filter(l => ALL[l].length);
// the same article in the other languages: [[lang, address]]
const twins = a => LANGS.map(l => [l, l === a.lang ? a : ALL[l].find(o => a.key && o.key === a.key)])
  .filter(([, o]) => o).map(([l, o]) => [l, `${SITE}/${l}/${o.slug}/`]);
const alt = list => list.length > 1 ? list.map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${u}">`).join('\n') + '\n' : '';
const sw = (list, lang) => list.filter(([l]) => l !== lang).map(([l, u]) => `<a href="${u.replace(SITE, '')}" hreflang="${l}">${l.toUpperCase()}</a>`).join('');
let count = 0;

for (const lang of Object.keys(L)) {
  const arts = ALL[lang];
  if (!arts.length) continue;
  const t = L[lang];
  for (const a of arts) {
    const url = `${SITE}/${lang}/${a.slug}/`;
    const upd = [a.updated || a.date, PAGE_UPDATED].sort().at(-1);
    const sections = [];
    let body = a.body.replace(/<h2>(.*?)<\/h2>/g, (_, title) => {
      const id = 'section-' + (sections.length + 1);
      sections.push({ id, title });
      return `<h2 id="${id}">${title}</h2>`;
    });
    const contents = sections.length ? `<nav class="contents" aria-label="${t.contents}"><b>${t.contents}</b><ul>${sections.map(s => `<li><a href="#${s.id}">${s.title}</a></li>`).join('')}</ul></nav>` : '';
    body = body.replace(/(<p class="lead">[\s\S]*?<\/p>)/, '$1\n' + contents);
    const data = [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.h1, description: a.description,
      inLanguage: lang, datePublished: a.date, dateModified: upd, mainEntityOfPage: url, image: SITE + '/og.png',
      author: { '@type': 'Organization', name: 'voidstudio', url: 'https://voidstudio.top/' },
      publisher: { '@type': 'Organization', name: 'Surf', url: SITE + '/' } }];
    data.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Surf', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: t.section, item: `${SITE}/${lang}/` },
      { '@type': 'ListItem', position: 3, name: a.h1, item: url }
    ] });
    if (a.faq?.length) data.push({ '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: a.faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(ans) } })) });
    const related = { waves: ['surf', 'flags', 'cams'], surf: ['waves', 'cams', 'flags'], sunset: ['cams', 'swim', 'waves'], cams: ['flags', 'surf', 'sunset'], flags: ['swim', 'cams', 'waves'], swim: ['flags', 'cams', 'waves'] };
    const priority = related[a.key] || [];
    const others = arts.filter(o => o !== a).sort((x, y) =>
      (priority.includes(x.key) ? priority.indexOf(x.key) : 99) - (priority.includes(y.key) ? priority.indexOf(y.key) : 99));
    const tw = twins(a);
    const html = head({ lang, title: a.title, description: a.description, url, extra: alt(tw) + data.map(ld).join('\n') + '\n' }) +
`<div class="top"><a href="/">${t.back}</a><span><a href="/${lang}/">${t.section}</a>${sw(tw, lang)}</span></div>
<article>
<h1>${a.h1}</h1>
<p class="meta">${t.updated} ${day(upd, lang)}</p>
${body}
${a.faq?.length ? `<section class="faq">\n<h2>${t.faq}</h2>\n${a.faq.map(([q, ans]) => `<h3>${q}</h3>\n<p>${ans}</p>`).join('\n')}\n</section>` : ''}
</article>
<a class="cta" href="/">${t.cta} →<span>${t.ctaSub}</span></a>
${others.length ? `<h2>${t.more}</h2>\n<div class="list">\n${others.map(o => `<a href="/${lang}/${o.slug}/">${o.h1}<span>${esc(o.description)}</span></a>`).join('\n')}\n</div>` : ''}
` + foot(lang);
    const out = path.join(ROOT, lang, a.slug);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'index.html'), html);
    urls.push({ loc: url, freq: 'monthly', mod: upd });
    count++;
  }
  const url = `${SITE}/${lang}/`;
  fs.writeFileSync(path.join(ROOT, lang, 'index.html'),
    head({ lang, title: t.sectionTitle, description: t.sectionDesc, url, extra: alt(LANGS.map(l => [l, `${SITE}/${l}/`])) + ld({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.hubTitle, description: t.sectionDesc, url, inLanguage: lang, mainEntity: { '@type': 'ItemList', itemListElement: arts.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.h1, url: `${SITE}/${lang}/${a.slug}/` })) } }) }) +
`<div class="top"><a href="/">${t.back}</a><span>${sw(LANGS.map(l => [l, `${SITE}/${l}/`]), lang)}</span></div>
<h1>${t.hubTitle}</h1>
<p class="lead">${t.hubLead}</p>
<div class="list">
${arts.map(o => `<a href="/${lang}/${o.slug}/">${o.h1}<span>${esc(o.description)}</span></a>`).join('\n')}
</div>
<a class="cta" href="/">${t.cta} →<span>${t.ctaSub}</span></a>
` + foot(lang));
  urls.push({ loc: url, freq: 'weekly', mod: PAGE_UPDATED });
}

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}<changefreq>${u.freq}</changefreq></url>`).join('\n') +
  '\n</urlset>\n');

console.log(`${count} articles, ${urls.length} addresses in sitemap.xml`);

// Keep crawlable guide navigation in the initial HTML, independent of forecasts.
const short = {
  en: { title: 'Before you go', all: 'All guides', cams: 'Live webcams', waves: 'Waves by month', sunset: 'Sunset spots' },
  ru: { title: 'Перед поездкой', all: 'Все статьи', cams: 'Веб-камеры', waves: 'Волны по месяцам', sunset: 'Места для заката' }
};
const panels = (compact) => LANGS.map(lang => {
  const t = short[lang];
  const arts = compact ? ['cams', 'waves', 'sunset'].map(key => ALL[lang].find(a => a.key === key)).filter(Boolean) : ALL[lang];
  return `<nav class="${compact ? 'guide-shortcuts' : 'guide-panel'}" data-guide-lang="${lang}" lang="${lang}" aria-label="${t.title}">
${compact ? '' : `<h2>${L[lang].hubTitle}</h2>`}
<div class="guide-links">${arts.map(a => `<a href="/${lang}/${a.slug}/">${compact ? t[a.key] : a.h1}${compact ? '' : `<span>${esc(a.description)}</span>`}</a>`).join('')}</div>
<a class="guide-all" href="/${lang}/">${t.all} →</a>
</nav>`;
}).join('\n');
const home = path.join(ROOT, 'index.html');
let main = fs.readFileSync(home, 'utf8');
for (const [name, compact] of [['shortcuts', true], ['guides', false]]) {
  const begin = `<!-- articles:${name}:begin -->`, end = `<!-- articles:${name}:end -->`;
  const start = main.indexOf(begin), finish = main.indexOf(end);
  if (start < 0 || finish < start) throw new Error(`Missing article navigation markers: ${name}`);
  main = main.slice(0, start) + begin + '\n' + panels(compact) + '\n' + main.slice(finish);
}
fs.writeFileSync(home, main);
