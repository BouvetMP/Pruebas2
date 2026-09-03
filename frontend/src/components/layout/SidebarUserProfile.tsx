// ¿Qué? Perfil del usuario en el sidebar + confirmación de logout.
// ¿Para qué? Mostrar identidad y cerrar sesión con ConfirmDialog accesible.
// ¿Impacto? Logout con teclado/ratón; sin estilos solo-hover por JS (Día 6).

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { UserAvatar } from '@components/shared/UserAvatar';
import { ConfirmDialog } from '@components/shared/ConfirmDialog';
import { Tooltip } from '@components/ui/Tooltip';
import { getRoleShortLabel } from '@constants/Roles';
import { getShortName, getDisplayName } from '@utils/User';
import { PUBLIC_ROUTES } from '@constants/Navigation';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarUserProfileProps {
  collapsed: boolean;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarUserProfile({ collapsed }: SidebarUserProfileProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogoutConfirm = (): void => {
    logout();
    navigate(PUBLIC_ROUTES.LOGIN, { replace: true });
    setConfirmLogout(false);
  };

  const userName = user?.nombre ?? 'Usuario';
  const userEmail = user?.email ?? '';
  const userRole = user?.rol;
  const displayName = getDisplayName({ nombre: userName });
  const shortName = getShortName(displayName);
  const roleLabel = userRole ? getRoleShortLabel(userRole) : 'Usuario';

  const logoutBtnClass =
    'inline-flex cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-[var(--text-tertiary)] transition-colors duration-150 outline-none hover:bg-[rgba(255,107,107,0.1)] hover:text-[var(--color-danger)] focus-visible:shadow-[var(--focus-ring)] focus-visible:text-[var(--color-danger)]';

  const collapsedTooltipContent = (
    <div>
      <div className="text-[11px] font-bold">{displayName}</div>
      {userEmail && <div className="mt-0.5 text-[10px] opacity-70">{userEmail}</div>}
      <div className="mt-1 text-[10px] font-semibold text-indigo-light">{roleLabel}</div>
    </div>
  );

  return (
    <>
      <div
        className={`sidebar-user-profile border-t border-[var(--border)] font-sans ${
          collapsed ? 'px-2 py-3' : 'p-3'
        }`}
      >
        {collapsed ? (
          <Tooltip content={collapsedTooltipContent} position="right">
            <div className="flex items-center justify-center rounded-[10px] bg-[var(--bg-tertiary)] p-1">
              <UserAvatar name={displayName} role={userRole} size="sm" />
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 rounded-[10px] bg-[var(--bg-tertiary)] px-2.5 py-2">
            <UserAvatar name={displayName} role={userRole} size="sm" title={userEmail} />

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-xs font-bold leading-tight text-[var(--text-primary)]" title={displayName}>
                {shortName}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                {roleLabel}
              </span>
            </div>

            <Tooltip content="Cerrar sesión" position="top">
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                className={`${logoutBtnClass} h-7 w-7 shrink-0`}
                aria-label="Cerrar sesión"
              >
                <LogOut size={14} aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
        )}

        {collapsed && (
          <Tooltip content="Cerrar sesión" position="right">
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className={`${logoutBtnClass} mt-1.5 w-full rounded-lg border border-[var(--border)] px-2 py-2 hover:border-[rgba(255,107,107,0.3)]`}
              aria-label="Cerrar sesión"
            >
              <LogOut size={14} aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmLogout(false)}
        title="Cerrar sesión"
        message={
          <>
            ¿Deseas cerrar la sesión de <strong>{displayName}</strong>?
          </>
        }
        variant="question"
        confirmLabel="Cerrar sesión"
      />
    </>
  );
}