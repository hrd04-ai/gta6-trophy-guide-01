// Leonida Platinum Road — a GTA VI trophy guide entry for gta6-trophy-guide-01.
//
// The guide itself is plain static files under app/: an index.html page, its
// stylesheet, a couple of small ES modules, and the trophy data in
// app/data/trophies.json. It opens in a browser and works with the network
// off — it loads nothing from outside app/.
//
// This program is the hand-in: it copies app/ and screenshots/ from beside
// this file into /output and writes /output/dossier.json, the summary the
// judge reads (the screenshots, the first load's files and bytes, and the
// source), using the vendored make.fun library. That library file,
// vendor/makefun-frontend.ts, stays exactly as the kit ships it — the scorer
// rebuilds the dossier with its own copy and compares the two byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));

const shotsDir = join(repoRoot, 'screenshots');
const shotFiles = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => !name.startsWith('.')).sort()
  : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`Expected 3 or 4 screenshots, found ${shotFiles.length}.`);
}
copyTree(shotsDir, join(outputDir, 'screenshots'));

// The scorer's own caps for this competition: the dossier text is capped at
// 163,840 bytes, screenshots at 4 files of 256 KiB each, app/ at 993 files
// and directories and 48 MiB in all.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Leonida Platinum Road handed in: ${shotFiles.length} screenshots, dossier written to ${join(outputDir, 'dossier.json')}.`);
