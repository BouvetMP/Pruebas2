// ¿Qué? Componente Tooltip reutilizable con posicionamiento inteligente.
// ¿Para qué? Estandarizar los tooltips del sistema con Tailwind.
// ¿Impacto? Reemplaza los `title=` HTML nativos con tooltips estilizados
//           y accesibles en toda la aplicación.

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Posiciones donde puede aparecer el tooltip. */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/** Variantes de color del tooltip. */
export type TooltipVariant = 'default' | 'dark' | 'primary' | 'danger';

/** Props del Tooltip. */
export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
  maxWidth?: string;
}

// ==============================================================================
// CLASES POR VARIANTE
// ==============================================================================

const VARIANT_CLASSES: Record<TooltipVariant, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border)]',
  dark: 'bg-[#1F2937] text-[#F3F4F6] border-[#374151]',
  primary: 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]',
  danger: 'bg-[var(--color-danger)] text-white border-[var(--color-danger)]',
};

// ==============================================================================
// HELPERS DE POSICIONAMIENTO
// ==============================================================================

/**
 * Calcula las coordenadas del tooltip según la posición del trigger.
 */
function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: { width: number; height: number },
  position: TooltipPosition,
  gap: number = 8,
): { top: number; left: number } {
  const centerX = triggerRect.left + triggerRect.width / 2;
  const centerY = triggerRect.top + triggerRect.height / 2;

  switch (position) {
    case 'top':
      return {
        top: triggerRect.top - tooltipRect.height - gap,
        left: centerX - tooltipRect.width / 2,
      };
    case 'bottom':
      return {
        top: triggerRect.bottom + gap,
        left: centerX - tooltipRect.width / 2,
      };
    case 'left':
      return {
        top: centerY - tooltipRect.height / 2,
        left: triggerRect.left - tooltipRect.width - gap,
      };
    case 'right':
      return {
        top: centerY - tooltipRect.height / 2,
        left: triggerRect.right + gap,
      };
  }
}

/**
 * Ajusta la posición para que el tooltip no se salga del viewport.
 */
function clampToViewport(
  coords: { top: number; left: number },
  tooltipRect: { width: number; height: number },
  padding: number = 8,
): { top: number; left: number } {
  const maxLeft = window.innerWidth - tooltipRect.width - padding;
  const maxTop = window.innerHeight - tooltipRect.height - padding;

  return {
    top: Math.max(padding, Math.min(coords.top, maxTop)),
    left: Math.max(padding, Math.min(coords.left, maxLeft)),
  };
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Tooltip({
  content,
  children,
  position = 'top',
  variant = 'default',
  delay = 300,
  disabled = false,
  maxWidth = '240px',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const tooltipId = useId();

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const showTooltip = (): void => {
    if (disabled) return;

    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
    }

    showTimerRef.current = window.setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = (): void => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    setVisible(false);
    setCoords(null);
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }
    };
  }, []);

  // ==============================================================================
  // CÁLCULO DE POSICIÓN
  // ==============================================================================

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = {
      width: tooltipRef.current.offsetWidth,
      height: tooltipRef.current.offsetHeight,
    };

    const rawCoords = calculatePosition(triggerRect, tooltipRect, position);
    const clampedCoords = clampToViewport(rawCoords, tooltipRect);

    setCoords(clampedCoords);
  }, [visible, position, content]);

  // ==============================================================================
  // CLONAR CHILDREN PARA INYECTAR HANDLERS Y REF
  // ==============================================================================

  if (!isValidElement(children)) {
    console.warn('Tooltip: children debe ser un elemento React válido');
    return <>{children}</>;
  }

  const childProps = children.props as React.HTMLAttributes<HTMLElement> & {
    ref?: React.Ref<HTMLElement>;
  };

  const enhancedChild = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;

      const originalRef = (children as ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof originalRef === 'function') {
        originalRef(node);
      } else if (originalRef && typeof originalRef === 'object') {
        (originalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      showTooltip();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hideTooltip();
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      showTooltip();
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hideTooltip();
      childProps.onBlur?.(e);
    },
    'aria-describedby': visible ? tooltipId : undefined,
  } as Partial<React.HTMLAttributes<HTMLElement>>);

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <>
      {enhancedChild}

      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={cn(
              // Base
              'fixed z-[10000] pointer-events-none',
              'px-2.5 py-1.5 rounded-md',
              'text-[11px] font-medium leading-snug font-sans',
              'border',
              'shadow-[var(--shadow-md)]',
              'select-none break-words',

              // Variante
              VARIANT_CLASSES[variant],

              // Visibilidad (fade in)
              coords ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-150',
            )}
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              maxWidth,
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
