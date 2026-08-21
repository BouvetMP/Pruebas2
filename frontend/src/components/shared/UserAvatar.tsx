// ¿Qué? Avatar de usuario con iniciales, color personalizado y estado opcional.
// ¿Para qué? Indicador visual consistente de usuarios en Sidebar, Settings y Users.
// ¿Impacto? Todos los avatares del sistema usan este componente.

import type { ReactNode } from 'react';
import { getInitials, getDisplayName } from '@utils/User';
import { getRoleColor } from '@constants/Roles';
import type { SystemRole } from '@constants/Roles';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tamaños disponibles del avatar. */
export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Estado del usuario que se muestra como indicador. */
export type UserAvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/** Props del UserAvatar. */
export interface UserAvatarProps {
  name?: string | null;
  src?: string;
  role?: SystemRole;
  color?: string;
  size?: UserAvatarSize;
  status?: UserAvatarStatus;
  clickable?: boolean;
  onClick?: () => void;
  title?: string;
  maxInitials?: number;
  children?: ReactNode;
  className?: string;
}

/** Props del AvatarGroup. */
export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: UserAvatarSize;
  spacing?: string;
  total?: number;
}

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

const SIZE_CLASSES: Record<
  UserAvatarSize,
  {
    wrapper: string;
    text: string;
    dot: string;
    dotPos: string;
  }
> = {
  xs: {
    wrapper: 'w-6 h-6',
    text: 'text-[10px]',
    dot: 'w-1.5 h-1.5',
    dotPos: '-bottom-px -right-px',
  },
  sm: {
    wrapper: 'w-8 h-8',
    text: 'text-[11px]',
    dot: 'w-2 h-2',
    dotPos: 'bottom-0 right-0',
  },
  md: {
    wrapper: 'w-10 h-10',
    text: 'text-[13px]',
    dot: 'w-2.5 h-2.5',
    dotPos: 'bottom-0 right-0',
  },
  lg: {
    wrapper: 'w-14 h-14',
    text: 'text-lg',
    dot: 'w-3 h-3',
    dotPos: 'bottom-0.5 right-0.5',
  },
  xl: {
    wrapper: 'w-20 h-20',
    text: 'text-[28px]',
    dot: 'w-4 h-4',
    dotPos: 'bottom-1 right-1',
  },
};

// ==============================================================================
// CLASES POR ESTADO
// ==============================================================================

const STATUS_CLASSES: Record<UserAvatarStatus, string> = {
  online: 'bg-[var(--color-success)]',
  offline: 'bg-[var(--text-tertiary)]',
  away: 'bg-[var(--color-warning)]',
  busy: 'bg-[var(--color-danger)]',
};

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Determina el color de fondo del avatar.
 * Prioridad: color explícito > color del rol > índigo por defecto.
 */
function resolveBackgroundColor(color?: string, role?: SystemRole): string {
  if (color) return color;
  if (role) return getRoleColor(role);
  return '#6366F1';
}

/**
 * Determina si un color es "claro" para elegir el color del texto.
 */
function isLightColor(hex: string): boolean {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

// ==============================================================================
// COMPONENTE — UserAvatar
// ==============================================================================

export function UserAvatar({
  name,
  src,
  role,
  color,
  size = 'md',
  status,
  clickable = false,
  onClick,
  title,
  maxInitials = 2,
  children,
  className = '',
}: UserAvatarProps) {
  const config = SIZE_CLASSES[size];
  const displayName = getDisplayName({ nombre: name ?? undefined });
  const initials = getInitials(displayName, maxInitials);
  const bgColor = resolveBackgroundColor(color, role);
  const textColor = isLightColor(bgColor) ? '#1F2937' : '#FFFFFF';

  const accessibleTitle = title ?? displayName;

  return (
    <div
      className={cn('relative inline-flex shrink-0', config.wrapper, className)}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      title={accessibleTitle}
      aria-label={accessibleTitle}
    >
      {/* Avatar circle */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          'font-bold font-sans select-none overflow-hidden',
          config.wrapper,
          config.text,
          clickable && 'cursor-pointer transition-transform duration-150 hover:scale-105',
          !clickable && 'cursor-default',
        )}
        style={{
          background: src ? 'transparent' : bgColor,
          color: textColor,
          boxShadow: `0 0 0 1px ${bgColor}30`,
        }}
      >
        {children ? (
          children
        ) : src ? (
          <img
            src={src}
            alt={displayName}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Status dot */}
      {status && (
        <span
          className={cn(
            'absolute rounded-full z-[1]',
            'border-2 border-[var(--bg-primary)]',
            config.dot,
            config.dotPos,
            STATUS_CLASSES[status],
          )}
          aria-label={`Estado: ${status}`}
        />
      )}
    </div>
  );
}

// ==============================================================================
// COMPONENTE — AvatarGroup
// ==============================================================================

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  spacing = '-8px',
  total,
}: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remaining = (total ?? avatars.length) - max;

  return (
    <div className="inline-flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative"
          style={{
            marginLeft: index === 0 ? 0 : spacing,
            zIndex: visibleAvatars.length - index,
          }}
        >
          {avatar}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="relative"
          style={{
            marginLeft: spacing,
            zIndex: 0,
          }}
        >
          <UserAvatar
            size={size}
            color="#4B5563"
            name={`+${remaining}`}
            title={`${remaining} usuario(s) más`}
          >
            <span>+{remaining}</span>
          </UserAvatar>
        </div>
      )}
    </div>
  );
}
