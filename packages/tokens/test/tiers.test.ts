import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const src = join(root, 'src');

type Token = { path: string; collection: string; value: unknown; file: string };

const RAW_ONLY = ['primitives', 'typography-primitives'];
const ALLOWED_REFS: Record<string, string[]> = {
  semantics: ['primitives'],
  'typography-semantics': ['typography-primitives'],
  'icon-context': ['semantics', 'primitives'],
};
const MODE_FOLDERS = ['typography-semantics'];

function listJson(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return e.name === 'docs' ? [] : listJson(full);
    return e.name.endsWith('.json') ? [full] : [];
  });
}

function walk(node: Record<string, unknown>, path: string[], file: string, out: Token[]) {
  if ('$value' in node) {
    const figma = (node.$extensions as Record<string, { collection: string }>)['com.figma'];
    out.push({ path: path.join('.'), collection: figma.collection, value: node.$value, file });
    return;
  }
  for (const [k, v] of Object.entries(node))
    if (!k.startsWith('$')) walk(v as Record<string, unknown>, [...path, k], file, out);
}

const tokens: Token[] = [];
for (const file of listJson(src)) {
  walk(
    JSON.parse(readFileSync(file, 'utf8')),
    [],
    relative(src, file).split(sep).join('/'),
    tokens,
  );
}

const refOf = (v: unknown) => (typeof v === 'string' ? v.match(/^\{([^}]+)\}$/)?.[1] : undefined);
// Collection of each path; mode files repeat paths within the same collection.
const collectionOf = new Map(tokens.map((t) => [t.path, t.collection]));

describe('token tiers', () => {
  it('every token sits in the folder of its collection', () => {
    for (const t of tokens) expect(t.file.split('/')[0], t.path).toBe(t.collection);
  });

  it.each(RAW_ONLY)('%s holds raw values only', (col) => {
    const refs = tokens.filter(
      (t) => t.collection === col && typeof t.value === 'string' && t.value.includes('{'),
    );
    expect(refs.map((t) => t.path)).toEqual([]);
  });

  it.each(Object.keys(ALLOWED_REFS))('%s holds references only, to allowed collections', (col) => {
    const bad = tokens
      .filter((t) => t.collection === col)
      .flatMap((t) => {
        const ref = refOf(t.value);
        if (!ref) return [`${t.path}: raw value ${JSON.stringify(t.value)}`];
        const target = collectionOf.get(ref);
        if (!target) return [`${t.path}: unknown reference {${ref}}`];
        return ALLOWED_REFS[col].includes(target)
          ? []
          : [`${t.path}: references ${target} ({${ref}})`];
      });
    expect(bad).toEqual([]);
  });

  it.each(MODE_FOLDERS)('every %s mode file has the same token paths', (folder) => {
    const files = [...new Set(tokens.filter((t) => t.collection === folder).map((t) => t.file))];
    const pathsIn = (f: string) =>
      tokens
        .filter((t) => t.file === f)
        .map((t) => t.path)
        .sort();
    expect(files.length).toBeGreaterThan(0);
    for (const f of files.slice(1)) expect(pathsIn(f), f).toEqual(pathsIn(files[0]));
  });

  it('breakpoints.json and typography-semantics mode files match', () => {
    const breakpoints = JSON.parse(readFileSync(join(root, 'breakpoints.json'), 'utf8'));
    const modes = readdirSync(join(src, 'typography-semantics')).map((f) =>
      f.replace(/\.json$/, ''),
    );
    expect(Object.keys(breakpoints).sort()).toEqual(modes.sort());
    expect(Math.min(...(Object.values(breakpoints) as number[]))).toBe(0);
  });

  it('font families and weights exist in @jpm1475/ds-fonts', () => {
    const css = readFileSync(join(root, '..', 'fonts', 'fonts.css'), 'utf8');
    const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => ({
      family: m[1].match(/font-family:\s*"([^"]+)"/)?.[1],
      weight: m[1].match(/font-weight:\s*([\d ]+);/)?.[1].trim(),
    }));
    const families = new Set(faces.map((f) => f.family));
    const weights = new Set(
      faces.filter((f) => !f.family?.endsWith(' Fallback')).map((f) => Number(f.weight)),
    );

    const familyTokens = tokens.filter(
      (t) => t.collection === 'typography-primitives' && t.path.startsWith('Font-Family.'),
    );
    expect(familyTokens.length).toBeGreaterThan(0);
    for (const t of familyTokens) {
      const first = String(t.value).split(',')[0].trim().replace(/^"|"$/g, '');
      expect(families, `${t.path} = ${first}`).toContain(first);
    }

    const valueOf = new Map(tokens.map((t) => [t.path, t.value]));
    const usedWeights = tokens
      .filter((t) => t.collection === 'typography-semantics' && t.path.endsWith('.font-weight'))
      .map((t) => Number(valueOf.get(refOf(t.value) ?? '')));
    expect(usedWeights.length).toBeGreaterThan(0);
    for (const w of new Set(usedWeights)) expect(weights, `weight ${w}`).toContain(w);
  });

  it('icon-context has one token per Figma mode, each with its mode id', () => {
    const sync = JSON.parse(readFileSync(join(root, 'figma-sync.json'), 'utf8'));
    const modeIds = Object.keys(sync.collections['icon-context'].modes).sort();
    const icon = JSON.parse(readFileSync(join(src, 'icon-context', 'icon-context.json'), 'utf8'));
    const ids: string[] = [];
    const collect = (o: Record<string, unknown>) => {
      for (const v of Object.values(o) as Record<string, unknown>[]) {
        if ('$value' in v)
          ids.push((v.$extensions as Record<string, { modeId: string }>)['com.figma'].modeId);
        else collect(v);
      }
    };
    collect(icon);
    expect(ids.sort()).toEqual(modeIds);
  });

  it('CSS names are unique', () => {
    const names = [...collectionOf.keys()].map((p) =>
      p.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '-'),
    );
    expect(names.length).toBe(new Set(names).size);
  });
});
