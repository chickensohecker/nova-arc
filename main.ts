// Nova Arc — the entry program for best-game-01 (Node 22, standard library only).
//
// The game itself is plain static files under game/ (game/index.html and the ES
// modules it loads, no library, no network request). This program hands the entry
// in: it copies game/ and screenshots/ from beside this file into the output
// directory and writes /output/dossier.json, the summary the judge reads, using
// the vendored make.fun library. The grader runs this program twice and both runs
// must write the same bytes.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (from the kit's reference data): only text_max_bytes
// shapes the dossier's bytes; the other limits refuse an entry the scorer would
// refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in
// game/ or 48 MiB of game files in all, or a path under game/ over 1000 bytes).
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), {
    recursive: true,
  });
}

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, dossierOptions),
);
