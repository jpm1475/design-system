---
'@jpm1475/ds-tokens': minor
---

Icon contexts are now one variable per mode (`--ds-icon-primary`, `--ds-icon-inverse` and so on) instead of `[data-icon-context]` selectors. Elevation levels are composed into `--ds-elevation-l1` to `l3` box-shadows, elevation parts are in px, and z-index tokens are named `--ds-z-*`. New `elevation` export; `iconContexts` is now a flat map of context to color.
