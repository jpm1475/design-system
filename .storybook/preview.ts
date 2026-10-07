import type { Preview } from '@storybook/react-vite';
import { breakpoints } from '@jpm1475/ds-tokens';
import '@jpm1475/ds-fonts/fonts.css';
import '@jpm1475/ds-tokens/tokens.css';

// Width used for the base breakpoint, whose min-width is 0.
const BASE_VIEWPORT_WIDTH = 375;

const viewports = Object.fromEntries(
  Object.entries(breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([name, minWidth]) => {
      const width = minWidth || BASE_VIEWPORT_WIDTH;
      return [
        name,
        {
          name: `${name[0].toUpperCase()}${name.slice(1)} (${width}px)`,
          styles: { width: `${width}px`, height: '900px' },
          type: width < 600 ? 'mobile' : width < 1200 ? 'tablet' : 'desktop',
        },
      ];
    }),
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: { options: viewports },
    options: {
      storySort: { order: ['Foundations', 'Components', 'Patterns', 'Blocks'] },
    },
    a11y: { test: 'error' },
  },
  // Load every THICCCBOI face before a story renders, so Storybook and Chromatic
  // never capture the fallback font.
  loaders: [
    async () => {
      const faces = [...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'THICCCBOI');
      await Promise.all(faces.map((f) => f.load()));
      await document.fonts.ready;
      return {};
    },
  ],
};

export default preview;
