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

// Simple viewer for non-editable quotations
function QuotationViewer({ quotation, initialData }: { quotation: any; initialData: any }) {
  const currencySymbol = initialData.currency === 'PEN' ? 'S/' : '$';

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
    sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  };

  const status = statusConfig[quotation.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{quotation.code}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              Creada el {new Date(quotation.created_at).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`/panel/cotizaciones/${quotation.id}/pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </a>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Cliente</h2>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-gray-900">{initialData.clientName || '—'}</p>
          {initialData.clientRuc && <p className="text-gray-600">RUC: {initialData.clientRuc}</p>}
          {initialData.clientEmail && <p className="text-gray-600">{initialData.clientEmail}</p>}
          {initialData.clientPhone && <p className="text-gray-600">{initialData.clientPhone}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Items</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-medium text-gray-600">Descripción</th>
              <th className="text-center py-2 text-sm font-medium text-gray-600 w-20">Cant.</th>
              <th className="text-center py-2 text-sm font-medium text-gray-600 w-16">Und.</th>
              <th className="text-right py-2 text-sm font-medium text-gray-600 w-24">P. Unit.</th>
              <th className="text-right py-2 text-sm font-medium text-gray-600 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {initialData.items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-900">{item.description}</td>
                <td className="py-3 text-gray-600 text-center">{item.quantity}</td>
                <td className="py-3 text-gray-600 text-center">{item.unit}</td>
                <td className="py-3 text-gray-600 text-right">{currencySymbol} {item.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-gray-900 font-medium text-right">{currencySymbol} {item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{currencySymbol} {initialData.subtotal.toFixed(2)}</span>
            </div>
            {initialData.includeIgv && (
              <div className="flex justify-between text-gray-600">
                <span>IGV (18%):</span>
                <span>{currencySymbol} {initialData.igv.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-[#DC2626]">{currencySymbol} {initialData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Condiciones</h2>
        <ul className="space-y-2 text-gray-600">
          <li>• Validez: {initialData.validityDays} días</li>
          <li>• Forma de pago: {initialData.paymentTerms}</li>
          {initialData.notes && <li>• {initialData.notes}</li>}
        </ul>
      </div>
    </div>
  );
}
