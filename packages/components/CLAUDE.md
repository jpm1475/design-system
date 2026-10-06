# Components

Reference component: `src/Button`. Match its structure exactly.

## File anatomy
`Name/Name.tsx`, `Name.module.css`, `Name.stories.tsx`, `Name.test.tsx`, `index.ts`, and an export line in `src/index.ts`.

## API conventions
- Function components with `forwardRef`; set `displayName`.
- Extend the native element's props (`React.ComponentPropsWithoutRef<'button'>`), and merge `className` onto the root.
- Variants as a `variant` prop, sizes as a `size` prop; render them as `data-variant` and `data-size` on the root element.
- Booleans are adjectives: `disabled`, `loading`, `invalid`, `fullWidth`.
- No default export. Named exports for the component and its props type (`ButtonProps`).
- Add `'use client'` at the top only when the component uses state, effects or event handlers that need it.

## Styling
- CSS Modules. Every rule inside `@layer ds { }`.
- Only `var(--ds-*)` values. Never raw colors, sizes or shadows.
- Style states with real selectors: `:hover`, `:focus-visible`, `:disabled`, `[aria-invalid="true"]`, `[data-loading]`.
- Focus is always visible, using the focus-ring token.
- Never declare `@font-face` or import fonts in a component; fonts come from `@jpm1475/ds-fonts` at the app level.
- Text uses `typography-semantics` tokens only (never `typography-primitives`). Don't add your own font-size media queries; the tokens already change per breakpoint.
- Icons get color from the `icon-context` token: `color: var(--ds-icon-color-icon-context)`, with icons drawn in `currentColor`. A component sets the context with `data-icon-context="<mode>"` on the element that owns the icon (for example `inverse` on a dark surface, `disabled` when disabled).
- Never use `primitives` or `typography-primitives` variables; check `@jpm1475/ds-tokens/tier-map.json` if unsure.
- Respect `prefers-reduced-motion` for any transition or animation.

## Behavior and accessibility (required per pattern)
- Native elements first. Never put click handlers on a div.
- Button: `type="button"` by default; loading sets `aria-busy` and keeps the label for screen readers.
- Inputs: label always associated; errors linked with `aria-describedby`; `aria-invalid` when invalid.
- Dialog: native `<dialog>` or equivalent focus trap; Escape closes; focus returns to the trigger; labelled by its heading.
- Menu and listbox: arrow-key navigation, Home and End, typeahead, Escape closes, roving tabindex or `aria-activedescendant`.
- Tabs: arrow keys move between tabs; Tab moves into the panel.
- Every interactive component is reachable and operable by keyboard alone.

## Tests
- Testing Library, user-centric queries (`getByRole`).
- Keyboard interactions with `user-event`.
- One axe check per component with no violations.

## Stories
One story per variant, size and state, plus an "All variants" story. Use args so controls work.
