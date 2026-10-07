// Shared blocks for the Foundations pages (packages/tokens/src/docs/*.mdx).
// Everything renders from the built tokens, so the pages follow token changes without edits.
// These style the docs chrome only; component and block rules don't apply here.
import type { CSSProperties, ReactNode } from 'react';
import { Markdown } from '@storybook/addon-docs/blocks';
import { breakpoints, typography } from '@jpm1475/ds-tokens';
import { live, token } from './data';

export { groupBy, varsWhere } from './data';

const mono: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
};
const muted: CSSProperties = { ...mono, color: '#666' };
const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '8px 0',
  borderBottom: '1px solid #eee',
};
const accent = '#0d6efd';

function Label({ name, children }: { name: string; children?: ReactNode }) {
  const t = token(name);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ ...mono, fontWeight: 600 }}>{name}</div>
      <div style={muted}>
        {children ?? live(name)}
        {t.alias && <> · {t.alias}</>}
      </div>
      {t.description && <div style={{ ...muted, fontFamily: 'inherit' }}>{t.description}</div>}
    </div>
  );
}

// --- Written content from Figma ------------------------------------------------------------

const content = import.meta.glob<string>('../../packages/tokens/src/docs/content/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Guidance pulled from the matching Figma foundation page, if there is any. */
export function FoundationContent({ page }: { page: string }) {
  const entry = Object.entries(content).find(([file]) => file.endsWith(`/${page}.md`));
  const text = entry?.[1].replace(/<!--[\s\S]*?-->/g, '').trim();
  return text ? <Markdown>{text}</Markdown> : null;
}

// --- Token table ---------------------------------------------------------------------------

/** Name, live value, alias and description for any group of tokens. */
export function TokenTable({ names }: { names: string[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>CSS variable</th>
            <th>Value</th>
            <th>Alias</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => {
            const t = token(name);
            return (
              <tr key={name} style={{ borderTop: '1px solid #eee', verticalAlign: 'top' }}>
                <td style={{ ...mono, fontWeight: 600 }}>{name}</td>
                <td style={mono}>{live(name)}</td>
                <td style={mono}>{t.alias ?? ''}</td>
                <td>{t.description ?? ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Colors --------------------------------------------------------------------------------

/** Resolves any CSS color (including color-mix) to sRGB over white with a 1px canvas. */
function rgbOf(value: string): [number, number, number] | null {
  if (typeof document === 'undefined' || !value) return null;
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const luminance = ([r, g, b]: [number, number, number]) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a: string, b: string) => {
  const x = rgbOf(a);
  const y = rgbOf(b);
  if (!x || !y) return '';
  const [hi, lo] = [luminance(x), luminance(y)].sort((m, n) => n - m);
  return `${((hi + 0.05) / (lo + 0.05)).toFixed(2)}:1`;
};

const checker = 'repeating-conic-gradient(#e6e6e6 0% 25%, #fff 0% 50%) 50% / 12px 12px';

/** Swatches with the primitive each color aliases and its contrast against the text tokens. */
export function ColorSwatches({
  names,
  against = ['--ds-color-text-primary', '--ds-color-text-inverse'],
}: {
  names: string[];
  against?: string[];
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
          <Label name={name}>
            {live(name)}
            {against.map((t) => (
              <span key={t}>
                {' '}
                · {t.replace('--ds-color-', '')} {contrast(live(name), live(t))}
              </span>
            ))}
          </Label>
        </div>
      ))}
    </div>
  );
}

// --- Scales --------------------------------------------------------------------------------

/** Spacing, sizing and border widths as proportional bars. */
export function ScaleBars({ names, as = 'width' }: { names: string[]; as?: 'width' | 'border' }) {
  return (
    <div>
      {names.map((name) => (
        <div key={name} style={row}>
          <div style={{ width: 240, flex: 'none', overflow: 'hidden' }}>
            {as === 'width' ? (
              <div
                style={{ height: 16, width: `var(${name})`, background: accent, borderRadius: 2 }}
              />
            ) : (
              <div style={{ width: 64, height: 40, border: `var(${name}) solid ${accent}` }} />
            )}
          </div>
          <Label name={name} />
        </div>
      ))}
    </div>
  );
}

/** One box per radius token. */
export function RadiusSamples({ names }: { names: string[] }) {
  return (
    <div>
      {names.map((name) => (
        <div key={name} style={row}>
          <div
            style={{
              width: 64,
              height: 40,
              flex: 'none',
              borderRadius: `var(${name})`,
              background: accent,
            }}
          />
          <Label name={name} />
        </div>
      ))}
    </div>
  );
}

/** Opacity tokens on a solid square over a checkerboard. */
export function OpacitySamples({ names }: { names: string[] }) {
  return (
    <div>
      {names.map((name) => (
        <div key={name} style={row}>
          <div style={{ width: 40, height: 40, flex: 'none', background: checker }}>
            <div
              style={{ width: '100%', height: '100%', background: accent, opacity: `var(${name})` }}
            />
          </div>
          <Label name={name} />
        </div>
      ))}
    </div>
  );
}

// --- Elevation -----------------------------------------------------------------------------

/** A surface per elevation level, then the z-index scale. */
export function ShadowSamples({ levels, zIndex }: { levels: string[]; zIndex: string[] }) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 32,
          padding: 24,
          background: 'var(--ds-color-surface-subtle)',
        }}
      >
        {levels.map((name) => (
          <div
            key={name}
            style={{
              padding: 16,
              minHeight: 96,
              borderRadius: 'var(--ds-radius-md, 8px)',
              background: 'var(--ds-color-surface-default)',
              boxShadow: `var(${name})`,
            }}
          >
            <Label name={name} />
          </div>
        ))}
      </div>
      <h3>Z-index</h3>
      <TokenTable names={zIndex} />
    </>
  );
}

