import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from './VisuallyHidden';

const meta = {
  title: 'Components/Utilities/Visually Hidden',
  component: VisuallyHidden,
  args: { children: 'Only screen readers announce this text.' },
  parameters: {
    docs: {
      description: {
        component:
          'Hides content visually while keeping it for screen readers, for example a label for an icon-only button. Set `focusable` for skip links, which appear when focused.',
      },
    },
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <p>
      Visible text. <VisuallyHidden {...args} />
    </p>
  ),
};

export const SkipLink: Story = {
  args: { focusable: true, children: <a href="#main">Skip to content</a> },
  render: (args) => (
    <p>
      Press Tab to reveal the link: <VisuallyHidden {...args} />
    </p>
  ),
};
