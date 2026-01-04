'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SERVICE_TYPE_LABELS, type ServiceType } from '@/lib/crm/types';
import {
  createAssignmentRule,
  updateAssignmentRule,
  deleteAssignmentRule,
} from '@/lib/crm/actions';

interface AssignmentRule {
  id: string;
  serviceType: string;
  userId: string;
  userName: string;
  priority: number;
  isActive: boolean;
}

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface AssignmentRulesClientProps {
  initialRules: AssignmentRule[];
  teamMembers: TeamMember[];
  availableServiceTypes: ServiceType[];
}

export default function AssignmentRulesClient({
  initialRules,
  teamMembers,
  availableServiceTypes,
}: AssignmentRulesClientProps) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createAssignmentRule(formData);

    if (result.success) {
      setShowAddForm(false);
      router.refresh();
    } else {
      alert(result.error || 'Error al crear la regla');
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (ruleId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateAssignmentRule(ruleId, formData);

    if (result.success) {
      setEditingRule(null);
      router.refresh();
    } else {
      alert(result.error || 'Error al actualizar la regla');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('¿Eliminar esta regla de asignación?')) return;

    setIsSubmitting(true);
    const result = await deleteAssignmentRule(ruleId);

    if (result.success) {
      setRules(rules.filter((r) => r.id !== ruleId));
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar la regla');
    }
    setIsSubmitting(false);
  };

  const handleToggleActive = async (ruleId: string, currentActive: boolean) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('isActive', (!currentActive).toString());

    const result = await updateAssignmentRule(ruleId, formData);

    if (result.success) {
      setRules(rules.map((r) =>
        r.id === ruleId ? { ...r, isActive: !currentActive } : r
      ));
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">¿Cómo funcionan las reglas de asignación?</p>
            <p className="mt-1">
              Cuando se crea un lead (desde formulario de contacto o manualmente) sin un responsable asignado,
              el sistema busca automáticamente una regla activa para el tipo de servicio y asigna al responsable configurado.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Reglas Configuradas</h2>
          {availableServiceTypes.length > 0 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Regla
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Servicio
                </label>
                <select
                  name="serviceType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {availableServiceTypes.map((st) => (
                    <option key={st} value={st}>
                      {SERVICE_TYPE_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsable
                </label>
                <select
                  name="userId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <input
                  type="number"
                  name="priority"
                  defaultValue={1}
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rules List */}
        {rules.length === 0 && !showAddForm ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No hay reglas de asignación configuradas</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors"
            >
              Crear primera regla
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 ${
                  !rule.isActive ? 'opacity-50' : ''
                }`}
              >
                {editingRule === rule.id ? (
                  <form
                    onSubmit={(e) => handleUpdate(rule.id, e)}
                    className="flex-1 flex flex-wrap items-end gap-4"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Servicio
                      </label>
                      <input
                        type="text"
                        disabled
                        value={SERVICE_TYPE_LABELS[rule.serviceType as ServiceType] || rule.serviceType}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsable
                      </label>
                      <select
                        name="userId"
                        defaultValue={rule.userId}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                      >
                        {teamMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.fullName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                      </label>
                      <input
                        type="number"
                        name="priority"
                        defaultValue={rule.priority}
                        min={1}
                        max={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRule(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-6 flex-1">
                      <div className="min-w-[200px]">
                        <p className="text-sm font-medium text-gray-500">Tipo de Servicio</p>
                        <p className="font-medium text-gray-900">
                          {SERVICE_TYPE_LABELS[rule.serviceType as ServiceType] || rule.serviceType}
                        </p>
                      </div>
                      <div className="min-w-[150px]">
                        <p className="text-sm font-medium text-gray-500">Responsable</p>
                        <p className="font-medium text-gray-900">{rule.userName}</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-sm font-medium text-gray-500">Prioridad</p>
                        <p className="font-medium text-gray-900">{rule.priority}</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-sm font-medium text-gray-500">Estado</p>
                        <button
                          onClick={() => handleToggleActive(rule.id, rule.isActive)}
                          disabled={isSubmitting}
                          className={`text-sm font-medium ${
                            rule.isActive
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                        >
                          {rule.isActive ? 'Activa' : 'Inactiva'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        disabled={isSubmitting}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All service types have rules */}
      {availableServiceTypes.length === 0 && rules.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Todos los tipos de servicio tienen una regla de asignación</span>
          </div>
        </div>
      )}
    </div>
  );
}
