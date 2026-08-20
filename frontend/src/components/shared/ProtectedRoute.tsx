// ¿Qué? Wrapper de rutas que protege el acceso según autenticación, rol y permisos.
// ¿Para qué? Protección centralizada de rutas privadas con Tailwind.
// ¿Impacto? Todas las rutas privadas del sistema usan este componente.

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import type { SystemRole } from '@constants/Roles';
import type { PermissionKey } from '@constants/Permissions';
import { PUBLIC_ROUTES } from '@constants/Navigation';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del ProtectedRoute. */
export interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  allowedRoles?: SystemRole[];
  requiredPermission?: PermissionKey;
  redirectTo?: string;
  silentRedirect?: boolean;
  unauthorizedRedirect?: string;
}

// ==============================================================================
// SUB-COMPONENTE — LoadingScreen
// ==============================================================================

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-[var(--bg-primary)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] mb-2">
        <Shield size={28} strokeWidth={2} />
      </div>
      <Spinner size="md" variant="primary" />
      <p className="text-[13px] text-[var(--text-secondary)] font-sans font-medium tracking-wide">
        Verificando sesión...
      </p>
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — UnauthorizedScreen
// ==============================================================================

interface UnauthorizedScreenProps {
  reason: 'role' | 'permission';
  redirectPath: string;
}

function UnauthorizedScreen({ reason, redirectPath }: UnauthorizedScreenProps) {
  const iconElement = reason === 'role'
    ? <Lock size={48} strokeWidth={1.5} />
    : <ShieldAlert size={48} strokeWidth={1.5} />;

  const title = reason === 'role'
    ? 'Acceso restringido por rol'
    : 'Permiso insuficiente';

  const description = reason === 'role'
    ? 'Tu rol actual no tiene acceso a esta sección del sistema. Contacta a un administrador si necesitas acceso.'
    : 'No tienes el permiso específico requerido para acceder a esta funcionalidad.';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 bg-[var(--bg-primary)]"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-[480px] w-full text-center">
        <EmptyState
          icon={iconElement}
          title={title}
          description={description}
          variant="danger"
          size="lg"
          action={
            <Button
              variant="primary"
              onClick={() => (window.location.href = redirectPath)}
            >
              Volver al inicio
            </Button>
          }
        />
      </div>
    </div>
  );
}

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export function ProtectedRoute({
  children,
  adminOnly = false,
  allowedRoles,
  requiredPermission,
  redirectTo = PUBLIC_ROUTES.LOGIN,
  silentRedirect = false,
  unauthorizedRedirect = '/',
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isAdmin,
    loading,
    user,
    isRole,
    hasPermission,
  } = useAuth();
  const location = useLocation();

  // 1. Loading
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. No autenticado
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 3. Admin only
  if (adminOnly && !isAdmin) {
    if (silentRedirect) {
      return <Navigate to={unauthorizedRedirect} replace />;
    }
    return <UnauthorizedScreen reason="role" redirectPath={unauthorizedRedirect} />;
  }

  // 4. Roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = user && allowedRoles.some((role) => isRole(role));
    if (!hasAllowedRole) {
      if (silentRedirect) {
        return <Navigate to={unauthorizedRedirect} replace />;
      }
      return <UnauthorizedScreen reason="role" redirectPath={unauthorizedRedirect} />;
    }
  }

  // 5. Permiso específico
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (silentRedirect) {
      return <Navigate to={unauthorizedRedirect} replace />;
    }
    return <UnauthorizedScreen reason="permission" redirectPath={unauthorizedRedirect} />;
  }

  // 6. Autorizado
  return <>{children}</>;
}