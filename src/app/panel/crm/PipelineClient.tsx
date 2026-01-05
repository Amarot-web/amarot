'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lead, LeadStage, PipelineStageSummary, ForecastColumn } from '@/lib/crm/types';
import KanbanBoard from '@/components/crm/KanbanBoard';
import ForecastKanban from '@/components/crm/ForecastKanban';

type ViewMode = 'stage' | 'forecast';

interface PipelineClientProps {
  stages: LeadStage[];
  leadsByStage: Record<string, Lead[]>;
  summary: PipelineStageSummary[];
  alertsMap: Record<string, string[]>;
  forecastColumns: ForecastColumn[];
}

export default function PipelineClient({
  stages,
  leadsByStage,
  summary,
  alertsMap,
  forecastColumns,
}: PipelineClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('stage');

  // Calculate totals
  const totalLeads = summary
    .filter((s) => !s.isWon && !s.isLost)
    .reduce((sum, s) => sum + s.leadCount, 0);
  const totalRevenue = summary
    .filter((s) => !s.isWon && !s.isLost)
    .reduce((sum, s) => sum + s.totalRevenue, 0);
  const weightedRevenue = summary
    .filter((s) => !s.isWon && !s.isLost)
    .reduce((sum, s) => sum + s.weightedRevenue, 0);
  const wonRevenue = summary
    .filter((s) => s.isWon)
    .reduce((sum, s) => sum + s.totalRevenue, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Ventas</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus oportunidades de negocio
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle de vistas */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('stage')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'stage'
                  ? 'bg-white text-[#DC2626] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Pipeline por Etapa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span className="hidden sm:inline">Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('forecast')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'forecast'
                  ? 'bg-white text-[#DC2626] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Forecast por Mes de Cierre (incluye ganados)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Forecast</span>
            </button>
          </div>

          {/* Nuevo Lead button */}
          <Link
            href="/panel/crm/nuevo"
            className="inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Nuevo Lead</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Leads Activos</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{totalLeads}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Valor Total</div>
          <div className="mt-1 text-2xl font-bold text-[#1E3A8A]">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Valor Ponderado</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(weightedRevenue)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Ganados (Mes)</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {formatCurrency(wonRevenue)}
          </div>
        </div>
      </div>

      {/* View content */}
      {viewMode === 'stage' ? (
        <KanbanBoard stages={stages} leadsByStage={leadsByStage} alertsMap={alertsMap} />
      ) : (
        <ForecastKanban columns={forecastColumns} alertsMap={alertsMap} />
      )}
    </div>
  );
}
