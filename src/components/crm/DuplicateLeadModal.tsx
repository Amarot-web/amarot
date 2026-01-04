'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mergeLeadWithExisting } from '@/lib/crm/actions';
import { SERVICE_TYPE_LABELS, LEAD_SOURCE_LABELS } from '@/lib/crm/types';
import type { Lead } from '@/lib/crm/types';
import { toast } from 'sonner';

interface DuplicateLeadModalProps {
  duplicates: Lead[];
  newLeadData: {
    company: string;
    contactName: string;
    email?: string;
    phone?: string;
    location?: string;
    serviceType: string;
    description?: string;
    source?: string;
  };
  onMerge: (targetLeadId: string) => void;
  onCreateAnyway: () => void;
  onCancel: () => void;
}

export default function DuplicateLeadModal({
  duplicates,
  newLeadData,
  onMerge,
  onCreateAnyway,
  onCancel,
}: DuplicateLeadModalProps) {
  const router = useRouter();
  const [selectedLeadId, setSelectedLeadId] = useState<string>(duplicates[0]?.id || '');
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = async () => {
    if (!selectedLeadId) return;

    setIsMerging(true);
    try {
      const result = await mergeLeadWithExisting(selectedLeadId, newLeadData);

      if (result.success) {
        toast.success('Información fusionada con el lead existente');
        onMerge(selectedLeadId);
        router.push(`/panel/crm/leads/${selectedLeadId}`);
        router.refresh();
      } else {
        toast.error(result.error || 'Error al fusionar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado al fusionar');
    } finally {
      setIsMerging(false);
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Posible Lead Duplicado
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Se encontró {duplicates.length === 1 ? 'un lead existente' : `${duplicates.length} leads existentes`} con información similar.
              </p>
            </div>
          </div>
        </div>

        {/* New lead info */}
        <div className="px-6 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Nuevo lead a crear:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-700">Empresa:</span>{' '}
                <span className="font-medium text-blue-900">{newLeadData.company}</span>
              </div>
              <div>
                <span className="text-blue-700">Contacto:</span>{' '}
                <span className="font-medium text-blue-900">{newLeadData.contactName}</span>
              </div>
              {newLeadData.email && (
                <div>
                  <span className="text-blue-700">Email:</span>{' '}
                  <span className="text-blue-900">{newLeadData.email}</span>
                </div>
              )}
              {newLeadData.phone && (
                <div>
                  <span className="text-blue-700">Teléfono:</span>{' '}
                  <span className="text-blue-900">{newLeadData.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Duplicate leads list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Leads existentes encontrados:
          </h4>
          <div className="space-y-3">
            {duplicates.map((lead) => (
              <label
                key={lead.id}
                className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedLeadId === lead.id
                    ? 'border-[#DC2626] bg-red-50 ring-2 ring-[#DC2626]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="duplicateLead"
                    value={lead.id}
                    checked={selectedLeadId === lead.id}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="mt-1 text-[#DC2626] focus:ring-[#DC2626]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{lead.company}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {lead.code}
                      </span>
                      {lead.stage && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: lead.stage.color }}
                        >
                          {lead.stage.displayName}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {lead.contactName} • {lead.email || lead.phone || 'Sin contacto'}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>
                        Servicio: {SERVICE_TYPE_LABELS[lead.serviceType as keyof typeof SERVICE_TYPE_LABELS] || lead.serviceType}
                      </span>
                      <span>
                        Origen: {LEAD_SOURCE_LABELS[lead.source as keyof typeof LEAD_SOURCE_LABELS] || lead.source}
                      </span>
                      <span>Creado: {formatDate(lead.createdAt)}</span>
                      {lead.expectedRevenue > 0 && (
                        <span className="font-medium text-green-600">
                          S/ {lead.expectedRevenue.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isMerging}
              className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors order-3 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onCreateAnyway}
              disabled={isMerging}
              className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors order-2 sm:order-2 sm:ml-auto"
            >
              Crear nuevo de todos modos
            </button>
            <button
              type="button"
              onClick={handleMerge}
              disabled={isMerging || !selectedLeadId}
              className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 order-1 sm:order-3 flex items-center justify-center gap-2"
            >
              {isMerging ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fusionando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Fusionar con seleccionado
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Al fusionar, se agregará una nota al lead existente con la información del nuevo contacto.
          </p>
        </div>
      </div>
    </div>
  );
}
