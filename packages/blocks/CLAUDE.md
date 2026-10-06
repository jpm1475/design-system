# Blocks

Blocks are full-width page sections (Hero, FeatureGrid, Pricing, Testimonials, FAQ, Footer).

- Compose only from `@jpm1475/ds-components`. If something is missing, stop and build the component first.
- Never restyle a component's internals. Blocks only lay components out.
- Layout CSS uses spacing, size and breakpoint tokens only, inside `@layer ds`, with container queries for responsive behavior.
- All content arrives as typed props: text, images (src, alt), links (href, label) and lists of items. No data fetching, routing or global state.
- Use correct landmarks and heading levels; accept a `headingLevel` prop when a block can appear at different depths.
- Stories: `parameters: { layout: 'fullscreen' }`, realistic placeholder content, and mobile, tablet and desktop viewports.
- Same file anatomy, export rules and test rules as components.
