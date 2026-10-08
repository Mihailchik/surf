# Surf

<p align="center">
  <img src="./surf-logo-icon-smooth.svg" alt="Surf logo" width="180">
</p>

Wave, wind, tide and live cams for Andaman Sea beaches in Phuket and Khao Lak.
One page, one question: is it worth going right now?

**https://surf.voidstudio.top**

## How it works

A single static HTML file. No backend, no API keys — every source is fetched
straight from the browser and works without registration.

One step stands in for a build. `index.html` carries a copy of `core.js` and
`grid.js`: GitHub Pages hands out every file in a separate round trip of about
0.3 s, and the page could not ask for the forecast until both had arrived.
**After any change to `core.js` run `node tools/inline.mjs`** and commit
`index.html` and `history.html` with it (`tools/grid.mjs` runs it by itself).
`core.js` stays the one place to edit; `history.html` and the recorder load the
file itself, so a stale copy would make the page score differently from the
history. A pre-commit check (`.git/hooks/pre-commit`, local to a clone) refuses
a commit with a stale copy.

### Sources

| Source | Provides |
|---|---|
| Open-Meteo Marine | swell height, period, direction, wind wave: DWD GWAM, MeteoFrance WAM, NOAA GFS-Wave 0.16°, ECMWF WAM |
| Open-Meteo Forecast | wind, gusts, precipitation: ECMWF, GFS, ICON |
| Open-Meteo Marine | tide and sea temperature |
| Open-Meteo Forecast | general weather, sunrise, UV |
| MET Norway | wind, a separate provider, part of the wind median |
| NOAA WaveWatch III (PacIOOS ERDDAP) | waves, a separate provider, part of the wave median (one open-sea node per region, scaled by 0.75 to near-shore) |
| Open-Meteo | wave and wind at three ocean watchpoints |
| Open-Meteo Forecast | weather tab and cloud by layer for the sunset score: ECMWF, GFS, ICON, JMA, GEM, UKMO |
| Open-Meteo Air Quality | aerosol depth for the sunset score |
| MET Norway | weather and cloud by layer, a separate provider |
| wttr.in | weather for 3 days (World Weather Online data), a separate provider |

Each value is the **median** across models, not the mean — a single outlier
cannot drag the result. Directions are averaged as vectors. The spread between
sources is shown next to the result; when it is wide, the forecast is unreliable
and the page says so.

Sources load independently with a 10 s timeout. A failed one does not break the
page: it is marked in the header (`sources 7/8`), named in a note above the
beaches, and drops out of the median. Only waves are required. Without the
Open-Meteo wind models the score uses MET Norway wind, and without any wind it
treats wind as neutral and says so. Beaches with no data are left out and
listed. With no waves at all the page says the forecast did not come through,
lists what is down, shows the live cameras and retries every minute. After 5 s
of loading it says the server is slow instead of spinning silently.

All sources go into one pot: whichever wave source answers first is drawn at
once, and the page redraws as the rest arrive. Two providers per quantity (waves:
Open-Meteo and NOAA; wind: Open-Meteo and MET Norway) matter more than many
models from one provider, which fail together. If Open-Meteo never answers, the
page runs on NOAA and MET Norway alone and says the precision is lower.

Open-Meteo's main forecast host (`api.open-meteo.com`) went down on
19 Sep 2026 while the marine host kept working. Wind and weather now fall back
to `previous-runs-api.open-meteo.com`, which serves the same models: it is asked
if the main host fails or is silent for 2.5 s, and asked first for 10 minutes
after a failure, on later page loads too. The history recorder asks both.

The slowest part is not traffic but Open-Meteo's compute time: 1.4-2.2 s per
request, whatever the size. The page shows what arrives, as it arrives: the
weather bar as soon as its request answers, then beaches from a 2-day request
(now and the next daylight window), then the full 10 days and the secondary
sources. Camera players start only after the data is on screen, so they do not
compete with it on a phone connection. The same goes for the analytics library,
the code of the weather and sunset tabs and the visit counter. The 10 days do
not wait for the reserve either: NOAA's server gets 1.2 s to join the median,
and a later answer is added when it lands.
The last good forecast is kept in the browser. On the next visit it is on
screen at once and the fresh one replaces it when it arrives; a forecast older
than 12 hours is not shown. Coming back to the tab within 30 minutes asks
nothing, and a hidden tab asks nothing at all.

### Requests

Open-Meteo counts every point of a request as a call, against 600 a minute and
10 000 a day per visitor. The models are coarser than the distance between
beaches: the 13 points around Phuket fall into 3 to 6 grid cells, depending on
the model. `tools/grid.mjs` finds which beaches share a cell and writes
`grid.js`; the page asks for one point per cell and hands the answer to every
beach in it. The numbers are the same as with a full request (checked point by
point on 7 Oct 2026). Run the tool after adding a beach; a beach it does not
know is simply asked by itself.