// --- Typography ----------------------------------------------------------------------------

const ROLE_PROPS = ['font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing'];
type Mode = keyof typeof typography;
const typeModes = (Object.keys(breakpoints) as Mode[]).sort(
  (a, b) => breakpoints[a] - breakpoints[b],
);

const roleStyle = (role: string): CSSProperties =>
  Object.fromEntries(
    ROLE_PROPS.map((p) => [
      p.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()),
      `var(--ds-type-${role}-${p})`,
    ]),
  );

type Tree = Record<string, unknown>;
const at = (tree: Tree, role: string) =>
  role.split('-').reduce<Tree>((acc, seg) => (acc?.[seg] as Tree) ?? acc, tree);

/** Each type role rendered with the live variables, with its values at every breakpoint. */
export function TypeScale({
  sample = 'The quick brown fox jumps over the lazy dog',
}: {
  sample?: string;
}) {
  const base = typography[typeModes[0]] as Tree;
  const roles = Object.keys(base).flatMap((role) => {
    const node = base[role] as Tree;
    // Button roles nest one level deeper (button.xl, button.lg, ...).
    return 'font-size' in node ? [role] : Object.keys(node).map((k) => `${role}-${k}`);
  });
  return (
    <div>
      {roles.map((role) => (
        <div
          key={role}
          style={{
            ...row,
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: 8,
            padding: '16px 0',
          }}
        >
          <div style={{ ...roleStyle(role), overflowWrap: 'anywhere' }}>{sample}</div>
          <div style={{ ...muted, overflowWrap: 'anywhere' }}>
            <strong style={{ color: '#000' }}>--ds-type-{role}-*</strong>{' '}
            {typeModes
              .map((mode) => {
                const v = at(typography[mode] as Tree, role);
                return `${mode}: ${v['font-size']} / ${v['line-height']} / ${v['font-weight']}`;
              })
              .join('  ·  ')}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Breakpoints ---------------------------------------------------------------------------

/** Each breakpoint's min-width and the typography mode that starts there. */
export function BreakpointList() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Breakpoint</th>
            <th>Min width</th>
            <th>Typography mode</th>
            <th>CSS</th>
          </tr>
        </thead>
        <tbody>
          {typeModes.map((mode) => (
            <tr key={mode} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ fontWeight: 600 }}>{mode}</td>
              <td style={mono}>{breakpoints[mode]}px</td>
              <td style={mono}>typography-semantics / {mode}</td>
              <td style={mono}>
                {breakpoints[mode] === 0 ? ':root' : `@media (min-width: ${breakpoints[mode]}px)`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Icons ---------------------------------------------------------------------------------

/** The icon-context colors, each drawn on a star icon in currentColor. */
export function IconContexts({ names }: { names: string[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}
    >
      {names.map((name) => {
        const inverse = name.endsWith('-inverse');
        return (
          <div
            key={name}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 16,
              background: inverse ? 'var(--ds-color-surface-inverse)' : undefined,
              color: inverse ? '#fff' : undefined,
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ color: `var(${name})` }}
            >
              <path
                fill="currentColor"
                d="M12 2l2.9 6.9L22 9.3l-5.5 4.8L18.2 21 12 17.3 5.8 21l1.7-6.9L2 9.3l7.1-.4z"
              />
            </svg>
            <div style={{ ...mono, fontWeight: 600, marginTop: 8 }}>{name}</div>
            <div style={{ ...mono, opacity: 0.7 }}>{token(name).alias}</div>
          </div>
        );
      })}
    </div>
  );
}
