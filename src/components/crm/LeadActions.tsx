'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { markLeadAsLost, deleteLead, changeLeadStage, fetchEmailTemplates, reactivateLead } from '@/lib/crm/actions';
import type { Lead, LeadStage, LostReason, EmailTemplate } from '@/lib/crm/types';
import EmailTemplateSelector from './EmailTemplateSelector';
import WinLeadModal from './WinLeadModal';

interface LeadActionsProps {
  lead: Lead;
  stages: LeadStage[];
  lostReasons: LostReason[];
}

export default function LeadActions({ lead, stages, lostReasons }: LeadActionsProps) {
  const router = useRouter();
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lead ganado: está en etapa "Ganado"
  const isWonLead = lead.stage?.isWon || false;
  // Lead perdido: tiene lostReasonId (nuevo modelo: mantiene su etapa pero está marcado como perdido)
  const isLostLead = !!lead.lostReasonId;
  // Lead cerrado (ganado o perdido)
  const isClosedLead = isWonLead || isLostLead;
  const activeStages = stages.filter((s) => !s.isWon && !s.isLost);

  // Cargar plantillas de email al abrir el modal
  useEffect(() => {
    if (showEmailModal && emailTemplates.length === 0) {
      fetchEmailTemplates().then(setEmailTemplates);
    }
  }, [showEmailModal, emailTemplates.length]);

  const handleMarkAsWon = () => {
    setShowWinModal(true);
  };

  const handleMarkAsLost = async (formData: FormData) => {
    setIsSubmitting(true);
    const result = await markLeadAsLost(lead.id, formData);
    if (result.success) {
      setShowLostModal(false);
      router.refresh();
    } else {
      alert(result.error || 'Error al marcar como perdido');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este lead? Esta acción no se puede deshacer.')) return;

    setIsSubmitting(true);
    const result = await deleteLead(lead.id);
    if (result.success) {
      router.push('/panel/crm');
    } else {
      alert(result.error || 'Error al eliminar');
    }
    setIsSubmitting(false);
  };

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStageId = e.target.value;
    if (!newStageId || newStageId === lead.stageId) return;

    setIsSubmitting(true);
    const result = await changeLeadStage(lead.id, newStageId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al cambiar etapa');
      e.target.value = lead.stageId; // Revert
    }
    setIsSubmitting(false);
  };

  const handleReactivate = async () => {
    if (!confirm('¿Reactivar esta oportunidad? El lead volverá al pipeline activo.')) return;

    setIsSubmitting(true);
    const result = await reactivateLead(lead.id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al reactivar');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Stage Selector */}
      {!isClosedLead && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etapa Actual
          </label>
          <select
            value={lead.stageId}
            onChange={handleStageChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent disabled:opacity-50"
          >
            {activeStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.displayName} ({stage.probability}%)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      {!isClosedLead && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleMarkAsWon}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ganado
          </button>
          <button
            onClick={() => setShowLostModal(true)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Perdido
          </button>
        </div>
      )}

      {/* Status Badge - Ganado */}
      {isWonLead && (
        <div className="text-center py-3 px-4 rounded-lg font-semibold bg-green-100 text-green-800 border border-green-200">
          ✓ GANADO
        </div>
      )}

      {/* Status Badge - Perdido con botón Reactivar */}
      {isLostLead && !isWonLead && (
        <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
          <div className="text-center py-3 px-4 bg-red-100 text-red-800 font-semibold">
            ✗ PERDIDO
            {lead.lostReason && (
              <p className="text-sm font-normal mt-1">
                Razón: {lead.lostReason.displayName}
              </p>
            )}
          </div>
          {/* Botón Reactivar */}
          <div className="p-3 border-t border-red-200">
            <button
              onClick={handleReactivate}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isSubmitting ? 'Reactivando...' : 'Reactivar Oportunidad'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              El lead volverá al pipeline en su etapa actual
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Acciones Rápidas
        </p>

        {/* Email Button */}
        <button
          onClick={() => setShowEmailModal(true)}
          disabled={!lead.email}
          className="w-full px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          title={!lead.email ? 'Este lead no tiene email registrado' : undefined}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Enviar Email
        </button>

        {/* Quotation Button (Placeholder) */}
        <button
          disabled
          className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2 relative group"
          title="Módulo de cotizaciones próximamente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Crear Cotización
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Próximamente
          </span>
        </button>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isSubmitting}
        className="w-full px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        Eliminar Lead
      </button>

      {/* Lost Modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Marcar como Perdido
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleMarkAsLost(new FormData(e.currentTarget));
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón de Pérdida *
                  </label>
                  <select
                    name="lostReasonId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {lostReasons.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    name="lostNotes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                    placeholder="Detalles sobre por qué se perdió..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowLostModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Template Modal */}
      {showEmailModal && (
        <EmailTemplateSelector
          lead={lead}
          templates={emailTemplates}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {/* Win Lead Modal */}
      {showWinModal && (
        <WinLeadModal
          lead={lead}
          onSuccess={() => setShowWinModal(false)}
          onCancel={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
