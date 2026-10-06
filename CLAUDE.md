# design-system

Personal design system: four npm packages in one pnpm monorepo.

| Package | Path | Depends on |
| --- | --- | --- |
| @jpm1475/ds-tokens | packages/tokens | nothing |
| @jpm1475/ds-fonts | packages/fonts | nothing (THICCCBOI web fonts, OFL-1.1) |
| @jpm1475/ds-components | packages/components | tokens |
| @jpm1475/ds-blocks | packages/blocks | components |

## Commands
- `pnpm build` builds all packages in dependency order
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm size`
- `pnpm storybook` runs Storybook locally on port 6006
- `pnpm changeset` records a version bump for the current change

## Rules
- Every change to a package's published code needs a changeset (patch, minor or major).
- Never publish manually. Releases happen by merging the "chore: version packages" PR.
- Use the ds-pipeline agents: component-builder for components, block-builder for blocks, token-sync for Figma variables, design-system-check before every commit.
- Commit and open PRs only through /ds-pipeline:commit and /ds-pipeline:pr.
- Storybook is published to Chromatic on every push; the latest main build is the repo homepage.
