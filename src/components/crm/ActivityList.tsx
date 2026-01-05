'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createActivity, updateActivity, completeActivity, uncompleteActivity, deleteActivity } from '@/lib/crm/actions';
import { ACTIVITY_TYPE_LABELS } from '@/lib/crm/types';
import type { LeadActivity } from '@/lib/crm/types';

interface TeamMember {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface ActivityListProps {
  leadId: string;
  activities: LeadActivity[];
  teamMembers: TeamMember[];
}

export default function ActivityList({ leadId, activities, teamMembers }: ActivityListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<LeadActivity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true);
    const result = await createActivity(leadId, formData);
    if (result.success) {
      setShowForm(false);
      router.refresh();
    } else {
      alert(result.error || 'Error al crear actividad');
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingActivity) return;
    setIsSubmitting(true);
    const result = await updateActivity(editingActivity.id, formData);
    if (result.success) {
      setEditingActivity(null);
      router.refresh();
    } else {
      alert(result.error || 'Error al actualizar actividad');
    }
    setIsSubmitting(false);
  };

  const handleComplete = async (activityId: string) => {
    const result = await completeActivity(activityId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al completar');
    }
  };

  const handleUncomplete = async (activityId: string) => {
    const result = await uncompleteActivity(activityId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al desmarcar');
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    const result = await deleteActivity(activityId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'visit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const pendingActivities = activities.filter((a) => !a.isCompleted);
  const completedActivities = activities.filter((a) => a.isCompleted);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Actividades</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium"
        >
          + Nueva
        </button>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="p-4 border-b border-gray-200 bg-gray-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select
                name="activityType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Tipo...</option>
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="date"
                name="dueDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="text"
                name="title"
                required
                placeholder="Título de la actividad"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <textarea
                name="description"
                rows={2}
                placeholder="Descripción (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <select
                name="userId"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Responsable...</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Crear'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Activity List */}
      <div className="divide-y divide-gray-100">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No hay actividades registradas
          </div>
        ) : (
          <>
            {/* Pending */}
            {pendingActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {ACTIVITY_TYPE_LABELS[activity.activityType] || activity.activityType}
                        {activity.dueDate && (
                          <span className="ml-2">• {formatDate(activity.dueDate)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleComplete(activity.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Completar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingActivity(activity)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Completed */}
            {completedActivities.length > 0 && (
              <div className="bg-gray-50">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                  Completadas ({completedActivities.length})
                </div>
                {completedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 flex items-start gap-3 hover:bg-gray-100"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-600 line-through">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {ACTIVITY_TYPE_LABELS[activity.activityType]} • Completado {formatDate(activity.completedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUncomplete(activity.id)}
                            className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                            title="Marcar como pendiente"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingActivity(activity)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Editar Actividad
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(new FormData(e.currentTarget)); }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      name="activityType"
                      defaultValue={editingActivity.activityType}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={editingActivity.dueDate ? new Date(editingActivity.dueDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingActivity.title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="description"
                    defaultValue={editingActivity.description || ''}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                  <select
                    name="userId"
                    defaultValue={editingActivity.userId || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Sin asignar</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
