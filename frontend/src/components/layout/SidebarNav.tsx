// ¿Qué? Menú de navegación del sidebar con items, badges y estado activo.
// ¿Para qué? Filtrar por permisos RBAC y navegar con React Router.
// ¿Impacto? Solo muestra rutas autorizadas; accesible con teclado vía NavLink nativo.

import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { NAV_ITEMS, type NavItem } from '@constants/Navigation';
import { useAuth } from '@context/AuthContext';
import { Tooltip } from '@components/ui/Tooltip';
import { Badge } from '@components/ui/Badge';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarNavProps {
  collapsed: boolean;
  alertCount?: number;
  isLive?: boolean;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarNav({ collapsed, alertCount = 0, isLive = false }: SidebarNavProps) {
  const { hasPermission } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <nav
      className={`sidebar-nav flex flex-1 flex-col gap-0.5 overflow-y-auto font-sans ${
        collapsed ? 'px-2 py-3' : 'p-3'
      }`}
      aria-label="Navegación principal"
    >
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {visibleItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            alertCount={alertCount}
            isLive={isLive}
          />
        ))}
      </ul>
    </nav>
  );
}

// ==============================================================================
// SUB-COMPONENTE — SidebarNavItem
// ==============================================================================

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  alertCount: number;
  isLive: boolean;
}

function SidebarNavItem({ item, collapsed, alertCount, isLive }: SidebarNavItemProps) {
  const Icon: LucideIcon = item.icon;
  const showAlertBadge = Boolean(item.showAlertBadge && alertCount > 0);
  const showLiveIndicator = Boolean(item.showLiveIndicator && isLive);

  const formatBadgeCount = (count: number): string => (count > 99 ? '99+' : String(count));

  const tooltipContent = collapsed ? (
    <div>
      <strong>{item.label}</strong>
      {showAlertBadge && (
        <div className="mt-0.5 text-[10px] opacity-80">{alertCount} alertas activas</div>
      )}
      {showLiveIndicator && (
        <div className="mt-0.5 text-[10px] font-medium text-neon-green opacity-90">● En vivo</div>
      )}
    </div>
  ) : null;

  const linkContent = (
    <NavLink
      to={item.path}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'sidebar-nav-link relative flex items-center rounded-lg text-[13px] no-underline outline-none transition-colors duration-150',
          'focus-visible:shadow-[var(--focus-ring)]',
          collapsed ? 'justify-center px-2 py-2.5' : 'justify-start gap-2.5 px-3 py-2.5',
          isActive
            ? 'sidebar-nav-link-active bg-[rgba(99,102,241,0.12)] font-bold text-indigo-light'
            : 'bg-transparent font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        ].join(' ')
      }
    >
      <span className="inline-flex shrink-0 items-center">
        <Icon size={18} strokeWidth={collapsed ? 2 : 1.8} aria-hidden="true" />
      </span>

      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}

      {showAlertBadge && !collapsed && (
        <span className="ml-auto shrink-0">
          <Badge variant="danger" size="sm" rounded>
            {formatBadgeCount(alertCount)}
          </Badge>
        </span>
      )}

      {showAlertBadge && collapsed && (
        <span
          className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-lg bg-[var(--color-danger)] px-1 text-[9px] font-bold leading-none text-white tabular-nums"
          aria-label={`${alertCount} alertas`}
        >
          {alertCount > 9 ? '9+' : alertCount}
        </span>
      )}

      {showLiveIndicator && !collapsed && (
        <span className="ml-auto shrink-0" title="Sistema en vivo" aria-label="En vivo">
          <span className="block h-1.5 w-1.5 animate-pulse-scale rounded-full bg-neon-green shadow-[0_0_0_3px_rgba(6,214,160,0.15)]" />
        </span>
      )}

      {showLiveIndicator && collapsed && (
        <span
          className="absolute right-1 top-1 block h-1.5 w-1.5 animate-pulse-scale rounded-full bg-neon-green"
          aria-label="En vivo"
        />
      )}
    </NavLink>
  );

  return (
    <li>
      {collapsed ? (
        <Tooltip content={tooltipContent} position="right">
          {linkContent}
        </Tooltip>
      ) : (
        linkContent
      )}
    </li>
  );
}