import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import styles from './Input.module.css';

export type InputVariant = 'default' | 'numeric' | 'search';

type InputProps = {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  optional?: boolean;
  prefix?: string;
  suffix?: string;
  onClear?: () => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    variant = 'default',
    optional = false,
    prefix,
    suffix,
    onClear,
    className,
    id,
    value,
    onFocus,
    onBlur,
    disabled,
    inputMode,
    type,
    placeholder,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);

  const isSearch = variant === 'search';
  const isNumeric = variant === 'numeric';

  const wrapperClasses = [
    styles.inputWrapper,
    focused ? styles.focused : null,
    error ? styles.error : null,
    disabled ? styles.disabled : null,
    isSearch ? styles.hasLeadingIcon : null,
    prefix && !isSearch ? styles.hasPrefix : null,
    suffix && !isSearch ? styles.hasSuffix : null,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [styles.input, isNumeric ? styles.numeric : null, className]
    .filter(Boolean)
    .join(' ');

  const resolvedInputMode = inputMode ?? (isNumeric ? 'decimal' : undefined);
  const resolvedType = type ?? 'text';
  const resolvedPlaceholder = placeholder ?? (isSearch ? 'Buscar...' : undefined);

  const showClear = isSearch && typeof value === 'string' && value.length > 0 && !disabled;

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}>(opcional)</span>}
        </label>
      )}
      <div className={wrapperClasses}>
        {isSearch && (
          <span className={styles.leadingIcon} aria-hidden="true">
            <Search size={16} strokeWidth={2} />
          </span>
        )}
        {prefix && !isSearch && <span className={styles.prefix}>{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          type={resolvedType}
          inputMode={resolvedInputMode}
          value={value}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? `${inputId}-helper` : undefined}
          {...rest}
        />
        {suffix && !isSearch && <span className={styles.suffix}>{suffix}</span>}
        {showClear && onClear && (
          <button
            type="button"
            onClick={onClear}
            className={styles.trailingButton}
            aria-label="Limpar busca"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>
      {(error || helperText) && (
        <div
          id={`${inputId}-helper`}
          className={[styles.helper, error ? styles.errorText : null].filter(Boolean).join(' ')}
        >
          {error ?? helperText}
        </div>
      )}
    </div>
  );
});
