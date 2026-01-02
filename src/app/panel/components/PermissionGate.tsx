'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionName, RoleName } from '@/types/auth';

interface PermissionGateProps {
  children: ReactNode;
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAll?: boolean;  // true = AND, false = OR (default)
  role?: RoleName;
  fallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * Componente para renderizado condicional basado en permisos
 *
 * Uso:
 * <PermissionGate permission="quotations:create">
 *   <Button>Crear Cotización</Button>
 * </PermissionGate>
 *
 * <PermissionGate permissions={['blog:edit', 'blog:delete']} requireAll>
 *   <AdminControls />
 * </PermissionGate>
 *
 * <PermissionGate role="admin" fallback={<p>No tienes acceso</p>}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export default function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    isLoading,
    isAdmin,
  } = usePermissions();

  // Mostrar loading si está cargando y se solicita
  if (isLoading && showLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded h-8 w-24" />
    );
  }

  // Admin siempre tiene acceso
  if (isAdmin) {
    return <>{children}</>;
  }

  // Verificar rol si se especifica
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Verificar permiso único
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * HOC para proteger componentes completos
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: PermissionName
) {
  return function ProtectedComponent(props: P) {
    return (
      <PermissionGate permission={permission}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Componente para mostrar mensaje de acceso denegado
 */
export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Acceso Denegado
      </h2>
      <p className="text-gray-600 max-w-md">
        {message || 'No tienes permiso para acceder a esta sección. Contacta al administrador si crees que esto es un error.'}
      </p>
    </div>
  );
}
