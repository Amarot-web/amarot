import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuotationBuilder from '../components/QuotationBuilder';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Client {
  id: string;
  name: string;
  ruc?: string;
}

export default async function EditCotizacionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get quotation with client and items
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
        address,
        ruc
      ),
      quotation_items (
        id,
        sequence,
        description,
        quantity,
        unit,
        unit_price,
        total_price
      )
    `)
    .eq('id', id)
    .single();

  if (error || !quotation) {
    notFound();
  }

  // Get existing clients for autocomplete
  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, company_name, ruc')
    .order('company_name', { ascending: true })
    .limit(100);

  // Transform clients to the format expected by QuotationBuilder
  const clients: Client[] = (clientsData || []).map(c => ({
    id: c.id,
    name: c.company_name,
    ruc: c.ruc || undefined,
  }));

  // Transform data for the builder
  const initialData = {
    clientName: quotation.clients?.company_name || '',
    clientRuc: quotation.clients?.ruc || '',
    items: (quotation.quotation_items || [])
      .sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)
      .map((item: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        unit_price: number;
        total_price: number;
      }) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity || 1,
        unit: item.unit || 'und',
        unitPrice: item.unit_price || 0,
        subtotal: item.total_price || 0,
      })),
    includeIgv: quotation.igv > 0,
    currency: (quotation.currency as 'PEN' | 'USD') || 'PEN',
    validityDays: quotation.validity_days || 15,
    paymentTerms: quotation.payment_terms || 'Contado',
    notes: quotation.notes || '',
    conditions: quotation.conditions || [],
    // Totales (para el viewer)
    subtotal: Number(quotation.subtotal) || 0,
    igv: Number(quotation.igv) || 0,
    total: Number(quotation.total) || 0,
  };

  // Check if quotation is editable
  const isEditable = quotation.status === 'draft';

  if (!isEditable) {
    return <QuotationViewer quotation={quotation} initialData={initialData} />;
  }

  return (
    <QuotationBuilder
      mode="edit"
      initialCode={quotation.code}
      quotationId={id}
      existingClients={clients}
      initialData={initialData}
    />
  );
}

// Viewer para cotizaciones no editables (enviadas, aprobadas, rechazadas)
function QuotationViewer({ quotation, initialData }: { quotation: any; initialData: any }) {
  const currencySymbol = initialData.currency === 'PEN' ? 'S/' : '$';
  const fmt = (n: number) => `${currencySymbol} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
    sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  };

  const status = statusConfig[quotation.status as keyof typeof statusConfig] || statusConfig.draft;
  const conditions: { id?: string; title: string; content: string }[] = initialData.conditions || [];

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <a href="/panel/cotizaciones" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900 font-mono">{quotation.code}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-10">
              Creada el {new Date(quotation.created_at).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
              {quotation.sent_at && (
                <span> · Enviada el {new Date(quotation.sent_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`/panel/cotizaciones/${quotation.id}/preview`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Vista previa
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Client Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Cliente</h2>
          <p className="text-sm font-semibold text-gray-900">{initialData.clientName || '—'}</p>
          {initialData.clientRuc && <p className="text-xs text-gray-500 font-mono mt-1">RUC: {initialData.clientRuc}</p>}
        </div>

        {/* Config */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Configuración</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Moneda: <span className="font-medium text-gray-900">{initialData.currency}</span></p>
            <p>Validez: <span className="font-medium text-gray-900">{initialData.validityDays} días</span></p>
            <p>Pago: <span className="font-medium text-gray-900">{initialData.paymentTerms}</span></p>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Total</h2>
          <p className="text-2xl font-bold text-[#DC2626] font-mono">{fmt(initialData.total)}</p>
          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
            <p>Subtotal: {fmt(initialData.subtotal)}</p>
            {initialData.includeIgv && <p>IGV (18%): {fmt(initialData.igv)}</p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            Items ({initialData.items.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-600">#</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-600">Descripción</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-600 w-16">Cant.</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-600 w-14">Und.</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-600 w-24">P. Unit.</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-600 w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialData.items.map((item: any, idx: number) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-5 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 text-center font-mono">{item.quantity}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 text-center">{item.unit}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 text-right font-mono">{fmt(item.unitPrice)}</td>
                  <td className="px-5 py-3 text-sm text-gray-900 font-semibold text-right font-mono">{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={5} className="px-5 py-3 text-sm text-gray-600 text-right">Subtotal</td>
                <td className="px-5 py-3 text-sm text-gray-900 font-mono text-right">{fmt(initialData.subtotal)}</td>
              </tr>
              {initialData.includeIgv && (
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-5 py-2 text-sm text-gray-600 text-right">IGV (18%)</td>
                  <td className="px-5 py-2 text-sm text-gray-900 font-mono text-right">{fmt(initialData.igv)}</td>
                </tr>
              )}
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={5} className="px-5 py-3 text-base font-bold text-gray-900 text-right">Total</td>
                <td className="px-5 py-3 text-base font-bold text-[#DC2626] font-mono text-right">{fmt(initialData.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Conditions */}
      {conditions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              Condiciones del servicio ({conditions.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {conditions.map((condition, idx) => (
              <div key={condition.id || idx} className="px-5 py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{condition.title}</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{condition.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {initialData.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Notas</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">{initialData.notes}</p>
        </div>
      )}
    </div>
  );
}
