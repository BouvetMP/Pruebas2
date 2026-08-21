// ¿Qué? Badge especializado para mostrar estados de transacciones, alertas y usuarios.
// ¿Para qué? Indicador visual consistente del estado en toda la app.
// ¿Impacto? Todos los indicadores de estado del sistema usan este componente.

import { Badge } from '@components/ui/Badge';
import type { BadgeSize } from '@components/ui/Badge';
import {
  CheckCircle,
  Ban,
  AlertTriangle,
  Clock,
  Eye,
  XCircle,
  UserCheck,
  UserX,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import type { TransactionStatus, AlertStatus, UserStatus } from '@app-types/index';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tipos de estado que puede mostrar el badge. */
export type StatusType = 'transaction' | 'alert' | 'user';

/** Props del StatusBadge. */
export interface StatusBadgeProps {
  type: StatusType;
  status: TransactionStatus | AlertStatus | UserStatus | string;
  size?: BadgeSize;
  showIcon?: boolean;
  rounded?: boolean;
  className?: string;
}

// ==============================================================================
// CONFIGURACIÓN POR TIPO Y ESTADO
// ==============================================================================

interface StatusMeta {
  label: string;
  color: string;
  icon: LucideIcon;
}

const TRANSACTION_STATUS_MAP: Record<TransactionStatus, StatusMeta> = {
  approved: { label: 'Aprobada', color: '#34D399', icon: CheckCircle },
  flagged: { label: 'Marcada', color: '#FBBF24', icon: AlertTriangle },
  blocked: { label: 'Bloqueada', color: '#EF4444', icon: Ban },
  pending: { label: 'Pendiente', color: '#9CA3AF', icon: Clock },
};

const ALERT_STATUS_MAP: Record<AlertStatus, StatusMeta> = {
  active: { label: 'Activa', color: '#EF4444', icon: AlertTriangle },
  in_review: { label: 'En revisión', color: '#FBBF24', icon: Eye },
  resolved: { label: 'Resuelta', color: '#34D399', icon: CheckCircle },
  dismissed: { label: 'Descartada', color: '#9CA3AF', icon: XCircle },
};

const USER_STATUS_MAP: Record<UserStatus, StatusMeta> = {
  active: { label: 'Activo', color: '#34D399', icon: UserCheck },
  inactive: { label: 'Inactivo', color: '#9CA3AF', icon: UserX },
};

const UNKNOWN_STATUS: StatusMeta = {
  label: 'Desconocido',
  color: '#9CA3AF',
  icon: Circle,
};

// ==============================================================================
// HELPERS
// ==============================================================================

function getStatusMeta(type: StatusType, status: string): StatusMeta {
  switch (type) {
    case 'transaction':
      return TRANSACTION_STATUS_MAP[status as TransactionStatus] ?? UNKNOWN_STATUS;
    case 'alert':
      return ALERT_STATUS_MAP[status as AlertStatus] ?? UNKNOWN_STATUS;
    case 'user':
      return USER_STATUS_MAP[status as UserStatus] ?? UNKNOWN_STATUS;
  }
}

const ICON_SIZE: Record<BadgeSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function StatusBadge({
  type,
  status,
  size = 'md',
  showIcon = true,
  rounded = false,
  className = '',
}: StatusBadgeProps) {
  const meta = getStatusMeta(type, status);
  const Icon = meta.icon;

  return (
    <Badge
      variant="custom"
      color={meta.color}
      size={size}
      icon={showIcon ? <Icon size={ICON_SIZE[size]} strokeWidth={2} /> : undefined}
      rounded={rounded}
      className={className}
      title={meta.label}
    >
      {meta.label}
    </Badge>
  );
}
