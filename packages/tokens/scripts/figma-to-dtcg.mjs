// Figma variables (raw read) -> DTCG source files, figma-sync snapshot and breakpoints.
// Dependency-free Node ESM. Used by token-sync for pulls.
//
// Input ("raw read") JSON, field names as the Figma Plugin API reports them:
// {
//   "fileKey": "...",
//   "collections": [{ "id", "name", "modes": [{ "modeId", "name" }], "defaultModeId", "variableIds": [...] }],
//   "variables":   [{ "id", "name", "resolvedType", "variableCollectionId", "valuesByMode",
//                     "description", "scopes", "hiddenFromPublishing", "remote" }]
// }
// valuesByMode values are raw Figma values: numbers, strings, { r, g, b, a },
// { type: "VARIABLE_ALIAS", id }, or { color: { type: "VARIABLE_ALIAS", id }, opacity } (alias with opacity).
//
// CLI:
//   node scripts/figma-to-dtcg.mjs <raw.json>            validate + report, write nothing
//   node scripts/figma-to-dtcg.mjs <raw.json> --write    replace src/ (keeps src/docs/), write
//                                                        breakpoints.json and figma-sync.json
// Exits 1 (and writes nothing) if any tier rule or structural check fails.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeSourceHash } from './source-hash.mjs';

export const COLLECTIONS = [
  'primitives',
  'typography-primitives',
  'semantics',
  'typography-semantics',
  'icon-context',
];
export const RAW_TIERS = new Set(['primitives', 'typography-primitives']);
export const ALLOWED_REFS = {
  semantics: ['primitives'],
  'typography-semantics': ['typography-primitives'],
  'icon-context': ['semantics', 'primitives'],
};
const NAMESPACE = { 'icon-context': 'icon', 'typography-semantics': 'type' };
const TYPE_ROOTS = ['type', 'typography', 'text', 'font'];
const BREAKPOINT_COLLECTION = 'typography-semantics';

/** Alias info from a raw Figma value, or null. */
export function aliasOf(val) {
  if (val && val.type === 'VARIABLE_ALIAS') return { id: val.id };
  if (val && val.color && val.color.type === 'VARIABLE_ALIAS')
    return { id: val.color.id, opacity: val.opacity };
  return null;
}

/** Shortest decimal that maps to the same float32 (Figma stores float32). */
export function f32(x) {
  for (let p = 1; p <= 17; p++) {
    const y = Number(x.toPrecision(p));
    if (Math.fround(y) === Math.fround(x)) return y;
  }
  return x;
}

function channelHex(c) {
  const n = Math.round(c * 255);
  if (Math.fround(n / 255) !== Math.fround(c))
    throw new Error(`color channel ${c} is not an 8-bit value`);
  return n.toString(16).padStart(2, '0');
}

export function colorToCss(c) {
  if (c.a >= 1) return '#' + channelHex(c.r) + channelHex(c.g) + channelHex(c.b);
  const rgb = [c.r, c.g, c.b].map((x) => (channelHex(x), Math.round(x * 255)));
  return `rgba(${rgb.join(', ')}, ${f32(c.a)})`;
}

/** Code path segments for a variable (namespacing per packages/tokens/CLAUDE.md). */
export function codePath(name, collection) {
  const segs = name.split('/');
  // Z-Index/* primitives become --ds-z-* (docs/figma-conventions.md section 4).
  if (collection === 'primitives' && /^z-index$/i.test(segs[0])) return ['z', ...segs.slice(1)];
  const ns = NAMESPACE[collection];
  if (!ns) return segs;
  if (collection === 'icon-context' && segs[0] === 'icon') return segs;
  if (collection === 'typography-semantics' && TYPE_ROOTS.includes(segs[0])) return segs;
  return [ns, ...segs];
}

/** Conversion kind of a raw (non-alias) variable, from its type and top-level group. */
export function kindOf(v) {
  const root = v.name.split('/')[0];
  if (v.resolvedType === 'COLOR') return 'color';
  if (v.resolvedType === 'STRING') {
    if (/family/i.test(v.name)) return 'fontFamily';
    if (/weight/i.test(v.name)) return 'fontWeight';
    return 'string';
  }
  if (v.resolvedType === 'BOOLEAN') return 'boolean';
  if (/^(border-width|stroke)/i.test(root)) return 'px';
  // Elevation offsets, blur and spread stay px (docs/figma-conventions.md section 5).
  if (/^elevations?$/i.test(root)) return 'px';
  if (/breakpoint|screen/i.test(root)) return 'px';
  if (/^opacity$/i.test(root)) return 'percent';
  if (/^z-index$/i.test(root)) return 'number';
  if (/^font-weight$/i.test(root)) return 'number';
  if (
    /^(radius|sizing-scale|spacing-scale|font-size|line-height|letter-spacing|paragraph-spacing|paragraph-indent)$/i.test(
      root,
    )
  )
    return 'rem';
  return 'unknown';
}

