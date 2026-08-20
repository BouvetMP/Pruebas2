// ¿Qué? Componente de input con label, error, ícono y estados de validación.
// ¿Para qué? Estandarizar los inputs del sistema con clases Tailwind.
// ¿Impacto? Todos los formularios usan este componente, garantizando
//           consistencia visual y cumplimiento de accesibilidad (WCAG 2.1 AA).

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del Input. */
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
    ref
  ) => {
    // Generar ID único si no se proporciona (para vincular label ↔ input).
    const generatedId = useId();
    const inputId = providedId ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);
    const showHelper = !hasError && helperText;

    return (
      <div
        className={cn(
          'flex flex-col gap-1.5 font-sans',
          fullWidth && 'w-full',
          wrapperClassName
        )}
      >
        {/* ================================================================
            LABEL
            ================================================================ */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-xs font-semibold flex items-center gap-1',
              hasError
                ? 'text-[var(--color-danger)]'
                : 'text-[var(--text-secondary)]'
            )}
          >
            {label}
            {required && (
              <span
                className="text-[var(--color-danger)]"
                aria-label="Campo requerido"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* ================================================================
            INPUT CONTAINER (posiciona íconos absolutos)
            ================================================================ */}
        <div className="relative flex items-center">

          {/* Ícono izquierdo */}
          {leftIcon && (
            <span
              className={cn(
                'absolute left-2.5 top-1/2 -translate-y-1/2',
                'flex items-center justify-center pointer-events-none',
                hasError
                  ? 'text-[var(--color-danger)]'
                  : 'text-[var(--text-tertiary)]'
              )}
            >
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : showHelper ? helperId : undefined
            }
            className={cn(
              // Base
              'w-full py-2.5 text-sm font-sans rounded-lg outline-none',
              'text-[var(--text-primary)]',
              'transition-colors duration-150',

              // Background según estado
              disabled
                ? 'bg-[var(--bg-tertiary)] cursor-not-allowed opacity-60'
                : 'bg-[var(--bg-secondary)] cursor-text',

              // Borde según error
              hasError
                ? 'border border-[var(--color-danger)]'
                : 'border border-[var(--border)] focus:border-[var(--border-focus)]',

              // Focus ring (solo sin error para no duplicar colores)
              !hasError && 'focus:ring-2 focus:ring-[var(--color-primary)]/20',

              // Padding horizontal (ajustar por presencia de íconos)
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon ? 'pr-9' : 'pr-3.5',

              // Clase externa
              className
            )}
            {...rest}
          />

          {/* Ícono derecho (pointer-events habilitado para botones como toggle password) */}
          {rightIcon && (
            <span
              className={cn(
                'absolute right-2.5 top-1/2 -translate-y-1/2',
                'flex items-center justify-center',
                hasError
                  ? 'text-[var(--color-danger)]'
                  : 'text-[var(--text-tertiary)]'
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* ================================================================
            MENSAJES (error o helper, nunca ambos)
            ================================================================ */}

        {/* Error */}
        {hasError && (
          <span
            id={errorId}
            role="alert"
            className="text-[11px] font-semibold text-[var(--color-danger)] mt-0.5"
          >
            ⚠️ {error}
          </span>
        )}

        {/* Helper */}
        {showHelper && (
          <span
            id={helperId}
            className="text-[11px] text-[var(--text-tertiary)] mt-0.5"
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';