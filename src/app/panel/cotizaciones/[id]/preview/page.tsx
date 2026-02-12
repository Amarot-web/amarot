'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuotationDocument, { type QuotationDocumentData } from '../../components/QuotationDocument';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PreviewCotizacionPage({ params }: PageProps) {
  const router = useRouter();
  const [data, setData] = useState<QuotationDocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/cotizaciones/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar la cotización');
        const quotation = await res.json();

        const items = (quotation.quotation_items || [])
          .sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)
          .map((item: { description: string; quantity: number; unit: string; unit_price: number; total_price: number }) => ({
            description: item.description,
            quantity: item.quantity || 1,
            unit: item.unit || 'und',
            unitPrice: item.unit_price || 0,
            subtotal: item.total_price || 0,
          }));

        const conditions = (quotation.conditions || []).map((c: { title: string; content: string }) => ({
          title: c.title,
          content: c.content,
        }));

        setData({
          code: quotation.code,
          date: quotation.created_at,
          clientName: quotation.clients?.company_name || '',
          clientContact: quotation.clients?.contact_name || undefined,
          clientAddress: quotation.clients?.address || undefined,
          clientRuc: quotation.clients?.ruc || undefined,
          contactPhone: quotation.clients?.contact_phone || undefined,
          items,
          subtotal: Number(quotation.subtotal) || 0,
          igv: Number(quotation.igv) || 0,
          total: Number(quotation.total) || 0,
          includeIgv: Number(quotation.igv) > 0,
          currency: quotation.currency || 'PEN',
          validityDays: quotation.validity_days || 15,
          paymentTerms: quotation.payment_terms || 'Contado',
          deliveryTime: quotation.delivery_time || undefined,
          notes: quotation.notes || undefined,
          conditions,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Cargando vista previa...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-600">{error || 'No se encontró la cotización'}</p>
        <button onClick={() => router.back()} className="text-sm text-[#1E3A8A] hover:underline">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-sm font-bold text-gray-900">Vista previa — {data.code}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 py-8 print:py-0">
        <QuotationDocument data={data} className="shadow-lg mx-auto print:shadow-none" />
      </div>
    </div>
  );
}
