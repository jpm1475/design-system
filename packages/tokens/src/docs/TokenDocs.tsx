// Storybook doc blocks for the token pages. Everything is driven by the built
// package exports, so the pages follow the tokens without manual edits.
import type { CSSProperties, ReactNode } from 'react';
import { breakpoints, iconContexts, tierMap, typography } from '@jpm1475/ds-tokens';

type Tier = (typeof tierMap)[keyof typeof tierMap];

export const varsWhere = (prefix: string, tier?: Tier) =>
  Object.entries(tierMap)
    .filter(([name, t]) => name.startsWith(prefix) && (!tier || t === tier))
    .map(([name]) => name);

/** Groups `--ds-color-text-primary` style names by the segment after the prefix. */
export const groupBy = (names: string[], prefix: string) => {
  const groups = new Map<string, string[]>();
  for (const name of names) {
    const key = name.slice(prefix.length).split('-')[0];
    groups.set(key, [...(groups.get(key) ?? []), name]);
  }
  return groups;
};

// Docs render only in the browser, so the live value can be read during render.
function computed(name: string) {
  return typeof document === 'undefined'
    ? ''
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const mono: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
};
const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '8px 0',
  borderBottom: '1px solid #eee',
};

function Name({ name, children }: { name: string; children?: ReactNode }) {
  const value = computed(name);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ ...mono, fontWeight: 600 }}>{name}</div>
      <div style={{ ...mono, color: '#666' }}>{children ?? value}</div>
    </div>
  );
}

const checker = 'repeating-conic-gradient(#e6e6e6 0% 25%, #fff 0% 50%) 50% / 12px 12px';

export function Swatches({ names }: { names: string[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '0 24px',
      }}
    >
      {names.map((name) => (
        <div key={name} style={row}>
          <div
            style={{
              width: 40,
              height: 40,
              flex: 'none',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: checker,
            }}
          >
            <div
              style={{ width: '100%', height: '100%', borderRadius: 5, background: `var(${name})` }}
            />
          </div>
          <Name name={name} />
        </div>
      ))}
    </div>
  );
}

export function Bars({
  names,
  as = 'width',
}: {
  names: string[];
  as?: 'width' | 'radius' | 'border';
}) {
  return (
    <div>
      {names.map((name) => (
        <div key={name} style={row}>
          <div style={{ width: 200, flex: 'none' }}>
            {as === 'width' && (
              <div
                style={{
                  height: 16,
                  width: `var(${name})`,
                  maxWidth: 200,
                  background: '#0d6efd',
                  borderRadius: 2,
                }}
              />
            )}
            {as === 'radius' && (
              <div
                style={{
                  width: 64,
                  height: 40,
                  borderRadius: `var(${name})`,
                  background: '#0d6efd',
                }}
              />
            )}
            {as === 'border' && (
              <div style={{ width: 64, height: 40, border: `var(${name}) solid #0d6efd` }} />
            )}
          </div>
          <Name name={name} />
        </div>
      ))}
    </div>
  );
}

export function Values({ names }: { names: string[] }) {
  return (
    <div>
      {names.map((name) => (
        <div key={name} style={row}>
          <Name name={name} />
        </div>
      ))}
    </div>
  );
}

const ROLE_PROPS = [
  'font-family',
  'font-weight',
  'font-size',
  'line-height',
  'letter-spacing',
] as const;
const typeModes = Object.keys(breakpoints).sort(
  (a, b) => breakpoints[a as keyof typeof breakpoints] - breakpoints[b as keyof typeof breakpoints],
) as (keyof typeof typography)[];

const roleStyle = (role: string): CSSProperties =>
  Object.fromEntries(
    ROLE_PROPS.map((p) => [
      p.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()),
      `var(--ds-type-${role}-${p})`,
    ]),
  );

/** One sample per type role, rendered with the live variables, plus its values per breakpoint. */
export function TypeScale({
  sample = 'The quick brown fox jumps over the lazy dog',
}: {
  sample?: string;
}) {
  const roles = Object.keys(typography[typeModes[0]]) as string[];
  return (
    <div>
      {roles.flatMap((role) => {
        const node = (typography[typeModes[0]] as Record<string, unknown>)[role] as Record<
          string,
          unknown
        >;
        // Button roles nest one level deeper (button.xl, button.lg, ...).
        const leaves = 'font-size' in node ? [role] : Object.keys(node).map((k) => `${role}-${k}`);
        return leaves.map((leaf) => (
          <div
            key={leaf}
            style={{
              ...row,
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: 8,
              padding: '16px 0',
            }}
          >
            <div style={{ ...roleStyle(leaf), margin: 0 }}>{sample}</div>
            <div style={{ ...mono, color: '#666' }}>
              <strong style={{ color: '#000' }}>--ds-type-{leaf}-*</strong>{' '}
              {typeModes
                .map((mode) => {
                  const path = leaf
                    .split('-')
                    .reduce<Record<string, unknown>>(
                      (acc, seg) => (acc?.[seg] as Record<string, unknown>) ?? acc,
                      typography[mode] as Record<string, unknown>,
                    );
                  return `${mode}: ${path['font-size']} / ${path['line-height']} / ${path['font-weight']}`;
                })
                .join('  ·  ')}
            </div>
          </div>
        ));
      })}
    </div>
  );
}

export function IconContexts() {
  const contexts = Object.keys(iconContexts);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
      }}
    >
      {contexts.map((ctx) => (
        <div
          key={ctx}
          data-icon-context={ctx}
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            background: ctx === 'inverse' ? '#282828' : undefined,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ color: 'var(--ds-icon-color-icon-context)' }}
          >
            <path
              fill="currentColor"
              d="M12 2l2.9 6.9L22 9.3l-5.5 4.8L18.2 21 12 17.3 5.8 21l1.7-6.9L2 9.3l7.1-.4z"
            />
          </svg>
          <div
            style={{
              ...mono,
              fontWeight: 600,
              marginTop: 8,
              color: ctx === 'inverse' ? '#fff' : undefined,
            }}
          >
            data-icon-context="{ctx}"
          </div>
        </div>
      ))}
    </div>
  );
}
