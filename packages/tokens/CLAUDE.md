# Tokens

Tokens sync both ways between the five Figma variable collections and `src/`, through the token-sync agent and the Figma MCP.

- Change tokens in Figma or in `src/`, whichever is easier. Then run token-sync: `status` to see drift, `pull` for Figma changes, `push` for code changes, `sync` for both.
- Every token keeps its Figma variable id in `$extensions["com.figma"].variableId`. Never remove or edit those ids by hand; renames are tracked through them.
- `figma-sync.json` is the snapshot from the last sync. CI fails if `src/` changed since then, so code changes must be pushed to Figma before merging.
- Conflicts (both sides changed differently) and deletions always need a human decision. Token-sync never deletes a Figma variable without explicit confirmation.
- Pushing saves a Figma version first when possible, and only touches variables inside the five collections.

## Collections (one source folder each)
| Collection | Holds | May reference | Usable in components? |
| --- | --- | --- | --- |
| primitives | raw values | nothing | no |
| typography-primitives | raw type values | nothing | no |
| semantics | purpose-named tokens, one mode | primitives | yes |
| typography-semantics | type roles, one file per breakpoint mode | typography-primitives | yes |
| icon-context | icon colors per context | semantics or primitives | yes (icons only) |

A test enforces the reference rules. `dist/tier-map.json` records each CSS variable's collection; design-system-check uses it to reject primitives in components and blocks.

## Output
- `dist/tokens.css`: all variables with the `ds` prefix (`--ds-color-bg-surface`). Semantic tokens resolve to `var()` of their primitives.
- Typography: the smallest breakpoint's values are on `:root`; larger breakpoints override them in `@media (min-width: ...)` queries. Components just use `var(--ds-type-...)` and get responsive type for free.
- Icon contexts: `icon-context` has one mode file per context. `primary` is on `:root`; the others apply under `[data-icon-context="<mode>"]` (for example `inverse`, `brand`, `disabled`), so an icon reads `var(--ds-icon-color-icon-context)` and its container picks the context.
- Aliases with an opacity in Figma carry `aliasOpacity` (percent) and output as `color-mix(in srgb, var(...) n%, transparent)`.
- No theme switching today: `semantics` has one mode. A future theme mode maps to `[data-theme="<mode>"]`.
- `breakpoints.json` holds the min-width of each breakpoint mode; it is exported from the package as `breakpoints`.

## Changes
- Renaming or removing a token is breaking: major changeset, and the rename must go through token-sync so the Figma variable is renamed rather than replaced.
- Adding a token: minor. Changing a value: patch.
