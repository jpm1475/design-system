// DTCG source files -> Figma variable values (reverse of figma-to-dtcg.mjs). Dependency-free Node ESM.
// Used by token-sync for push / dry-run push, and to prove a pull is lossless.
//
// dtcgToFigma(srcDir, collections) returns { [variableId]: { [modeId]: value } } where value is in
// snapshot form: raw Figma value (number, string, { r, g, b, a }), { alias: "<variableId>" }, or
// { alias, opacity } for an alias with an opacity modifier. Tokens without a variableId (new in code)
// are returned under `added` instead, keyed by code path.
//
// `collections` is figma-sync.json's "collections" block: { <name>: { id, defaultModeId, modes: { <modeId>: <modeName> } } }.
// Mode files map to modes by lowercased mode name; single-mode collections use their only mode.
//
// CLI: node scripts/dtcg-to-figma.mjs [figma-sync.json]
//   compares src/ (converted back) with the snapshot's variables, prints the diff, exits 1 on any diff.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function listJson(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return e.name === 'docs' && dir.endsWith('src') ? [] : listJson(full);
    return e.name.endsWith('.json') ? [full] : [];
  });
}

/** Every token in src/ as { collectionDir, modeFile, path, token }. */
export function readTokens(srcDir) {
  const out = [];
  for (const file of listJson(srcDir)) {
    const rel = relative(srcDir, file).split(sep);
    const collectionDir = rel[0];
    const modeFile = rel[rel.length - 1].replace(/\.json$/, '');
    const walk = (o, p) => {
      for (const [k, x] of Object.entries(o)) {
        if (k.startsWith('$') || !x || typeof x !== 'object') continue;
        if ('$value' in x)
          out.push({ collectionDir, modeFile, path: [...p, k].join('.'), token: x });
        else walk(x, [...p, k]);
      }
    };
    walk(JSON.parse(readFileSync(file, 'utf8')), []);
  }
  return out;
}

function parseColor(v) {
  if (v.startsWith('#')) {
    const h = v.slice(1);
    const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r: n[0], g: n[1], b: n[2], a };
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`unsupported color "${v}"`);
  const p = m[1].split(',').map((s) => Number(s.trim()));
  return { r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p.length > 3 ? p[3] : 1 };
}

/** Convert one token's $value back to its Figma value (aliases need pathToId). */
export function tokenToFigmaValue(token, pathToId) {
  const ext = token.$extensions?.['com.figma'] ?? {};
  const v = token.$value;
  if (typeof v === 'string' && /^\{[^}]+\}$/.test(v)) {
    const target = v.slice(1, -1);
    const id = pathToId[target];
    if (!id) throw new Error(`reference ${v} has no Figma variable id`);
    return ext.aliasOpacity !== undefined
      ? { alias: id, opacity: ext.aliasOpacity }
      : { alias: id };
  }
  switch (token.$type) {
    case 'color':
      return parseColor(v);
    case 'dimension':
      if (typeof v === 'string' && v.endsWith('rem')) return parseFloat(v) * 16;
      if (typeof v === 'string' && v.endsWith('px')) return parseFloat(v);
      throw new Error(`unsupported dimension "${v}"`);
    case 'fontWeight':
      return ext.figmaType === 'STRING' ? String(v) : Number(v);
    case 'fontFamily': {
      const first = Array.isArray(v) ? v[0] : String(v).split(',')[0];
      return first.trim().replace(/^["']|["']$/g, '');
    }
    case 'number':
      return ext.figmaUnit === 'percent' ? Math.round(v * 100 * 1e6) / 1e6 : v;
    default:
      return v;
  }
}

export function dtcgToFigma(srcDir, collections) {
  const tokens = readTokens(srcDir);
  const pathToId = {};
  for (const t of tokens) {
    const id = t.token.$extensions?.['com.figma']?.variableId;
    if (id) pathToId[t.path] = id;
  }
  const modeIdFor = (collectionName, modeFile) => {
    const c = collections[collectionName];
    if (!c) throw new Error(`unknown collection ${collectionName}`);
    const modes = Object.entries(c.modes);
    if (modes.length === 1) return modes[0][0];
    const hit = modes.find(([, name]) => name.toLowerCase() === modeFile);
    if (!hit) throw new Error(`no mode "${modeFile}" in ${collectionName}`);
    return hit[0];
  };
  const values = {};
  const added = {};
  for (const t of tokens) {
    const ext = t.token.$extensions?.['com.figma'] ?? {};
    const collection = ext.collection ?? t.collectionDir;
    const modeId = modeIdFor(collection, t.modeFile);
    const value = tokenToFigmaValue(t.token, pathToId);
    if (ext.variableId) (values[ext.variableId] ??= {})[modeId] = value;
    else (added[t.path] ??= { collection, values: {} }).values[modeId] = value;
  }
  return Object.assign(values, Object.keys(added).length ? { added } : {});
}

/** Equality in Figma terms: numbers compared as float32 (Figma's storage precision). */
export function figmaValuesEqual(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.fround(a) === Math.fround(b);
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every((k) => figmaValuesEqual(a[k], b[k]));
  }
  return a === b;
}

/** Diff converted code values against snapshot variables ({ id: { values } }). */
export function diffAgainstSnapshot(codeValues, snapshotVariables) {
  const diffs = [];
  for (const [id, snap] of Object.entries(snapshotVariables)) {
    const code = codeValues[id];
    if (!code) {
      diffs.push({ id, name: snap.name, kind: 'missing-in-code' });
      continue;
    }
    for (const [modeId, want] of Object.entries(snap.values)) {
      if (!(modeId in code)) diffs.push({ id, name: snap.name, modeId, kind: 'missing-mode' });
      else if (!figmaValuesEqual(code[modeId], want))
        diffs.push({ id, name: snap.name, modeId, kind: 'value', code: code[modeId], figma: want });
    }
  }
  for (const id of Object.keys(codeValues)) {
    if (id !== 'added' && !snapshotVariables[id]) diffs.push({ id, kind: 'missing-in-snapshot' });
  }
  if (codeValues.added)
    for (const p of Object.keys(codeValues.added)) diffs.push({ path: p, kind: 'added-in-code' });
  return diffs;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
  const syncPath = process.argv[2] ?? join(pkgDir, 'figma-sync.json');
  const sync = JSON.parse(readFileSync(syncPath, 'utf8'));
  const code = dtcgToFigma(join(pkgDir, 'src'), sync.collections);
  const diffs = diffAgainstSnapshot(code, sync.variables);
  const modeValues = Object.values(sync.variables).reduce(
    (n, v) => n + Object.keys(v.values).length,
    0,
  );
  console.log(
    JSON.stringify(
      {
        variables: Object.keys(sync.variables).length,
        modeValues,
        diffCount: diffs.length,
        diffs: diffs.slice(0, 50),
      },
      null,
      2,
    ),
  );
  process.exit(diffs.length ? 1 : 0);
}
