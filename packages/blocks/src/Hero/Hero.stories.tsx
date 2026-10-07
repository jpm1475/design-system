import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hero } from './Hero';

// Self-contained placeholder artwork (no network), standing in for a product screenshot.
const productShot = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="#eef1f6"/>
  <rect x="80" y="80" width="1040" height="740" rx="24" fill="#ffffff" stroke="#d4dae4" stroke-width="4"/>
  <rect x="80" y="80" width="1040" height="72" rx="24" fill="#1f2a44"/>
  <circle cx="132" cy="116" r="10" fill="#ff6b6b"/><circle cx="168" cy="116" r="10" fill="#ffd166"/><circle cx="204" cy="116" r="10" fill="#06d6a0"/>
  <rect x="136" y="208" width="280" height="40" rx="8" fill="#1f2a44"/>
  <rect x="136" y="272" width="420" height="20" rx="6" fill="#c3cad6"/>
  <rect x="136" y="308" width="360" height="20" rx="6" fill="#c3cad6"/>
  <rect x="136" y="372" width="160" height="52" rx="12" fill="#3d5afe"/>
  <rect x="316" y="372" width="160" height="52" rx="12" fill="none" stroke="#3d5afe" stroke-width="4"/>
  <rect x="640" y="208" width="424" height="260" rx="16" fill="#dfe6ff"/>
  <rect x="136" y="520" width="296" height="240" rx="16" fill="#f5f7fa" stroke="#d4dae4" stroke-width="3"/>
  <rect x="452" y="520" width="296" height="240" rx="16" fill="#f5f7fa" stroke="#d4dae4" stroke-width="3"/>
  <rect x="768" y="520" width="296" height="240" rx="16" fill="#f5f7fa" stroke="#d4dae4" stroke-width="3"/>
</svg>`)}`;

const meta = {
  title: 'Blocks/Hero',
  component: Hero,
  parameters: { layout: 'fullscreen' },
  args: {
    headline: 'Ship consistent interfaces, faster',
    supportingText:
      'Tokens, components and page blocks that stay in sync with Figma, so your team spends less time redrawing buttons and more time building the product.',
    primaryAction: { label: 'Get started', href: '#get-started' },
    secondaryAction: { label: 'Read the docs', href: '#docs' },
    headingLevel: 1,
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

const image = {
  src: productShot,
  alt: 'Dashboard built with the design system, showing a page header, two buttons and three cards',
};

export const Default: Story = {};

export const WithImage: Story = { args: { image } };

export const PrimaryActionOnly: Story = { args: { secondaryAction: undefined } };

export const NestedHeading: Story = {
  name: 'Heading level 2',
  args: { headingLevel: 2 },
};

// Viewports (keys come from packages/tokens/breakpoints.json via .storybook/preview.ts)
export const Mobile: Story = { globals: { viewport: { value: 'mobile', isRotated: false } } };
export const MobileWithImage: Story = {
  args: { image },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};
export const Tablet: Story = { globals: { viewport: { value: 'tablet', isRotated: false } } };
export const TabletWithImage: Story = {
  args: { image },
  globals: { viewport: { value: 'tablet', isRotated: false } },
};
export const Desktop: Story = { globals: { viewport: { value: 'desktop', isRotated: false } } };
export const DesktopWithImage: Story = {
  args: { image },
  globals: { viewport: { value: 'desktop', isRotated: false } },
};
