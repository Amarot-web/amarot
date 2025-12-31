// Tipos para el Sistema de Autenticación y Permisos AMAROT
// Basado en la estructura de roles y permisos granulares

// ==================== ENUMS ====================

export type RoleName = 'admin' | 'manager' | 'member';

export type PermissionModule = 'quotations' | 'clients' | 'blog' | 'team' | 'analytics';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

// ==================== USER PROFILE ====================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Campos calculados (de joins)
  role?: Role;
  permissions?: Permission[];
}

// ==================== ROLES ====================

export interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
}

// ==================== PERMISSIONS ====================

export interface Permission {
  id: string;
  module: PermissionModule;
  action: PermissionAction;
  name: string;           // 'quotations:view'
  displayName: string;    // 'Ver cotizaciones'
}

// ==================== RELACIONES ====================

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string | null;
  assignedAt: Date;
  // Joins
  role?: Role;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
  grantedBy: string | null;
  grantedAt: Date;
  // Joins
  permission?: Permission;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  // Joins
  permission?: Permission;
}

// ==================== AUTH CONTEXT ====================

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
  role: RoleName;
  permissions: string[];    // Array de permission names: ['quotations:view', 'clients:edit']
}

// ==================== PERMISSION HELPERS ====================

export type PermissionName =
  | 'quotations:view' | 'quotations:create' | 'quotations:edit' | 'quotations:delete'
  | 'clients:view' | 'clients:create' | 'clients:edit' | 'clients:delete'
  | 'blog:view' | 'blog:create' | 'blog:edit' | 'blog:delete'
  | 'team:view' | 'team:create' | 'team:edit' | 'team:delete'
  | 'analytics:view';

// Permisos por módulo para UI
export const MODULE_PERMISSIONS: Record<PermissionModule, PermissionAction[]> = {
  quotations: ['view', 'create', 'edit', 'delete'],
  clients: ['view', 'create', 'edit', 'delete'],
  blog: ['view', 'create', 'edit', 'delete'],
  team: ['view', 'create', 'edit', 'delete'],
  analytics: ['view'],
};

// Labels en español
export const ROLE_LABELS: Record<RoleName, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  member: 'Miembro',
};

export const MODULE_LABELS: Record<PermissionModule, string> = {
  quotations: 'Cotizaciones',
  clients: 'Clientes',
  blog: 'Blog',
  team: 'Equipo',
  analytics: 'Analytics',
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

// ==================== TIPOS DE DATABASE (SUPABASE) ====================

export interface DbUserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface DbPermission {
  id: string;
  module: string;
  action: string;
  name: string;
  display_name: string;
}

export interface DbUserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

export interface DbUserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted_by: string | null;
  granted_at: string;
}

export interface DbRolePermission {
  id: string;
  role_id: string;
  permission_id: string;
}

// ==================== CONVERSIONES ====================

export function dbUserProfileToUserProfile(db: DbUserProfile): UserProfile {
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

export function dbRoleToRole(db: DbRole): Role {
  return {
    id: db.id,
    name: db.name as RoleName,
    displayName: db.display_name,
    description: db.description,
    isSystem: db.is_system,
    createdAt: new Date(db.created_at),
  };
}

export function dbPermissionToPermission(db: DbPermission): Permission {
  return {
    id: db.id,
    module: db.module as PermissionModule,
    action: db.action as PermissionAction,
    name: db.name,
    displayName: db.display_name,
  };
}

// ==================== FORM TYPES ====================

export interface InviteUserFormData {
  email: string;
  fullName: string;
  phone?: string;
  roleId: string;
  additionalPermissions?: string[];  // Permission IDs
}

export interface UpdateUserFormData {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UpdateUserRoleFormData {
  roleId: string;
  additionalPermissions?: string[];
}
