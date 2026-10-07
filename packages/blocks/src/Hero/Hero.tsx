import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { ButtonLink, Heading, Text } from '@jpm1475/ds-components';
import type { ButtonLinkProps, HeadingLevel } from '@jpm1475/ds-components';
import styles from './Hero.module.css';

/** A call to action. Rendered as a ButtonLink (`<a href>`); other anchor props pass through. */
export interface HeroAction extends Omit<ButtonLinkProps, 'children' | 'variant' | 'size'> {
  /** Visible link text. */
  label: string;
}

/** Optional image beside the text. `alt` is required; pass `''` only for a purely decorative image. */
export interface HeroImage {
  src: string;
  alt: string;
}

export interface HeroProps extends Omit<ComponentPropsWithoutRef<'section'>, 'children'> {
  /** Main headline. Labels the section. */
  headline: string;
  /** Lead paragraph under the headline. */
  supportingText: string;
  /** Main call to action, rendered as a primary ButtonLink. */
  primaryAction: HeroAction;
  /** Optional second call to action, rendered as a secondary ButtonLink. */
  secondaryAction?: HeroAction;
  /** Optional image. With an image the layout splits into two columns on wide containers. */
  image?: HeroImage;
  /** Outline level of the headline (`h1` to `h6`). The visual size does not change. Defaults to 1. */
  headingLevel?: HeadingLevel;
}

export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero(
  {
    headline,
    supportingText,
    primaryAction,
    secondaryAction,
    image,
    headingLevel = 1,
    className,
    ...rest
  },
  ref,
) {
  const headingId = useId();

  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    >
      <div className={styles.inner} data-has-image={image ? true : undefined}>
        <div className={styles.content}>
          {/* display2 for a full-width hero; display3 when the headline shares the row with an image. */}
          <Heading id={headingId} level={headingLevel} variant={image ? 'display3' : 'display2'}>
            {headline}
          </Heading>
          <Text variant="body1" tone="secondary">
            {supportingText}
          </Text>
          <div className={styles.actions}>
            {renderAction(primaryAction, 'primary')}
            {secondaryAction && renderAction(secondaryAction, 'secondary')}
          </div>
        </div>
        {image && <img className={styles.image} src={image.src} alt={image.alt} />}
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

/** Renders an action as a large ButtonLink; the label becomes its children, the rest pass through. */
function renderAction({ label, ...linkProps }: HeroAction, variant: 'primary' | 'secondary') {
  return (
    <ButtonLink {...linkProps} variant={variant} size="lg">
      {label}
    </ButtonLink>
  );
}
