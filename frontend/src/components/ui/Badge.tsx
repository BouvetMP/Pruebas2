// ¿Qué? Componente de badge (etiqueta pequeña) reutilizable con variantes y tamaños.
// ¿Para qué? Estandarizar las etiquetas visuales para estados, niveles, contadores
//            y clasificaciones en toda la aplicación.
// ¿Impacto? Es la base para RiskBadge, BankBadge, StatusBadge y otros badges
//           especializados del sistema.

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Variantes de color predefinidas del badge. */
export type BadgeVariant =
  | 'default' // Gris neutro
  | 'primary' // Azul/índigo (info)
  | 'success' // Verde (éxito, aprobado)
  | 'warning' // Amarillo (advertencia, medio)
  | 'danger' // Rojo (error, crítico, bloqueado)
  | 'info' // Cian (informativo)
  | 'custom'; // Color personalizado (usa color prop)

/** Tamaños disponibles del badge. */
export type BadgeSize = 'sm' | 'md' | 'lg';

/** Props del Badge. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string;
  icon?: ReactNode;
  pulse?: boolean;
  rounded?: boolean;
  children: ReactNode;
}

// ==============================================================================
// CLASES POR VARIANTE
// ==============================================================================

/**
 * Clases Tailwind para cada variante predefinida.
 * Cada variante define background (15% opacidad), texto y borde (30% opacidad).
 * Se usan variables CSS para que los colores cambien con el tema.
 */
const VARIANT_CLASSES: Record<Exclude<BadgeVariant, 'custom'>, string> = {
  default:
    'bg-[var(--text-tertiary)]/15 text-[var(--text-tertiary)] border-[var(--text-tertiary)]/30',
  primary:
    'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] border-[var(--color-primary)]/30',
  success:
    'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30',
  warning:
    'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/30',
  danger: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/30',
  info: 'bg-[var(--color-info)]/15 text-[var(--color-info)] border-[var(--color-info)]/30',
};

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

/**
 * Clases Tailwind para cada tamaño.
 * Define padding, font-size, gap, altura y tamaño del dot pulsante.
 */
const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] gap-1 h-[18px]',
  md: 'px-2.5 py-1 text-[11px] gap-1.5 h-[22px]',
  lg: 'px-3.5 py-1.5 text-[13px] gap-2 h-7',
};

/**
 * Tamaño del dot pulsante según el tamaño del badge.
 */
const DOT_SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'w-[5px] h-[5px]',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Convierte un color HEX a formato rgba para usar en estilos inline.
 * Solo se usa cuando variant='custom' (no se puede hacer con clases Tailwind
 * porque el color es dinámico en runtime).
 */
function hexToRgba(hex: string, opacity: number): string {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Badge({
  variant = 'default',
  size = 'md',
  color,
  icon,
  pulse = false,
  rounded = false,
  children,
  className = '',
  style,
  ...rest
}: BadgeProps) {
  // ==============================================================================
  // DETERMINAR CLASES Y ESTILOS
  // ==============================================================================

  const isCustom = variant === 'custom' && color;

  const variantClasses = !isCustom
    ? VARIANT_CLASSES[variant === 'custom' ? 'default' : variant]
    : '';

  const customStyles: React.CSSProperties | undefined = isCustom
    ? {
        background: hexToRgba(color, 0.15),
        color: color,
        borderColor: hexToRgba(color, 0.3),
        ...style,
      }
    : style;

  return (
    <span
      className={cn(
        // Base
        'inline-flex items-center justify-center',
        'font-bold font-sans leading-none',
        'whitespace-nowrap select-none',
        'border',

        // Tamaño
        SIZE_CLASSES[size],

        // Border radius
        rounded ? 'rounded-full' : 'rounded-md',

        // Variante (solo para no-custom)
        variantClasses,

        // Clase externa
        className,
      )}
      style={customStyles}
      {...rest}
    >
      {/* Dot pulsante (opcional) */}
      {pulse && (
        <span
          className={cn(
            'rounded-full shrink-0 animate-pulse-slow',
            DOT_SIZE_CLASSES[size],
            isCustom ? '' : 'bg-current',
          )}
          style={isCustom ? { background: color } : undefined}
          aria-hidden="true"
        />
      )}

      {/* Ícono (opcional) */}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}

      {/* Contenido */}
      {children}
    </span>
  );
}
