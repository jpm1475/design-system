import { createRef } from 'react';
import type { MouseEvent } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { ButtonLink } from './ButtonLink';

describe('ButtonLink', () => {
  it('renders a native link with its href', () => {
    render(<ButtonLink href="/start">Get started</ButtonLink>);
    const link = screen.getByRole('link', { name: 'Get started' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/start');
  });

  it('renders variant and size as data attributes with defaults', () => {
    const { rerender } = render(<ButtonLink href="/go">Go</ButtonLink>);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('data-variant', 'primary');
    expect(link).toHaveAttribute('data-size', 'md');
    rerender(
      <ButtonLink href="/go" variant="danger" size="xs">
        Go
      </ButtonLink>,
    );
    expect(link).toHaveAttribute('data-variant', 'danger');
    expect(link).toHaveAttribute('data-size', 'xs');
  });

  it('uses the same classes, attributes and markup as Button', () => {
    render(
      <>
        <Button variant="secondary" size="lg" iconEnd={<svg />}>
          Same
        </Button>
        <ButtonLink href="/same" variant="secondary" size="lg" iconEnd={<svg />}>
          Same
        </ButtonLink>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Same' });
    const link = screen.getByRole('link', { name: 'Same' });
    for (const cls of button.classList) expect(link).toHaveClass(cls);
    for (const attr of ['data-variant', 'data-size', 'data-icon-context']) {
      expect(link.getAttribute(attr)).toBe(button.getAttribute(attr));
    }
    expect(link.innerHTML).toBe(button.innerHTML);
  });

  it('is reachable with Tab and activates with Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(
      <ButtonLink href="/start" onClick={onClick}>
        Start
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'Start' });

    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('passes target and rel through', () => {
    render(
      <ButtonLink href="https://example.com" target="_blank" rel="noopener noreferrer">
        External
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders icon slots hidden from assistive tech', () => {
    render(
      <ButtonLink
        href="/next"
        iconStart={<svg data-testid="before" />}
        iconEnd={<svg data-testid="after" />}
      >
        Next
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'Next' });
    expect(screen.getByTestId('before').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('after').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(link).toHaveAttribute('data-icon-context', 'inverse');
  });

  it('merges className onto the root', () => {
    render(
      <ButtonLink href="/save" className="custom">
        Save
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'Save' });
    expect(link).toHaveClass('custom');
    expect(link.className.split(' ').length).toBeGreaterThan(1);
  });

  it('forwards its ref to the anchor element', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <ButtonLink href="/save" ref={ref}>
        Save
      </ButtonLink>,
    );
    expect(ref.current).toBe(screen.getByRole('link', { name: 'Save' }));
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <ButtonLink href="/a">Primary</ButtonLink>
        <ButtonLink href="/b" variant="secondary" iconEnd={<svg />}>
          Secondary
        </ButtonLink>
        <ButtonLink href="/c" variant="danger">
          Danger
        </ButtonLink>
        <ButtonLink href="/d" variant="tertiary" target="_blank" rel="noopener noreferrer">
          Tertiary
        </ButtonLink>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
