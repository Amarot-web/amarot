'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '@/lib/crm/actions';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  position: number;
  isActive: boolean;
}

interface EmailTemplatesClientProps {
  initialTemplates: EmailTemplate[];
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  seguimiento: 'Seguimiento',
  cotizacion: 'Cotización',
  cierre: 'Cierre',
};

const AVAILABLE_VARIABLES = [
  { key: 'nombre', description: 'Nombre del contacto' },
  { key: 'empresa', description: 'Nombre de la empresa' },
  { key: 'servicio', description: 'Tipo de servicio' },
  { key: 'responsable', description: 'Responsable asignado' },
];

export default function EmailTemplatesClient({ initialTemplates }: EmailTemplatesClientProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    variables: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      category: 'general',
      variables: [],
    });
    setEditingTemplate(null);
    setError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (template: EmailTemplate) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      variables: template.variables,
    });
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingTemplate) {
        const result = await updateEmailTemplate(editingTemplate.id, {
          name: formData.name,
          subject: formData.subject,
          body: formData.body,
          category: formData.category,
          variables: formData.variables,
        });
        if (!result.success) {
          setError(result.error || 'Error al actualizar');
          return;
        }
      } else {
        const result = await createEmailTemplate({
          name: formData.name,
          subject: formData.subject,
          body: formData.body,
          category: formData.category,
          variables: formData.variables,
        });
        if (!result.success) {
          setError(result.error || 'Error al crear');
          return;
        }
      }

      setShowModal(false);
      resetForm();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    const result = await updateEmailTemplate(template.id, {
      isActive: !template.isActive,
    });
    if (result.success) {
      router.refresh();
    }
  };

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`¿Eliminar la plantilla "${template.name}"?`)) return;

    const result = await deleteEmailTemplate(template.id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  };

  const toggleVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter((v) => v !== variable)
        : [...prev.variables, variable],
    }));
  };

  return (
    <>
      {/* Actions */}
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Plantilla
        </button>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {templates.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
            <p className="text-gray-500 mb-4">Crea tu primera plantilla de email</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Nueva Plantilla
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${!template.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {CATEGORY_LABELS[template.category] || template.category}
                      </span>
                      {!template.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Asunto:</span> {template.subject}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">{template.body}</p>
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.variables.map((v) => (
                          <span key={v} className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(template)}
                      className={`p-2 rounded-lg transition-colors ${
                        template.isActive
                          ? 'hover:bg-amber-50 text-amber-600'
                          : 'hover:bg-green-50 text-green-600'
                      }`}
                      title={template.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {template.isActive ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                    placeholder="Ej: Confirmación de contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                  placeholder="Ej: Gracias por contactar a AMAROT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuerpo del mensaje *
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent font-mono text-sm"
                  placeholder="Estimado/a {{nombre}},&#10;&#10;Gracias por contactar a AMAROT..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variables disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => toggleVariable(v.key)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        formData.variables.includes(v.key)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {`{{${v.key}}}`}
                      <span className="ml-1 text-xs opacity-75">- {v.description}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selecciona las variables que usas en tu plantilla para documentación
                </p>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.subject || !formData.body}
                className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : editingTemplate ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
