# Blocks

Blocks are full-width page sections (Hero, FeatureGrid, Pricing, Testimonials, FAQ, Footer).

- Compose only from `@jpm1475/ds-components` (components and patterns). If something is missing, stop and build it first with `/ds-pipeline:component` or `/ds-pipeline:pattern`.
- Stories are titled `Blocks/<Name>`.
- The package builds with the Vite config copied from the components package (switched when the first block, `Hero`, was added).
- Never restyle a component's internals. Blocks only lay components out.
- Layout CSS uses spacing, size and breakpoint tokens only, inside `@layer ds`, with container queries for responsive behavior.
- All content arrives as typed props: text, images (src, alt), links (href, label) and lists of items. No data fetching, routing or global state.
- Use correct landmarks and heading levels; accept a `headingLevel` prop when a block can appear at different depths.
- Stories: `parameters: { layout: 'fullscreen' }`, realistic placeholder content, and mobile, tablet and desktop viewports.
- Same file anatomy, export rules and test rules as components.
