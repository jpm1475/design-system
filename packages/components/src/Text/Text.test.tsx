import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  it('renders a paragraph with body5 and primary tone by default', () => {
    render(<Text>Copy</Text>);
    const text = screen.getByText('Copy');
    expect(text.tagName).toBe('P');
    expect(text).toHaveAttribute('data-variant', 'body5');
    expect(text).toHaveAttribute('data-tone', 'primary');
  });

  it.each(['p', 'span', 'div'] as const)('renders as %s', (as) => {
    render(<Text as={as}>Copy</Text>);
    expect(screen.getByText('Copy').tagName).toBe(as.toUpperCase());
  });

  it('renders variant and tone as data attributes', () => {
    render(
      <Text variant="body1" tone="secondary">
        Lead
      </Text>,
    );
    const text = screen.getByText('Lead');
    expect(text).toHaveAttribute('data-variant', 'body1');
    expect(text).toHaveAttribute('data-tone', 'secondary');
  });

  it('passes native attributes through', () => {
    render(<Text id="note">Copy</Text>);
    expect(screen.getByText('Copy')).toHaveAttribute('id', 'note');
  });

  it('merges className onto the root', () => {
    render(<Text className="custom">Copy</Text>);
    const text = screen.getByText('Copy');
    expect(text).toHaveClass('custom');
    expect(text.className.split(' ').length).toBeGreaterThan(1);
  });

  it('forwards its ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    const { rerender } = render(<Text ref={ref}>Copy</Text>);
    expect(ref.current).toBe(screen.getByText('Copy'));
    expect(ref.current?.tagName).toBe('P');
    rerender(
      <Text as="span" ref={ref}>
        Copy
      </Text>,
    );
    expect(ref.current?.tagName).toBe('SPAN');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Text variant="body1">Lead paragraph</Text>
        <Text>Body paragraph</Text>
        <Text as="span" variant="body7" tone="secondary">
          Caption
        </Text>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
