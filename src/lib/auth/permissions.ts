// Helpers de Permisos para el Panel AMAROT
// Funciones server-side para verificar permisos

import { createClient } from '@/lib/supabase/server';
import type { PermissionName, RoleName, AuthUser, UserProfile, DbUserProfile } from '@/types/auth';

// ==================== OBTENER USUARIO CON PERMISOS ====================

/**
 * Obtiene el usuario autenticado con su perfil, rol y permisos
 * Usar en Server Components y API Routes
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Obtener rol del usuario
  const { data: roleData } = await supabase.rpc('get_user_role', {
    p_user_id: user.id
  });

  // Obtener permisos efectivos
  const { data: permissions } = await supabase.rpc('get_user_permissions', {
    p_user_id: user.id
  });

  const permissionNames = permissions?.map((p: { permission_name: string }) => p.permission_name) || [];

  return {
    id: user.id,
    email: user.email || '',
    profile: profile ? dbToProfile(profile) : null,
    role: (roleData as RoleName) || 'member',
    permissions: permissionNames,
  };
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 */
export async function hasPermission(permission: PermissionName): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  // Admin tiene todos los permisos
  if (user.role === 'admin') return true;

  return user.permissions.includes(permission);
}

/**
 * Verifica si el usuario actual tiene TODOS los permisos especificados
 */
export async function hasAllPermissions(permissions: PermissionName[]): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  if (user.role === 'admin') return true;

  return permissions.every(p => user.permissions.includes(p));
}

/**
 * Verifica si el usuario actual tiene AL MENOS UNO de los permisos especificados
 */
export async function hasAnyPermission(permissions: PermissionName[]): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  if (user.role === 'admin') return true;

  return permissions.some(p => user.permissions.includes(p));
}

/**
 * Verifica si el usuario tiene un rol específico o superior
 */
export async function hasRole(requiredRole: RoleName): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  const roleHierarchy: Record<RoleName, number> = {
    admin: 3,
    manager: 2,
    member: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// ==================== VERIFICACIÓN DIRECTA (usando Supabase) ====================

/**
 * Verifica un permiso directamente en la base de datos
 * Útil cuando no necesitas el objeto AuthUser completo
 */
export async function checkPermission(userId: string, permission: PermissionName): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_permission_name: permission
  });

  return data === true;
}

/**
 * Obtiene el rol de un usuario específico
 */
export async function getUserRole(userId: string): Promise<RoleName> {
  const supabase = await createClient();

  const { data } = await supabase.rpc('get_user_role', {
    p_user_id: userId
  });

  return (data as RoleName) || 'member';
}

// ==================== HELPERS PARA API ROUTES ====================

/**
 * Verifica autenticación y permiso, lanza error si no tiene acceso
 * Uso: await requirePermission('quotations:view');
 */
export async function requirePermission(permission: PermissionName): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new AuthError('No autenticado', 401);
  }

  if (user.role !== 'admin' && !user.permissions.includes(permission)) {
    throw new AuthError('Sin permiso para esta acción', 403);
  }

  return user;
}

/**
 * Verifica autenticación y rol mínimo
 */
export async function requireRole(minRole: RoleName): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new AuthError('No autenticado', 401);
  }

  const roleHierarchy: Record<RoleName, number> = {
    admin: 3,
    manager: 2,
    member: 1,
  };

  if (roleHierarchy[user.role] < roleHierarchy[minRole]) {
    throw new AuthError('Rol insuficiente', 403);
  }

  return user;
}

// ==================== GESTIÓN DE PERFILES ====================

/**
 * Crea o actualiza el perfil de un usuario
 */
export async function ensureUserProfile(userId: string, email: string, fullName?: string): Promise<UserProfile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email,
      full_name: fullName || email.split('@')[0],
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creando perfil: ${error.message}`);
  }

  return dbToProfile(data);
}

/**
 * Asigna un rol a un usuario
 */
export async function assignRole(
  userId: string,
  roleName: RoleName,
  assignedBy?: string
): Promise<void> {
  const supabase = await createClient();

  // Obtener el ID del rol
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (roleError || !role) {
    throw new Error(`Rol no encontrado: ${roleName}`);
  }

  // Eliminar roles anteriores del usuario
  await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  // Asignar nuevo rol
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: role.id,
      assigned_by: assignedBy,
    });

  if (error) {
    throw new Error(`Error asignando rol: ${error.message}`);
  }
}

/**
 * Asigna permisos adicionales a un usuario
 */
export async function assignPermissions(
  userId: string,
  permissionNames: PermissionName[],
  grantedBy?: string
): Promise<void> {
  const supabase = await createClient();

  // Obtener IDs de permisos
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .in('name', permissionNames);

  if (permError || !permissions) {
    throw new Error('Error obteniendo permisos');
  }

  // Eliminar permisos anteriores
  await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId);

  // Insertar nuevos permisos
  if (permissions.length > 0) {
    const { error } = await supabase
      .from('user_permissions')
      .insert(
        permissions.map(p => ({
          user_id: userId,
          permission_id: p.id,
          granted_by: grantedBy,
        }))
      );

    if (error) {
      throw new Error(`Error asignando permisos: ${error.message}`);
    }
  }
}

// ==================== UTILIDADES ====================

function dbToProfile(db: DbUserProfile): UserProfile {
  return {
    id: db.id,
    email: db.email,
    fullName: db.full_name,
    avatarUrl: db.avatar_url,
    phone: db.phone,
    isActive: db.is_active,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// ==================== ERROR PERSONALIZADO ====================

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ==================== PERMISOS POR RUTA ====================

/**
 * Mapeo de rutas del panel a permisos requeridos
 * Usar en middleware para validación automática
 */
export const ROUTE_PERMISSIONS: Record<string, PermissionName> = {
  '/panel/dashboard': 'quotations:view',  // Dashboard requiere al menos ver cotizaciones
  '/panel/cotizador': 'quotations:view',
  '/panel/cotizador/nueva': 'quotations:create',
  '/panel/clientes': 'clients:view',
  '/panel/clientes/nuevo': 'clients:create',
  '/panel/blog': 'blog:view',
  '/panel/blog/nuevo': 'blog:create',
  '/panel/equipo': 'team:view',
  '/panel/equipo/nuevo': 'team:create',
  '/panel/analytics': 'analytics:view',
};

/**
 * Verifica si una ruta requiere permiso específico
 */
export function getRequiredPermission(pathname: string): PermissionName | null {
  // Buscar coincidencia exacta primero
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Buscar coincidencia parcial (para rutas dinámicas como /panel/clientes/[id])
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return permission;
    }
  }

  return null;
}
