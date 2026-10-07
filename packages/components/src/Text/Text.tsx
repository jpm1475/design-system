import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, Ref } from 'react';
import styles from './Text.module.css';

/** Type role from typography-semantics (`--ds-type-<variant>-*`). `body1` is the largest. */
export type TextVariant = 'body1' | 'body2' | 'body3' | 'body4' | 'body5' | 'body6' | 'body7';

/** Text color, mapped to the semantic `--ds-color-text-*` tokens. */
export type TextTone = 'primary' | 'secondary' | 'inverse';

/** Element to render. */
export type TextElement = 'p' | 'span' | 'div';

export interface TextProps extends ComponentPropsWithoutRef<'p'> {
  /** Element to render. Defaults to `p`. */
  as?: TextElement;
  /** Type role. Defaults to `body5`, the 16px base body size at every breakpoint. */
  variant?: TextVariant;
  /** Text color. Use `inverse` on dark surfaces. */
  tone?: TextTone;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as: Tag = 'p', variant = 'body5', tone = 'primary', className, children, ...rest },
  ref,
) {
  return (
    <Tag
      // The ref points at whichever element `as` picks; all three are plain HTMLElements.
      ref={ref as Ref<HTMLParagraphElement & HTMLSpanElement & HTMLDivElement>}
      data-variant={variant}
      data-tone={tone}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    >
      {children}
    </Tag>
  );
});

Text.displayName = 'Text';
