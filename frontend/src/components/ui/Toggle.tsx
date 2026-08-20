// ¿Qué? Componente Toggle (switch on/off) reutilizable con label y accesibilidad.
// ¿Para qué? Estandarizar los switches del sistema con Tailwind.
// ¿Impacto? Todos los switches del sistema usan este componente (Settings,
//           notificaciones, configuración del modelo, etc.).

import { useId, type ReactNode } from 'react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tamaños disponibles del toggle. */
export type ToggleSize = 'sm' | 'md' | 'lg';

/** Variantes de color cuando está activo. */
export type ToggleVariant = 'primary' | 'success' | 'danger';

/** Props del Toggle. */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  size?: ToggleSize;
  variant?: ToggleVariant;
  labelPosition?: 'left' | 'right';
  id?: string;
  className?: string;
}

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

/**
 * Track = fondo del switch
 * Thumb = bolita que se mueve
 * Label/Desc = texto al lado
 */
const SIZE_CONFIG: Record<ToggleSize, {
  track: string;
  thumb: string;
  thumbTranslate: string;
  label: string;
  description: string;
}> = {
  sm: {
    track:          'w-[30px] h-4',
    thumb:          'w-3 h-3',
    thumbTranslate: 'translate-x-[14px]',
    label:          'text-xs',
    description:    'text-[10px]',
  },
  md: {
    track:          'w-[38px] h-5',
    thumb:          'w-3.5 h-3.5',
    thumbTranslate: 'translate-x-[18px]',
    label:          'text-[13px]',
    description:    'text-[11px]',
  },
  lg: {
    track:          'w-12 h-[26px]',
    thumb:          'w-5 h-5',
    thumbTranslate: 'translate-x-[22px]',
    label:          'text-sm',
    description:    'text-xs',
  },
};

// ==============================================================================
// CLASES POR VARIANTE (color del track cuando está activo)
// ==============================================================================

const VARIANT_ACTIVE_CLASSES: Record<ToggleVariant, string> = {
  primary: 'bg-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]',
  danger:  'bg-[var(--color-danger)]',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  size = 'md',
  variant = 'primary',
  labelPosition = 'right',
  id: providedId,
  className = '',
}: ToggleProps) {
  const generatedId = useId();
  const toggleId = providedId ?? generatedId;
  const descriptionId = description ? `${toggleId}-description` : undefined;

  const config = SIZE_CONFIG[size];

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleClick = (): void => {
    if (disabled) return;
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={cn(
        // Layout
        'flex gap-3 font-sans',
        description ? 'items-start' : 'items-center',
        'justify-between',

        // Dirección según posición del label
        labelPosition === 'left' && 'flex-row-reverse',

        // Estados
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',

        // Clase externa
        className
      )}
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-describedby={descriptionId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      id={toggleId}
    >
      {/* ================================================================
          LABEL + DESCRIPCIÓN + ÍCONO
          ================================================================ */}
      {(label || description || icon) && (
        <div
          className={cn(
            'flex gap-2.5 flex-1 min-w-0',
            description ? 'items-start' : 'items-center'
          )}
        >
          {/* Ícono */}
          {icon && (
            <span
              className={cn(
                'flex items-center shrink-0',
                'text-[var(--text-secondary)]',
                !!description && 'mt-0.5'
              )}
            >
              {icon}
            </span>
          )}

          {/* Textos */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            {label && (
              <span
                className={cn(
                  'font-semibold text-[var(--text-primary)] leading-tight select-none',
                  config.label
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                id={descriptionId}
                className={cn(
                  'text-[var(--text-tertiary)] leading-snug select-none',
                  config.description
                )}
              >
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          TRACK + THUMB (el switch visual)
          ================================================================ */}
      <div
        className={cn(
          // Track (fondo)
          'relative rounded-full shrink-0',
          'transition-colors duration-200',
          config.track,

          // Color del track según estado
          checked
            ? VARIANT_ACTIVE_CLASSES[variant]
            : 'bg-[var(--border-strong)]'
        )}
      >
        {/* Thumb (bolita que se mueve) */}
        <div
          className={cn(
            // Base
            'absolute top-1/2 -translate-y-1/2',
            'bg-white rounded-full',
            'shadow-sm',
            'transition-all duration-200 ease-in-out',
            config.thumb,

            // Posición según estado
            checked
              ? config.thumbTranslate  // Movido a la derecha
              : 'translate-x-0.5'      // Posición izquierda (2px de margen)
          )}
        />
      </div>
    </div>
  );
}