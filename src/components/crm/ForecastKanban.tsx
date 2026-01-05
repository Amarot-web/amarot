'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Lead, ForecastColumn, AlertType } from '@/lib/crm/types';
import { SERVICE_TYPE_LABELS } from '@/lib/crm/types';
import AlertBadge from './AlertBadge';

interface ForecastKanbanProps {
  columns: ForecastColumn[];
  alertsMap: Record<string, string[]>;
}

// Card simplificado para el forecast (sin drag & drop)
function ForecastLeadCard({ lead, alerts }: { lead: Lead; alerts?: AlertType[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isWon = lead.stage?.isWon || false;

  return (
    <Link
      href={`/panel/crm/leads/${lead.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all relative overflow-hidden"
    >
      {/* Etiqueta GANADO diagonal como en Odoo */}
      {isWon && (
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
          <div className="absolute transform rotate-45 bg-green-500 text-white text-[10px] font-bold py-1 w-32 text-center shadow-sm" style={{ top: '18px', right: '-36px' }}>
            GANADO
          </div>
        </div>
      )}
      {/* Header with code, alerts, stage and service */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-gray-400">{lead.code}</span>
          {alerts && alerts.length > 0 && <AlertBadge alerts={alerts} size="sm" />}
          {lead.stage && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white whitespace-nowrap"
              style={{ backgroundColor: lead.stage.color || '#6B7280' }}
            >
              {lead.stage.displayName}
            </span>
          )}
        </div>
      </div>

      {/* Service type */}
      <div className="mb-2">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          {SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType}
        </span>
      </div>

      {/* Company name */}
      <p className="font-semibold text-gray-900 mb-1 line-clamp-2">
        {lead.company}
      </p>

      {/* Contact name */}
      <p className="text-sm text-gray-600 mb-3">{lead.contactName}</p>

      {/* Expected revenue and probability */}
      {lead.expectedRevenue > 0 && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm font-medium text-green-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatCurrency(lead.expectedRevenue)}
          </div>
          <span className="text-xs text-gray-500">{lead.probability}%</span>
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

export default function ForecastKanban({ columns, alertsMap }: ForecastKanbanProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar leads por búsqueda
  const filterLeads = useCallback((leads: Lead[]): Lead[] => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase().trim();
    return leads.filter(
      (lead) =>
        lead.company.toLowerCase().includes(query) ||
        lead.contactName.toLowerCase().includes(query) ||
        lead.code.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query)
    );
  }, [searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calcular totales filtrados
  const getColumnStats = (column: ForecastColumn) => {
    const filteredLeads = filterLeads(column.leads);
    const wonLeads = filteredLeads.filter((l) => l.stage?.isWon);
    const activeLeads = filteredLeads.filter((l) => !l.stage?.isWon);

    const totalValue = filteredLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);
    const wonValue = wonLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);
    const activeValue = activeLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);

    return {
      leads: filteredLeads,
      count: filteredLeads.length,
      totalValue,
      wonValue,
      activeValue,
      wonPercent: totalValue > 0 ? (wonValue / totalValue) * 100 : 0,
      activePercent: totalValue > 0 ? (activeValue / totalValue) * 100 : 0,
    };
  };

  // Contar resultados de búsqueda
  const totalFiltered = searchQuery.trim()
    ? columns.reduce((sum, col) => sum + filterLeads(col.leads).length, 0)
    : null;

  return (
    <div className="relative">
      {/* Barra de búsqueda */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar empresa, contacto, código..."
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

      {/* Columnas del Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const stats = getColumnStats(column);

          return (
            <div
              key={column.monthKey}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-xl"
            >
              {/* Header de la columna */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{column.monthLabel}</h3>
                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                    {stats.count}
                  </span>
                </div>

                {/* Progress bar con valor total - estilo Odoo */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Valor total</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(stats.totalValue)}
                    </span>
                  </div>
                  {/* Barra de progreso: verde (ganados) + amarillo (activos) */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    {/* Porción ganada (verde) */}
                    {stats.wonPercent > 0 && (
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${stats.wonPercent}%` }}
                      />
                    )}
                    {/* Porción activa (amarillo/naranja) */}
                    {stats.activePercent > 0 && (
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${stats.activePercent}%` }}
                      />
                    )}
                  </div>
                  {/* Leyenda */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {stats.wonValue > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          {formatCurrency(stats.wonValue)}
                        </span>
                      )}
                      {stats.activeValue > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          {formatCurrency(stats.activeValue)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de leads */}
              <div className="p-3 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
                {stats.leads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {searchQuery ? 'Sin resultados' : 'Sin leads'}
                  </div>
                ) : (
                  stats.leads.map((lead) => (
                    <ForecastLeadCard
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

        {columns.length === 0 && (
          <div className="flex-1 text-center py-12 text-gray-500">
            No hay leads activos en el pipeline
          </div>
        )}
      </div>
    </div>
  );
}
