import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';
import type { TextElement, TextTone, TextVariant } from './Text';

const variants: TextVariant[] = ['body1', 'body2', 'body3', 'body4', 'body5', 'body6', 'body7'];
const tones: TextTone[] = ['primary', 'secondary', 'inverse'];
const elements: TextElement[] = ['p', 'span', 'div'];

// Inverse text needs a dark surface to be readable.
const inverseSurface = { background: 'var(--ds-color-surface-inverse)', padding: 16 };

const meta = {
  title: 'Components/Text',
  component: Text,
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
    as: 'p',
    variant: 'body5',
    tone: 'primary',
  },
  argTypes: {
    as: { control: 'inline-radio', options: elements },
    variant: { control: 'inline-radio', options: variants },
    tone: { control: 'inline-radio', options: tones },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Variants (type roles)
export const Body1: Story = { args: { variant: 'body1' } };
export const Body2: Story = { args: { variant: 'body2' } };
export const Body3: Story = { args: { variant: 'body3' } };
export const Body4: Story = { args: { variant: 'body4' } };
export const Body5: Story = { args: { variant: 'body5' } };
export const Body6: Story = { args: { variant: 'body6' } };
export const Body7: Story = { args: { variant: 'body7' } };

// Tones
export const Primary: Story = { args: { tone: 'primary' } };
export const Secondary: Story = { args: { tone: 'secondary' } };
export const Inverse: Story = {
  args: { tone: 'inverse' },
  decorators: [
    (Story) => (
      <div style={inverseSurface}>
        <Story />
      </div>
    ),
  ],
};

// Elements
export const AsSpan: Story = { name: 'As span', args: { as: 'span' } };
export const AsDiv: Story = { name: 'As div', args: { as: 'div' } };

export const AllVariants: Story = {
  name: 'All variants',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'grid', gap: 8 }}>
          {tones.map((tone) => (
            <div key={tone} style={tone === 'inverse' ? inverseSurface : undefined}>
              <Text {...args} variant={variant} tone={tone}>
                {variant} / {tone}: {args.children}
              </Text>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
