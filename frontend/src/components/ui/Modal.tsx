// ¿Qué? Componente Modal reutilizable con overlay, tecla Escape y accesibilidad.
// ¿Para qué? Estandarizar todos los diálogos del sistema con Tailwind.
// ¿Impacto? Todos los modales del sistema usan este componente, garantizando
//           consistencia visual, accesibilidad y comportamiento.

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tamaños disponibles del modal. */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Props del Modal. */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  disableClose?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

/**
 * Ancho máximo del modal según el tamaño.
 */
const SIZE_CLASSES: Record<ModalSize, string> = {
  sm:   'max-w-[400px]',
  md:   'max-w-[520px]',
  lg:   'max-w-[680px]',
  xl:   'max-w-[900px]',
  full: 'max-w-[95vw]',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnEscape = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  disableClose = false,
  children,
  footer,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ==============================================================================
  // CIERRE POR TECLA ESCAPE
  // ==============================================================================

  useEffect(() => {
    if (!open || !closeOnEscape || disableClose) return;

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, disableClose, onClose]);

  // ==============================================================================
  // BLOQUEO DEL SCROLL DEL BODY
  // ==============================================================================

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // ==============================================================================
  // MANEJO DE FOCUS (accesibilidad)
  // ==============================================================================

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        contentRef.current?.focus();
      }, 50);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // ==============================================================================
  // NO RENDERIZAR SI ESTÁ CERRADO
  // ==============================================================================

  if (!open) return null;

  // ==============================================================================
  // HANDLER — Click en overlay
  // ==============================================================================

  const handleOverlayClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget && closeOnOverlayClick && !disableClose) {
      onClose();
    }
  };

  // ==============================================================================
  // RENDER (con portal al body)
  // ==============================================================================

  const modalContent = (
    <div
      className={cn(
        // Overlay de fondo
        'fixed inset-0 z-[9999]',
        'bg-black/65 backdrop-blur-sm',
        'flex items-center justify-center',
        'p-5',
        'animate-fade-in'
      )}
      role="presentation"
      onClick={handleOverlayClick}
    >
      {/* Contenido del modal */}
      <div
        ref={contentRef as React.RefObject<HTMLDivElement>}
        className={cn(
          // Estructura
          'w-full flex flex-col',
          'bg-[var(--bg-secondary)]',
          'border border-[var(--border)]',
          'rounded-xl',
          'shadow-[var(--shadow-xl)]',
          'max-h-[calc(100vh-40px)]',
          'font-sans',
          'outline-none',
          'animate-scale-in',

          // Tamaño
          SIZE_CLASSES[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
      >
        {/* ================================================================
            HEADER — Título + descripción + botón X
            ================================================================ */}
        {(title || description || showCloseButton) && (
          <div
            className={cn(
              'flex items-start justify-between gap-4',
              'px-5 pt-5 pb-4',
              (title || description) && 'border-b border-[var(--border)]'
            )}
          >
            {/* Grupo de título y descripción */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-bold text-[var(--text-primary)] m-0 leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-xs text-[var(--text-tertiary)] m-0 leading-normal"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Botón de cerrar */}
            {showCloseButton && (
              <button
                type="button"
                onClick={() => !disableClose && onClose()}
                disabled={disableClose}
                className={cn(
                  'flex items-center justify-center',
                  'w-8 h-8 shrink-0',
                  'bg-transparent border-none rounded-md',
                  'text-[var(--text-tertiary)]',
                  'transition-colors duration-150',
                  disableClose
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]'
                )}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* ================================================================
            BODY — Contenido scrolleable
            ================================================================ */}
        <div className="px-5 py-5 overflow-y-auto flex-1 text-[13px] text-[var(--text-primary)] leading-normal">
          {children}
        </div>

        {/* ================================================================
            FOOTER — Botones de acción
            ================================================================ */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-3 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}