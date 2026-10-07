# Figma conventions (web-ds)

Shared rules for every agent and skill that reads the Figma file. The Figma file is a work in progress, so these rules say what to build, what to skip, and how Figma names map to code.

## 1. What to skip

Never build from, sync, or report as missing:

- Pages whose name contains `⚒️`. That marker means "still in progress". List skipped pages in your report so the user knows.
- Anything named with a `_deprecated/` prefix, and anything on a page named `_Archive`.
- Component sets or components named `Elements/...`. These are internal parts: build them inside their parent component, with no story and no export of their own.
- Pages in the `❖ DOCUMENTATION` section and the `Cover` page.
- Divider pages named `----`.

If a skipped item is needed by something you were asked to build, stop and tell the user which item and why, instead of building from it.

## 2. Sections and Storybook

| Figma section | Storybook title prefix | Code location |
| --- | --- | --- |
| `❖ FOUNDATIONS` | `Foundations/` | `packages/tokens/src/docs/` (MDX pages) |
| `❖ COMPONENTS` | `Components/` | `packages/components/src/<Name>/` |
| `❖ PATTERNS` | `Patterns/` | `packages/components/src/patterns/<Name>/` |
| `❖ BLOCKS` | `Blocks/` | `packages/blocks/src/<Name>/` |

Storybook shows sections in this order: Foundations, Components, Patterns, Blocks. Every story file sets an explicit `title`, for example `title: 'Components/Button'`.

**Classification** when a page is in the wrong section or none:

- **Component:** one element with its own behavior or display role (Button, Checkbox, Tabs, Tooltip, Avatar, Badge, Text Field, Select).
- **Pattern:** several components combined into reusable interaction or structure, usually with a landmark or shared behavior (Navigation, Breadcrumbs, Form field group, Pagination).
- **Block:** a full-width page section that takes content as props (Hero, Header, Feature Grid, Pricing, Footer).

Current known mapping (until the Figma file is reorganized): Breadcrumbs and Form are patterns even though they sit under Components.

## 3. Foundations pages

One Storybook page per foundation, each titled `Foundations/<Name>`:

| Page | Built from |
| --- | --- |
| Colors | `semantics` color tokens, grouped by role, with the primitive each aliases |
| Typography | `typography-semantics` roles at each breakpoint, plus the font family and weights from the fonts package |
| Spacing | spacing tokens as a visual scale |
| Radius | radius tokens as samples |
| Border | border width tokens as samples |
| Size | sizing scale tokens |
| Icons | the icon set (filled in during the components stage, when the Icon component exists; until then a short note) |
| Elevation | the composed `--ds-elevation-*` shadows on sample surfaces, plus the z-index scale |
| Opacity | opacity tokens |
| Breakpoints | the breakpoint widths and which typography mode starts at each |

**Content:** values are always rendered from the built tokens (never screenshots), so pages update when tokens change. Written guidance comes from Figma: text on the matching Figma foundation page, plus descriptions on variables and styles. Store the copied text in `packages/tokens/src/docs/content/<page>.md` with a header comment giving the Figma page name and the date it was pulled. A page with no written guidance in Figma shows only the values.

## 4. Variables

- **Collections:** `primitives`, `semantics`, `typography-primitives`, `typography-semantics`, `icon-context`. Expect exactly these five.
- **Casing:** group names are lowercased and kebab-cased in code (`Border-Width/2` and `border-width/2` both become `--ds-border-width-2`). If two Figma variables would produce the same CSS name, stop and report both.
- **`icon-context`:** one variable (currently `color/icon/context`) with one mode per context (currently Primary, Inverse, Secondary, Brand, Disabled, Error). In code, each mode becomes its own variable named after the mode: `--ds-icon-primary`, `--ds-icon-inverse`, and so on. The Icon component takes a `context` prop that picks one. Sync maps each `--ds-icon-<mode>` back to that mode of the single Figma variable. If the collection later has several variables, name them `--ds-icon-<variable>-<mode>`.
- **Elevation:** semantic level variables (currently `elevations/L1` to `L3`, each with `x-offset`, `y-offset`, `blur`, `spread`, `color`) are combined into one composite per level, `--ds-elevation-l1` and so on. Match the group case-insensitively as `elevation` or `elevations`. If a level has `layer-1`, `layer-2` subgroups, combine them into one comma-separated `box-shadow`. Effect styles named `Elevation/*` must have every property bound to variables; report any unbound property as a warning.
- **Z-index:** `Z-Index/*` primitives become unitless `--ds-z-*` tokens.

## 5. Units

| Token kind | Unit in code |
| --- | --- |
| Spacing, sizing, radius, font size | rem (px / 16) |
| Border width, elevation offsets, blur, spread | px |
| Breakpoints | px |
| Line height | unitless if Figma gives a percent, rem if px |
| Opacity | 0 to 1 (divide by 100 if Figma stores 0 to 100) |
| Z-index, font weight | unitless numbers |

The reverse conversion must restore Figma's exact values, so a pull followed by a dry-run push reports no changes.

## 6. Component property naming map

Figma properties become React props. Normalize as follows, and record any name not covered here in the component's report.

| Figma | React |
| --- | --- |
| `Size`: XS, SM, MD, LG, XL, or XSmall/Small/Medium/Large/XLarge, or L, or Big | `size`: `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` (Big maps to `lg`, L to `lg`) |
| `Type` or `Variant` | `variant` (lowercased values, for example `'primary'`, `'danger'`) |
| `State` values Hover, Pressed, Focus | Not props. CSS `:hover`, `:active`, `:focus-visible`; shown in stories with the pseudo-states addon |
| `State` value Inactive or Disabled | `disabled: boolean` |
| `Checked`, `On`, `Selected` with Yes/No or True/False | `checked`, `on` or `selected`: `boolean` (controlled plus `default...` uncontrolled variant) |
| `Dark: True/False`, `Color: Light/Dark`, `Tone` | `tone: 'light' \| 'dark'` |
| `Fill: Solid/Outline` | `fill: 'solid' \| 'outline'` |
| `Roundness`: Pill, Rounded, Sharp, Circle | `shape: 'pill' \| 'rounded' \| 'sharp' \| 'circle'` |
| Boolean `Icon Before`/`Icon After`, `Left Icon`/`Right Icon`, `Icon Start`/`Icon End` | `iconStart` / `iconEnd`: `ReactNode` (an icon element or nothing) |
| Instance swap for an icon | Covered by `iconStart` / `iconEnd` |
| `Label` or `Text` (text property) | `children` |
| `Indicator` (boolean) | `indicator: boolean` |
| `Side` (tooltip placement) | `side: 'top' \| 'right' \| 'bottom' \| 'left'` |
| `Switch Mobile`, `Device: Desktop/Mobile` | Not props. Responsive behavior comes from breakpoints in CSS |
| Default property names like `Property 1` | Stop and ask the user what the property means |

## 7. Reference component

The first component built in the components stage becomes the reference that later components copy. It must be reviewed and approved by the user in Storybook before any other component is built. Record its name in `packages/components/CLAUDE.md` under "Reference component".
