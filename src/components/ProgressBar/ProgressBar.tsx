import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  value: number;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
};

export function ProgressBar({ value, size = 'md', label, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const classes = [styles.track, styles[size], className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  );
}