const DTCG_TYPE = {
  color: 'color',
  fontFamily: 'fontFamily',
  fontWeight: 'fontWeight',
  px: 'dimension',
  rem: 'dimension',
  percent: 'number',
  number: 'number',
  string: 'string',
  boolean: 'boolean',
};

function convertRaw(kind, val) {
  switch (kind) {
    case 'color':
      return colorToCss(val);
    case 'px':
      return `${f32(val)}px`;
    case 'rem':
      return `${f32(val) / 16}rem`;
    case 'percent':
      return f32(f32(val) / 100);
    case 'number':
      return f32(val);
    case 'fontWeight': {
      const n = Number(val);
      if (!Number.isFinite(n) || String(n) !== val)
        throw new Error(`font weight "${val}" is not numeric`);
      return n;
    }
    case 'fontFamily':
      return `"${val}", sans-serif`;
    case 'string':
    case 'boolean':
      return val;
    default:
      return undefined;
  }
}

function fileFor(v, collection, mode) {
  if (collection.name === 'icon-context') return 'icon-context/icon-context.json';
  if (collection.name === 'primitives')
    return `primitives/${v.name.split('/')[0].toLowerCase()}.json`;
  if (collection.modes.length > 1) return `${collection.name}/${mode.name.toLowerCase()}.json`;
  return `${collection.name}/${collection.name}.json`;
}

/**
 * icon-context code path for one mode: icon.<mode> when the collection has one variable,
 * icon.<variable>.<mode> when it has several (docs/figma-conventions.md section 4).
 */
export function iconModePath(variableName, modeName, variableCount) {
  const mode = kebab([modeName]);
  return variableCount === 1 ? ['icon', mode] : ['icon', kebab(variableName.split('/')), mode];
}

