import type { ReactNode } from 'react';
import type { ButtonVariant } from './Button';
import styles from './Button.module.css';

// Internal: shared by Button and ButtonLink so both render the same markup and classes.
// Not exported from the package.

/** Resting icon context per variant. Hover and pressed contexts are switched in CSS. */
export const buttonIconContext: Record<ButtonVariant, string | undefined> = {
  primary: 'inverse',
  secondary: undefined,
  danger: 'inverse',
  tertiary: undefined,
};

export interface ButtonContentProps {
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children?: ReactNode;
}

/** Label with the optional icon slots, hidden from assistive tech. */
export function ButtonContent({ iconStart, iconEnd, children }: ButtonContentProps) {
  return (
    <span className={styles.content}>
      {iconStart != null && (
        <span className={styles.icon} aria-hidden="true">
          {iconStart}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {iconEnd != null && (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      )}
    </span>
  );
}
