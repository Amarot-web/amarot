'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createLead, updateLead, checkDuplicateLeads } from '@/lib/crm/actions';
import { SERVICE_TYPE_LABELS, LEAD_SOURCE_LABELS, PRIORITY_CONFIG } from '@/lib/crm/types';
import type { Lead, LeadStage, Priority } from '@/lib/crm/types';
import DuplicateLeadModal from './DuplicateLeadModal';

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface LeadFormProps {
  lead?: Lead;
  stages: LeadStage[];
  teamMembers: TeamMember[];
}

export default function LeadForm({ lead, stages, teamMembers }: LeadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Lead[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = !!lead;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Solo verificar duplicados al crear, no al editar
    if (!isEditing) {
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;

      if (email || phone) {
        try {
          const foundDuplicates = await checkDuplicateLeads(email || undefined, phone || undefined);
          if (foundDuplicates.length > 0) {
            setDuplicates(foundDuplicates);
            setPendingFormData(formData);
            setShowDuplicateModal(true);
            setIsSubmitting(false);
            return;
          }
        } catch (err) {
          console.error('Error checking duplicates:', err);
          // Continuar con la creación si falla la verificación
        }
      }
    }

    await submitForm(formData);
  };

  const submitForm = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = isEditing
        ? await updateLead(lead.id, formData)
        : await createLead(formData);

      if (result.success) {
        router.push('/panel/crm');
        router.refresh();
      } else {
        setError(result.error || 'Error al guardar el lead');
      }
    } catch (err) {
      setError('Error inesperado al guardar');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMerge = () => {
    setShowDuplicateModal(false);
    setPendingFormData(null);
    setDuplicates([]);
  };

  const handleCreateAnyway = async () => {
    setShowDuplicateModal(false);
    if (pendingFormData) {
      await submitForm(pendingFormData);
    }
    setPendingFormData(null);
    setDuplicates([]);
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setPendingFormData(null);
    setDuplicates([]);
  };

  const getNewLeadDataFromForm = () => {
    return {
      company: pendingFormData?.get('company') as string || '',
      contactName: pendingFormData?.get('contactName') as string || '',
      email: pendingFormData?.get('email') as string || undefined,
      phone: pendingFormData?.get('phone') as string || undefined,
      location: pendingFormData?.get('location') as string || undefined,
      serviceType: pendingFormData?.get('serviceType') as string || '',
      description: pendingFormData?.get('description') as string || undefined,
      source: pendingFormData?.get('source') as string || undefined,
    };
  };

  // Filter active stages for dropdown
  const activeStages = stages.filter((s) => !s.isWon && !s.isLost);

  // Find default stage (first one, which is "Nuevo Lead")
  const defaultStageId = activeStages[0]?.id || '';

  return (
    <>
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Company & Contact Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de Contacto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <input
              type="text"
              id="company"
              name="company"
              required
              defaultValue={lead?.company || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              placeholder="Nombre de la empresa"
            />
          </div>

          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Contacto *
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              defaultValue={lead?.contactName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              placeholder="Nombre del contacto"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={lead?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              placeholder="email@empresa.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={lead?.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              placeholder="+51 999 999 999"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación / Dirección
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={lead?.location || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              placeholder="Distrito, Ciudad"
            />
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detalles del Servicio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Servicio *
            </label>
            <select
              id="serviceType"
              name="serviceType"
              required
              defaultValue={lead?.serviceType || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              Origen del Lead *
            </label>
            <select
              id="source"
              name="source"
              required
              defaultValue={lead?.source || 'contact_form'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
            >
              {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Proyecto
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={lead?.description || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              placeholder="Describe los detalles del proyecto o requerimiento..."
            />
          </div>
        </div>
      </div>

      {/* Pipeline & Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pipeline y Valor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isEditing && (
            <div>
              <label htmlFor="stageId" className="block text-sm font-medium text-gray-700 mb-1">
                Etapa Inicial
              </label>
              <select
                id="stageId"
                name="stageId"
                defaultValue={defaultStageId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              >
                {activeStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="expectedRevenue" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Esperado (S/)
            </label>
            <input
              type="number"
              id="expectedRevenue"
              name="expectedRevenue"
              min="0"
              step="100"
              defaultValue={lead?.expectedRevenue || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="dateDeadline" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Límite de Cierre
            </label>
            <input
              type="date"
              id="dateDeadline"
              name="dateDeadline"
              defaultValue={
                lead?.dateDeadline
                  ? new Date(lead.dateDeadline).toISOString().split('T')[0]
                  : ''
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              Responsable
            </label>
            <select
              id="userId"
              name="userId"
              defaultValue={lead?.userId || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
            >
              <option value="">Sin asignar</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={lead?.priority || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
            >
              <option value="">Sin prioridad</option>
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((key) => (
                <option key={key} value={key}>
                  {PRIORITY_CONFIG[key].label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              La prioridad se mostrará como un borde de color en la tarjeta del lead
            </p>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Lead' : 'Crear Lead'}
        </button>
      </div>
    </form>

    {/* Modal de duplicados */}
    {showDuplicateModal && duplicates.length > 0 && (
      <DuplicateLeadModal
        duplicates={duplicates}
        newLeadData={getNewLeadDataFromForm()}
        onMerge={handleMerge}
        onCreateAnyway={handleCreateAnyway}
        onCancel={handleCancelDuplicate}
      />
    )}
    </>
  );
}
