// sha256 over every file under src/ except src/docs/, sorted by POSIX relative path.
// Each file contributes `<path relative to src, POSIX separators>\n<contents>`.
// Shared by token-sync (figma-sync.json sourceHash) and check-figma-sync.mjs.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : entry.isFile() ? [full] : [];
  });
}

export function computeSourceHash(srcDir = DEFAULT_SRC_DIR) {
  const files = listFiles(srcDir)
    .map((full) => ({ full, rel: relative(srcDir, full).split(sep).join('/') }))
    .filter(({ rel }) => rel !== 'docs' && !rel.startsWith('docs/'))
    .sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  const hash = createHash('sha256');
  for (const { full, rel } of files) {
    hash.update(rel + '\n');
    hash.update(readFileSync(full));
  }
  return hash.digest('hex');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.stdout.write(computeSourceHash(process.argv[2]) + '\n');
}
