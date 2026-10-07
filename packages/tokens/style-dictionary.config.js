// Builds dist/ from the DTCG source in src/.
// Style Dictionary parses, resolves references and applies transforms; this file
// assembles the outputs so breakpoint mode files become media queries and elevation
// levels become composite box-shadow variables.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');
const PREFIX = 'ds';

// Figma path segments keep their spelling in source ("Font-Weight.Semi Bold");
// CSS names are lowercased with spaces as hyphens: --ds-font-weight-semi-bold.
export const cssName = (path) =>
  [PREFIX, ...path].map((seg) => String(seg).toLowerCase().replace(/\s+/g, '-')).join('-');

const figma = (token) => token.$extensions?.['com.figma'] ?? {};
const refPath = (value) => {
  const m = typeof value === 'string' && value.match(/^\{([^}]+)\}$/);
  return m ? m[1].split('.') : null;
};

StyleDictionary.registerTransform({
  name: 'ds/name',
  type: 'name',
  transform: (token) => cssName(token.path).slice(PREFIX.length + 1),
});

// Figma aliases can carry an opacity (percent). Resolved outputs get rgba();
// CSS keeps the reference through color-mix() in the format below.
StyleDictionary.registerTransform({
  name: 'ds/alias-opacity',
  type: 'value',
  transitive: true,
  filter: (token) => figma(token).aliasOpacity !== undefined,
  transform: (token) => {
    const hex = String(token.$value).replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return `rgba(${r}, ${g}, ${b}, ${figma(token).aliasOpacity / 100})`;
  },
});

// Font families get the metric-adjusted fallback face from @jpm1475/ds-fonts when it
// declares one: "THICCCBOI", sans-serif -> "THICCCBOI", "THICCCBOI Fallback", system-ui, sans-serif.
const fontsCss = readFileSync(join(root, '..', 'fonts', 'fonts.css'), 'utf8');
const fallbackFaces = new Set(
  [...fontsCss.matchAll(/font-family:\s*"([^"]+) Fallback"/g)].map((m) => m[1]),
);

StyleDictionary.registerTransform({
  name: 'ds/font-stack',
  type: 'value',
  filter: (token) => token.$type === 'fontFamily' && !refPath(token.original.$value),
  transform: (token) => {
    const [first, ...rest] = String(token.$value)
      .split(',')
      .map((s) => s.trim());
    const family = first.replace(/^"|"$/g, '');
    if (!fallbackFaces.has(family)) return token.$value;
    return [
      first,
      `"${family} Fallback"`,
      'system-ui',
      ...rest.filter((f) => f !== 'system-ui'),
    ].join(', ');
  },
});

const modeFiles = (dir) =>
  readdirSync(join(src, dir))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

const breakpoints = JSON.parse(readFileSync(join(root, 'breakpoints.json'), 'utf8'));
const typeModes = modeFiles('typography-semantics').sort((a, b) => breakpoints[a] - breakpoints[b]);

for (const mode of typeModes) {
  if (breakpoints[mode] === undefined)
    throw new Error(`breakpoints.json has no width for mode "${mode}"`);
}

// icon-context holds one token per mode (icon.primary, icon.inverse, ...), so it is shared too.
const SHARED = [
  'primitives/*.json',
  'typography-primitives/*.json',
  'semantics/*.json',
  'icon-context/*.json',
];

async function tokensFor({ typeMode }) {
  const sd = new StyleDictionary({
    source: [...SHARED, `typography-semantics/${typeMode}.json`].map((g) => join(src, g)),
    platforms: { ds: { transforms: ['ds/name', 'ds/font-stack', 'ds/alias-opacity'] } },
    log: { verbosity: 'silent', warnings: 'error' },
  });
  return sd.getPlatformTokens('ds');
}

// The CSS value: a var() of the referenced token, or the raw value for primitives.
function cssValue(token) {
  const ref = refPath(token.original.$value);
  if (!ref) return String(token.$value);
  const v = `var(--${cssName(ref)})`;
  const opacity = figma(token).aliasOpacity;
  return opacity === undefined ? v : `color-mix(in srgb, ${v} ${opacity}%, transparent)`;
}

const decl = (t, indent) => `${indent}--${cssName(t.path)}: ${cssValue(t)};`;
const byCollection = (all, name) => all.filter((t) => figma(t).collection === name);
const COLLECTION_ORDER = [
  'primitives',
  'typography-primitives',
  'semantics',
  'typography-semantics',
  'icon-context',
];

const base = await tokensFor({ typeMode: typeModes[0] });
const all = base.allTokens;

// Two Figma variables must never produce the same CSS name (docs/figma-conventions.md section 4).
const seen = new Map();
for (const t of all) {
  const name = cssName(t.path);
  if (seen.has(name) && seen.get(name) !== t.path.join('.'))
    throw new Error(`CSS name ${name} comes from both ${seen.get(name)} and ${t.path.join('.')}`);
  seen.set(name, t.path.join('.'));
}

