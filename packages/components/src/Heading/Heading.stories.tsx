import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';
import type { HeadingLevel, HeadingVariant } from './Heading';

const variants: HeadingVariant[] = [
  'display1',
  'display2',
  'display3',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'h7',
];
const levels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

const meta = {
  title: 'Components/Heading',
  component: Heading,
  args: {
    children: 'The quick brown fox',
    level: 1,
  },
  argTypes: {
    level: { control: 'inline-radio', options: levels },
    variant: { control: 'select', options: [undefined, ...variants] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default: h1 element with the h1 type role.
export const Default: Story = {};

// Variants (type roles). Level stays 1 unless set; variant is independent of level.
export const Display1: Story = { args: { variant: 'display1' } };
export const Display2: Story = { args: { variant: 'display2' } };
export const Display3: Story = { args: { variant: 'display3' } };
export const H1: Story = { args: { variant: 'h1' } };
export const H2: Story = { args: { variant: 'h2' } };
export const H3: Story = { args: { variant: 'h3' } };
export const H4: Story = { args: { variant: 'h4' } };
export const H5: Story = { args: { variant: 'h5' } };
export const H6: Story = { args: { variant: 'h6' } };
export const H7: Story = { args: { variant: 'h7' } };

// Level and variant set separately: an h2 in the document outline styled as display1.
export const LevelIndependentOfVariant: Story = {
  name: 'Level independent of variant',
  args: { level: 2, variant: 'display1' },
};

export const AllVariants: Story = {
  name: 'All variants',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      {variants.map((variant) => (
        <Heading key={variant} {...args} level={2} variant={variant}>
          {variant}: {args.children}
        </Heading>
      ))}
    </div>
  ),
};
