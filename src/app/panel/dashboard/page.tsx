import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Iconos
const icons = {
  quotation: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  client: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  money: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  approved: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  blog: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  href?: string;
}

function KPICard({ title, value, subtitle, icon, color, href }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

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
      className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#DC2626]/30 transition-all group"
    >
      <div className="p-3 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Obtener fecha de inicio del mes actual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Obtener estadísticas de cotizaciones
  const { count: totalQuotations } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true });

  const { count: quotationsThisMonth } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth);

  const { count: pendingQuotations } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .in('status', ['draft', 'sent']);

  const { count: approvedQuotations } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // Calcular valor total de cotizaciones aprobadas
  const { data: approvedTotals } = await supabase
    .from('quotations')
    .select('total')
    .eq('status', 'approved');

  const totalApprovedValue = approvedTotals?.reduce((sum, q) => sum + (q.total || 0), 0) || 0;

  // Obtener estadísticas de clientes
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  const { count: newClientsThisMonth } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth);

  // Obtener cotizaciones recientes
  const { data: recentQuotations } = await supabase
    .from('quotations')
    .select(`
      id,
      code,
      total,
      status,
      created_at,
      clients (company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  };

  const statusLabels: Record<string, { label: string; class: string }> = {
    draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-700' },
    sent: { label: 'Enviada', class: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Aprobada', class: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rechazada', class: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Resumen de actividad de AMAROT
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Cotizaciones del Mes"
          value={quotationsThisMonth || 0}
          subtitle={`${totalQuotations || 0} en total`}
          icon={icons.quotation}
          color="blue"
          href="/panel/cotizador"
        />
        <KPICard
          title="Pendientes"
          value={pendingQuotations || 0}
          subtitle="Borradores y enviadas"
          icon={icons.pending}
          color="yellow"
          href="/panel/cotizador"
        />
        <KPICard
          title="Aprobadas"
          value={approvedQuotations || 0}
          subtitle={formatCurrency(totalApprovedValue)}
          icon={icons.approved}
          color="green"
        />
        <KPICard
          title="Clientes"
          value={totalClients || 0}
          subtitle={`+${newClientsThisMonth || 0} este mes`}
          icon={icons.client}
          color="purple"
          href="/panel/clientes"
        />
      </div>

      {/* Cotizaciones Recientes y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cotizaciones Recientes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Cotizaciones Recientes
              </h2>
              <Link
                href="/panel/cotizador"
                className="text-sm text-[#DC2626] hover:underline font-medium"
              >
                Ver todas
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentQuotations?.length ? (
              recentQuotations.map((quotation) => (
                <Link
                  key={quotation.id}
                  href={`/panel/cotizador/${quotation.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {quotation.code}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {(quotation.clients as unknown as { company_name: string } | null)?.company_name || 'Sin cliente'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusLabels[quotation.status]?.class || 'bg-gray-100'}`}>
                      {statusLabels[quotation.status]?.label || quotation.status}
                    </span>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(quotation.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(quotation.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No hay cotizaciones recientes
              </div>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <QuickAction
              title="Nueva Cotización"
              description="Crear cotización rápida"
              href="/panel/cotizador/nueva"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            />
            <QuickAction
              title="Nuevo Cliente"
              description="Registrar nuevo cliente"
              href="/panel/clientes/nuevo"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            />
            <QuickAction
              title="Ver Clientes"
              description="Gestionar cartera"
              href="/panel/clientes"
              icon={icons.client}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
