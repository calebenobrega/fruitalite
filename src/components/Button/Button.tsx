import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'icon') {
    return (
      <button type={type} className={classes} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
