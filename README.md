# design-system

The jpm1475 design system: tokens synced with Figma, the THICCCBOI web font, React components and page blocks.

| Package | Purpose |
| --- | --- |
| `@jpm1475/ds-tokens` | Design tokens from the Figma variable collections (CSS variables, JS, JSON) |
| `@jpm1475/ds-fonts` | THICCCBOI web font files and `@font-face` CSS |
| `@jpm1475/ds-components` | React components |
| `@jpm1475/ds-blocks` | Page sections built from the components |

## Development

```bash
pnpm install
pnpm build
pnpm storybook
```

Changes to published packages need a changeset (`pnpm changeset`).
