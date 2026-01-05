'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Link from 'next/link';
import type { Lead, LeadStage } from '@/lib/crm/types';
import { SERVICE_TYPE_LABELS } from '@/lib/crm/types';
import { changeLeadStage } from '@/lib/crm/actions';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';
import WinLeadModal from './WinLeadModal';

interface KanbanBoardProps {
  stages: LeadStage[];
  leadsByStage: Record<string, Lead[]>;
  alertsMap: Record<string, string[]>;
}

type ViewMode = 'kanban' | 'list' | 'grouped';
type SortColumn = 'code' | 'company' | 'serviceType' | 'stage' | 'expectedRevenue' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function KanbanBoard({ stages, leadsByStage: initialLeadsByStage, alertsMap }: KanbanBoardProps) {
  const [leadsByStage, setLeadsByStage] = useState(initialLeadsByStage);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  // Estado para etapas expandidas en vista agrupada
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  // Estado para el modal de ganar
  const [pendingWinLead, setPendingWinLead] = useState<Lead | null>(null);
  const [pendingWinSourceStageId, setPendingWinSourceStageId] = useState<string | null>(null);

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findLeadById = useCallback(
    (id: string): Lead | undefined => {
      for (const leads of Object.values(leadsByStage)) {
        const found = leads.find((l) => l.id === id);
        if (found) return found;
      }
      return undefined;
    },
    [leadsByStage]
  );

  const findStageByLeadId = useCallback(
    (leadId: string): string | undefined => {
      for (const [stageId, leads] of Object.entries(leadsByStage)) {
        if (leads.some((l) => l.id === leadId)) {
          return stageId;
        }
      }
      return undefined;
    },
    [leadsByStage]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLeadId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLeadId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Determine target stage
    let targetStageId: string;

    // If dropped on a column
    if (over.data.current?.type === 'column') {
      targetStageId = overId;
    }
    // If dropped on another lead
    else if (over.data.current?.type === 'lead') {
      const overLead = over.data.current.lead as Lead;
      targetStageId = overLead.stageId;
    } else {
      // Fallback: check if overId is a stage
      if (stages.some((s) => s.id === overId)) {
        targetStageId = overId;
      } else {
        return;
      }
    }

    const sourceStageId = findStageByLeadId(activeLeadId);
    if (!sourceStageId || sourceStageId === targetStageId) return;

    const lead = findLeadById(activeLeadId);
    if (!lead) return;

    // Verificar si la etapa destino es "Ganado"
    const targetStage = stages.find((s) => s.id === targetStageId);
    if (targetStage?.isWon) {
      // Mostrar modal de vinculación en lugar de mover directamente
      setPendingWinLead(lead);
      setPendingWinSourceStageId(sourceStageId);
      return;
    }

    // Optimistic update
    setLeadsByStage((prev) => {
      const newState = { ...prev };

      // Remove from source
      newState[sourceStageId] = prev[sourceStageId].filter((l) => l.id !== activeLeadId);

      // Add to target
      const updatedLead = { ...lead, stageId: targetStageId };
      newState[targetStageId] = [...(prev[targetStageId] || []), updatedLead];

      return newState;
    });

    // Call server action
    setIsUpdating(true);
    try {
      const result = await changeLeadStage(activeLeadId, targetStageId);
      if (!result.success) {
        // Revert on error
        setLeadsByStage((prev) => {
          const newState = { ...prev };
          newState[targetStageId] = prev[targetStageId].filter((l) => l.id !== activeLeadId);
          newState[sourceStageId] = [...prev[sourceStageId], lead];
          return newState;
        });
        console.error('Error moving lead:', result.error);
      }
    } catch (error) {
      // Revert on error
      setLeadsByStage((prev) => {
        const newState = { ...prev };
        newState[targetStageId] = prev[targetStageId].filter((l) => l.id !== activeLeadId);
        newState[sourceStageId] = [...prev[sourceStageId], lead];
        return newState;
      });
      console.error('Error moving lead:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar éxito del modal de ganar
  const handleWinSuccess = () => {
    if (pendingWinLead && pendingWinSourceStageId) {
      const wonStage = stages.find((s) => s.isWon);
      if (wonStage) {
        // Mover el lead a la columna ganado
        setLeadsByStage((prev) => {
          const newState = { ...prev };
          newState[pendingWinSourceStageId] = prev[pendingWinSourceStageId].filter(
            (l) => l.id !== pendingWinLead.id
          );
          const updatedLead = { ...pendingWinLead, stageId: wonStage.id };
          newState[wonStage.id] = [...(prev[wonStage.id] || []), updatedLead];
          return newState;
        });
      }
    }
    setPendingWinLead(null);
    setPendingWinSourceStageId(null);
  };

  // Manejar cancelación del modal
  const handleWinCancel = () => {
    setPendingWinLead(null);
    setPendingWinSourceStageId(null);
  };

  const activeLead = activeLeadId ? findLeadById(activeLeadId) : null;

  // Contar resultados de búsqueda
  const totalFiltered = searchQuery.trim()
    ? stages.reduce((sum, stage) => sum + filterLeads(leadsByStage[stage.id] || []).length, 0)
    : null;

  // Obtener todos los leads filtrados y ordenados para la vista lista
  const getAllFilteredLeads = useCallback((): Lead[] => {
    const allLeads: Lead[] = [];
    for (const stage of stages) {
      const stageLeads = filterLeads(leadsByStage[stage.id] || []);
      for (const lead of stageLeads) {
        allLeads.push({ ...lead, stage });
      }
    }

    // Ordenar según columna y dirección
    return allLeads.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'serviceType':
          comparison = a.serviceType.localeCompare(b.serviceType);
          break;
        case 'stage':
          comparison = (a.stage?.position || 0) - (b.stage?.position || 0);
          break;
        case 'expectedRevenue':
          comparison = a.expectedRevenue - b.expectedRevenue;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [stages, leadsByStage, filterLeads, sortColumn, sortDirection]);

  // Manejar click en columna para ordenar
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Toggle de etapa expandida en vista agrupada
  const toggleStageExpanded = (stageId: string) => {
    setExpandedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  // Icono de ordenamiento
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="relative">
      {/* Barra de búsqueda y toggle de vistas */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {totalFiltered !== null && (
            <span className="text-sm text-gray-500">
              {totalFiltered} {totalFiltered === 1 ? 'resultado' : 'resultados'}
            </span>
          )}

          {/* Toggle de vistas */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#DC2626] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista Kanban"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#DC2626] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista Lista"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grouped'
                  ? 'bg-white text-[#DC2626] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista Agrupada"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Updating indicator */}
      {isUpdating && (
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-center">
          <div className="bg-blue-500 text-white text-sm px-4 py-1 rounded-b-lg shadow-lg">
            Actualizando...
          </div>
        </div>
      )}

      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages
              .filter((stage) => !stage.isLost) // Excluir etapa "Perdido"
              .map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  leads={filterLeads(leadsByStage[stage.id] || [])}
                  alertsMap={alertsMap}
                />
              ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <div className="rotate-3 scale-105">
                <LeadCard lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {viewMode === 'list' && (
        /* Vista Lista */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Tabla para desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('code')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      Código
                      <SortIcon column="code" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('company')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      Empresa / Contacto
                      <SortIcon column="company" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('serviceType')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      Servicio
                      <SortIcon column="serviceType" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('stage')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      Etapa
                      <SortIcon column="stage" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('expectedRevenue')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Valor
                      <SortIcon column="expectedRevenue" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      Fecha
                      <SortIcon column="createdAt" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getAllFilteredLeads().map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/panel/crm/leads/${lead.id}`}
                        className="text-sm font-medium text-[#DC2626] hover:underline"
                      >
                        {lead.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{lead.company}</div>
                      <div className="text-sm text-gray-500">{lead.contactName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: lead.stage?.color || '#6B7280' }}
                      >
                        {lead.stage?.displayName || 'Sin etapa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(lead.expectedRevenue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
                {getAllFilteredLeads().length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery ? 'No se encontraron resultados' : 'No hay leads'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards para mobile */}
          <div className="md:hidden divide-y divide-gray-200">
            {getAllFilteredLeads().map((lead) => (
              <Link
                key={lead.id}
                href={`/panel/crm/leads/${lead.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#DC2626]">{lead.code}</span>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: lead.stage?.color || '#6B7280' }}
                      >
                        {lead.stage?.displayName}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">{lead.company}</div>
                    <div className="text-sm text-gray-500">{lead.contactName}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(lead.expectedRevenue)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(lead.createdAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
            {getAllFilteredLeads().length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {searchQuery ? 'No se encontraron resultados' : 'No hay leads'}
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'grouped' && (
        /* Vista Agrupada por Etapa (Acordeón) */
        <div className="bg-white rounded-xl shadow overflow-hidden divide-y divide-gray-200">
          {stages
            .filter((stage) => !stage.isLost) // Excluir etapa "Perdido"
            .map((stage) => {
              const stageLeads = filterLeads(leadsByStage[stage.id] || []);
            const isExpanded = expandedStages.has(stage.id);
            const totalValue = stageLeads.reduce((sum, lead) => sum + lead.expectedRevenue, 0);

            return (
              <div key={stage.id}>
                {/* Header del acordeón */}
                <button
                  onClick={() => toggleStageExpanded(stage.id)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Indicador de color */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    {/* Nombre de etapa */}
                    <span className="font-medium text-gray-900">
                      {stage.displayName}
                    </span>
                    {/* Badge con conteo */}
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                      {stageLeads.length}
                    </span>
                    {/* Valor total de la etapa */}
                    {totalValue > 0 && (
                      <span className="text-sm text-gray-500">
                        ({formatCurrency(totalValue)})
                      </span>
                    )}
                  </div>
                  {/* Icono expandir/colapsar */}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Contenido expandible */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    {stageLeads.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay leads en esta etapa
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {stageLeads.map((lead) => (
                          <Link
                            key={lead.id}
                            href={`/panel/crm/leads/${lead.id}`}
                            className="block px-4 py-3 hover:bg-white transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-medium text-[#DC2626]">
                                    {lead.code}
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    {SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {lead.company}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {lead.contactName}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(lead.expectedRevenue)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {formatDate(lead.createdAt)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mensaje cuando no hay resultados */}
          {stages.every((stage) => filterLeads(leadsByStage[stage.id] || []).length === 0) && (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'No se encontraron resultados' : 'No hay leads'}
            </div>
          )}
        </div>
      )}

      {/* Modal de vinculación al ganar */}
      {pendingWinLead && (
        <WinLeadModal
          lead={pendingWinLead}
          onSuccess={handleWinSuccess}
          onCancel={handleWinCancel}
        />
      )}
    </div>
  );
}
