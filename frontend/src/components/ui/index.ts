// ¿Qué? Barrel export que centraliza todos los componentes UI base del design system.
// ¿Para qué? Permitir importar múltiples componentes desde una sola ruta (@components/ui).
// ¿Impacto? Mantiene limpios los imports en páginas y layout.

// ==============================================================================
// FEEDBACK Y ESTADO
// ==============================================================================

export { Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize, SpinnerVariant } from './Spinner';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps, EmptyStatePreset, EmptyStateVariant } from './EmptyState';

export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { ToastProvider, useToast } from './Toast';
export type { ToastType, ToastItem } from './Toast';

// ==============================================================================
// FORMULARIOS
// ==============================================================================

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Toggle } from './Toggle';
export type { ToggleProps, ToggleSize, ToggleVariant } from './Toggle';

// ==============================================================================
// CONTENEDORES
// ==============================================================================

export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardVariant,
  CardPadding,
} from './Card';

export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

// ==============================================================================
// INDICADORES
// ==============================================================================

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

export { Tooltip } from './Tooltip';
export type { TooltipProps, TooltipPosition, TooltipVariant } from './Tooltip';