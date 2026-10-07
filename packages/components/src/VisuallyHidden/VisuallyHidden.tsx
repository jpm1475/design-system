import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './VisuallyHidden.module.css';

export interface VisuallyHiddenProps extends ComponentPropsWithoutRef<'span'> {
  /** Show the content when it (or a child) has keyboard focus, for example a skip link. */
  focusable?: boolean;
}

/** Content for screen readers only: removed visually, kept in the accessibility tree. */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ focusable = false, className, children, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-focusable={focusable || undefined}
        className={className ? `${styles.root} ${className}` : styles.root}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

VisuallyHidden.displayName = 'VisuallyHidden';
