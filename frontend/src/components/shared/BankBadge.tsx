// ¿Qué? Badge especializado para mostrar bancos con su color institucional.
// ¿Para qué? Indicador visual del banco asociado a transacciones y clientes.
// ¿Impacto? Todos los indicadores de banco del sistema usan este componente.

import { Badge } from '@components/ui/Badge';
import type { BadgeSize } from '@components/ui/Badge';
import { DEFAULT_BANK_COLOR, ALL_BANKS_ID } from '@app-types/index';
import type { Bank } from '@app-types/index';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del BankBadge. */
export interface BankBadgeProps {
  bank?: Bank | null;
  name?: string;
  color?: string;
  size?: BadgeSize;
  dotOnly?: boolean;
  rounded?: boolean;
  showFallback?: boolean;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Extrae el nombre y color efectivos según los props.
 */
function resolveBank(
  bank?: Bank | null,
  name?: string,
  color?: string,
): { name: string; color: string; isAll: boolean } {
  if (bank) {
    return {
      name: bank.name,
      color: bank.color ?? DEFAULT_BANK_COLOR,
      isAll: bank.id === ALL_BANKS_ID,
    };
  }

  return {
    name: name ?? 'Sin banco',
    color: color ?? DEFAULT_BANK_COLOR,
    isAll: false,
  };
}

// ==============================================================================
// CLASES DE TAMAÑO DEL DOT
// ==============================================================================

const DOT_SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function BankBadge({
  bank,
  name,
  color,
  size = 'md',
  dotOnly = false,
  rounded = false,
  showFallback = true,
  className = '',
}: BankBadgeProps) {
  const resolved = resolveBank(bank, name, color);

  // Si no hay data y no se debe mostrar fallback, no renderizar nada
  if (!bank && !name && !showFallback) return null;

  // ==============================================================================
  // MODO DOT ONLY (solo círculo del color)
  // ==============================================================================

  if (dotOnly) {
    return (
      <span
        className={cn('inline-block rounded-full shrink-0', DOT_SIZE_CLASSES[size], className)}
        style={{
          background: resolved.color,
          boxShadow: `0 0 0 2px ${resolved.color}20`,
        }}
        title={resolved.name}
        aria-label={`Banco: ${resolved.name}`}
      />
    );
  }

  // ==============================================================================
  // MODO BADGE COMPLETO
  // ==============================================================================

  return (
    <Badge
      variant="custom"
      color={resolved.color}
      size={size}
      rounded={rounded}
      className={className}
      title={resolved.name}
    >
      {resolved.name}
    </Badge>
  );
}
