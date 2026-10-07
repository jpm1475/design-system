import { createRef } from 'react';
import type { MouseEvent } from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Hero } from './Hero';
import type { HeroProps } from './Hero';

const baseProps: HeroProps = {
  headline: 'Ship consistent interfaces, faster',
  supportingText: 'Tokens, components and page blocks that stay in sync with Figma.',
  primaryAction: { label: 'Get started', href: '/start' },
  secondaryAction: { label: 'Read the docs', href: '/docs' },
};

describe('Hero', () => {
  it('renders a region landmark labelled by the headline', () => {
    render(<Hero {...baseProps} />);
    const region = screen.getByRole('region', { name: baseProps.headline });
    expect(region.tagName).toBe('SECTION');
    expect(within(region).getByRole('heading', { name: baseProps.headline })).toBeInTheDocument();
  });

  it('renders the headline as an h1 by default with a display type role', () => {
    render(<Hero {...baseProps} />);
    const heading = screen.getByRole('heading', { level: 1, name: baseProps.headline });
    expect(heading).toHaveAttribute('data-variant', 'display2');
  });

  it('respects headingLevel without changing the visual role', () => {
    render(<Hero {...baseProps} headingLevel={3} />);
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 3, name: baseProps.headline });
    expect(heading).toHaveAttribute('data-variant', 'display2');
  });

  it('renders the supporting text as a lead paragraph', () => {
    render(<Hero {...baseProps} />);
    const text = screen.getByText(baseProps.supportingText);
    expect(text.tagName).toBe('P');
    expect(text).toHaveAttribute('data-variant', 'body1');
    expect(text).toHaveAttribute('data-tone', 'secondary');
  });

  it('renders both actions as links, not buttons', () => {
    render(<Hero {...baseProps} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const primary = screen.getByRole('link', { name: 'Get started' });
    const secondary = screen.getByRole('link', { name: 'Read the docs' });
    expect(primary.tagName).toBe('A');
    expect(primary).toHaveAttribute('href', '/start');
    expect(primary).toHaveAttribute('data-variant', 'primary');
    expect(secondary).toHaveAttribute('href', '/docs');
    expect(secondary).toHaveAttribute('data-variant', 'secondary');
  });

  it('omits the secondary action when not given', () => {
    render(<Hero {...baseProps} secondaryAction={undefined} />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('passes anchor props and handlers through to the action links', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(
      <Hero
        {...baseProps}
        primaryAction={{ label: 'Get started', href: '/start', onClick }}
        secondaryAction={{
          label: 'Read the docs',
          href: 'https://example.com',
          target: '_blank',
          rel: 'noopener noreferrer',
        }}
      />,
    );
    const secondary = screen.getByRole('link', { name: 'Read the docs' });
    expect(secondary).toHaveAttribute('target', '_blank');
    expect(secondary).toHaveAttribute('rel', 'noopener noreferrer');
    expect(secondary).not.toHaveAttribute('label');

    await user.tab();
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders no image by default', () => {
    render(<Hero {...baseProps} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the image with its alt text and uses the smaller display role beside it', () => {
    render(<Hero {...baseProps} image={{ src: '/hero.png', alt: 'Product dashboard' }} />);
    const img = screen.getByRole('img', { name: 'Product dashboard' });
    expect(img).toHaveAttribute('src', '/hero.png');
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('data-variant', 'display3');
  });

  it('merges className and native section props onto the root', () => {
    render(<Hero {...baseProps} className="custom" data-testid="hero" id="top" />);
    const root = screen.getByTestId('hero');
    expect(root).toHaveClass('custom');
    expect(root.className.split(' ').length).toBeGreaterThan(1);
    expect(root).toHaveAttribute('id', 'top');
  });

  it('forwards its ref to the section element', () => {
    const ref = createRef<HTMLElement>();
    render(<Hero {...baseProps} ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('region'));
  });

  it('gives each instance a unique heading id', () => {
    render(
      <>
        <Hero {...baseProps} headline="First" />
        <Hero {...baseProps} headline="Second" headingLevel={2} />
      </>,
    );
    expect(screen.getByRole('region', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Second' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <main>
        <Hero {...baseProps} image={{ src: '/hero.png', alt: 'Product dashboard' }} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
