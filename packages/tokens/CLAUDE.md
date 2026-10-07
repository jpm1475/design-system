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
- Aliases with an opacity in Figma carry `aliasOpacity` (percent) and output as `color-mix(in srgb, var(...) n%, transparent)`.
- No theme switching today: `semantics` has one mode. A future theme mode maps to `[data-theme="<mode>"]`.
- `breakpoints.json` holds the min-width of each breakpoint mode; it is exported from the package as `breakpoints`.

## Special collections
- `icon-context` is one Figma variable with one mode per context (Primary, Inverse, Secondary, Brand, Disabled, Error). Each mode becomes `--ds-icon-<mode>`; the Icon component's `context` prop picks one.
- Elevation levels (`elevations/L1` to `L3` in Figma) are composed into `--ds-elevation-l1` to `l3` (full `box-shadow` values). Edit shadows through their variables only; effect styles are never synced. Pair levels with `--ds-z-*` as documented on the Foundations/Elevation page.
- Units follow `docs/figma-conventions.md` section 5 (rem for spacing and type, px for borders, shadows and breakpoints, unitless z-index and weights, opacity 0 to 1).

## Foundations pages
- One MDX page per foundation in `src/docs/`, titled `Foundations/<Name>`. Values come from the built tokens; never paste values by hand.
- Written guidance lives in `src/docs/content/<page>.md`, pulled from the matching Figma foundation page. Refresh it with `/ds-pipeline:tokens`.

## Changes
- Renaming or removing a token is breaking: major changeset, and the rename must go through token-sync so the Figma variable is renamed rather than replaced.
- Adding a token: minor. Changing a value: patch.
