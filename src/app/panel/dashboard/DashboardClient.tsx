'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { CRMMetrics, PipelineStageSummary, LeadsByPeriod } from '@/lib/crm/types';

// =============================================
// TYPES
// =============================================

interface AlertLead {
  id: string;
  code: string;
  company: string;
  contactName: string;
  serviceType: string;
  stageName: string;
  assignedToName: string | null;
  alerts: string[];
  createdAt: Date;
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'client' | 'message';
  title: string;
  subtitle: string;
  date: Date;
  href: string;
  status?: string;
}

interface DashboardClientProps {
  metrics: CRMMetrics;
  pipeline: PipelineStageSummary[];
  trendData: LeadsByPeriod[];
  alertLeads: AlertLead[];
  recentActivity: RecentActivity[];
  messageStats: {
    total: number;
    new: number;
  };
  clientStats: {
    total: number;
    newThisMonth: number;
  };
  blogStats: {
    total: number;
    published: number;
  };
}

// =============================================
// METRIC CARD (Versión sobria)
// =============================================

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  href?: string;
  delay?: number;
}

function MetricCard({ label, value, change, changeLabel, icon, href, delay = 0 }: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const content = (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 transition-all duration-500 hover:shadow-md hover:border-gray-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {/* Always reserve space for change indicator */}
          <div className="mt-2 h-5 flex items-center gap-1">
            {change !== undefined && change !== 0 && (
              <>
                {change > 0 ? (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                <span className={`text-sm font-medium ${change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}{change}%
                  {changeLabel && <span className="text-gray-400 ml-1">{changeLabel}</span>}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

// =============================================
// PIPELINE CHART
// =============================================

function PipelineChart({ data }: { data: PipelineStageSummary[] }) {
  const activeStages = data.filter(s => !s.isWon && !s.isLost);
  const maxValue = Math.max(...activeStages.map(s => s.totalRevenue), 1);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `S/.${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `S/.${(value / 1000).toFixed(0)}k`;
    return `S/.${value}`;
  };

  return (
    <div className="space-y-3">
      {activeStages.map((stage, idx) => {
        const percentage = (stage.totalRevenue / maxValue) * 100;
        return (
          <div key={stage.stageId} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-sm font-medium text-gray-700">{stage.displayName}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {stage.leadCount}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(stage.totalRevenue)}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: stage.color,
                  transitionDelay: `${idx * 100}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================
// TREND CHART
// =============================================

function TrendChart({ data }: { data: LeadsByPeriod[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="periodLabel"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
            itemStyle={{ color: '#fff', fontSize: '13px' }}
            formatter={(value) => [String(value), 'Leads']}
          />
          <Area
            type="monotone"
            dataKey="newLeads"
            stroke="#DC2626"
            strokeWidth={2}
            fill="url(#colorLeads)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// =============================================
// ALERTS LIST
// =============================================

function AlertsList({ leads }: { leads: AlertLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">No hay alertas pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
      {leads.slice(0, 5).map((lead, idx) => (
        <Link
          key={lead.id}
          href={`/panel/crm/leads/${lead.id}`}
          className="block p-3 rounded-lg border border-gray-200 hover:border-[#DC2626] hover:shadow-sm transition-all bg-white"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{lead.company}</p>
              <p className="text-xs text-gray-500 truncate">{lead.contactName} • {lead.stageName}</p>
            </div>
            <span className="flex-shrink-0 text-xs font-mono text-gray-500">
              {lead.code}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {lead.alerts.map((alert, i) => (
              <span key={i} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {alert}
              </span>
            ))}
          </div>
        </Link>
      ))}
      {leads.length > 5 && (
        <Link
          href="/panel/crm/alertas"
          className="block text-center py-2 text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium"
        >
          Ver {leads.length - 5} más →
        </Link>
      )}
    </div>
  );
}

// =============================================
// ACTIVITY FEED
// =============================================

function ActivityFeed({ activities }: { activities: RecentActivity[] }) {
  const typeIcons = {
    lead: (
      <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    ),
    client: (
      <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    ),
    message: (
      <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    ),
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, idx) => (
        <Link
          key={activity.id}
          href={activity.href}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
          style={{ animationDelay: `${idx * 30}ms` }}
        >
          {typeIcons[activity.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600 transition-colors">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatTimeAgo(activity.date)}
          </span>
        </Link>
      ))}
    </div>
  );
}

// =============================================
// QUICK ACTION (Versión sobria)
// =============================================

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickAction({ title, description, href, icon }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#DC2626] hover:shadow-md transition-all group bg-white"
    >
      <div className="p-3 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 group-hover:text-[#DC2626] transition-colors">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-300 group-hover:text-[#DC2626] group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// =============================================
// MAIN DASHBOARD
// =============================================

export default function DashboardClient({
  metrics,
  pipeline,
  trendData,
  alertLeads,
  recentActivity,
  messageStats,
  clientStats,
  blogStats,
}: DashboardClientProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `S/.${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `S/.${(value / 1000).toFixed(0)}k`;
    return `S/.${value}`;
  };

  // Calculate pipeline total
  const pipelineTotal = pipeline
    .filter(s => !s.isWon && !s.isLost)
    .reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenido al panel de control de AMAROT
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Actualizado hace unos segundos
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Leads en Pipeline"
          value={metrics.activeLeads}
          href="/panel/crm"
          delay={0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Tasa Conversión"
          value={`${metrics.conversionRate}%`}
          change={metrics.conversionChange}
          changeLabel="pts"
          href="/panel/crm/metricas"
          delay={100}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Valor Pipeline"
          value={formatCurrency(pipelineTotal)}
          href="/panel/crm/metricas"
          delay={200}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Clientes"
          value={clientStats.total}
          change={clientStats.newThisMonth > 0 ? Math.round((clientStats.newThisMonth / Math.max(clientStats.total - clientStats.newThisMonth, 1)) * 100) : 0}
          changeLabel="este mes"
          href="/panel/clientes"
          delay={300}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <MetricCard
          label="Mensajes Nuevos"
          value={messageStats.new}
          href="/panel/mensajes"
          delay={400}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            title="Nuevo Lead"
            description="Registrar oportunidad"
            href="/panel/crm/nuevo"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          />
          <QuickAction
            title="Nuevo Cliente"
            description="Registrar empresa"
            href="/panel/clientes/nuevo"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <QuickAction
            title="Ver Mensajes"
            description={`${messageStats.new} sin leer`}
            href="/panel/mensajes"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <QuickAction
            title="Nuevo Artículo"
            description="Escribir para el blog"
            href="/panel/blog/nuevo"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pipeline & Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline by Stage */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pipeline de Ventas</h2>
                <p className="text-sm text-gray-500">Valor por etapa activa</p>
              </div>
              <Link
                href="/panel/crm"
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                Ver Kanban
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <PipelineChart data={pipeline} />
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tendencia de Leads</h2>
                <p className="text-sm text-gray-500">Últimos 30 días</p>
              </div>
              <Link
                href="/panel/crm/metricas"
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                Ver métricas
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <TrendChart data={trendData} />
          </div>
        </div>

        {/* Right Column - Alerts & Activity */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Requieren Atención</h2>
                  <p className="text-xs text-gray-500">{alertLeads.length} leads con alertas</p>
                </div>
              </div>
            </div>
            <AlertsList leads={alertLeads} />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
            </div>
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
