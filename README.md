[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hrd04-ai/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hrd04-ai/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: the official list with saved progress, filters and a
spoiler setting, a roadmap to the platinum, the missable trophies flagged, and
a guide to each trophy in our own words that cites its sources.

Made for the make.fun competition
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01)
("Build the best GTA 6 trophy guide", $250).

## What it does

- **Checklist tracker** — all 55 trophies with official name, description and
  grade (1 platinum, 2 gold, 6 silver, 46 bronze). Tick a trophy when you earn
  it; progress is saved in the browser (localStorage) automatically.
- **Export / import** — download your progress as JSON and import it back on
  any device. Reset clears it (with a confirm first).
- **Filters** — by kind (story, collectibles, activities, exploration, combat,
  misc, 100% completion, platinum), by grade, by search text, earned-only and
  missable-only.
- **Spoiler setting** — story trophies stay blurred (name and description
  hidden) until you earn them, unless you switch spoilers on.
- **Platinum roadmap** — five stages in order: story first, side strands and
  one-off moments, collectibles and exploring, activities/combat/money, then
  cleanup and the platinum. Each stage shows how many of its trophies you
  have earned.
- **Missables flagged** — 7 trophies are flagged missable (partner setups and
  one-off moments to clear before the final mission), with their own view.
- **A guide to every trophy** — in our own words, with its sources named
  beside it. Where the official description does not pin down a place or a
  step, the guide says so plainly instead of inventing one.

## Sources

Trophy names, descriptions and grades: the official PlayStation 5 list as
published on Exophase and PSNProfiles (18 Nov 2026). Progress targets
(counts): PSNProfiles. Every guide is written in our own words from the
official description — nothing is copied from another guide. No Rockstar logo
or official artwork is used anywhere.

## Run it offline

Static files, no build step, no network at run time:

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server and open `index.html`. The app
loads only its own files (`index.html`, `style.css`, `app.js`,
`data/trophies.json`).

## Hand in (the entry program)

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the kit's vendored
library (`vendor/makefun-frontend.ts`, unchanged):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `main.ts` — the hand-in program
- `app/index.html` — the guide page
- `app/app.js` — tracker logic (checklist, filters, spoiler setting, export/import, roadmap, missables)
- `app/style.css` — the look (dark "night" theme, coral accent)
- `app/data/trophies.json` — all 55 trophies: official name, description and grade, kind, missable flag, roadmap stage, PSN count where one exists, guide and sources
- `screenshots/` — 4 renders of the finished app (checklist, guide detail, roadmap, missables)
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `serve.ts` — local static server (kit file)

## License

MIT — see `LICENSE`.
