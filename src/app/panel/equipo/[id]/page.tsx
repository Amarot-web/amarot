import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import Link from 'next/link';
import TeamMemberForm from './TeamMemberForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMemberPage({ params }: PageProps) {
  const { id } = await params;

  // Verificar permiso
  try {
    await requirePermission('team:view');
  } catch {
    redirect('/panel/dashboard');
  }

  const supabase = createAdminClient();

  // Obtener datos del usuario
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      phone,
      is_active,
      created_at,
      updated_at,
      user_roles!user_roles_user_id_fkey (
        id,
        roles (
          id,
          name,
          display_name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !user) {
    notFound();
  }

  // Obtener todos los roles disponibles
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  // Obtener todos los permisos
  const { data: permissions } = await supabase
    .from('permissions')
    .select('*')
    .order('module, action');

  // Obtener permisos adicionales del usuario
  const { data: userPermissions } = await supabase
    .from('user_permissions')
    .select('permission_id')
    .eq('user_id', id);

  // Preparar datos para el formulario
  const userRoles = user.user_roles as unknown as Array<{ id: string; roles: { id: string; name: string; display_name: string } | null }> | null;
  const currentRole = userRoles?.[0]?.roles || null;
  const currentRoleAssignmentId = userRoles?.[0]?.id || null;

  const userData = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone || '',
    isActive: user.is_active,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    currentRoleId: currentRole?.id || null,
    currentRoleName: currentRole?.name || 'member',
    currentRoleAssignmentId,
    userPermissionIds: userPermissions?.map(p => p.permission_id) || [],
  };

  // Agrupar permisos por módulo
  const permissionsByModule = permissions?.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof permissions>) || {};

  const moduleLabels: Record<string, string> = {
    quotations: 'Cotizaciones',
    clients: 'Clientes',
    blog: 'Blog',
    team: 'Equipo',
    analytics: 'Analytics',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/panel/equipo"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al equipo
        </Link>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <TeamMemberForm
        userData={userData}
        roles={roles || []}
        permissionsByModule={permissionsByModule}
        moduleLabels={moduleLabels}
      />
    </div>
  );
}
