import Link from 'next/link';
import { getLeadStages, getLeadsByStage, getPipelineSummary, getLeadAlertsMap } from '@/lib/crm/queries';
import KanbanBoard from '@/components/crm/KanbanBoard';

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
  // Fetch data in parallel
  const [stages, leadsByStageMap, summary, alertsMap] = await Promise.all([
    getLeadStages(),
    getLeadsByStage(),
    getPipelineSummary(),
    getLeadAlertsMap(),
  ]);

  // Convert Map to Record for client component
  const leadsByStage: Record<string, typeof leadsByStageMap extends Map<string, infer V> ? V : never> = {};
  leadsByStageMap.forEach((leads, stageId) => {
    leadsByStage[stageId] = leads;
  });

  // Ensure all stages have an entry
  stages.forEach((stage) => {
    if (!leadsByStage[stage.id]) {
      leadsByStage[stage.id] = [];
    }
  });

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
          Nuevo Lead
        </Link>
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

      {/* Kanban Board */}
      <KanbanBoard stages={stages} leadsByStage={leadsByStage} alertsMap={alertsMap} />
    </div>
  );
}
