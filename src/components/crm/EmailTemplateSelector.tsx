'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead, EmailTemplate } from '@/lib/crm/types';
import {
  replaceTemplateVariables,
  getVariablesFromLead,
  generateMailtoLink,
} from '@/lib/crm/email-utils';
import { createActivity } from '@/lib/crm/actions';

interface EmailTemplateSelectorProps {
  lead: Lead;
  templates: EmailTemplate[];
  onClose: () => void;
}

export default function EmailTemplateSelector({
  lead,
  templates,
  onClose,
}: EmailTemplateSelectorProps) {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewBody, setPreviewBody] = useState('');
  const [registerActivity, setRegisterActivity] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const variables = getVariablesFromLead(lead);

  useEffect(() => {
    if (selectedTemplate) {
      setPreviewSubject(replaceTemplateVariables(selectedTemplate.subject, variables));
      setPreviewBody(replaceTemplateVariables(selectedTemplate.body, variables));
    } else {
      setPreviewSubject('');
      setPreviewBody('');
    }
  }, [selectedTemplate, lead]);

  const handleSendEmail = async () => {
    if (!lead.email) {
      alert('Este lead no tiene email registrado');
      return;
    }

    if (!selectedTemplate) {
      alert('Selecciona una plantilla');
      return;
    }

    // Registrar actividad si está marcado
    if (registerActivity) {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('activityType', 'email');
      formData.append('title', `Email: ${selectedTemplate.name}`);
      formData.append('description', `Plantilla: ${selectedTemplate.name}\nAsunto: ${previewSubject}`);

      const result = await createActivity(lead.id, formData);
      if (!result.success) {
        console.error('Error registrando actividad:', result.error);
      }
      setIsSubmitting(false);
      router.refresh();
    }

    // Abrir cliente de correo
    const mailtoLink = generateMailtoLink(lead.email, previewSubject, previewBody);
    window.open(mailtoLink, '_blank');

    onClose();
  };

  // Agrupar plantillas por categoría
  const templatesByCategory = templates.reduce(
    (acc, template) => {
      const cat = template.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(template);
      return acc;
    },
    {} as Record<string, EmailTemplate[]>
  );

  const categoryLabels: Record<string, string> = {
    general: 'General',
    seguimiento: 'Seguimiento',
    cotizacion: 'Cotización',
    cierre: 'Cierre',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Enviar Email</h3>
            <p className="text-sm text-gray-500">
              {lead.email ? `Para: ${lead.email}` : 'Sin email registrado'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plantilla de Email
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
            >
              <option value="">Seleccionar plantilla...</option>
              {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                <optgroup key={category} label={categoryLabels[category] || category}>
                  {categoryTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Preview */}
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                  {previewSubject}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vista Previa del Mensaje
                </label>
                <div className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto text-sm">
                  {previewBody}
                </div>
              </div>

              {/* Variables utilizadas */}
              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">Variables disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{'{{nombre}}'} = {variables.nombre}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{'{{empresa}}'} = {variables.empresa}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{'{{servicio}}'} = {variables.servicio}</span>
                  {variables.responsable && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded">{'{{responsable}}'} = {variables.responsable}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No email warning */}
          {!lead.email && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Este lead no tiene email registrado</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Agrega un email al lead para poder enviar correos.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          {/* Register Activity Checkbox - Visible en footer */}
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={registerActivity}
              onChange={(e) => setRegisterActivity(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#DC2626] focus:ring-[#DC2626]"
            />
            <span className="text-sm text-gray-700">
              Registrar como actividad de email
            </span>
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!selectedTemplate || !lead.email || isSubmitting}
              className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {isSubmitting ? 'Registrando...' : 'Abrir en Cliente de Correo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
