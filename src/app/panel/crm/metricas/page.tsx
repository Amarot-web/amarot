import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import {
  getCRMMetrics,
  getLeadsByPeriod,
  getLeadsBySource,
  getPipelineSummary,
} from '@/lib/crm/queries';
import MetricsDashboard from './MetricsDashboard';

interface PageProps {
  searchParams: Promise<{ periodo?: string }>;
}

export default async function MetricasPage({ searchParams }: PageProps) {
  try {
    await requirePermission('quotations:view');
  } catch {
    redirect('/panel/dashboard');
  }

  const params = await searchParams;
  const periodo = params.periodo || 'month';

  // Calcular fechas según el período
  const now = new Date();
  let dateFrom: Date;
  let dateTo: Date = new Date(now);
  let groupBy: 'day' | 'week' | 'month' = 'day';

  switch (periodo) {
    case 'week':
      dateFrom = new Date(now);
      dateFrom.setDate(dateFrom.getDate() - 7);
      groupBy = 'day';
      break;
    case 'quarter':
      dateFrom = new Date(now);
      dateFrom.setMonth(dateFrom.getMonth() - 3);
      groupBy = 'week';
      break;
    case 'year':
      dateFrom = new Date(now);
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);
      groupBy = 'month';
      break;
    case 'month':
    default:
      dateFrom = new Date(now);
      dateFrom.setMonth(dateFrom.getMonth() - 1);
      groupBy = 'day';
      break;
  }

  // Obtener datos en paralelo
  const [metrics, trendData, sourceData, pipelineData] = await Promise.all([
    getCRMMetrics(dateFrom, dateTo),
    getLeadsByPeriod(groupBy, dateFrom, dateTo),
    getLeadsBySource(dateFrom, dateTo),
    getPipelineSummary(),
  ]);

  const periodoLabels: Record<string, string> = {
    week: 'Última semana',
    month: 'Último mes',
    quarter: 'Último trimestre',
    year: 'Último año',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/panel/crm" className="hover:text-[#DC2626]">
            Pipeline
          </Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Métricas</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Métricas del CRM
            </h1>
            <p className="text-gray-500 mt-1">
              {periodoLabels[periodo] || 'Último mes'}
            </p>
          </div>

          {/* Selector de período */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'week', label: '7D' },
              { value: 'month', label: '30D' },
              { value: 'quarter', label: '3M' },
              { value: 'year', label: '1A' },
            ].map((option) => (
              <Link
                key={option.value}
                href={`/panel/crm/metricas?periodo=${option.value}`}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  periodo === option.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <MetricsDashboard
        metrics={metrics}
        trendData={trendData}
        sourceData={sourceData}
        pipelineData={pipelineData}
      />
    </div>
  );
}
