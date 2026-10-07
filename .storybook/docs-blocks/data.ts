// Token index for the Foundations pages, read from the DTCG source (descriptions and aliases)
// and the built tier map (every CSS variable, including composites). Values are read live
// from tokens.css at render time, so the pages always match the build.
import { tierMap } from '@jpm1475/ds-tokens';

export type Collection = (typeof tierMap)[keyof typeof tierMap];

export interface TokenInfo {
  name: string;
  collection: Collection;
  /** CSS variable this token references, if it is an alias. */
  alias?: string;
  description?: string;
}

type Node = { $value?: unknown; $description?: string; [key: string]: unknown };

const sources = import.meta.glob<Node>('../../packages/tokens/src/**/*.json', {
  eager: true,
  import: 'default',
});

// Same rule as style-dictionary.config.js: lowercase, spaces to hyphens, joined with hyphens.
export const cssName = (path: string[]) =>
  ['--ds', ...path.map((s) => s.toLowerCase().replace(/\s+/g, '-'))].join('-');

const info = new Map<string, Omit<TokenInfo, 'name' | 'collection'>>();
const walk = (node: Node, path: string[]) => {
  if ('$value' in node) {
    const name = cssName(path);
    if (info.has(name)) return;
    const ref = typeof node.$value === 'string' && node.$value.match(/^\{([^}]+)\}$/)?.[1];
    info.set(name, {
      alias: ref ? cssName(ref.split('.')) : undefined,
      description: node.$description,
    });
    return;
  }
  for (const [k, v] of Object.entries(node))
    if (!k.startsWith('$') && v && typeof v === 'object') walk(v as Node, [...path, k]);
};
// Mode files repeat paths; sort so the smallest typography mode (mobile) is read first.
for (const [file, json] of Object.entries(sources).sort(([a], [b]) => a.localeCompare(b)))
  if (!file.includes('/docs/')) walk(json, []);

const elevationParts = (level: string) =>
  Object.keys(tierMap).filter((n) => new RegExp(`^--ds-elevations?-${level}-`).test(n));

export function token(name: string): TokenInfo {
  const collection = tierMap[name as keyof typeof tierMap];
  const level = name.match(/^--ds-elevation-(l\d+)$/)?.[1];
  if (level)
    return {
      name,
      collection,
      description: `Composite box-shadow of ${elevationParts(level).join(', ')}`,
    };
  return { name, collection, ...info.get(name) };
}

/** CSS variables whose name starts with `prefix`, optionally limited to one collection. */
export const varsWhere = (prefix: string, collection?: Collection) =>
  Object.entries(tierMap)
    .filter(([name, c]) => name.startsWith(prefix) && (!collection || c === collection))
    .map(([name]) => name);

/** Groups names by the segment right after the prefix (`--ds-color-text-primary` -> `text`). */
export const groupBy = (names: string[], prefix: string) => {
  const groups = new Map<string, string[]>();
  for (const name of names) {
    const key = name.slice(prefix.length).split('-')[0];
    groups.set(key, [...(groups.get(key) ?? []), name]);
  }
  return groups;
};

/** Live value from tokens.css (references already substituted). Docs render in the browser only. */
export const live = (name: string) =>
  typeof document === 'undefined'
    ? ''
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
