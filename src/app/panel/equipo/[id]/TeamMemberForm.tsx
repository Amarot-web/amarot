'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateTeamMember } from '@/lib/team/actions';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  currentRoleId: string | null;
  currentRoleName: string;
  currentRoleAssignmentId: string | null;
  userPermissionIds: string[];
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
}

interface Permission {
  id: string;
  module: string;
  action: string;
  name: string;
  display_name: string;
}

interface Props {
  userData: UserData;
  roles: Role[];
  permissionsByModule: Record<string, Permission[]>;
  moduleLabels: Record<string, string>;
}

const actionLabels: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

export default function TeamMemberForm({
  userData,
  roles,
  permissionsByModule,
  moduleLabels,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: userData.fullName,
    phone: userData.phone,
    isActive: userData.isActive,
    roleId: userData.currentRoleId || '',
    selectedPermissions: userData.userPermissionIds,
  });

  // Determinar si mostrar permisos granulares (solo para rol "member")
  const selectedRole = roles.find(r => r.id === formData.roleId);
  const showGranularPermissions = selectedRole?.name === 'member';

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateTeamMember({
      userId: userData.id,
      fullName: formData.fullName,
      phone: formData.phone || null,
      isActive: formData.isActive,
      roleId: formData.roleId,
      currentRoleAssignmentId: userData.currentRoleAssignmentId,
      selectedPermissions: formData.selectedPermissions,
      showGranularPermissions,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/panel/equipo');
        router.refresh();
      }, 1500);
    } else {
      setError(result.error || 'Error desconocido');
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Cambios guardados exitosamente. Redirigiendo...
        </div>
      )}

      {/* Información Básica */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
              placeholder="+51 999 999 999"
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-[#DC2626] border-gray-300 rounded focus:ring-[#DC2626]"
              />
              <span className="text-sm font-medium text-gray-700">
                Usuario activo
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-8">
              Los usuarios inactivos no pueden acceder al sistema
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          Miembro desde: {formatDate(userData.createdAt)}
        </div>
      </div>

      {/* Rol */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rol en el Sistema
        </h3>
        <div className="space-y-3">
          {roles.map((role) => (
            <label
              key={role.id}
              className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                formData.roleId === role.id
                  ? 'border-[#DC2626] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={formData.roleId === role.id}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="text-[#DC2626] focus:ring-[#DC2626]"
                />
                <div>
                  <p className="font-medium text-gray-900">{role.display_name}</p>
                  {role.description && (
                    <p className="text-sm text-gray-500">{role.description}</p>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Permisos Granulares (solo para member) */}
      {showGranularPermissions && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Permisos Adicionales
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Como miembro, este usuario solo tendrá acceso a los módulos seleccionados
          </p>

          <div className="space-y-6">
            {Object.entries(permissionsByModule).map(([module, perms]) => (
              <div key={module}>
                <h4 className="font-medium text-gray-900 mb-3">
                  {moduleLabels[module] || module}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.selectedPermissions.includes(perm.id)
                          ? 'border-[#DC2626] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedPermissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="w-4 h-4 text-[#DC2626] border-gray-300 rounded focus:ring-[#DC2626]"
                      />
                      <span className="text-sm">
                        {actionLabels[perm.action] || perm.action}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/panel/equipo')}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || success}
          className="px-6 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </button>
      </div>
    </form>
  );
}
