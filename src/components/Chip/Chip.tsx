import type { ReactNode, MouseEventHandler } from 'react';
import styles from './Chip.module.css';

export type ChipVariant = 'primary' | 'warning' | 'success' | 'neutral' | 'info' | 'error';
export type ChipSize = 'sm' | 'md';

type ChipProps = {
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  selected?: boolean;
  className?: string;
  children: ReactNode;
};

export function Chip({
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  selected = false,
  className,
  children,
}: ChipProps) {
  const classes = [
    styles.chip,
    styles[variant],
    styles[size],
    onClick ? styles.interactive : null,
    selected ? styles.selected : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-pressed={selected}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }

  return (
    <span className={classes}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
