// ¿Qué? Botón con menú desplegable para exportar datos en múltiples formatos.
// ¿Para qué? Exportación consistente en Alerts, Transactions y otros módulos.
// ¿Impacto? Todos los botones de exportación del sistema usan este componente.

import { useRef, useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Eye,
  ChevronDown,
  FileJson,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import type { ButtonSize, ButtonVariant } from '@components/ui/Button';
import { useClickOutside } from '@hooks/useClickOutside';
import { cn } from '@utils/cn';
import type { ExportFormat } from '@app-types/index';

// ==============================================================================
// TYPES
// ==============================================================================

/** Opción del menú de exportación. */
export interface ExportOption {
  format: ExportFormat;
  label: string;
  icon?: React.ReactNode;
  hasPreview?: boolean;
  disabled?: boolean;
}

/** Props del ExportButton. */
export interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  onPreview?: (format: ExportFormat) => void;
  options?: ExportOption[];
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  align?: 'left' | 'right';
  className?: string;
}

// ==============================================================================
// OPCIONES POR DEFECTO
// ==============================================================================

const DEFAULT_OPTIONS: ExportOption[] = [
  { format: 'csv',  label: 'Exportar CSV',  icon: <FileSpreadsheet size={13} />, hasPreview: true },
  { format: 'pdf',  label: 'Exportar PDF',  icon: <FileText size={13} />,        hasPreview: true },
  { format: 'json', label: 'Exportar JSON', icon: <FileJson size={13} />,        hasPreview: false },
];

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ExportButton({
  onExport,
  onPreview,
  options = DEFAULT_OPTIONS,
  label = 'Exportar',
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  showChevron = true,
  align = 'right',
  className = '',
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useClickOutside<HTMLDivElement>(
    () => setOpen(false),
    { enabled: open, additionalRefs: [triggerRef] }
  );

  // Handlers
  const handleExport = (format: ExportFormat): void => {
    onExport(format);
    setOpen(false);
  };

  const handlePreview = (format: ExportFormat): void => {
    if (!onPreview) return;
    onPreview(format);
    setOpen(false);
  };

  const hasPreviewOptions = options.some((opt) => opt.hasPreview && onPreview);

  return (
    <div ref={triggerRef} className={cn('relative inline-block', className)}>
      {/* Botón trigger */}
      <Button
        variant={variant}
        size={size}
        loading={loading}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        leftIcon={<Download size={14} />}
        rightIcon={
          showChevron ? (
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          ) : undefined
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de exportación"
      >
        {label}
      </Button>

      {/* Menú dropdown */}
      {open && (
        <div
          ref={menuRef as React.RefObject<HTMLDivElement>}
          className={cn(
            'absolute top-[calc(100%+4px)] min-w-[200px]',
            'bg-[var(--bg-secondary)] border border-[var(--border)]',
            'rounded-lg shadow-[var(--shadow-lg)]',
            'z-[100] p-1.5',
            'flex flex-col gap-0.5',
            'font-sans animate-dropdown-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
          aria-label="Opciones de exportación"
        >
          {/* Sección de preview */}
          {hasPreviewOptions && (
            <>
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2.5 pt-1.5 pb-1">
                Vista previa
              </span>

              {options
                .filter((opt) => opt.hasPreview && onPreview)
                .map((opt) => (
                  <button
                    key={`preview-${opt.format}`}
                    type="button"
                    onClick={() => handlePreview(opt.format)}
                    disabled={opt.disabled}
                    role="menuitem"
                    className={cn(
                      'flex items-center gap-2 w-full',
                      'px-2.5 py-2 text-xs font-medium',
                      'text-[var(--text-primary)] bg-transparent',
                      'border-none rounded-md text-left',
                      'font-sans transition-colors duration-150',
                      opt.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    <span className="flex items-center text-[var(--text-secondary)] shrink-0">
                      {opt.icon}
                    </span>
                    <span className="flex-1">Ver {opt.format.toUpperCase()}</span>
                    <span className="flex items-center text-[var(--text-tertiary)] shrink-0">
                      <Eye size={11} />
                    </span>
                  </button>
                ))}

              <hr className="h-px bg-[var(--border)] my-1 border-none" />
            </>
          )}

          {/* Sección de descarga */}
          <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2.5 pt-1.5 pb-1">
            Descargar
          </span>

          {options.map((opt) => (
            <button
              key={`export-${opt.format}`}
              type="button"
              onClick={() => handleExport(opt.format)}
              disabled={opt.disabled}
              role="menuitem"
              className={cn(
                'flex items-center gap-2 w-full',
                'px-2.5 py-2 text-xs font-medium',
                'text-[var(--text-primary)] bg-transparent',
                'border-none rounded-md text-left',
                'font-sans transition-colors duration-150',
                opt.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-[var(--bg-tertiary)]'
              )}
            >
              <span className="flex items-center text-[var(--text-secondary)] shrink-0">
                {opt.icon}
              </span>
              <span className="flex-1">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}