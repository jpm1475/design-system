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
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  children?: ReactNode;
}

/** Label with the optional icon slots, hidden from assistive tech. */
export function ButtonContent({ iconBefore, iconAfter, children }: ButtonContentProps) {
  return (
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
  );
}
