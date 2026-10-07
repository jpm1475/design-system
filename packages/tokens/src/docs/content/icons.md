<!-- Pulled from Figma web-ds, page "↳ Icons", on 2026-10-07. Refresh with /ds-pipeline:tokens. -->

**Icon library:** Tabler Icons (1,424 icons, MIT license).

### Sizes

Five icon sizes are available, mapped to semantic size tokens (`size/icon/*`): XS (12), S (16), M (20), L (24) and XL (32). Use the token, not the raw pixel value, to keep the system consistent.

### Colors

Icon colors are bound to semantic tokens from the `color/icon/*` category. These tokens resolve to primitives automatically and let icons adapt to theme changes.

### Containers

The Icon Box component wraps any icon in a container with a subtle surface fill (`color/surface/subtle`). Three roundness variants control the container shape: Sharp for tables, data-dense UIs and technical contexts; Rounded for cards, buttons and default UI components; Circle for avatars, status indicators and floating actions.

### Do

- Use semantic size tokens (`size/icon/*`) instead of hardcoded pixel values.
- Bind icon fills and strokes to `color/icon/*` semantic tokens.
- Use `color/icon/primary` on light surfaces.
- Use `color/icon/inverse` on dark and inverse surfaces.
- Keep stroke weight consistent within a size; it scales with the icon.
- Use Icon Box containers for interactive icon targets (buttons, toggles).
- Pair the Circle container with indicators for notification badges.

### Don't

- Use raw hex colors; always bind to a semantic `color/icon/*` token.
- Mix icon sizes within the same UI context (for example a nav bar).
- Use `icon/primary` on dark backgrounds; switch to `icon/inverse`.
- Resize icons to sizes outside the five defined steps.
- Add custom stroke weights that break the proportional scaling.
- Use the Icon Box container without the surface fill token bound.
- Mix container roundness variants within the same component group.
