import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/calculations';

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusLabels = {
  draft: 'Borrador',
  sent: 'Enviada',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default async function ClienteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener cliente
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !client) {
    notFound();
  }

  // Obtener cotizaciones del cliente
  const { data: quotations } = await supabase
    .from('quotations')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  const totalQuotations = quotations?.length || 0;
  const approvedQuotations = quotations?.filter((q) => q.status === 'approved') || [];
  const totalApproved = approvedQuotations.reduce((sum, q) => sum + Number(q.total), 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/panel/clientes"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{client.company_name}</h1>
          </div>
          <p className="text-gray-500">
            Cliente desde {new Date(client.created_at).toLocaleDateString('es-PE', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/cotizador/nueva`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cotización
          </Link>
          <Link
            href={`/clientes/${id}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del cliente */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Contacto</p>
                <p className="font-medium">{client.contact_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{client.contact_phone}</p>
              </div>
              {client.contact_email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{client.contact_email}</p>
                </div>
              )}
              {client.ruc && (
                <div>
                  <p className="text-sm text-gray-500">RUC</p>
                  <p className="font-medium">{client.ruc}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium">{client.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Cotizaciones</span>
                <span className="font-bold">{totalQuotations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Aprobadas</span>
                <span className="font-bold text-green-600">{approvedQuotations.length}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-500">Total Facturado</span>
                <span className="font-bold text-[#1E3A8A]">{formatCurrency(totalApproved, 'PEN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cotizaciones */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Cotizaciones ({totalQuotations})
              </h2>
            </div>
            {!quotations || quotations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay cotizaciones para este cliente
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/cotizador/${quotation.id}`}
                          className="text-[#1E3A8A] hover:underline font-medium"
                        >
                          {quotation.code}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[quotation.status as keyof typeof statusColors]}`}>
                          {statusLabels[quotation.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatCurrency(quotation.total, quotation.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(quotation.created_at).toLocaleDateString('es-PE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
