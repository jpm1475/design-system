import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders a native button with type="button" by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('respects an explicit type', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit');
  });

  it('renders variant and size as data attributes with defaults', () => {
    const { rerender } = render(<Button>Go</Button>);
    const button = screen.getByRole('button', { name: 'Go' });
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'md');
    rerender(
      <Button variant="danger" size="xs">
        Go
      </Button>,
    );
    expect(button).toHaveAttribute('data-variant', 'danger');
    expect(button).toHaveAttribute('data-size', 'xs');
  });

  it('activates with click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not fire onClick when disabled and is not focusable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();

    await user.click(button);
    await user.tab();
    expect(button).not.toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('when loading, stays focusable, keeps its label, sets aria-busy and ignores activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-loading');

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not submit its form while loading', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent as SubmitEvent)}>
        <Button type="submit" loading>
          Send
        </Button>
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders icon slots hidden from assistive tech', () => {
    render(
      <Button iconStart={<svg data-testid="before" />} iconEnd={<svg data-testid="after" />}>
        Next
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Next' });
    expect(screen.getByTestId('before').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('after').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('data-icon-context', 'inverse');
  });

  it('sets the icon context for the disabled state', () => {
    render(
      <Button variant="secondary" disabled>
        Next
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute(
      'data-icon-context',
      'secondary',
    );
  });

  it('merges className onto the root', () => {
    render(<Button className="custom">Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('custom');
    expect(button.className.split(' ').length).toBeGreaterThan(1);
  });

  it('forwards its ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Save' }));
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary" iconEnd={<svg />}>
          Secondary
        </Button>
        <Button variant="danger" disabled>
          Danger
        </Button>
        <Button variant="tertiary" loading>
          Tertiary
        </Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
