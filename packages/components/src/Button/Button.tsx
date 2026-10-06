'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import styles from './Button.module.css';

/** Figma `Type`: Primary, Secondary, Danger, Tertiary. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'tertiary';

/** Figma `Size`: XL, LG, MD, SM, XS. */
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Visual style. Maps to Figma `Type`. */
  variant?: ButtonVariant;
  /** Height, padding, type role and icon size. Maps to Figma `Size`. */
  size?: ButtonSize;
  /** Shows a spinner, sets `aria-busy`, and ignores clicks. The label stays in the accessible name. */
  loading?: boolean;
  /** Icon shown before the label (Figma `Icon Before`). Draw it in `currentColor`. */
  iconBefore?: ReactNode;
  /** Icon shown after the label (Figma `Icon After`). Draw it in `currentColor`. */
  iconAfter?: ReactNode;
}

// Resting icon context per variant. Hover and pressed contexts are switched in CSS.
const iconContext: Record<ButtonVariant, string | undefined> = {
  primary: 'inverse',
  secondary: undefined,
  danger: 'inverse',
  tertiary: undefined,
};

const disabledIconContext: Record<ButtonVariant, string> = {
  primary: 'disabled',
  secondary: 'secondary',
  danger: 'disabled',
  tertiary: 'secondary',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    iconBefore,
    iconAfter,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-icon-context={disabled ? disabledIconContext[variant] : iconContext[variant]}
      className={className ? `${styles.root} ${className}` : styles.root}
      onClick={handleClick}
      {...rest}
    >
      <span className={styles.content}>
        {iconBefore != null && (
          <span className={styles.icon} aria-hidden="true">
            {iconBefore}
          </span>
        )}
        <span className={styles.label}>{children}</span>
        {iconAfter != null && (
          <span className={styles.icon} aria-hidden="true">
            {iconAfter}
          </span>
        )}
      </span>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
});

Button.displayName = 'Button';
