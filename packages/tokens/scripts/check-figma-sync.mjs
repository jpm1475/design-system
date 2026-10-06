// CI guard: fails when src/ changed since the last Figma sync (figma-sync.json).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeSourceHash } from './source-hash.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(readFileSync(join(root, 'figma-sync.json'), 'utf8'));
const actual = computeSourceHash(join(root, 'src'));

if (actual !== snapshot.sourceHash) {
  console.error(
    'Token source changed since the last Figma sync. Run token-sync push (or sync) in Claude Code, commit figma-sync.json, and push again.',
  );
  console.error(`  expected ${snapshot.sourceHash}\n  actual   ${actual}`);
  process.exit(1);
}
console.log(`figma-sync: in sync (synced ${snapshot.syncedAt})`);
