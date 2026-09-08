# Surf

Wave, wind, tide and live cams for west-coast beaches. One page, one question:
is it worth going right now?

**https://surf.voidstudio.top**

## How it works

A single static HTML file. No build step, no backend, no API keys — every
source is fetched straight from the browser and works without registration.

### Sources

| Source | Provides |
|---|---|
| Open-Meteo Marine | swell height, period, direction, wind wave: DWD GWAM, MeteoFrance WAM, NOAA GFS-Wave 0.16°, ECMWF WAM |
| Open-Meteo Forecast | wind, gusts, precipitation: ICON, GFS, ECMWF, ARPEGE, JMA |
| Open-Meteo Marine | tide and sea temperature |
| Open-Meteo Forecast | general weather, sunrise, UV |
| MET Norway | wind, independent of Open-Meteo |
| NOAA WaveWatch III (PacIOOS ERDDAP) | total wave height, independent of Open-Meteo |
| Open-Meteo | wave and wind at three ocean watchpoints |

Each value is the **median** across models, not the mean — a single outlier
cannot drag the result. Directions are averaged as vectors. The spread between
sources is shown next to the result; when it is wide, the forecast is unreliable
and the page says so.

Sources load independently with a 15 s timeout. A failed one does not break the
page — it is marked in the header (`sources 7/8`) and drops out of the median.

### Cameras

Kata (SSS Dive & Surf), Patong (Patong Tower), Karon (Marina Phuket Resort) —
direct links to the original streams, no keys. Other beaches have no public
camera pointing at the water.

## Regions

The region comes from the URL hash: `/#phuket`. Phuket is the default and
currently the only one. Everything location-dependent lives in `REGIONS`
(coordinates, timezone, daylight hours); beaches live in `SPOTS`.

## Scoring

Each hour gets a number 0–10 and a word from a six-step scale:

| score | grade | meaning |
|---|---|---|
| 8.2+ | EPIC | best it gets here |
| 6.5+ | GOOD | what you come here for |
| 4.5+ | FAIR | most waves are rideable |
| 3.0+ | POOR | rare rideable waves, you have to hunt |
| 1.5+ | VERY POOR | you can paddle, you will not ride |
| below | FLAT | nothing to catch |

The number is a weighted sum: wave size against the spot's working range (34%),
wind direction and strength (30%), period (20%), wave direction relative to the
shore (16%), plus a tide adjustment.

**Size also acts as a ceiling.** Without waves, good wind and a favourable
direction cannot add up to a passing score — there is still nothing to ride.

**Danger is separate.** Too much size for the break or storm gusts raise their
own red banner instead of being folded into the quality score, because a wave
that is too big and a wave that is too small are different problems.

Thresholds were shifted on 8 Sep 2026 after a session at Nai Harn where
conditions read as "very poor to poor" — the scale now reproduces that.

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

**Webcams** — the streams belong to SSS Phuket Dive & Surf (Kata), Patong Tower
(Patong) and Marina Phuket Resort (Karon). They are embedded from the original
sources and credited on every frame. Nothing is re-hosted, recorded or passed
off as this site's own. If an operator asks for their stream to be removed,
remove it.

**Visit counter** — hits.sh, a third-party service. It sees visitors' IP
addresses, as any external analytics does. Remove the `.hits` block to drop it.

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