const kebab = (segs) =>
  segs
    .join('-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

/**
 * Convert a raw Figma read to DTCG files + snapshot data.
 * Returns { files: { "<collection>/<file>.json": object }, snapshot: { collections, variables },
 *           breakpoints: { widths, sources } | null, problems: { ... }, ok: boolean }.
 */
export function figmaToDtcg(raw) {
  const problems = {
    collections: [],
    remote: [],
    rawInReferenceTier: [],
    aliasInRawTier: [],
    crossTier: [],
    externalAlias: [],
    unconvertible: [],
    cssNameCollisions: [],
    tokenGroupConflicts: [],
    modePathMismatch: [],
    breakpoints: [],
  };
  const names = raw.collections.map((c) => c.name);
  for (const n of COLLECTIONS) if (!names.includes(n)) problems.collections.push(`missing: ${n}`);
  for (const n of names)
    if (!COLLECTIONS.includes(n)) problems.collections.push(`unexpected: ${n}`);

  const colById = Object.fromEntries(raw.collections.map((c) => [c.id, c]));
  const varById = Object.fromEntries(raw.variables.map((v) => [v.id, v]));
  const colOf = (id) => colById[varById[id]?.variableCollectionId]?.name;

  // Tier checks.
  for (const v of raw.variables) {
    const cn = colOf(v.id);
    if (v.remote) problems.remote.push(v.name);
    for (const [modeId, val] of Object.entries(v.valuesByMode)) {
      const a = aliasOf(val);
      if (RAW_TIERS.has(cn)) {
        if (a) problems.aliasInRawTier.push({ name: v.name, collection: cn, target: a.id });
        continue;
      }
      if (!a) {
        problems.rawInReferenceTier.push({
          name: v.name,
          id: v.id,
          collection: cn,
          modeId,
          value: val,
        });
        continue;
      }
      const tc = colOf(a.id);
      if (!tc) {
        problems.externalAlias.push({ name: v.name, collection: cn, target: a.id });
        continue;
      }
      if (!ALLOWED_REFS[cn]?.includes(tc)) {
        problems.crossTier.push({
          name: v.name,
          collection: cn,
          target: varById[a.id].name,
          targetCollection: tc,
        });
      }
    }
  }

  const rawKindOf = (id, depth = 0) => {
    const t = varById[id];
    if (!t || depth > 20) return 'unknown';
    if (RAW_TIERS.has(colOf(id))) return kindOf(t);
    const a = aliasOf(Object.values(t.valuesByMode)[0]);
    return a ? rawKindOf(a.id, depth + 1) : kindOf(t);
  };

  const files = {};
  const put = (fp, segs, tok) => {
    let o = (files[fp] ??= {});
    for (let i = 0; i < segs.length - 1; i++) {
      if (o[segs[i]] && '$value' in o[segs[i]])
        problems.tokenGroupConflicts.push(`${fp}:${segs.join('.')}`);
      o = o[segs[i]] ??= {};
    }
    const last = segs[segs.length - 1];
    if (o[last]) problems.tokenGroupConflicts.push(`${fp}:${segs.join('.')}`);
    o[last] = tok;
  };

  const snapshotVars = {};
  const cssNames = {};
  // Stable order: collections in the canonical order, variables in Figma order.
  for (const cn of COLLECTIONS) {
    const c = raw.collections.find((x) => x.name === cn);
    if (!c) continue;
    const isIcon = cn === 'icon-context';
    for (const id of c.variableIds) {
      const v = varById[id];
      const segs = codePath(v.name, cn);
      if (isIcon)
        for (const mode of c.modes)
          (cssNames[kebab(iconModePath(v.name, mode.name, c.variableIds.length))] ??= []).push(
            `${cn}:${v.name} (${mode.name})`,
          );
      else (cssNames[kebab(segs)] ??= []).push(`${cn}:${v.name}`);
      snapshotVars[v.id] = {
        name: v.name,
        collection: cn,
        values: Object.fromEntries(
          Object.entries(v.valuesByMode).map(([m, x]) => {
            const a = aliasOf(x);
            return [
              m,
              a
                ? a.opacity !== undefined
                  ? { alias: a.id, opacity: a.opacity }
                  : { alias: a.id }
                : x,
            ];
          }),
        ),
      };
      for (const mode of c.modes) {
        const val = v.valuesByMode[mode.modeId];
        const a = aliasOf(val);
        const ext = { variableId: v.id, collection: cn, scopes: v.scopes };
        if (isIcon) ext.modeId = mode.modeId;
        if (v.hiddenFromPublishing) ext.hiddenFromPublishing = true;
        let $type;
        let $value;
        if (a) {
          const t = varById[a.id];
          const k = rawKindOf(a.id);
          $value = t ? `{${codePath(t.name, colOf(a.id)).join('.')}}` : `{unresolved:${a.id}}`;
          $type = DTCG_TYPE[k] ?? 'string';
          if (k === 'fontWeight') ext.figmaType = 'STRING';
          if (a.opacity !== undefined) ext.aliasOpacity = a.opacity;
        } else {
          const k = kindOf(v);
          $value = convertRaw(k, val);
          if ($value === undefined) {
            problems.unconvertible.push({ name: v.name, collection: cn, value: val });
            $value = val;
          }
          $type = DTCG_TYPE[k] ?? 'string';
          if (k === 'fontWeight') ext.figmaType = 'STRING';
          if (k === 'percent') ext.figmaUnit = 'percent';
        }
        const tok = { $type, $value };
        if (v.description) tok.$description = v.description;
        tok.$extensions = { 'com.figma': ext };
        put(
          fileFor(v, c, mode),
          isIcon ? iconModePath(v.name, mode.name, c.variableIds.length) : segs,
          tok,
        );
      }
    }
  }

  for (const [css, vs] of Object.entries(cssNames))
    if (vs.length > 1) problems.cssNameCollisions.push({ css, vars: vs });

  // Every mode file of a multi-mode collection must have the same token paths.
  const paths = (o, p = '') =>
    Object.entries(o).flatMap(([k, x]) => ('$value' in x ? [p + k] : paths(x, `${p}${k}.`)));
  for (const c of raw.collections.filter((x) => x.modes.length > 1 && x.name !== 'icon-context')) {
    const fs = Object.keys(files).filter((f) => f.startsWith(`${c.name}/`));
    const base = JSON.stringify(paths(files[fs[0]]).sort());
    for (const f of fs)
      if (JSON.stringify(paths(files[f]).sort()) !== base) problems.modePathMismatch.push(f);
  }

  // Breakpoints: semantics variables "breakpoints/<mode>" (one per typography-semantics mode), resolved to px.
  let breakpoints = null;
  const bpCol = raw.collections.find((c) => c.name === BREAKPOINT_COLLECTION);
  if (bpCol) {
    const resolve = (id, modeId, depth = 0) => {
      const t = varById[id];
      const val = t.valuesByMode[modeId] ?? Object.values(t.valuesByMode)[0];
      const a = aliasOf(val);
      return a && depth < 20 ? resolve(a.id, null, depth + 1) : val;
    };
    const found = [];
    for (const m of bpCol.modes) {
      const mode = m.name.toLowerCase();
      const v = raw.variables.find(
        (x) =>
          colOf(x.id) === 'semantics' &&
          /^breakpoints?\//i.test(x.name) &&
          x.name.split('/').slice(1).join('/').toLowerCase() === mode,
      );
      if (!v) {
        problems.breakpoints.push(`no semantics breakpoint variable for mode "${m.name}"`);
        continue;
      }
      const px = resolve(v.id, Object.keys(v.valuesByMode)[0]);
      if (typeof px !== 'number') {
        problems.breakpoints.push(`${v.name} does not resolve to a number`);
        continue;
      }
      found.push({ mode, px, variableId: v.id });
    }
    if (found.length === bpCol.modes.length) {
      found.sort((a, b) => a.px - b.px);
      const widths = {};
      const sources = {};
      found.forEach((b, i) => {
        widths[b.mode] = i === 0 ? 0 : b.px;
        sources[b.mode] = b.variableId;
      });
      breakpoints = { widths, sources };
    }
  }

  const snapshot = {
    collections: Object.fromEntries(
      COLLECTIONS.filter((n) => names.includes(n)).map((n) => {
        const c = raw.collections.find((x) => x.name === n);
        return [
          n,
          {
            id: c.id,
            defaultModeId: c.defaultModeId,
            modes: Object.fromEntries(c.modes.map((m) => [m.modeId, m.name])),
          },
        ];
      }),
    ),
    variables: snapshotVars,
  };
  const ok = Object.values(problems).every((p) => p.length === 0);
  return { files, snapshot, breakpoints, problems, ok };
}

/** Write a conversion result into a tokens package directory (src/ replaced except src/docs/). */
export function writeResult(result, pkgDir, { fileKey, syncedAt = new Date().toISOString() }) {
  const src = join(pkgDir, 'src');
  mkdirSync(src, { recursive: true });
  for (const entry of readdirSync(src))
    if (entry !== 'docs') rmSync(join(src, entry), { recursive: true, force: true });
  for (const [fp, obj] of Object.entries(result.files)) {
    const p = join(src, fp);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
  }
  if (result.breakpoints)
    writeFileSync(
      join(pkgDir, 'breakpoints.json'),
      JSON.stringify(result.breakpoints.widths, null, 2) + '\n',
    );
  const sync = {
    fileKey,
    syncedAt,
    sourceHash: computeSourceHash(src),
    collections: result.snapshot.collections,
    breakpoints: result.breakpoints ? result.breakpoints.sources : {},
    variables: result.snapshot.variables,
  };
  writeFileSync(join(pkgDir, 'figma-sync.json'), JSON.stringify(sync, null, 2) + '\n');
  return sync;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [rawPath, ...flags] = process.argv.slice(2);
  if (!rawPath) {
    console.error('usage: figma-to-dtcg.mjs <raw.json> [--write]');
    process.exit(2);
  }
  const raw = JSON.parse(readFileSync(rawPath, 'utf8'));
  const result = figmaToDtcg(raw);
  const counts = {};
  for (const v of Object.values(result.snapshot.variables))
    counts[v.collection] = (counts[v.collection] ?? 0) + 1;
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        counts,
        files: Object.keys(result.files),
        breakpoints: result.breakpoints,
        problems: result.problems,
      },
      null,
      2,
    ),
  );
  if (!result.ok) process.exit(1);
  if (flags.includes('--write')) {
    const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
    const sync = writeResult(result, pkgDir, { fileKey: raw.fileKey });
    console.log(`wrote src/, breakpoints.json, figma-sync.json (sourceHash ${sync.sourceHash})`);
  }
}
