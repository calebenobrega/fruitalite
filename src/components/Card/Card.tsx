import type { ReactNode, MouseEventHandler } from 'react';
import { Check } from 'lucide-react';
import styles from './Card.module.css';

export type CardVariant = 'static' | 'interactive' | 'selectable';

type CardProps = {
  variant?: CardVariant;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
};

export function Card({
  variant = 'static',
  selected = false,
  onClick,
  className,
  children,
  'aria-label': ariaLabel,
}: CardProps) {
  const classes = [
    styles.card,
    variant === 'interactive' ? styles.interactive : null,
    variant === 'selectable' ? styles.selectable : null,
    variant === 'selectable' && selected ? styles.selected : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'static') {
    return (
      <div className={classes} aria-label={ariaLabel}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={variant === 'selectable' ? selected : undefined}
    >
      {children}
      {variant === 'selectable' && (
        <span className={styles.checkIndicator} aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
