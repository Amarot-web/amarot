import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/calculations';

// Colores de estado
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
  draft: 'Borrador',
  sent: 'Enviada',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener cotización con cliente
  const { data: quotation, error } = await supabase
    .from('quotations')
    .select(`
      *,
      clients (
        id,
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        ruc,
        address
      )
    `)
    .eq('id', id)
    .single();

  if (error || !quotation) {
    notFound();
  }

  // Obtener items
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', id)
    .order('sequence');

  // Obtener costos
  const { data: laborCosts } = await supabase
    .from('labor_costs')
    .select('*')
    .eq('quotation_id', id);

  const { data: logisticsCosts } = await supabase
    .from('logistics_costs')
    .select('*')
    .eq('quotation_id', id);

  const { data: materialCosts } = await supabase
    .from('material_costs')
    .select('*')
    .eq('quotation_id', id);

  const { data: equipmentCosts } = await supabase
    .from('equipment_costs')
    .select('*')
    .eq('quotation_id', id);

  const currency = quotation.currency as 'PEN' | 'USD';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/panel/cotizador"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{quotation.code}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[quotation.status as keyof typeof statusColors]}`}>
              {statusLabels[quotation.status as keyof typeof statusLabels]}
            </span>
          </div>
          <p className="text-gray-500">
            Creada el {new Date(quotation.created_at).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/cotizador/${id}/pdf`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#DC2626] text-[#DC2626] rounded-lg hover:bg-[#DC2626]/5 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </Link>
          {quotation.status === 'draft' && (
            <Link
              href={`/cotizador/${id}/editar`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
            {quotation.clients ? (
              <div className="space-y-2">
                <p className="text-xl font-medium">{quotation.clients.company_name}</p>
                <p className="text-gray-600">{quotation.clients.contact_name}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {quotation.clients.contact_phone && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {quotation.clients.contact_phone}
                    </span>
                  )}
                  {quotation.clients.contact_email && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {quotation.clients.contact_email}
                    </span>
                  )}
                  {quotation.clients.ruc && (
                    <span>RUC: {quotation.clients.ruc}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Sin cliente asignado</p>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Servicios ({items?.length || 0})
              </h2>
            </div>
            {items && items.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">P. Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.description}</div>
                        {item.diameter && (
                          <div className="text-xs text-gray-500">
                            Ø{item.diameter}" {item.depth && `• ${item.depth}cm`} {item.working_height && item.working_height > 2 && `• ${item.working_height}m altura`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm">{formatCurrency(item.unit_price, currency)}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">{formatCurrency(item.total_price, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No hay servicios en esta cotización
              </div>
            )}
          </div>

          {/* Costos operativos */}
          {(laborCosts?.length || logisticsCosts?.length || materialCosts?.length || equipmentCosts?.length) ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Costos Operativos</h2>
              </div>
              <div className="p-6 space-y-4">
                {laborCosts && laborCosts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Personal</h3>
                    {laborCosts.map((cost) => (
                      <div key={cost.id} className="flex justify-between text-sm py-1">
                        <span>{cost.quantity}x {cost.description} × {cost.days_worked} días</span>
                        <span className="font-medium">{formatCurrency(cost.total_cost, currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {logisticsCosts && logisticsCosts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Logística</h3>
                    {logisticsCosts.map((cost) => (
                      <div key={cost.id} className="flex justify-between text-sm py-1">
                        <span>{cost.description} × {cost.quantity}</span>
                        <span className="font-medium">{formatCurrency(cost.total_cost, currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {materialCosts && materialCosts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Materiales</h3>
                    {materialCosts.map((cost) => (
                      <div key={cost.id} className="flex justify-between text-sm py-1">
                        <span>{cost.quantity}x {cost.description}</span>
                        <span className="font-medium">{formatCurrency(cost.total_cost, currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {equipmentCosts && equipmentCosts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Equipos</h3>
                    {equipmentCosts.map((cost) => (
                      <div key={cost.id} className="flex justify-between text-sm py-1">
                        <span>{cost.quantity}x {cost.description} × {cost.days_used} días</span>
                        <span className="font-medium">{formatCurrency(cost.total_cost, currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Notas */}
          {quotation.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Notas</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}
        </div>

        {/* Columna lateral - Resumen financiero */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span>{formatCurrency(quotation.subtotal - quotation.margin_amount, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Margen ({quotation.margin_percentage}%):</span>
                <span className="text-green-600">+{formatCurrency(quotation.margin_amount, currency)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-500">Base imponible:</span>
                <span>{formatCurrency(quotation.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IGV (18%):</span>
                <span>{formatCurrency(quotation.igv, currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 pt-3">
                <span>TOTAL:</span>
                <span className="text-[#DC2626]">{formatCurrency(quotation.total, currency)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo:</span>
                <span className="capitalize">{quotation.type === 'small' ? 'Pequeño' : 'Grande'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duración:</span>
                <span>{quotation.duration_days} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Moneda:</span>
                <span>{quotation.currency === 'PEN' ? 'Soles (S/)' : 'Dólares ($)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Validez:</span>
                <span>{quotation.validity_days} días</span>
              </div>
              {quotation.validity_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vence:</span>
                  <span>{new Date(quotation.validity_date).toLocaleDateString('es-PE')}</span>
                </div>
              )}
              {quotation.payment_terms && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pago:</span>
                  <span className="text-right max-w-[150px]">{quotation.payment_terms}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones de estado */}
          {quotation.status === 'draft' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-3">
                Esta cotización está en borrador. Puedes editarla o enviarla al cliente.
              </p>
              <button className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-medium py-2 px-4 rounded-lg">
                Marcar como Enviada
              </button>
            </div>
          )}

          {quotation.status === 'sent' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                Cotización enviada. ¿El cliente aceptó?
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                  Aprobar
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
