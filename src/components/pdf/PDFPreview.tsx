'use client';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import QuotationPDF, { type QuotationPDFData } from './QuotationPDF';

interface PDFPreviewProps {
  data: QuotationPDFData;
}

export function PDFDownloadButton({ data }: PDFPreviewProps) {
  return (
    <PDFDownloadLink
      document={<QuotationPDF data={data} />}
      fileName={`${data.code}.pdf`}
      className="inline-flex items-center gap-2 px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-semibold transition-colors"
    >
      {({ loading: pdfLoading }) =>
        pdfLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
}

export function PDFViewerComponent({ data }: PDFPreviewProps) {
  return (
    <PDFViewer
      style={{ width: '100%', height: '100%', border: 'none' }}
      showToolbar={false}
    >
      <QuotationPDF data={data} />
    </PDFViewer>
  );
}
