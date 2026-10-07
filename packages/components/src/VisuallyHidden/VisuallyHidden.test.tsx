import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('keeps its content in the accessible name', () => {
    render(
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Close dialog</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('marks focusable content so it shows on focus', () => {
    render(
      <VisuallyHidden focusable>
        <a href="#main">Skip to content</a>
      </VisuallyHidden>,
    );
    expect(screen.getByRole('link').parentElement).toHaveAttribute('data-focusable');
  });

  it('merges className onto the root', () => {
    render(<VisuallyHidden className="custom">Hidden</VisuallyHidden>);
    const el = screen.getByText('Hidden');
    expect(el).toHaveClass('custom');
    expect(el.className.split(' ').length).toBeGreaterThan(1);
  });

  it('forwards its ref to the span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<VisuallyHidden ref={ref}>Hidden</VisuallyHidden>);
    expect(ref.current).toBe(screen.getByText('Hidden'));
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <button type="button">
        <VisuallyHidden>Search</VisuallyHidden>
      </button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
