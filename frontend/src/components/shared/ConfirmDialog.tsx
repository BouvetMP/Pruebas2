// ¿Qué? Diálogo modal de confirmación reutilizable con variantes.
// ¿Para qué? Reemplazar window.confirm() con un diálogo accesible y estilizado.
// ¿Impacto? Todas las confirmaciones del sistema usan este componente.

import type { ReactNode } from 'react';
import { AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import type { ButtonVariant } from '@components/ui/Button';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Variantes visuales del diálogo. */
export type ConfirmDialogVariant = 'info' | 'warning' | 'danger' | 'question';

/** Props del ConfirmDialog. */
export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

// ==============================================================================
// CONFIGURACIÓN POR VARIANTE
// ==============================================================================

interface VariantConfig {
  icon: ReactNode;
  iconClasses: string;
  wrapperClasses: string;
  confirmVariant: ButtonVariant;
}

const VARIANT_CONFIG: Record<ConfirmDialogVariant, VariantConfig> = {
  info: {
    icon: <Info size={24} strokeWidth={2} />,
    iconClasses: 'text-[var(--color-info)]',
    wrapperClasses: 'bg-[var(--color-info)]/15',
    confirmVariant: 'primary',
  },
  warning: {
    icon: <AlertTriangle size={24} strokeWidth={2} />,
    iconClasses: 'text-[var(--color-warning)]',
    wrapperClasses: 'bg-[var(--color-warning)]/15',
    confirmVariant: 'primary',
  },
  danger: {
    icon: <AlertCircle size={24} strokeWidth={2} />,
    iconClasses: 'text-[var(--color-danger)]',
    wrapperClasses: 'bg-[var(--color-danger)]/15',
    confirmVariant: 'danger',
  },
  question: {
    icon: <HelpCircle size={24} strokeWidth={2} />,
    iconClasses: 'text-[var(--color-primary)]',
    wrapperClasses: 'bg-[var(--color-primary)]/15',
    confirmVariant: 'primary',
  },
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'question',
  loading = false,
  disabled = false,
  icon,
  children,
}: ConfirmDialogProps) {
  const config = VARIANT_CONFIG[variant];

  const handleConfirm = async (): Promise<void> => {
    try {
      await onConfirm();
    } catch (err) {
      console.error('ConfirmDialog: error en onConfirm', err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      showCloseButton={false}
      disableClose={loading}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={loading}
            disabled={disabled}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2">
        {/* Ícono */}
        <div
          className={cn(
            'flex items-center justify-center',
            'w-14 h-14 rounded-full shrink-0',
            config.wrapperClasses,
            config.iconClasses,
          )}
          role="img"
          aria-label={`Ícono de ${variant}`}
        >
          {icon ?? config.icon}
        </div>

        {/* Título + Mensaje */}
        <div className="text-center w-full">
          <h3 className="text-base font-bold text-[var(--text-primary)] m-0 mb-2 leading-tight">
            {title}
          </h3>

          <div className="text-[13px] text-[var(--text-secondary)] leading-normal text-center max-w-[400px] mx-auto">
            {typeof message === 'string' ? <p className="m-0">{message}</p> : message}
          </div>
        </div>

        {/* Contenido extra */}
        {children && <div className="w-full mt-1">{children}</div>}
      </div>
    </Modal>
  );
}
