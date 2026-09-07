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
| Open-Meteo Marine | swell height, period, direction, wind wave — DWD GWAM, MeteoFrance WAM, ECMWF WAM |
| Open-Meteo Forecast | wind, gusts, precipitation — ICON, GFS, ECMWF, ARPEGE, JMA |
| Open-Meteo Marine | tide and sea temperature |
| Open-Meteo Forecast | general weather, sunrise, UV |
| MET Norway | wind, independent of Open-Meteo |
| NOAA WaveWatch III (PacIOOS ERDDAP) | total wave height, independent |
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

0–10 per hour, weighted: swell size against the spot's working range (34%),
wind direction and strength (30%), period (20%), swell direction relative to
the shore (16%), plus a tide adjustment.

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
