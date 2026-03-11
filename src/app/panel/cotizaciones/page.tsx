import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/calculations';
import { Suspense } from 'react';
import QuotationListActions from './QuotationListActions';
import QuotationSearch from './QuotationSearch';

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
};

interface QuotationWithClient {
  id: string;
  code: string;
  status: string;
  total: number;
  currency: 'PEN' | 'USD';
  validity_days: number;
  created_at: string;
  clients: {
    company_name: string | null;
    contact_name: string | null;
    contact_email: string | null;
  } | null;
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function CotizacionesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q || '';
  const statusFilter = params.status || '';

  const supabase = await createClient();

  let query = supabase
    .from('quotations')
    .select(`
      id,
      code,
      status,
      total,
      currency,
      validity_days,
      created_at,
      clients (
        company_name,
        contact_name,
        contact_email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // Apply status filter
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  const quotations = data as QuotationWithClient[] | null;

  // Filter by search (client-side for simplicity)
  const filteredQuotations = quotations?.filter((q) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      q.code?.toLowerCase().includes(searchLower) ||
      q.clients?.company_name?.toLowerCase().includes(searchLower) ||
      q.clients?.contact_name?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const stats = {
    total: quotations?.length || 0,
    draft: quotations?.filter((q) => q.status === 'draft').length || 0,
    sent: quotations?.filter((q) => q.status === 'sent').length || 0,
    approved: quotations?.filter((q) => q.status === 'approved').length || 0,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sistema simplificado de cotizaciones
          </p>
        </div>
        <Link
          href="/panel/cotizaciones/nueva"
          className="inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cotización
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Borradores" value={stats.draft} color="text-gray-600" />
        <StatCard label="Enviadas" value={stats.sent} color="text-blue-600" />
        <StatCard label="Aprobadas" value={stats.approved} color="text-green-600" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="p-4">
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
            <QuotationSearch initialSearch={search} initialStatus={statusFilter} />
          </Suspense>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">Error al cargar cotizaciones</p>
            <p className="text-gray-500 text-sm mt-1">{error.message}</p>
          </div>
        ) : !filteredQuotations || filteredQuotations.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredQuotations.map((quotation) => {
                  const status = statusConfig[quotation.status as keyof typeof statusConfig] || statusConfig.draft;
                  return (
                    <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/panel/cotizaciones/${quotation.id}`}
                          className="text-[#1E3A8A] hover:underline font-medium"
                        >
                          {quotation.code}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {quotation.clients?.company_name || 'Sin cliente'}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {quotation.clients?.contact_name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(quotation.total || 0, quotation.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quotation.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <QuotationListActions
                          quotationId={quotation.id}
                          quotationCode={quotation.code}
                          status={quotation.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="p-12 text-center">
      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {search ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
          <p className="text-gray-500">No se encontraron cotizaciones para "{search}"</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones</h3>
          <p className="text-gray-500 mb-6">Crea tu primera cotización para empezar</p>
          <Link
            href="/panel/cotizaciones/nueva"
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cotización
          </Link>
        </>
      )}
    </div>
  );
}
