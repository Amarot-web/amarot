'use client';

// Hook para verificar permisos en componentes cliente
// Usa el contexto de auth para acceder a permisos sin llamadas adicionales a la BD

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthUser, PermissionName, RoleName } from '@/types/auth';

// ==================== CONTEXT ====================

interface PermissionsContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: PermissionName) => boolean;
  hasAllPermissions: (permissions: PermissionName[]) => boolean;
  hasAnyPermission: (permissions: PermissionName[]) => boolean;
  hasRole: (role: RoleName) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  refresh: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

// ==================== PROVIDER ====================

interface PermissionsProviderProps {
  children: ReactNode;
  initialUser?: AuthUser | null;
}

export function PermissionsProvider({ children, initialUser }: PermissionsProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const supabase = createClient();

  // Cargar datos del usuario
  const loadUser = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        return;
      }

      // Obtener perfil
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Obtener rol
      const { data: roleData } = await supabase.rpc('get_user_role', {
        p_user_id: authUser.id
      });

      // Obtener permisos
      const { data: permissions } = await supabase.rpc('get_user_permissions', {
        p_user_id: authUser.id
      });

      const permissionNames = permissions?.map((p: { permission_name: string }) => p.permission_name) || [];

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        profile: profile ? {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          phone: profile.phone,
          isActive: profile.is_active,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
        } : null,
        role: (roleData as RoleName) || 'member',
        permissions: permissionNames,
      });
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Cargar usuario al montar
  useEffect(() => {
    if (!initialUser) {
      loadUser();
    }
  }, [initialUser, loadUser]);

  // Escuchar cambios de auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadUser]);

  // Helpers de permisos
  const hasPermission = useCallback((permission: PermissionName): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  }, [user]);

  const hasAllPermissions = useCallback((permissions: PermissionName[]): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.every(p => user.permissions.includes(p));
  }, [user]);

  const hasAnyPermission = useCallback((permissions: PermissionName[]): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.some(p => user.permissions.includes(p));
  }, [user]);

  const hasRole = useCallback((role: RoleName): boolean => {
    if (!user) return false;
    const hierarchy: Record<RoleName, number> = {
      admin: 3,
      manager: 2,
      member: 1,
    };
    return hierarchy[user.role] >= hierarchy[role];
  }, [user]);

  const value: PermissionsContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    refresh: loadUser,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

// ==================== HOOK ====================

export function usePermissions() {
  const context = useContext(PermissionsContext);

  if (!context) {
    throw new Error('usePermissions debe usarse dentro de PermissionsProvider');
  }

  return context;
}

// ==================== HOOK SIMPLIFICADO ====================

/**
 * Hook simplificado para verificar un solo permiso
 * Uso: const canEdit = useHasPermission('quotations:edit');
 */
export function useHasPermission(permission: PermissionName): boolean {
  const { hasPermission, isLoading } = usePermissions();
  return !isLoading && hasPermission(permission);
}

/**
 * Hook para verificar múltiples permisos (todos requeridos)
 */
export function useHasAllPermissions(permissions: PermissionName[]): boolean {
  const { hasAllPermissions, isLoading } = usePermissions();
  return !isLoading && hasAllPermissions(permissions);
}

/**
 * Hook para verificar múltiples permisos (al menos uno)
 */
export function useHasAnyPermission(permissions: PermissionName[]): boolean {
  const { hasAnyPermission, isLoading } = usePermissions();
  return !isLoading && hasAnyPermission(permissions);
}

/**
 * Hook para verificar rol mínimo
 */
export function useHasRole(role: RoleName): boolean {
  const { hasRole, isLoading } = usePermissions();
  return !isLoading && hasRole(role);
}

// ==================== EXPORTS ====================

export { PermissionsContext };
export type { PermissionsContextType, PermissionsProviderProps };
