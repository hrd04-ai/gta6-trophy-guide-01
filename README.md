[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hrd04-ai/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hrd04-ai/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum Road — GTA VI Trophy Guide & Tracker

An offline web app that is the best guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: the official list with saved progress, filters and a spoiler setting, a roadmap to the platinum, the missable trophies flagged, and a guide to each trophy in our own words that cites its sources.

## What it does

- **Checklist tracker** — tick a trophy off and it stays ticked. Progress is saved in your browser (localStorage), with **export** to a JSON file and **import** back. No account, no network, nothing leaves your machine.
- **Filters** — by kind (story, story mission, strangers & side, activities, collectibles, combat, completion), by grade, by missable-only, by remaining-only, plus free-text search across names, descriptions and guides.
- **Spoiler setting** — hides the names and descriptions of story and mission trophies until you earn them, so the guide never spoils the plot.
- **Roadmap to the platinum** — five stages in play order: story, strangers & side, explore & collect, the grinds, then 100% completion and the platinum. Each stage lists its trophies with a live earned count.
- **Missables flagged** — 11 trophies tied to a single story moment or a single move, each with its safety net (mission replay from the pause menu, or retry the move until it lands).
- **A guide to each trophy, in our own words** — what to do, where, and when it can be missed, with the PSN progress target where PlayStation tracks one (250 stunts, 42 Shooting Range challenges, 100 WAiNK locations, and the rest).
- **Next up** — the first unearned trophy in roadmap order, always visible above the checklist.

## The data

`app/data/trophies.json` holds the official 55: 1 platinum, 2 gold, 6 silver, 46 bronze. Names, descriptions and grades are exactly as PlayStation publishes them. Sources:

- [Exophase — the official trophy list](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) (names, descriptions, grades)
- [PSNProfiles — GTA VI trophies](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) (the counts PlayStation tracks)
- Our own advice, built from the official descriptions — not yet checked in the game. Where a place is not pinned down, the guide says so instead of inventing one.

GTA VI launched on 2026-11-19 and this guide was built a day later. The trophy list is official and frozen; the guides are our own reading of those descriptions. A cited guide that admits what it does not know beats a confident one that invents a location.

## Run it offline

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server. The app loads nothing from the network: every script, stylesheet and data file is under `app/`, and it makes no requests at run time.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`, which stays exactly as the kit ships it.

## Screenshots

`1-checklist.jpg` is the cover: the checklist with a guide open, progress seeded, filters visible. Then the roadmap, the missables page, and a guide with its sources — all real renders of this app.

## License

MIT. An unofficial, fan-made guide — not affiliated with Rockstar Games or PlayStation. No Rockstar logo or official artwork is used anywhere.
