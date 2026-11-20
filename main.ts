// Leonida Platinum — the hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// It assembles the entry from this repository into the output directory the
// grader reads: the static guide under app/, the screenshots under
// screenshots/, and dossier.json written by the kit's vendored library
// (vendor/makefun-frontend.ts, untouched). Run it with:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const appDir = join(repoRoot, "app");
const shotsDir = join(repoRoot, "screenshots");

function fail(message) {
  throw new Error("leonida-platinum main.ts: " + message);
}

function checkInputs() {
  if (!existsSync(join(appDir, "index.html"))) fail("app/index.html is missing");
  if (!existsSync(join(appDir, "data", "trophies.json"))) fail("app/data/trophies.json is missing");
  if (!existsSync(shotsDir)) fail("screenshots/ is missing");
  const shots = readdirSync(shotsDir).filter((name) => !name.startsWith("."));
  if (shots.length < 3 || shots.length > 4) fail("expected 3 or 4 screenshots, found " + shots.length);
  for (const name of shots) {
    const bytes = statSync(join(shotsDir, name)).size;
    if (bytes > 262144) fail("screenshot " + name + " is over the 256 KiB cap (" + bytes + " bytes)");
  }
  return shots;
}

const shots = checkInputs();

mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });

// The scorer's own caps for this competition: the dossier text is capped at
// 160 KiB, at most 4 screenshots of 256 KiB each, app/ at most 993 entries
// and 48 MiB. Only text_max_bytes shapes the bytes; the rest refuse an entry
// the scorer would refuse, so passing them here fails fast in the same way.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, "dossier.json"), dossier);

console.log("leonida-platinum: handed in " + shots.length + " screenshots and app/ to " + outDir);
