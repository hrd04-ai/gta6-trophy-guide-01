[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hrd04-ai/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hrd04-ai/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze. Open `app/index.html` in a desktop browser and it works with the network off — no build step, no account, no server.

## What it does

- **Checklist tracker** — every trophy with its official name, description and grade. Tick trophies off as you earn them; progress is saved in the browser (localStorage) and shown as a big count, a progress bar, and a per-grade breakdown.
- **Export / import** — download your progress as JSON and import it back on any device.
- **Filters** — by kind (story, side stories, collectibles, activities, combat, exploration), by grade, by earned / not earned yet, plus free-text search. A "Missable only" filter shows just the flagged ones.
- **Spoiler setting** — "Hide story spoilers" replaces the names and descriptions of unearned story trophies (and their guides) with a hidden placeholder until you earn them.
- **Platinum roadmap** — four stages in the order to play them: story, side stories, activities and combat, then collectibles and cleanup, each with its own earned count.
- **Missables flagged** — 23 trophies tied to a named story mission, a character finale, or a single-attempt moment, with a plain explanation of what "missable" means here and the advice to keep a separate save before each one.
- **A guide to each trophy, in our own words, with sources** — what to do, where, and when it can be missed. Every guide cites its sources beside it. Where the official description names no place or step, the guide says so instead of inventing one.

## The data

`app/data/trophies.json` holds the official list: each trophy's official name, description and grade as PlayStation publishes them (Exophase and PSNProfiles, 18 Nov 2026), plus its kind, roadmap stage, missable flag, PSN count target where one exists, our own-words guide, and its sources. Names, descriptions and grades are the official list; the guides are original writing for this entry.

## Run it

```sh
# serve app/ with any static server, then open it
node serve.ts
# or: python3 -m http.server --directory app 8080
```

Then open http://localhost:8080. Everything runs from the files in `app/` — the app fetches only its own `data/trophies.json` and makes no network request.

Deep links: `?view=roadmap` or `?view=missables` opens that tab, `?open=17` opens a trophy's guide, `?spoiler=1` turns the spoiler setting on, `?demo=1` seeds 13 earned trophies so the progress view can be tried at a glance.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Official trophy list: [Exophase — Grand Theft Auto VI trophies](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- Counts and grades cross-check: [PSNProfiles — Grand Theft Auto VI](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)

## License

MIT — see `LICENSE`. No Rockstar Games logo or official artwork is used anywhere in this guide.
