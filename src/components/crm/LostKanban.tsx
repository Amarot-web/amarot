'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Lead, LeadStage, AlertType } from '@/lib/crm/types';
import { SERVICE_TYPE_LABELS } from '@/lib/crm/types';
import AlertBadge from './AlertBadge';

interface LostKanbanProps {
  stages: LeadStage[];
  leadsByStage: Map<string, Lead[]>;
  alertsMap: Record<string, string[]>;
}

// Card para leads perdidos (con ribbon PERDIDO)
function LostLeadCard({ lead, alerts }: { lead: Lead; alerts?: AlertType[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <Link
      href={`/panel/crm/leads/${lead.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all relative overflow-hidden"
    >
      {/* Etiqueta PERDIDO diagonal (roja) */}
      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
        <div
          className="absolute transform rotate-45 bg-red-500 text-white text-[10px] font-bold py-1 w-32 text-center shadow-sm"
          style={{ top: '18px', right: '-36px' }}
        >
          PERDIDO
        </div>
      </div>

      {/* Header with code, alerts, and service */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-gray-400">{lead.code}</span>
          {alerts && alerts.length > 0 && <AlertBadge alerts={alerts} size="sm" />}
        </div>
      </div>

      {/* Service type */}
      <div className="mb-2">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          {SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType}
        </span>
      </div>

      {/* Company name */}
      <p className="font-semibold text-gray-900 mb-1 line-clamp-2">{lead.company}</p>

      {/* Contact name */}
      <p className="text-sm text-gray-600 mb-2">{lead.contactName}</p>

      {/* Lost reason */}
      {lead.lostReason && (
        <div className="mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-red-600 font-medium">
            {lead.lostReason.displayName}
          </span>
        </div>
      )}

      {/* Expected revenue */}
      {lead.expectedRevenue > 0 && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-500 line-through">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatCurrency(lead.expectedRevenue)}
          </div>
          {lead.dateClosed && (
            <span className="text-xs text-gray-400">{formatDate(lead.dateClosed)}</span>
          )}
        </div>
      )}

      {/* Footer with assignee */}
      <div className="flex items-center justify-end pt-2 border-t border-gray-100">
        {lead.assignedTo ? (
          <div className="flex items-center gap-1.5">
            {lead.assignedTo.avatarUrl ? (
              <img
                src={lead.assignedTo.avatarUrl}
                alt={lead.assignedTo.fullName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {lead.assignedTo.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            )}
            <span className="text-xs text-gray-500">{lead.assignedTo.fullName.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Sin asignar</span>
        )}
      </div>
    </Link>
  );
}

export default function LostKanban({ stages, leadsByStage, alertsMap }: LostKanbanProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar etapas que NO son "Perdido" (solo mostrar etapas normales del pipeline)
  const filteredStages = stages.filter((s) => !s.isLost && !s.isWon);

  // Filtrar leads por búsqueda
  const filterLeads = useCallback(
    (leads: Lead[]): Lead[] => {
      if (!searchQuery.trim()) return leads;
      const query = searchQuery.toLowerCase().trim();
      return leads.filter(
        (lead) =>
          lead.company.toLowerCase().includes(query) ||
          lead.contactName.toLowerCase().includes(query) ||
          lead.code.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.lostReason?.displayName.toLowerCase().includes(query)
      );
    },
    [searchQuery]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calcular estadísticas de columna
  const getColumnStats = (stageId: string) => {
    const leads = leadsByStage.get(stageId) || [];
    const filteredLeads = filterLeads(leads);
    const totalValue = filteredLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);

    return {
      leads: filteredLeads,
      count: filteredLeads.length,
      totalValue,
    };
  };

  // Contar total de perdidos
  const totalLostLeads = Array.from(leadsByStage.values()).flat().length;
  const totalLostValue = Array.from(leadsByStage.values())
    .flat()
    .reduce((sum, l) => sum + l.expectedRevenue, 0);

  // Contar resultados de búsqueda
  const totalFiltered = searchQuery.trim()
    ? filteredStages.reduce((sum, stage) => sum + getColumnStats(stage.id).count, 0)
    : null;

  return (
    <div className="relative">
      {/* Header con estadísticas */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{totalLostLeads} oportunidades perdidas</span>
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500 line-through">{formatCurrency(totalLostValue)}</span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar empresa, contacto, motivo de pérdida..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {totalFiltered !== null && (
          <span className="text-sm text-gray-500">
            {totalFiltered} {totalFiltered === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      {/* Columnas del Kanban - agrupadas por etapa donde se perdió */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {filteredStages.map((stage) => {
          const stats = getColumnStats(stage.id);

          // Solo mostrar columnas que tienen leads perdidos
          if (stats.count === 0 && !searchQuery) return null;

          return (
            <div key={stage.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-xl">
              {/* Header de la columna */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-gray-900">{stage.displayName}</h3>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-100 text-sm font-medium text-red-700">
                    {stats.count}
                  </span>
                </div>

                {/* Valor perdido */}
                {stats.totalValue > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Valor perdido</span>
                    <span className="font-medium text-gray-500 line-through">
                      {formatCurrency(stats.totalValue)}
                    </span>
                  </div>
                )}
              </div>

              {/* Lista de leads */}
              <div className="p-3 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
                {stats.leads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {searchQuery ? 'Sin resultados' : 'Sin pérdidas en esta etapa'}
                  </div>
                ) : (
                  stats.leads.map((lead) => (
                    <LostLeadCard
                      key={lead.id}
                      lead={lead}
                      alerts={alertsMap[lead.id] as AlertType[] | undefined}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {totalLostLeads === 0 && (
          <div className="flex-1 text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium text-gray-700">Sin oportunidades perdidas</p>
            <p className="text-sm text-gray-400 mt-1">Las oportunidades perdidas aparecerán aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}
