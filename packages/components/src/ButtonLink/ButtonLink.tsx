import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ButtonSize, ButtonVariant } from '../Button/Button';
import { ButtonContent, buttonIconContext } from '../Button/ButtonContent';
import buttonStyles from '../Button/Button.module.css';
import styles from './ButtonLink.module.css';

export interface ButtonLinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  /** Link destination. Required: a ButtonLink always navigates. Use Button for actions. */
  href: string;
  /** Visual style, identical to Button. Maps to Figma `Type`. */
  variant?: ButtonVariant;
  /** Height, padding, type role and icon size, identical to Button. Maps to Figma `Size`. */
  size?: ButtonSize;
  /** Icon shown before the label (Figma `Icon Before`). Draw it in `currentColor`. */
  iconBefore?: ReactNode;
  /** Icon shown after the label (Figma `Icon After`). Draw it in `currentColor`. */
  iconAfter?: ReactNode;
}

const rootClassName = `${buttonStyles.root} ${styles.root}`;

/** A link styled as a Button. Shares Button's stylesheet, so the two always look the same. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = 'primary', size = 'md', iconBefore, iconAfter, className, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      data-variant={variant}
      data-size={size}
      data-icon-context={buttonIconContext[variant]}
      className={className ? `${rootClassName} ${className}` : rootClassName}
      {...rest}
    >
      <ButtonContent iconBefore={iconBefore} iconAfter={iconAfter}>
        {children}
      </ButtonContent>
    </a>
  );
});

ButtonLink.displayName = 'ButtonLink';
