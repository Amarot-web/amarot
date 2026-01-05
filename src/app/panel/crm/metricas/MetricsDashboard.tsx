'use client';

import { MetricCard, PipelineChart, SourceChart, TrendChart } from '@/components/crm/charts';
import type { CRMMetrics, LeadsByPeriod, LeadsBySource, PipelineStageSummary } from '@/lib/crm/types';

interface MetricsDashboardProps {
  metrics: CRMMetrics;
  trendData: LeadsByPeriod[];
  sourceData: LeadsBySource[];
  pipelineData: PipelineStageSummary[];
}

export default function MetricsDashboard({
  metrics,
  trendData,
  sourceData,
  pipelineData,
}: MetricsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Leads Nuevos"
          value={metrics.totalLeads}
          change={metrics.leadsChange}
          changeLabel="vs anterior"
          color="blue"
          tooltip="Cantidad de leads creados en el período seleccionado"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Tasa Conversión"
          value={metrics.conversionRate}
          change={metrics.conversionChange}
          changeLabel="pts"
          color="green"
          format="percent"
          tooltip="Leads ganados ÷ Total leads × 100"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Ticket Promedio"
          value={metrics.avgTicket}
          change={metrics.ticketChange}
          changeLabel="vs anterior"
          color="purple"
          format="currency"
          tooltip="Suma de ingresos ganados ÷ Número de ventas cerradas"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Ciclo de Venta"
          value={metrics.avgSalesCycle}
          change={metrics.cycleChange}
          changeLabel="días"
          color="yellow"
          format="days"
          tooltip="Promedio de días desde creación del lead hasta cierre ganado"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Valor Pipeline"
          value={metrics.pipelineValue}
          color="red"
          format="currency"
          tooltip="Σ (Valor lead × Probabilidad de etapa)"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <MetricCard
          title="Pronóstico 30d"
          value={metrics.salesForecast}
          color="blue"
          format="currency"
          tooltip="Valor esperado de leads con fecha límite en los próximos 30 días × probabilidad"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{metrics.wonLeads}</p>
          <p className="text-sm text-green-700">Ganados</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{metrics.lostLeads}</p>
          <p className="text-sm text-red-700">Perdidos</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{metrics.activeLeads}</p>
          <p className="text-sm text-blue-700">En Pipeline</p>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline por etapa */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pipeline por Etapa
          </h3>
          <PipelineChart data={pipelineData} showValue={true} />
        </div>

        {/* Leads por fuente */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leads por Fuente
          </h3>
          <SourceChart data={sourceData} />
        </div>
      </div>

      {/* Gráfico de tendencia */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tendencia de Leads
        </h3>
        <TrendChart data={trendData} showRevenue={false} />
      </div>

      {/* Tabla de fuentes con detalle */}
      {sourceData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Rendimiento por Fuente
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuente
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganados
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversión
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sourceData.map((source) => (
                <tr key={source.source} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.sourceLabel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                    {source.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                    {source.wonCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        source.conversionRate >= 10
                          ? 'bg-green-100 text-green-800'
                          : source.conversionRate >= 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {source.conversionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    S/.{source.value.toLocaleString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
