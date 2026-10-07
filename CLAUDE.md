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
- Build in stages with the ds-pipeline skills, in this order: `/ds-pipeline:tokens`, then `/ds-pipeline:component <Name>`, then `/ds-pipeline:pattern <Name>`, then `/ds-pipeline:block <Name>`. Each stops and points to the earlier stage when something it needs is missing.
- Agents behind them: token-sync, component-builder, pattern-builder, block-builder; run design-system-check before every commit.
- The Figma file (web-ds) is a work in progress. Follow `docs/figma-conventions.md`: skip pages marked ⚒️, `_deprecated/` items, `_Archive`, and `Elements/` parts as standalone outputs; map Figma properties to props with its naming map.
- Commit and open PRs only through /ds-pipeline:commit and /ds-pipeline:pr.
- Storybook is published to Chromatic on every push; the latest main build is the repo homepage.

## Storybook structure
| Section | Title prefix | Lives in |
| --- | --- | --- |
| Foundations | `Foundations/` | `packages/tokens/src/docs/` (one MDX page per foundation) |
| Components | `Components/` | `packages/components/src/<Name>/` |
| Patterns | `Patterns/` | `packages/components/src/patterns/<Name>/` |
| Blocks | `Blocks/` | `packages/blocks/src/<Name>/` |

Every story file sets `title` explicitly. Foundations values are rendered from the built tokens; written guidance is pulled from the Figma foundation pages into `packages/tokens/src/docs/content/`.
