// ¿Qué? Panel lateral deslizante para mostrar detalles de un item.
// ¿Para qué? Panel de detalle consistente en Alerts, Transactions y otros.
// ¿Impacto? Todos los paneles de detalle del sistema usan este componente.

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tamaños del panel. */
export type DetailPanelSize = 'sm' | 'md' | 'lg' | 'xl';

/** Posición del panel. */
export type DetailPanelPosition = 'right' | 'left';

/** Props del DetailPanel. */
export interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: DetailPanelSize;
  position?: DetailPanelPosition;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

/** Props del DetailField. */
export interface DetailFieldProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
  valueStyle?: React.CSSProperties;
  className?: string;
}

/** Props del DetailGrid. */
export interface DetailGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

/** Props del DetailSection. */
export interface DetailSectionProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

const SIZE_CLASSES: Record<DetailPanelSize, {
  open: string;
  inner: string;
}> = {
  sm: { open: 'w-[320px]', inner: 'w-[320px]' },
  md: { open: 'w-[400px]', inner: 'w-[400px]' },
  lg: { open: 'w-[520px]', inner: 'w-[520px]' },
  xl: { open: 'w-[640px]', inner: 'w-[640px]' },
};

// ==============================================================================
// CLASES POR COLUMNAS DEL GRID
// ==============================================================================

const GRID_COLUMNS: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

// ==============================================================================
// COMPONENTE PRINCIPAL — DetailPanel
// ==============================================================================

export function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  position = 'right',
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const config = SIZE_CLASSES[size];

  // Cierre con Escape
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Focus al abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => panelRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <aside
      ref={panelRef}
      className={cn(
        // Base
        'sticky top-0 h-full min-h-[400px] max-h-screen',
        'bg-[var(--bg-secondary)]',
        'flex flex-col font-sans shrink-0',
        'overflow-hidden',
        'transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',

        // Borde según posición
        position === 'right' && 'border-l border-[var(--border)]',
        position === 'left' && 'border-r border-[var(--border)]',

        // Ancho según estado
        open ? config.open : 'w-0',

        // Clase externa
        className
      )}
      role="complementary"
      aria-hidden={!open}
      aria-label={typeof title === 'string' ? title : 'Panel de detalle'}
      tabIndex={-1}
    >
      <div className={cn('h-full flex flex-col overflow-hidden', config.inner)}>

        {/* ================================================================
            HEADER
            ================================================================ */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-[var(--border)] shrink-0">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] m-0 leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[var(--text-tertiary)] m-0 leading-snug break-all">
                {subtitle}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex items-center justify-center',
                'w-7 h-7 shrink-0',
                'bg-transparent border-none rounded-md',
                'text-[var(--text-tertiary)]',
                'cursor-pointer transition-colors duration-150',
                'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]'
              )}
              aria-label="Cerrar panel de detalle"
              title="Cerrar (Esc)"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ================================================================
            BODY
            ================================================================ */}
        <div className="px-5 py-5 overflow-y-auto flex-1 text-[13px] text-[var(--text-primary)]">
          {children}
        </div>

        {/* ================================================================
            FOOTER
            ================================================================ */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-3 border-t border-[var(--border)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </aside>
  );
}

// ==============================================================================
// SUB-COMPONENTE — DetailField
// ==============================================================================

export function DetailField({
  label,
  value,
  icon,
  fullWidth = false,
  valueStyle,
  className = '',
}: DetailFieldProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 min-w-0',
        fullWidth && 'col-span-full',
        className
      )}
    >
      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span
        className="text-[13px] font-semibold text-[var(--text-primary)] break-words"
        style={valueStyle}
      >
        {value}
      </span>
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — DetailGrid
// ==============================================================================

export function DetailGrid({
  children,
  columns = 2,
  className = '',
}: DetailGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        GRID_COLUMNS[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — DetailDivider
// ==============================================================================

export function DetailDivider({ className = '' }: { className?: string }) {
  return (
    <hr className={cn('h-px bg-[var(--border)] my-4 border-none', className)} />
  );
}

// ==============================================================================
// SUB-COMPONENTE — DetailSection
// ==============================================================================

export function DetailSection({ title, children, className = '' }: DetailSectionProps) {
  return (
    <div className={cn('mb-5', className)}>
      <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}