A page load used to cost about 190 calls; it is about 70 on a first visit and
about 40 after that. What went: the 2-day quick request when a forecast is
already on screen, the second Open-Meteo host on every request, and repeated
requests for NOAA WaveWatch III and MET Norway.

### When something does not answer

| What is down | What the page does |
|---|---|
| one wave or wind model | the median uses the rest; the header counts sources |
| Open-Meteo main forecast host | the spare host answers, see above |
| all of Open-Meteo, forecast under 6 h old on screen | keeps that forecast and says from when; it is better than the reserve |
| all of Open-Meteo, nothing recent | NOAA WaveWatch III and MET Norway, with a note that precision is lower |
| every wave source | outage screen with the live cameras, retry every minute |
| rate limit (HTTP 429) | last forecast stays, retries after 1, 2, 5, then 10 minutes |
| no network | last forecast with its time |
| weather or sunset providers | see Weather and sunset below |

Every source that fails is sent to Google Analytics as a `src_fail` event with
its name, so the owner can see how often visitors really go without it.

### Cameras

Kata (SSS Dive & Surf), Patong (Patong Tower), Karon (Marina Phuket Resort) —
direct links to the original streams, no keys. Other beaches have no public
camera pointing at the water.

## Weather and sunset

Two more tabs, loaded on first open.

**Weather** is a 10-day outlook from eight sources on three providers: six
models through Open-Meteo (ECMWF, GFS, ICON, JMA, GEM, UKMO), MET Norway, and
wttr.in with World Weather Online data for the first 3 days. Each day shows the
median and, when opened, every source by itself.

Open-Meteo is one host and has gone down before, so the other two are asked on
every load, each by itself. When Open-Meteo is silent the tab opens after 3 s
on MET Norway and wttr.in and says so. The sunset score then runs on MET
Norway's cloud layers, including four requests for the points out west, which
are made only in that case.

Providers checked on 7 Oct 2026 and left out: UCAR THREDDS (GFS with cloud
layers), 7timer and aviationweather.gov (airport METAR and TAF) answer without
a key but send no CORS header, so a browser cannot read them; they would need
a server-side job such as the history recorder. PacIOOS ERDDAP has GFS and
allows browsers, but its data requests timed out all day.
In the wet season a shower passes almost daily, so a rain icon says nothing.
The rows count what decides a day: millimetres and wet hours in daylight.
Thresholds live in `WX_TUNE` in `sky.js`. The best wave score of the day sits
next to the weather.

**Sunset** answers two questions: is it worth going tonight, and where to
stand.

- The score (0-10, `SUNSET_TUNE` in `sky.js`) is a first estimate and has not
  been checked against real sunsets yet. It takes cloud by layer over the coast
  from each model, low and mid cloud 80-420 km out along the sunset line (the
  light that paints the clouds comes in flat from there), rain and aerosol
  depth. Every model is scored by itself; the page shows the median and how far
  the models disagree.
- Places are in `SUNSET_PLACES`: beaches snapped to the OpenStreetMap
  coastline, with three standing points for long bays, and OSM viewpoints.
  `tools/horizon.mjs` walks 30 km west of each point over SRTM elevation tiles
  and writes `horizon.js`: how many degrees of land stand above the sea horizon
  in each direction. From that the page tells where the sun sets into the sea
  today, where a headland takes it early, and in which months each is true.
  Run the tool after editing the list: `node tools/horizon.mjs`.
- An opened place shows a small OpenStreetMap picture: where to stand and a
  line to where the sun goes down. Where land takes the sun early, the line
  stops at that land and goes on dotted. It is tiles laid out by hand with a
  drawing on top, no map library, and nothing is fetched until a place is
  opened.
- Sunset time and direction, the Moon, planets and meteor shower nights are
  computed on the page (Paul Schlyter's low-precision formulas, checked against
  the astronomy-engine library: sunset within seconds, planets within 0.1°).
  The eclipse table in `sky.js` was computed with astronomy-engine and runs to
  2036.

Elevation data is blurred along the shore and knows nothing of trees and
buildings, so a profile can be wrong by a rock or a hotel.

## Regions

Two regions, switched from the header or by URL hash: `/#phuket` (default) and
`/#khaolak`. Everything location-dependent lives in `REGIONS` (coordinates for
the weather bar and point sources, timezone, daylight hours). Beaches live in
`ALL_SPOTS` with a `region` field; spots without one belong to Phuket. Each
region keeps its own data cache.

