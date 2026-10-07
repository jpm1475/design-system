import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Heading.module.css';

/** Document outline level: renders `h1` to `h6`. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Type role from typography-semantics (`--ds-type-<variant>-*`). */
export type HeadingVariant =
  'display1' | 'display2' | 'display3' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';

export interface HeadingProps extends ComponentPropsWithoutRef<'h1'> {
  /** Heading level in the document outline; picks the element `h1` to `h6`. */
  level?: HeadingLevel;
  /** Type role, independent of `level`. Defaults to the role matching the level (`h${level}`). */
  variant?: HeadingVariant;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 1, variant, className, children, ...rest },
  ref,
) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      ref={ref}
      data-variant={variant ?? `h${level}`}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    >
      {children}
    </Tag>
  );
});

Heading.displayName = 'Heading';
