// ¿Qué? Componente de input con label, error, ícono y estados de validación.
// ¿Para qué? Estandarizar los inputs del sistema con clases Tailwind y A11y (WCAG 2.1 AA).
// ¿Impacto? Todos los formularios usan este componente. Errores con AlertCircle de Lucide.

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      required = false,
      fullWidth = true,
      wrapperClassName = '',
      id: providedId,
      disabled,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = providedId ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);
    const showHelper = !hasError && helperText;

    return (
      <div
        className={cn('flex flex-col gap-1.5 font-sans', fullWidth && 'w-full', wrapperClassName)}
      >
        {/* LABEL */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'flex items-center gap-1 text-xs font-semibold',
              hasError ? 'text-[var(--color-danger)]' : 'text-[var(--text-secondary)]',
            )}
          >
            {label}
            {required && (
              <span className="text-[var(--color-danger)]" aria-label="Campo requerido">
                *
              </span>
            )}
          </label>
        )}

        {/* INPUT CONTAINER */}
        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className={cn(
                'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2',
                'flex items-center justify-center',
                hasError ? 'text-[var(--color-danger)]' : 'text-[var(--text-tertiary)]',
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : showHelper ? helperId : undefined}
            className={cn(
              'w-full rounded-lg py-2.5 font-sans text-sm outline-none',
              'text-[var(--text-primary)] transition-colors duration-150',

              disabled
                ? 'cursor-not-allowed bg-[var(--bg-tertiary)] opacity-60'
                : 'cursor-text bg-[var(--bg-secondary)]',

              hasError
                ? 'border border-[var(--color-danger)]'
                : 'border border-[var(--border)] focus:border-[var(--border-focus)]',

              !hasError && 'focus:ring-2 focus:ring-[var(--color-primary)]/20',

              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon ? 'pr-9' : 'pr-3.5',

              className,
            )}
            {...rest}
          />

          {rightIcon && (
            <span
              className={cn(
                'absolute right-2.5 top-1/2 -translate-y-1/2',
                'flex items-center justify-center',
                hasError ? 'text-[var(--color-danger)]' : 'text-[var(--text-tertiary)]',
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* MENSAJES (Error unificado con Lucide) */}
        {hasError && (
          <span
            id={errorId}
            role="alert"
            className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-[var(--color-danger)]"
          >
            <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </span>
        )}

        {showHelper && (
          <span id={helperId} className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';