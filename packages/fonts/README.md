# @jpm1475/ds-fonts

[THICCCBOI](https://github.com/wonderunit/font-thicccboi) by Wonder Unit, packaged as unmodified `.woff2` files with ready-made `@font-face` rules.

## Usage

Import the fonts once, before the tokens:

```ts
import '@jpm1475/ds-fonts/fonts.css';
import '@jpm1475/ds-tokens/tokens.css';
```

The font family tokens resolve to `"THICCCBOI", "THICCCBOI Fallback", system-ui, sans-serif`. The fallback face is a metric-adjusted local Arial that keeps layout shift low while the web font loads.

## Weights

| Weight | File |
| --- | --- |
| 100 | THICCCBOI-Thin.woff2 |
| 300 | THICCCBOI-Light.woff2 |
| 400 | THICCCBOI-Regular.woff2 |
| 500 | THICCCBOI-Medium.woff2 |
| 600 | THICCCBOI-SemiBold.woff2 |
| 700 | THICCCBOI-Bold.woff2 |
| 800 | THICCCBOI-ExtraBold.woff2 |
| 900 | THICCCBOI-Black.woff2 |
| 950 | THICCCBOI-ThicccAF.woff2 |

All faces use `font-display: swap`.

## Preloading

Preload only the weights used above the fold, usually Regular and the heading weight:

```html
<link rel="preload" href="/path/to/THICCCBOI-Regular.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/path/to/THICCCBOI-SemiBold.woff2" as="font" type="font/woff2" crossorigin />
```

## License

The fonts are licensed under the SIL Open Font License 1.1. See [OFL.txt](./OFL.txt). Copyright 2017 Wonder Unit Inc.
