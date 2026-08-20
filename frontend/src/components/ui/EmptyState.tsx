// ¿Qué? Componente para mostrar estados vacíos con ícono, título y acción opcional.
// ¿Para qué? Estandarizar los mensajes de "sin resultados" y "sin datos" con Tailwind.
// ¿Impacto? Todos los estados vacíos del sistema usan este componente.

import type { ReactNode } from 'react';
import { Inbox, Search, AlertCircle, PackageX } from 'lucide-react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Presets predefinidos del EmptyState. */
export type EmptyStatePreset =
  | 'no-data'      // Sin datos genéricos
  | 'no-results'   // Sin resultados de búsqueda
  | 'no-alerts'    // Sin alertas
  | 'error';       // Estado de error

/** Variantes de color del ícono. */
export type EmptyStateVariant = 'default' | 'success' | 'warning' | 'danger';

/** Props del EmptyState. */
export interface EmptyStateProps {
  preset?: EmptyStatePreset;
  icon?: ReactNode;
  title?: string;
  description?: string;
  variant?: EmptyStateVariant;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ==============================================================================
// PRESETS PREDEFINIDOS
// ==============================================================================

const PRESET_DEFAULTS: Record<EmptyStatePreset, {
  icon:        ReactNode;
  title:       string;
  description: string;
  variant:     EmptyStateVariant;
}> = {
  'no-data': {
    icon:        <Inbox size={40} strokeWidth={1.5} />,
    title:       'Sin datos',
    description: 'No hay información para mostrar en este momento.',
    variant:     'default',
  },
  'no-results': {
    icon:        <Search size={40} strokeWidth={1.5} />,
    title:       'Sin resultados',
    description: 'No se encontraron elementos que coincidan con tu búsqueda.',
    variant:     'default',
  },
  'no-alerts': {
    icon:        <PackageX size={40} strokeWidth={1.5} />,
    title:       'Sin alertas activas',
    description: 'El sistema no ha detectado transacciones sospechosas recientes.',
    variant:     'success',
  },
  'error': {
    icon:        <AlertCircle size={40} strokeWidth={1.5} />,
    title:       'Algo salió mal',
    description: 'Ocurrió un error al cargar los datos. Intenta de nuevo.',
    variant:     'danger',
  },
};

// ==============================================================================
// CLASES POR VARIANTE DE COLOR
// ==============================================================================

const VARIANT_CLASSES: Record<EmptyStateVariant, string> = {
  default: 'text-[var(--text-tertiary)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger:  'text-[var(--color-danger)]',
};

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

const SIZE_CLASSES: Record<NonNullable<EmptyStateProps['size']>, {
  wrapper: string;
  title:   string;
  desc:    string;
  gap:     string;
}> = {
  sm: {
    wrapper: 'py-5 px-5',
    title:   'text-[13px]',
    desc:    'text-[11px]',
    gap:     'gap-2',
  },
  md: {
    wrapper: 'py-10 px-5',
    title:   'text-[15px]',
    desc:    'text-xs',
    gap:     'gap-3',
  },
  lg: {
    wrapper: 'py-[60px] px-5',
    title:   'text-lg',
    desc:    'text-[13px]',
    gap:     'gap-4',
  },
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function EmptyState({
  preset,
  icon,
  title,
  description,
  variant,
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  // Obtener valores del preset si se especifica
  const presetData = preset ? PRESET_DEFAULTS[preset] : null;

  // Valores finales (props tienen prioridad sobre preset)
  const finalIcon        = icon        ?? presetData?.icon;
  const finalTitle       = title       ?? presetData?.title;
  const finalDescription = description ?? presetData?.description;
  const finalVariant     = variant     ?? presetData?.variant ?? 'default';

  const sizeConfig = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center font-sans',
        sizeConfig.wrapper,
        sizeConfig.gap,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Ícono */}
      {finalIcon && (
        <div
          className={cn(
            'flex items-center justify-center mb-1',
            VARIANT_CLASSES[finalVariant]
          )}
        >
          {finalIcon}
        </div>
      )}

      {/* Título */}
      {finalTitle && (
        <h3
          className={cn(
            'font-bold text-[var(--text-primary)] m-0 leading-tight',
            sizeConfig.title
          )}
        >
          {finalTitle}
        </h3>
      )}

      {/* Descripción */}
      {finalDescription && (
        <p
          className={cn(
            'text-[var(--text-tertiary)] m-0 leading-normal max-w-[380px]',
            sizeConfig.desc
          )}
        >
          {finalDescription}
        </p>
      )}

      {/* Acción */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}