// Elevation composites: each semantic level (elevation/elevations, L1, L2, ...) becomes
// --ds-elevation-l<n>: x y blur spread color. Layer subgroups (layer-1, layer-2) join with commas.
const SHADOW_PARTS = ['x-offset', 'y-offset', 'blur', 'spread', 'color'];
const elevationTokens = byCollection(all, 'semantics').filter((t) =>
  /^elevations?$/i.test(t.path[0]),
);
const levels = new Map();
for (const t of elevationTokens) {
  const part = t.path.at(-1).toLowerCase();
  if (!SHADOW_PARTS.includes(part)) throw new Error(`unknown elevation part ${t.path.join('.')}`);
  const level = t.path[1].toLowerCase();
  const layer = t.path.slice(2, -1).join('-') || '';
  const layers = levels.get(level) ?? new Map();
  levels.set(level, layers);
  (layers.get(layer) ?? layers.set(layer, {}).get(layer))[part] = t;
}
const elevations = [...levels].map(([level, layers]) => {
  const shadow = (pick) =>
    [...layers]
      .map(([layer, parts]) => {
        const missing = SHADOW_PARTS.filter((p) => !parts[p]);
        if (missing.length)
          throw new Error(`elevation ${level} ${layer} is missing ${missing.join(', ')}`);
        return SHADOW_PARTS.map((p) => pick(parts[p])).join(' ');
      })
      .join(', ');
  return {
    name: `--${PREFIX}-elevation-${level}`,
    css: shadow((t) => `var(--${cssName(t.path)})`),
    resolved: shadow((t) => String(t.$value)),
  };
});

// --- tokens.css ---------------------------------------------------------------
const css = ['/* Generated by @jpm1475/ds-tokens. Do not edit. */', ':root {'];
for (const col of COLLECTION_ORDER) {
  css.push(`  /* ${col} */`, ...byCollection(all, col).map((t) => decl(t, '  ')));
  if (col === 'semantics' && elevations.length)
    css.push('  /* semantics: elevation composites */', ...elevations.map((e) => `  ${e.name}: ${e.css};`));
}
css.push('}');

const baseType = new Map(
  byCollection(all, 'typography-semantics').map((t) => [t.name, cssValue(t)]),
);
const typeByMode = { [typeModes[0]]: base };
for (const mode of typeModes.slice(1)) {
  const d = await tokensFor({ typeMode: mode });
  typeByMode[mode] = d;
  const changed = byCollection(d.allTokens, 'typography-semantics').filter(
    (t) => baseType.get(t.name) !== cssValue(t),
  );
  if (changed.length === 0) continue;
  css.push(
    '',
    `/* typography-semantics: ${mode} */`,
    `@media (min-width: ${breakpoints[mode]}px) {`,
    '  :root {',
  );
  css.push(...changed.map((t) => decl(t, '    ')), '  }', '}');
}

// --- JSON and JS --------------------------------------------------------------
const nested = (tokens) => {
  const out = {};
  for (const t of tokens) {
    let node = out;
    t.path.slice(0, -1).forEach((seg) => (node = node[seg] ??= {}));
    node[t.path.at(-1)] = t.$value;
  }
  return out;
};

const tokensJson = nested(all);
const typography = Object.fromEntries(
  typeModes.map((m) => [
    m,
    nested(byCollection(typeByMode[m].allTokens, 'typography-semantics')).type ?? {},
  ]),
);
const iconContexts = nested(byCollection(all, 'icon-context')).icon ?? {};
const elevation = Object.fromEntries(
  elevations.map((e) => [e.name.replace(`--${PREFIX}-elevation-`, ''), e.resolved]),
);
const tierMap = Object.fromEntries(
  COLLECTION_ORDER.flatMap((col) => [
    ...byCollection(all, col).map((t) => [`--${cssName(t.path)}`, col]),
    ...(col === 'semantics' ? elevations.map((e) => [e.name, 'semantics']) : []),
  ]),
);

const toType = (v, indent = '') => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  const inner = `${indent}  `;
  const lines = Object.entries(v).map(
    ([k, val]) => `${inner}readonly ${JSON.stringify(k)}: ${toType(val, inner)};`,
  );
  return `{\n${lines.join('\n')}\n${indent}}`;
};

const exportsMap = { tokens: tokensJson, breakpoints, typography, iconContexts, elevation, tierMap };
const js = Object.entries(exportsMap).map(
  ([k, v]) => `export const ${k} = ${JSON.stringify(v, null, 2)};`,
);
const dts = Object.entries(exportsMap).map(([k, v]) => `export declare const ${k}: ${toType(v)};`);

mkdirSync(dist, { recursive: true });
const header = '// Generated by @jpm1475/ds-tokens. Do not edit.\n';
writeFileSync(join(dist, 'tokens.css'), css.join('\n') + '\n');
writeFileSync(join(dist, 'tokens.json'), JSON.stringify(tokensJson, null, 2) + '\n');
writeFileSync(join(dist, 'tier-map.json'), JSON.stringify(tierMap, null, 2) + '\n');
writeFileSync(join(dist, 'index.js'), header + js.join('\n\n') + '\n');
writeFileSync(join(dist, 'index.d.ts'), header + dts.join('\n\n') + '\n');

console.log(
  `tokens: ${all.length} base tokens, ${Object.keys(tierMap).length} CSS variables, modes ${typeModes.join('/')}`,
);
