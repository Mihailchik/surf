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
// description, date (YYYY-MM-DD), updated (optional), faq: [[question, answer]].
// The FAQ is printed at the end of the page and repeated as FAQPage data, which
// is what search engines and AI assistants quote.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://surf.voidstudio.top';
const GA = 'G-72CS4WJ571';
// pages that are not articles, kept in the sitemap
const STATIC = [['/', 'hourly'], ['/how.html', 'monthly'], ['/history.html', 'daily']];

const L = {
  ru: { back: '← Прогноз сейчас', section: 'Статьи', sectionTitle: 'Серфинг и море на Пхукете: статьи · Surf',
        sectionDesc: 'Волны по месяцам, сезон серфинга, пляжи и закаты Пхукета: коротко и с цифрами.',
        cta: 'Что на пляжах прямо сейчас', ctaSub: 'Волна, ветер, прилив и камеры по каждому пляжу',
        faq: 'Коротко', more: 'Ещё статьи', updated: 'Обновлено', how: 'Как считаются баллы', locale: 'ru-RU' },
  en: { back: '← Forecast now', section: 'Guides', sectionTitle: 'Surfing and the sea in Phuket: guides · Surf',
        sectionDesc: 'Waves by month, the surf season, beaches and sunsets in Phuket, short and with numbers.',
        cta: 'What the beaches look like right now', ctaSub: 'Wave, wind, tide and live cams for every beach',
        faq: 'In short', more: 'More guides', updated: 'Updated', how: 'How the score works', locale: 'en-GB' }
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
tr.hi td{background:var(--card2);font-weight:600}
.bar{display:inline-block;height:8px;border-radius:4px;background:var(--acc);vertical-align:middle;margin-right:6px}
.small{font-size:13px;color:var(--dim)}
.cta{display:block;background:var(--acc);color:#fff;border-radius:14px;padding:14px 16px;margin:22px 0;font-weight:700}
.cta span{display:block;font-weight:500;font-size:14px;opacity:.9}
.faq h3{margin-top:14px}
.list a{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);padding:12px 14px;margin:10px 0;font-weight:650}
.list a span{display:block;font-weight:400;font-size:14px;color:var(--dim)}
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

const urls = [...STATIC.map(([p, f]) => ({ loc: SITE + p, freq: f }))];
let count = 0;

for (const lang of Object.keys(L)) {
  const arts = load(lang);
  if (!arts.length) continue;
  const t = L[lang];
  for (const a of arts) {
    const url = `${SITE}/${lang}/${a.slug}/`;
    const upd = a.updated || a.date;
    const data = [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.h1, description: a.description,
      inLanguage: lang, datePublished: a.date, dateModified: upd, mainEntityOfPage: url, image: SITE + '/og.png',
      author: { '@type': 'Organization', name: 'voidstudio', url: 'https://voidstudio.top/' },
      publisher: { '@type': 'Organization', name: 'Surf', url: SITE + '/' } }];
    if (a.faq?.length) data.push({ '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: a.faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(ans) } })) });
    const others = arts.filter(o => o !== a);
    const html = head({ lang, title: a.title, description: a.description, url, extra: data.map(ld).join('\n') + '\n' }) +
`<div class="top"><a href="/">${t.back}</a><a href="/${lang}/">${t.section}</a></div>
<article>
<h1>${a.h1}</h1>
<p class="meta">${t.updated} ${day(upd, lang)}</p>
${a.body}
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
    head({ lang, title: t.sectionTitle, description: t.sectionDesc, url }) +
`<div class="top"><a href="/">${t.back}</a></div>
<h1>${t.section}</h1>
<div class="list">
${arts.map(o => `<a href="/${lang}/${o.slug}/">${o.h1}<span>${esc(o.description)}</span></a>`).join('\n')}
</div>
<a class="cta" href="/">${t.cta} →<span>${t.ctaSub}</span></a>
` + foot(lang));
  urls.push({ loc: url, freq: 'weekly' });
}

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}<changefreq>${u.freq}</changefreq></url>`).join('\n') +
  '\n</urlset>\n');

console.log(`${count} articles, ${urls.length} addresses in sitemap.xml`);
