# Fonts

THICCCBOI by Wonder Unit, licensed under the SIL Open Font License 1.1 (`OFL.txt`).

- Ship `.woff2` files only, unmodified and with their original names. Never commit TTFs here.
- `OFL.txt` must always be included in the published package.
- `fonts.css` declares one `@font-face` per weight with `font-display: swap`, plus the metric-adjusted "THICCCBOI Fallback" face.
- The family name in `fonts.css` must match the `typography-primitives` font family token exactly; the tokens tier test checks this.
- Components never import this package. Websites and Storybook import `fonts.css` once, before `tokens.css`.
- Adding a weight: minor. Removing one: major.
