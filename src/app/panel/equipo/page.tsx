import { createAdminClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Mapeo de roles a nombres y colores
const roleDisplay: Record<string, { label: string; class: string }> = {
  admin: { label: 'Administrador', class: 'bg-purple-100 text-purple-700' },
  manager: { label: 'Gerente', class: 'bg-blue-100 text-blue-700' },
  member: { label: 'Miembro', class: 'bg-gray-100 text-gray-700' },
};

// Iconos
const icons = {
  plus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
};

export default async function EquipoPage() {
  // Verificar que el usuario tiene permiso para ver el equipo
  try {
    await requirePermission('team:view');
  } catch {
    redirect('/panel/dashboard');
  }

  const supabase = createAdminClient();

  // Obtener todos los usuarios con sus roles
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      phone,
      is_active,
      created_at,
      user_roles!user_roles_user_id_fkey (
        roles (
          name,
          display_name
        )
      )
    `)
    .order('full_name');

  if (error) {
    console.error('Error fetching team:', error);
  }

  // Estadísticas
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.is_active).length || 0;
  const adminCount = users?.filter(u => {
    const userRoles = u.user_roles as unknown as Array<{ roles: { name: string } | null }> | null;
    return userRoles?.some(ur => ur.roles?.name === 'admin');
  }).length || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los miembros del equipo y sus permisos
          </p>
        </div>
        <Link
          href="/panel/equipo/nuevo"
          className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {icons.plus}
          Invitar Miembro
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Miembros</p>
          <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Administradores</p>
          <p className="text-2xl font-bold text-purple-600">{adminCount}</p>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Miembros del Equipo
          </h2>
        </div>

        {users && users.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {users.map((user) => {
              // Obtener el rol principal (prioridad: admin > manager > member)
              const userRoles = user.user_roles as unknown as Array<{ roles: { name: string; display_name: string } | null }> | null;
              const roleName = userRoles?.[0]?.roles?.name || 'member';
              const roleInfo = roleDisplay[roleName] || roleDisplay.member;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        icons.user
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {user.full_name}
                        </p>
                        {!user.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Rol */}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${roleInfo.class}`}>
                      {roleInfo.label}
                    </span>

                    {/* Fecha */}
                    <span className="text-sm text-gray-500 hidden md:block">
                      {formatDate(user.created_at)}
                    </span>

                    {/* Acciones */}
                    <Link
                      href={`/panel/equipo/${user.id}`}
                      className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      {icons.edit}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              {icons.user}
            </div>
            <p className="font-medium">No hay miembros en el equipo</p>
            <p className="text-sm mt-1">
              Invita al primer miembro para comenzar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
