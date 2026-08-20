// ¿Qué? Componente de textarea con label, error y contador de caracteres.
// ¿Para qué? Estandarizar los campos de texto largo con clases Tailwind.
// ¿Impacto? Se usa en validación de alertas, justificaciones y descripciones.

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del Textarea. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  showCharCount?: boolean;
  rows?: number;
  wrapperClassName?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Determina la clase de color del contador según la proximidad al límite.
 *
 * Rangos:
 *   0-74%  → gris (normal)
 *   75-89% → amarillo (cerca del límite)
 *   90-99% → naranja (advertencia)
 *   100%   → rojo (alcanzó el límite)
 */
function getCounterColorClass(current: number, max: number): string {
  const percentage = (current / max) * 100;
  if (percentage >= 100) return 'text-[var(--color-danger)]';
  if (percentage >= 90)  return 'text-[var(--color-orange)]';
  if (percentage >= 75)  return 'text-[var(--color-warning)]';
  return 'text-[var(--text-tertiary)]';
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      fullWidth = true,
      showCharCount = false,
      rows = 4,
      maxLength,
      value,
      wrapperClassName = '',
      id: providedId,
      disabled,
      className = '',
      ...rest
    },
    ref
  ) => {
    // Generar ID único si no se proporciona (para vincular label ↔ textarea).
    const generatedId = useId();
    const textareaId = providedId ?? generatedId;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;
    const counterId = `${textareaId}-counter`;

    const hasError = Boolean(error);
    const showHelper = !hasError && helperText;
    const currentLength = typeof value === 'string' ? value.length : 0;
    const showCounter = showCharCount && maxLength;

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
            htmlFor={textareaId}
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
            TEXTAREA
            ================================================================ */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            [
              hasError ? errorId : null,
              showHelper ? helperId : null,
              showCounter ? counterId : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(
            // Base
            'w-full px-3.5 py-2.5 text-sm font-sans rounded-lg outline-none',
            'text-[var(--text-primary)] leading-relaxed',
            'resize-y transition-colors duration-150',

            // Background según estado
            disabled
              ? 'bg-[var(--bg-tertiary)] cursor-not-allowed opacity-60'
              : 'bg-[var(--bg-secondary)] cursor-text',

            // Borde según error
            hasError
              ? 'border border-[var(--color-danger)]'
              : 'border border-[var(--border)] focus:border-[var(--border-focus)]',

            // Focus ring
            !hasError && 'focus:ring-2 focus:ring-[var(--color-primary)]/20',

            // Clase externa
            className
          )}
          style={{
            // minHeight calculada según rows (no hay clase Tailwind dinámica para esto)
            minHeight: `${rows * 22}px`,
          }}
          {...rest}
        />

        {/* ================================================================
            FOOTER — Error/Helper + Contador
            ================================================================ */}
        {(hasError || showHelper || showCounter) && (
          <div className="flex justify-between items-center gap-2">

            {/* Error */}
            {hasError && (
              <span
                id={errorId}
                role="alert"
                className="text-[11px] font-semibold text-[var(--color-danger)] flex-1"
              >
                ⚠️ {error}
              </span>
            )}

            {/* Helper */}
            {showHelper && (
              <span
                id={helperId}
                className="text-[11px] text-[var(--text-tertiary)] flex-1"
              >
                {helperText}
              </span>
            )}

            {/* Contador de caracteres */}
            {showCounter && maxLength && (
              <span
                id={counterId}
                aria-live="polite"
                className={cn(
                  'text-[11px] font-medium whitespace-nowrap tabular-nums',
                  getCounterColorClass(currentLength, maxLength)
                )}
              >
                {currentLength} / {maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';