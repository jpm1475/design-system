import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Heading } from './Heading';
import type { HeadingLevel } from './Heading';

const levels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

describe('Heading', () => {
  it('renders an h1 with the h1 variant by default', () => {
    render(<Heading>Title</Heading>);
    const heading = screen.getByRole('heading', { level: 1, name: 'Title' });
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveAttribute('data-variant', 'h1');
  });

  it.each(levels)('level %i renders the matching element and default variant', (level) => {
    render(<Heading level={level}>Title</Heading>);
    const heading = screen.getByRole('heading', { level, name: 'Title' });
    expect(heading.tagName).toBe(`H${level}`);
    expect(heading).toHaveAttribute('data-variant', `h${level}`);
  });

  it('keeps variant independent of level', () => {
    render(
      <>
        <Heading level={2} variant="display1">
          Big
        </Heading>
        <Heading level={1} variant="h7">
          Small
        </Heading>
      </>,
    );
    const big = screen.getByRole('heading', { name: 'Big' });
    expect(big.tagName).toBe('H2');
    expect(big).toHaveAttribute('data-variant', 'display1');
    const small = screen.getByRole('heading', { name: 'Small' });
    expect(small.tagName).toBe('H1');
    expect(small).toHaveAttribute('data-variant', 'h7');
  });

  it('passes native attributes through', () => {
    render(<Heading id="intro">Title</Heading>);
    expect(screen.getByRole('heading', { name: 'Title' })).toHaveAttribute('id', 'intro');
  });

  it('merges className onto the root', () => {
    render(<Heading className="custom">Title</Heading>);
    const heading = screen.getByRole('heading', { name: 'Title' });
    expect(heading).toHaveClass('custom');
    expect(heading.className.split(' ').length).toBeGreaterThan(1);
  });

  it('forwards its ref to the heading element', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading level={3} ref={ref}>
        Title
      </Heading>,
    );
    expect(ref.current).toBe(screen.getByRole('heading', { level: 3, name: 'Title' }));
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Heading variant="display1">Display</Heading>
        <Heading level={2}>Section</Heading>
        <Heading level={3} variant="h7">
          Subsection
        </Heading>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
