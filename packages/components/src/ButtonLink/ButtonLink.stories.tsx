import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import type { ButtonSize, ButtonVariant } from '../Button';
import { ButtonLink } from './ButtonLink';

// The arrow used by the Figma Button's Icon Before / Icon After slots, drawn in currentColor.
const Arrow = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16.63 7.29a1 1 0 0 1 1.41 0l8 8a1 1 0 0 1 0 1.42l-8 8a1 1 0 0 1-1.41-1.42L22.92 17H6.67a1 1 0 1 1 0-2h16.25l-6.3-6.29a1 1 0 0 1 0-1.42Z" />
  </svg>
);

const variants: ButtonVariant[] = ['primary', 'secondary', 'danger', 'tertiary'];
const sizes: ButtonSize[] = ['xl', 'lg', 'md', 'sm', 'xs'];

const meta = {
  title: 'Components/ButtonLink',
  component: ButtonLink,
  args: {
    children: 'Button Label',
    href: '#',
    variant: 'primary',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    size: { control: 'inline-radio', options: sizes },
    iconStart: { control: false },
    iconEnd: { control: false },
  },
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants (Button's Figma `Type`)
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Danger: Story = { args: { variant: 'danger' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };

// Sizes (Button's Figma `Size`)
export const SizeXL: Story = { name: 'Size XL', args: { size: 'xl' } };
export const SizeLG: Story = { name: 'Size LG', args: { size: 'lg' } };
export const SizeMD: Story = { name: 'Size MD', args: { size: 'md' } };
export const SizeSM: Story = { name: 'Size SM', args: { size: 'sm' } };
export const SizeXS: Story = { name: 'Size XS', args: { size: 'xs' } };

// States. Hover, Pressed and Focus use storybook-addon-pseudo-states. Links have no disabled
// or loading state: use Button for actions that can be unavailable.
export const Default: Story = {};
export const Hover: Story = { parameters: { pseudo: { hover: true } } };
export const Pressed: Story = { parameters: { pseudo: { hover: true, active: true } } };
export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

// Icon slots (Button's Figma `Icon Before` / `Icon After`)
export const WithIcons: Story = {
  args: { iconStart: <Arrow />, iconEnd: <Arrow /> },
};

// Opens in a new tab: target and rel pass through to the anchor.
export const External: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    iconEnd: <Arrow />,
  },
};

// Side by side with Button: each pair must look identical.
export const ComparedWithButton: Story = {
  name: 'Compared with Button',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Button variant={variant} size={args.size} iconEnd={<Arrow />}>
            {args.children}
          </Button>
          <ButtonLink {...args} variant={variant} iconEnd={<Arrow />} />
        </div>
      ))}
    </div>
  ),
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
              <ButtonLink {...args} variant={variant} size={size} />
              <ButtonLink
                {...args}
                variant={variant}
                size={size}
                iconStart={<Arrow />}
                iconEnd={<Arrow />}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
