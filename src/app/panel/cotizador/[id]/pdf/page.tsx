'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { QuotationPDFData } from '@/components/pdf/QuotationPDF';

// Dynamic import de los componentes que usan react-pdf
const PDFDownloadButton = dynamic(
  () => import('@/components/pdf/PDFPreview').then((mod) => mod.PDFDownloadButton),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Cargando...
      </span>
    )
  }
);

const PDFViewerComponent = dynamic(
  () => import('@/components/pdf/PDFPreview').then((mod) => mod.PDFViewerComponent),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-full w-full" />
  }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuotationPDFPage({ params }: PageProps) {
  const [quotationId, setQuotationId] = useState<string>('');
  const [data, setData] = useState<QuotationPDFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      setQuotationId(id);

      const supabase = createClient();

      // Obtener cotizacion con cliente
      const { data: quotation, error: quotationError } = await supabase
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

      if (quotationError || !quotation) {
        setError('Cotizacion no encontrada');
        setLoading(false);
        return;
      }

      // Obtener items
      const { data: items } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
        .eq('display_type', 'product')
        .order('sequence');

      // Transformar datos al formato del PDF
      const pdfData: QuotationPDFData = {
        code: quotation.code,
        createdAt: quotation.created_at,
        validityDays: quotation.validity_days,
        validityDate: quotation.validity_date,
        paymentTerms: quotation.payment_terms,
        notes: quotation.notes,
        subtotal: Number(quotation.subtotal),
        igv: Number(quotation.igv),
        total: Number(quotation.total),
        currency: quotation.currency as 'PEN' | 'USD',
        client: quotation.clients ? {
          companyName: quotation.clients.company_name,
          contactName: quotation.clients.contact_name,
          contactEmail: quotation.clients.contact_email,
          contactPhone: quotation.clients.contact_phone,
          ruc: quotation.clients.ruc,
          address: quotation.clients.address,
        } : null,
        items: (items || []).map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'und',
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
          diameter: item.diameter ? Number(item.diameter) : null,
          depth: item.depth ? Number(item.depth) : null,
          workingHeight: item.working_height ? Number(item.working_height) : null,
        })),
      };

      setData(pdfData);
      setLoading(false);
    };

    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500">Cargando cotizacion...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'No se pudo cargar la cotizacion'}</p>
          <Link
            href="/panel/cotizador"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver a Cotizaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/cotizador/${quotationId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">PDF de Cotizacion</h1>
          </div>
          <p className="text-gray-500">{data.code}</p>
        </div>
        <div className="flex gap-3">
          <PDFDownloadButton data={data} />
        </div>
      </div>

      {/* PDF Preview */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Vista previa del documento</span>
          <span className="text-xs text-gray-500">Tamano: A4</span>
        </div>
        <div className="h-[800px] w-full">
          <PDFViewerComponent data={data} />
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Enviar al cliente</p>
            <p className="text-blue-600">
              Descarga el PDF y envialo por correo electronico o WhatsApp.
              Tambien puedes compartir el enlace de esta pagina para que el cliente vea la cotizacion en linea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
