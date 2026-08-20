// ¿Qué? Chip seleccionable para filtros con contador y color personalizable.
// ¿Para qué? Filtros por chip consistentes en Alerts, Transactions y otros.
// ¿Impacto? Todos los filtros por chip del sistema usan este componente.

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tamaños disponibles del chip. */
export type FilterChipSize = 'sm' | 'md' | 'lg';

/** Props del FilterChip. */
export interface FilterChipProps {
  label: ReactNode;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  count?: number;
  color?: string;
  icon?: ReactNode;
  size?: FilterChipSize;
  disabled?: boolean;
  className?: string;
}

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

const SIZE_CLASSES: Record<FilterChipSize, string> = {
  sm: 'px-2.5 py-1 text-[11px] gap-1.5 h-6',
  md: 'px-3 py-1.5 text-xs gap-2 h-7',
  lg: 'px-4 py-2 text-[13px] gap-2.5 h-[34px]',
};

// ==============================================================================
// HELPERS
// ==============================================================================

function hexToRgba(hex: string, opacity: number): string {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >>  8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function FilterChip({
  label,
  active = false,
  onClick,
  onRemove,
  count,
  color = '#6366F1',
  icon,
  size = 'md',
  disabled = false,
  className = '',
}: FilterChipProps) {

  // Handlers
  const handleClick = (): void => {
    if (disabled) return;
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (disabled) return;
    onRemove?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={cn(
        // Base
        'inline-flex items-center justify-center',
        'font-sans rounded-full',
        'border select-none whitespace-nowrap',
        'outline-none transition-all duration-150',

        // Tamaño
        SIZE_CLASSES[size],

        // Estado activo vs inactivo
        active
          ? 'font-bold'
          : 'font-medium',

        // Deshabilitado
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && !!onClick && 'cursor-pointer',
        !disabled && !onClick && 'cursor-default',

        // Clase externa
        className
      )}
      style={
        active
          ? {
              background:  hexToRgba(color, 0.15),
              color:       color,
              borderColor: hexToRgba(color, 0.35),
            }
          : {
              background:  'transparent',
              color:       'var(--text-secondary)',
              borderColor: 'var(--border)',
            }
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-pressed={onClick ? active : undefined}
      aria-disabled={disabled}
    >
      {/* Ícono */}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}

      {/* Label */}
      <span className="leading-none">{label}</span>

      {/* Contador */}
      {typeof count === 'number' && (
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none tabular-nums'
          )}
          style={
            active
              ? { background: hexToRgba(color, 0.3), color }
              : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
          }
        >
          {count}
        </span>
      )}

      {/* Botón de remover */}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={cn(
            'inline-flex items-center justify-center',
            'p-0.5 -ml-1 -mr-1',
            'bg-transparent border-none rounded-full',
            'cursor-pointer transition-colors duration-150'
          )}
          style={{ color: active ? color : 'var(--text-secondary)' }}
          aria-label={`Remover ${typeof label === 'string' ? label : 'filtro'}`}
        >
          <X size={size === 'sm' ? 10 : size === 'lg' ? 13 : 11} />
        </button>
      )}
    </div>
  );
}