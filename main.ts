// Leonida Platinum — entry program for make.fun gta6-trophy-guide-01.
//
// Hands the guide in: copies app/ and screenshots/ from this repository
// into the output directory and writes /output/dossier.json with the kit's
// buildDossier. Runs on plain Node 22 with the standard library only; no
// build step and no install. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || "/output");

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function copyEntryTree(name: string): void {
  const from = join(REPO_ROOT, name);
  const to = join(OUTPUT_DIR, name);
  if (!existsSync(from)) throw new Error(`missing ${name}/ in the repository`);
  cpSync(from, to, { recursive: true });
}

function handInGuide(): void {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyEntryTree("app");
  copyEntryTree("screenshots");
  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), dossier);
  console.log(`handed in: ${OUTPUT_DIR} (dossier.json ${dossier.length} bytes)`);
}

handInGuide();