**Khao Lak** spots: Khuk Khak (Memories Beach Bar, the main learner break),
Cape Pakarang (reef breaks that need more size), Bang Niang, Nang Thong, Pak
Weep and Bang Sak. Coordinates come from OpenStreetMap; profiles are first
estimates from local surf guides and have not been checked against sessions.
No public webcam points at the water there.

The Phuket list also carries **Khao Lak** (Khuk Khak beach, named when the row is opened) as a reference row: it is
shown at the end of the list but never enters the top or the verdict
(`noTop` flag).

## Scoring

Each hour gets a number 0–10 and a word from a six-step scale. The word and
colour follow the number as displayed, so the same number always has the same
colour. The number is rounded down (7.9 shows as 7) so a beach is never worse
than promised:

| shown | grade | meaning |
|---|---|---|
| 8–10 | EPIC | best it gets here |
| 6–7 | GOOD | what you come here for |
| 5 | FAIR | most waves are rideable |
| 3–4 | POOR | rare rideable waves, you have to hunt |
| 2 | VERY POOR | you can paddle, you will not ride |
| 0–1 | FLAT | nothing to catch |

A plain-language explainer with drawings and worked examples lives in
`how.html` (EN, RU, TH), linked from the page footer. Its example scores are
computed with the site's own formula for Kata; update them if `TUNE` changes.
When a beach is expanded, the unrounded score is shown next to the badge.

### Tuning

Every number that decides what counts as good lives in one block, `TUNE`, near
the top of the script: grade thresholds, factor weights, the size curve, the
no-wave ceiling and the gust limit for the danger banner. Change the numbers
there; nothing else in the code needs to move. Per-beach ranges (`swellMin`,
`swellMax`, `shelter`, preferred tide) stay in `ALL_SPOTS`.

The number is a weighted sum: wave size against the spot's working range (34%),
wind direction and strength (30%), period (20%), wave direction relative to the
shore (16%), plus a tide adjustment.

**Size also acts as a ceiling.** Without waves, good wind and a favourable
direction cannot add up to a passing score — there is still nothing to ride.

**Danger is separate.** Too much size for the break or storm gusts raise their
own red banner instead of being folded into the quality score, because a wave
that is too big and a wave that is too small are different problems.

Calibration log:
- 8 Sep 2026: a session at Nai Harn read as "very poor to poor"; thresholds
  shifted so the scale reproduces that.
- 14 Sep 2026: morning and 16–17h on the west coast were good, powerful and
  even; GOOD now starts at a displayed 6 (was 6.5).
- 14 Sep 2026: the site showed 3 at Nai Harn for 0.7 m at 13 s, the same as
  for 0.7 m at 5 s on 8 Sep, yet one was great and the other poor. Height is
  now scaled by period (`TUNE.swellPeriod`): 13 s scores 6, 5 s scores 2.
- 15 Sep 2026: Kata showed 8 in the morning and it was not an 8. Scores are
  now rounded down everywhere instead of to the nearest.

## History

Every morning at 05:00 Bangkok a GitHub Actions job (`.github/workflows/history.yml`)
runs `tools/record.mjs`. It saves two things per beach, hour by hour from 06 to 18:

- **forecast**: what the site showed that morning, recorded once and never
  overwritten;
- **actual**: Open-Meteo model data for the day that just passed, fetched the
  next morning.

Both are scored with `core.js`, the same file the page loads, so history and
site never drift apart. Each record also stores the `TUNE` it was scored with.

Files live in `history/`: one JSON per day in `days/`, a list in `index.json`,
a CSV per month in `csv/` for spreadsheets, and `sessions.json` with real
sessions (what the site said, what it felt like). `history.html` shows all of
it: a grid of days and beaches, hours for a picked day, and the sessions list.

The job commits as Mihailchik and asks Pages to rebuild, since pushes made with
the workflow token do not trigger a build on their own. Run it by hand from the
Actions tab (`history` → Run workflow) or locally:

```
node tools/record.mjs                          # today's forecast + yesterday's actual
node tools/record.mjs actual 2026-09-01 2026-09-14
```

"Actual" is still model output, not a measurement at the beach. Actual data was
backfilled from 1 Sep 2026; morning forecasts exist from 15 Sep 2026 on.

## Known limits

- **10-day horizon.** No wave forecast exists beyond that anywhere — the
  atmosphere is not modelled that far out.
- **Phuket is shielded by islands.** The Andaman and Nicobar chain lets through
  roughly 40% of ocean swell and cuts the period from 10 s to 5–6 s. Low numbers
  here are geography, not a broken model.
- **No wave ensemble** for this region — Open-Meteo returns empty nodes.
- **No cyclone feed.** GDACS and JTWC do not allow browser access, and a made-up
  warning would be worse than none.
