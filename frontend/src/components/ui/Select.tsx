// ¿Qué? Componente de select estilizado con label, error y accesibilidad.
// ¿Para qué? Estandarizar los selects del sistema con clases Tailwind.
// ¿Impacto? Todos los formularios y filtros que usen selects usan este componente.

import {
  forwardRef,
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Opción individual del select. */
export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** Props del Select. */
export interface SelectProps<T extends string | number = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'children'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  leftIcon?: ReactNode;
  required?: boolean;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

function SelectInner<T extends string | number = string>(
  {
    label,
    helperText,
    error,
    options,
    value,
    onChange,
    placeholder,
    leftIcon,
    required = false,
    fullWidth = true,
    wrapperClassName = '',
    id: providedId,
    disabled,
    className = '',
    ...rest
  }: SelectProps<T>,
  ref: React.Ref<HTMLSelectElement>
) {
  // Generar ID único si no se proporciona (para vincular label ↔ select).
  const generatedId = useId();
  const selectId = providedId ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

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
          htmlFor={selectId}
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
          SELECT CONTAINER (posiciona ícono izq + chevron der)
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

        {/* Select nativo (con appearance-none para ocultar el chevron del browser) */}
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={e => onChange(e.target.value as T)}
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
            // Ocultar chevron nativo del navegador
            'appearance-none',

            // Background según estado
            disabled
              ? 'bg-[var(--bg-tertiary)] cursor-not-allowed opacity-60'
              : 'bg-[var(--bg-secondary)] cursor-pointer',

            // Borde según error
            hasError
              ? 'border border-[var(--color-danger)]'
              : 'border border-[var(--border)] focus:border-[var(--border-focus)]',

            // Focus ring
            !hasError && 'focus:ring-2 focus:ring-[var(--color-primary)]/20',

            // Padding (ajustar por íconos)
            leftIcon ? 'pl-9' : 'pl-3.5',
            'pr-9', // Siempre espacio para el chevron

            // Clase externa
            className
          )}
          {...rest}
        >
          {/* Placeholder como primera opción deshabilitada */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Opciones */}
          {options.map(option => (
            <option
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron personalizado (reemplaza el nativo oculto con appearance-none) */}
        <span
          className={cn(
            'absolute right-2.5 top-1/2 -translate-y-1/2',
            'flex items-center justify-center pointer-events-none',
            hasError
              ? 'text-[var(--color-danger)]'
              : 'text-[var(--text-tertiary)]'
          )}
        >
          <ChevronDown size={16} />
        </span>
      </div>

      {/* ================================================================
          MENSAJES (error o helper, nunca ambos)
          ================================================================ */}

      {hasError && (
        <span
          id={errorId}
          role="alert"
          className="text-[11px] font-semibold text-[var(--color-danger)] mt-0.5"
        >
          ⚠️ {error}
        </span>
      )}

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

// ==============================================================================
// EXPORT CON FORWARD REF Y GENÉRICO
// ==============================================================================

/**
 * Wrapper de forwardRef que preserva los tipos genéricos.
 * forwardRef no soporta bien genéricos directamente,
 * este pattern es la forma estándar de conservarlos.
 */
export const Select = forwardRef(SelectInner) as <T extends string | number = string>(
  props: SelectProps<T> & { ref?: React.Ref<HTMLSelectElement> }
) => ReturnType<typeof SelectInner>;