'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTeamMember } from '@/lib/team/actions';

type Role = 'admin' | 'manager' | 'member';

const roles: { value: Role; label: string; description: string }[] = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acceso completo al sistema, incluyendo gestión de equipo',
  },
  {
    value: 'manager',
    label: 'Gerente',
    description: 'Acceso a todos los módulos excepto gestión de equipo',
  },
  {
    value: 'member',
    label: 'Miembro',
    description: 'Acceso limitado según permisos asignados',
  },
];

export default function NuevoMiembroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'member' as Role,
    tempPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createTeamMember({
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || null,
        role: formData.role,
        tempPassword: formData.tempPassword,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/panel/equipo');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, tempPassword: password });
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-green-900 mb-2">
            ¡Miembro Creado!
          </h2>
          <p className="text-green-700 mb-4">
            El usuario <strong>{formData.fullName}</strong> ha sido creado exitosamente.
          </p>
          <div className="bg-white rounded-lg p-4 text-left border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Credenciales de acceso:</p>
            <p className="text-sm"><strong>Email:</strong> {formData.email}</p>
            <p className="text-sm"><strong>Contraseña:</strong> {formData.tempPassword}</p>
          </div>
          <p className="text-sm text-green-600 mt-4">
            Redirigiendo al listado de equipo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
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
        <h1 className="text-xl font-bold text-gray-900">Invitar Nuevo Miembro</h1>
        <p className="text-gray-500 mt-1">
          Crea una cuenta para un nuevo miembro del equipo
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Información Básica */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información Básica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                placeholder="Juan Pérez García"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                placeholder="juan@amarotperu.com"
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
          </div>
        </div>

        {/* Rol */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rol en el Sistema
          </h3>
          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.role === role.value
                    ? 'border-[#DC2626] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="text-[#DC2626] focus:ring-[#DC2626]"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{role.label}</p>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Contraseña Temporal */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Contraseña Temporal
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.tempPassword}
              onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none font-mono"
              placeholder="Contraseña temporal"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Generar
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            El usuario deberá cambiar esta contraseña en su primer inicio de sesión
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/panel/equipo"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creando...
              </>
            ) : (
              'Crear Miembro'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
