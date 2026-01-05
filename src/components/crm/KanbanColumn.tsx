'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lead, LeadStage } from '@/lib/crm/types';
import LeadCard from './LeadCard';

interface KanbanColumnProps {
  stage: LeadStage;
  leads: Lead[];
  alertsMap: Record<string, string[]>;
}

export default function KanbanColumn({ stage, leads, alertsMap }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'column',
      stage,
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.expectedRevenue || 0), 0);
  const weightedRevenue = leads.reduce(
    (sum, lead) => sum + (lead.expectedRevenue || 0) * (stage.probability / 100),
    0
  );

  // Estilos especiales para columnas Ganado/Perdido
  const columnBgClass = stage.isWon
    ? 'bg-green-50'
    : stage.isLost
      ? 'bg-red-50'
      : 'bg-gray-50';

  return (
    <div
      className={`
        flex-shrink-0 w-80 ${columnBgClass} rounded-xl flex flex-col
        ${isOver ? 'ring-2 ring-[#DC2626] ring-opacity-50' : ''}
      `}
    >
      {/* Column Header */}
      <div
        className="p-4 border-b border-gray-200"
        style={{ borderTopColor: stage.color, borderTopWidth: '4px', borderTopStyle: 'solid' }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{stage.displayName}</h3>
          <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>

        {/* Revenue summary */}
        <div className="text-xs text-gray-500 space-y-0.5">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-medium">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ponderado ({stage.probability}%):</span>
            <span className="font-medium text-green-600">{formatCurrency(weightedRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-320px)]"
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <svg
                className="w-8 h-8 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Sin leads
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                alerts={alertsMap[lead.id] as import('@/lib/crm/types').AlertType[] | undefined}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