- **Spot thresholds are not calibrated.** The working swell range and preferred
  tide for each break in `SPOTS` are estimates and need real sessions to verify.

## Attribution and terms

Code in this repository is MIT (see `LICENSE`). The data is not — each provider
sets its own terms, and they are met as follows.

**Open-Meteo** — data is CC BY 4.0 and requires attribution. The free tier is
limited to **non-commercial use** and 10 000 calls per day. This site is
non-commercial: no subscriptions, no advertising. Requests are made from each
visitor's own browser, so the daily limit applies per visitor, not to the site
as a whole. Adding ads or paid features would require a paid plan.

**MET Norway** — data is CC BY 4.0 and requires attribution. Their terms also
require an identifying User-Agent; a browser cannot set one, so requests carry
the Origin header instead, which their terms accept as the fallback. Data is
requested once per page load, far below their limits. Their terms forbid using
the Yr name or logo, or implying any affiliation — this site does neither.

**NOAA WaveWatch III via PacIOOS ERDDAP** — a work of the US government, in the
public domain. Credited in the footer.

**OpenStreetMap** — sunset places and the coastline they are snapped to come
from OpenStreetMap, © OpenStreetMap contributors, ODbL. Credited in the footer.

**Elevation** — Mapzen terrain tiles on AWS Open Data, built from SRTM (NASA,
public domain). Used once by `tools/horizon.mjs`, not by the page.

**wttr.in** — an open-source front end to World Weather Online data, free and
without a key, also without any promise of uptime. Credited in the footer.

**Aerosols** — Copernicus Atmosphere Monitoring Service, through Open-Meteo's
air quality API. Credited in the footer.

**Webcams** — the streams belong to SSS Phuket Dive & Surf (Kata), Patong Tower
(Patong) and Marina Phuket Resort (Karon). They are embedded from the original
sources and credited on every frame. Nothing is re-hosted, recorded or passed
off as this site's own. If an operator asks for their stream to be removed,
remove it.

**Visit counter** — hits.sh, a third-party service. It sees visitors' IP
addresses, as any external analytics does. Remove the `.hits` block to drop it.

**Google Analytics** — tag `G-72CS4WJ571` on all three pages. Google sets
cookies and sees visitors' IP addresses. There is no consent banner; one would
be needed before targeting EU visitors. Runs on `localhost` are not counted.

The library is not in the way of the forecast: events wait in `dataLayer`, and
the script itself is fetched once the forecast is on screen (on the other two
pages, once the page has loaded). The code of the weather and sunset tabs and
the hits.sh counter wait for the same moment.

Events, each with the region:

| Event | When | Parameters |
|---|---|---|
| `tab_open` | any tab but the first | `tab` |
| `beach_open` | a beach expanded | `beach` |
| `day_open` | a day opened in the 10-day tab | `beach`, `day_ahead` |
| `chip_tap` | a beach chip in the 10-day tab | `beach` |
| `map_open` | a Google Maps pin | `place`, `kind` (beach or sunset) |
| `cam_seen`, `cam_tap` | a camera 5 s on screen; a tap into the player | `beach` |
| `sources_open` | the table of every source | `where` (wave or sunset), `beach` |
| `wx_day_open` | a day opened in Weather | `day_ahead` |
| `place_open` | a place opened in Sunset | `place` |
| `fold_open` | "what makes a sunset", or the places behind land | `what` |
| `lang_set`, `theme_set`, `region_open` | language, theme, region switched | `lang`, `theme` |
| `first_paint` | first forecast on screen | `ms`, `speed`, `from` (cache, net or reserve) |
| `fresh_data` | first forecast from the network on screen | `ms`, `speed`, `from` |
| `page_state` | the page fell back | `state`: outage, reserve, kept_old, rate_limit, offline |
| `src_fail` | a data source did not answer | `src` |
| `retry_tap` | the retry button on the outage screen | |
| `hist_cell`, `hist_kind` | history page: a day opened, the view switched | `beach`, `kind` |

Everything opened is counted once per page view, except `beach_open`, which
keeps its old meaning of every opening. User properties: `ui_lang`, `ui_theme`,
`app_mode` (app when the site runs from the home screen). To see a parameter in
GA reports it has to be registered there as a custom dimension, `ms` as a
custom metric.

### What could actually go wrong

Not fines — none of these providers issue them. The realistic outcomes are:
rate limiting or a block from MET Norway if their terms are broken, a request
from a camera operator to stop embedding, and a requirement to move to a paid
Open-Meteo plan if the site ever becomes commercial. Attribution is a licence
condition in all three cases and is present in the page footer.

### Not a safety service

Forecasts are model output and can be wrong — the page shows the spread between
sources precisely because they often disagree. Do not use it as the sole basis
for decisions about entering the water.
