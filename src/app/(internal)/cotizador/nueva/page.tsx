import QuotationWizard from '@/components/quotation/QuotationWizard';

export const metadata = {
  title: 'Nueva Cotización | AMAROT',
};

export default function NuevaCotizacionPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Cotización</h1>
        <p className="text-gray-500 mt-1">
          Crea una nueva cotización paso a paso
        </p>
      </div>
      <QuotationWizard />
    </div>
  );
}
