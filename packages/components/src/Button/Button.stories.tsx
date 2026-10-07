import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import type { ButtonSize, ButtonVariant } from './Button';

// The arrow used by the Figma component's Icon Before / Icon After slots, drawn in currentColor.
const Arrow = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16.63 7.29a1 1 0 0 1 1.41 0l8 8a1 1 0 0 1 0 1.42l-8 8a1 1 0 0 1-1.41-1.42L22.92 17H6.67a1 1 0 1 1 0-2h16.25l-6.3-6.29a1 1 0 0 1 0-1.42Z" />
  </svg>
);

const variants: ButtonVariant[] = ['primary', 'secondary', 'danger', 'tertiary'];
const sizes: ButtonSize[] = ['xl', 'lg', 'md', 'sm', 'xs'];

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button Label',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    size: { control: 'inline-radio', options: sizes },
    iconStart: { control: false },
    iconEnd: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants (Figma `Type`)
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Danger: Story = { args: { variant: 'danger' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };

// Sizes (Figma `Size`)
export const SizeXL: Story = { name: 'Size XL', args: { size: 'xl' } };
export const SizeLG: Story = { name: 'Size LG', args: { size: 'lg' } };
export const SizeMD: Story = { name: 'Size MD', args: { size: 'md' } };
export const SizeSM: Story = { name: 'Size SM', args: { size: 'sm' } };
export const SizeXS: Story = { name: 'Size XS', args: { size: 'xs' } };

// States (Figma `State`). Hover, Pressed and Focus use storybook-addon-pseudo-states.
export const Default: Story = {};
export const Hover: Story = { parameters: { pseudo: { hover: true } } };
export const Pressed: Story = { parameters: { pseudo: { hover: true, active: true } } };
export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };
export const Inactive: Story = { name: 'Inactive (disabled)', args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };

// Icon slots (Figma `Icon Before` / `Icon After`)
export const WithIcons: Story = {
  args: { iconStart: <Arrow />, iconEnd: <Arrow /> },
};

export const AllVariants: Story = {
  name: 'All variants',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'grid', gap: 12 }}>
          {variants.map((variant) => (
            <div key={variant} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Button {...args} variant={variant} size={size} />
              <Button
                {...args}
                variant={variant}
                size={size}
                iconStart={<Arrow />}
                iconEnd={<Arrow />}
              />
              <Button {...args} variant={variant} size={size} disabled />
              <Button {...args} variant={variant} size={size} loading />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
