// ¿Qué? Componente de card contenedor reutilizable con variantes y sub-componentes.
// ¿Para qué? Estandarizar los contenedores visuales del sistema con Tailwind.
// ¿Impacto? Cualquier "caja" con contenido usa este componente, garantizando
//           consistencia en padding, bordes y elevaciones.

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Variantes visuales del card. */
export type CardVariant =
  | 'default' // Fondo secundario, borde sutil
  | 'elevated' // Con sombra prominente
  | 'outlined' // Solo borde, sin fondo
  | 'ghost'; // Sin borde ni fondo, solo estructura

/** Cantidad de padding interno. */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/** Props del Card. */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  clickable?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

/** Props del CardHeader. */
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

/** Props del CardBody. */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Props del CardFooter. */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'start' | 'center' | 'end' | 'between';
}

// ==============================================================================
// CLASES POR VARIANTE
// ==============================================================================

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-[var(--bg-secondary)] border border-[var(--border)]',
  elevated: 'bg-[var(--bg-secondary)] border border-[var(--border)] shadow-[var(--shadow-md)]',
  outlined: 'bg-transparent border border-[var(--border)]',
  ghost: 'bg-transparent border-none shadow-none',
};

// ==============================================================================
// CLASES POR PADDING
// ==============================================================================

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

// ==============================================================================
// CLASES DE ALINEACIÓN DEL FOOTER
// ==============================================================================

const FOOTER_ALIGN_CLASSES: Record<NonNullable<CardFooterProps['align']>, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

// ==============================================================================
// COMPONENTE PRINCIPAL — Card
// ==============================================================================

export function Card({
  variant = 'default',
  padding = 'md',
  clickable = false,
  fullWidth = true,
  children,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        // Base
        'rounded-xl',

        // Variante
        VARIANT_CLASSES[variant],

        // Padding
        PADDING_CLASSES[padding],

        // Ancho
        fullWidth && 'w-full',

        // Clickeable
        clickable && 'cursor-pointer transition-transform duration-150 hover:-translate-y-0.5',
        !clickable && 'cursor-default',

        // Clase externa
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — CardHeader
// ==============================================================================

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 mb-3 font-sans', className)}
      {...rest}
    >
      {children ? (
        children
      ) : (
        <>
          {/* Lado izquierdo: ícono + título/subtítulo */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {icon && (
              <span className="flex items-center text-[var(--text-secondary)] shrink-0">
                {icon}
              </span>
            )}

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              {title && (
                <h3 className="text-sm font-bold text-[var(--text-primary)] m-0 leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <span className="text-[11px] text-[var(--text-tertiary)] m-0 leading-snug">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Lado derecho: acción */}
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </>
      )}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — CardBody
// ==============================================================================

export function CardBody({ children, className = '', ...rest }: CardBodyProps) {
  return (
    <div
      className={cn('text-[var(--text-primary)] font-sans text-[13px] leading-normal', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — CardFooter
// ==============================================================================

export function CardFooter({ children, align = 'end', className = '', ...rest }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'mt-4 pt-3 border-t border-[var(--border)]',
        'font-sans',
        FOOTER_ALIGN_CLASSES[align],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
