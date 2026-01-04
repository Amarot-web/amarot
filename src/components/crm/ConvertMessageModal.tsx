'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { convertMessageToLead, checkDuplicateLeads } from '@/lib/crm/actions';
import { SERVICE_TYPE_LABELS } from '@/lib/crm/types';
import type { ServiceType, Lead } from '@/lib/crm/types';
import { toast } from 'sonner';
import DuplicateLeadModal from './DuplicateLeadModal';

interface Message {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service_type: string | null;
  location: string | null;
  message: string;
}

interface TeamMember {
  id: string;
  fullName: string;
}

interface ConvertMessageModalProps {
  message: Message;
  teamMembers: TeamMember[];
  onClose: () => void;
}

export default function ConvertMessageModal({
  message,
  teamMembers,
  onClose,
}: ConvertMessageModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<Lead[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set('messageId', message.id);

    // Verificar duplicados antes de convertir
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
        // Continuar con la conversión si falla la verificación
      }
    }

    await submitConversion(formData);
  };

  const submitConversion = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await convertMessageToLead(formData);

      if (result.success) {
        toast.success(`Lead ${result.leadCode} creado exitosamente`);
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || 'Error al convertir el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado al convertir');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMerge = () => {
    setShowDuplicateModal(false);
    setPendingFormData(null);
    setDuplicates([]);
    onClose();
  };

  const handleCreateAnyway = async () => {
    setShowDuplicateModal(false);
    if (pendingFormData) {
      await submitConversion(pendingFormData);
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
      source: 'contact_form',
    };
  };

  // Determinar el serviceType inicial
  const initialServiceType = message.service_type &&
    Object.keys(SERVICE_TYPE_LABELS).includes(message.service_type)
    ? message.service_type
    : '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Convertir a Lead</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Se creará un nuevo lead con los datos del mensaje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <input
                type="text"
                name="company"
                required
                defaultValue={message.company || message.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto *
              </label>
              <input
                type="text"
                name="contactName"
                required
                defaultValue={message.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={message.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={message.phone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                defaultValue={message.location || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Servicio *
              </label>
              <select
                name="serviceType"
                required
                defaultValue={initialServiceType}
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

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsable
              </label>
              <select
                name="userId"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              >
                <option value="">Auto-asignar por regla</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Esperado (S/)
              </label>
              <input
                type="number"
                name="expectedRevenue"
                min="0"
                step="100"
                defaultValue=""
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={message.message}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Lead'}
            </button>
          </div>
        </form>
      </div>

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
    </div>
  );
}
