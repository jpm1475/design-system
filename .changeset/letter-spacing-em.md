---
"@jpm1475/ds-tokens": major
---

Pull the latest Figma variables and output letter spacing in em.

- Breaking renames: `--ds-elevations-l<n>-*` is now `--ds-elevation-l<n>-*` (the `--ds-elevation-l1` to `l3` composites keep their names), `--ds-breakpoints-*` is now `--ds-breakpoint-*`, and `--ds-letter-spacing-225` is now `--ds-letter-spacing-400`. Primitive groups are lowercased in Figma, so the nested keys in the JS `tokens` export are lowercase (`elevation.l1`, `font-size`).
- Removed: `--ds-letter-spacing-25` and `--ds-letter-spacing-125`.
- Added: `--ds-color-border-disabled`, `--ds-spacing-55xl`, `--ds-spacing-special`, `--ds-letter-spacing-300`, and the `input-label`, `input-text`, `input-helper-text` and `section` type roles.
- Changed: elevation L2 is now `0 8px 24px` at 10% black and L3 is `0 16px 40px` at 14% black; letter-spacing primitives are now whole px (1, 2, 3, 4).
- Each semantic type role's `--ds-type-*-letter-spacing` is now its Figma px divided by the role's font size in the same breakpoint (`section` is `0.25em`), so tracking scales with text size. Letter-spacing primitives output in px.
