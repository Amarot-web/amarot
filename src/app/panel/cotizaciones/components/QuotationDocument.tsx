'use client';

// ============================================================================
// QUOTATION DOCUMENT - Formato de cotización para preview e impresión
// Basado en plantillas Excel: N176-ROKKA y N386-CONSORCIO RÍOS DEL NORTE
// ============================================================================

interface DocumentItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

interface DocumentCondition {
  title: string;
  content: string;
}

export interface QuotationDocumentData {
  code: string;
  date: string;
  clientName: string;
  clientContact?: string;
  clientProject?: string;
  clientAddress?: string;
  clientRuc?: string;
  contactName?: string;
  contactPhone?: string;
  items: DocumentItem[];
  subtotal: number;
  igv: number;
  total: number;
  includeIgv: boolean;
  currency: 'PEN' | 'USD';
  validityDays: number;
  paymentTerms: string;
  deliveryTime?: string;
  notes?: string;
  conditions: DocumentCondition[];
}

interface QuotationDocumentProps {
  data: QuotationDocumentData;
  className?: string;
}

export default function QuotationDocument({ data, className = '' }: QuotationDocumentProps) {
  const currencyLabel = data.currency === 'PEN' ? 'S/' : 'US$';
  const currencyName = data.currency === 'PEN' ? 'SOLES PERUANOS' : 'DÓLARES AMERICANOS';

  const fmt = (n: number) =>
    n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const today = data.date
    ? new Date(data.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className={`bg-white text-gray-900 ${className}`}>
      {/* Wrapper con estilos de impresión */}
      <div className="max-w-[210mm] mx-auto print:max-w-none" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>

        {/* ── PAGE 1: HEADER + ITEMS + TOTALS ── */}
        <div className="px-8 pt-6 pb-4 print:px-12 print:pt-8">

          {/* Logo + Header */}
          <div className="flex items-start justify-between mb-6 border-b-2 border-[#DC2626] pb-4">
            <div className="flex items-center gap-4">
              <img
                src="/images/logo.png"
                alt="AMAROT"
                className="h-14 w-auto"
              />
              <div>
                <p className="text-[10px] text-gray-500 leading-tight">Perforaciones Diamantinas</p>
                <p className="text-[10px] text-gray-500 leading-tight">Anclajes Químicos · Sellos Cortafuego</p>
                <p className="text-[10px] text-gray-500 leading-tight">Detección · Alquiler de Equipos</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-lg font-bold text-[#DC2626] tracking-wide">COTIZACIÓN</h1>
              <p className="text-sm font-mono font-bold text-gray-800">{data.code}</p>
            </div>
          </div>

          {/* Info del cliente (4 filas: Señores, Atención, Obra, Dirección | Fecha, RUC, Contacto, Teléfono) */}
          <div className="grid grid-cols-[1fr_auto] gap-x-8 mb-6 text-sm">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-20 text-gray-500 text-right pr-2 flex-shrink-0">Señores:</span>
                <span className="font-bold border-b border-gray-300 flex-1 pb-0.5">{data.clientName || '—'}</span>
              </div>
              {data.clientContact && (
                <div className="flex">
                  <span className="w-20 text-gray-500 text-right pr-2 flex-shrink-0">Atención:</span>
                  <span className="font-bold border-b border-gray-300 flex-1 pb-0.5">{data.clientContact}</span>
                </div>
              )}
              {data.clientProject && (
                <div className="flex">
                  <span className="w-20 text-gray-500 text-right pr-2 flex-shrink-0">Obra:</span>
                  <span className="border-b border-gray-300 flex-1 pb-0.5">{data.clientProject}</span>
                </div>
              )}
              {data.clientAddress && (
                <div className="flex">
                  <span className="w-20 text-gray-500 text-right pr-2 flex-shrink-0">Dirección:</span>
                  <span className="border-b border-gray-300 flex-1 pb-0.5">{data.clientAddress}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5 min-w-[200px]">
              <div className="flex">
                <span className="w-24 text-gray-500 text-right pr-2 flex-shrink-0">Fecha:</span>
                <span className="border-b border-gray-300 flex-1 pb-0.5 text-center">{today}</span>
              </div>
              {data.clientRuc && (
                <div className="flex">
                  <span className="w-24 text-gray-500 text-right pr-2 flex-shrink-0">RUC:</span>
                  <span className="border-b border-gray-300 flex-1 pb-0.5 text-center font-mono">{data.clientRuc}</span>
                </div>
              )}
              <div className="flex">
                <span className="w-24 text-gray-500 text-right pr-2 flex-shrink-0">Contacto:</span>
                <span className="border-b border-gray-300 flex-1 pb-0.5 text-center">{data.contactName || 'AMAROT'}</span>
              </div>
              {data.contactPhone && (
                <div className="flex">
                  <span className="w-24 text-gray-500 text-right pr-2 flex-shrink-0">Teléfono:</span>
                  <span className="border-b border-gray-300 flex-1 pb-0.5 text-center">{data.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de items */}
          <table className="w-full border-collapse mb-4 text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-700 px-2 py-2 text-center w-12">ITEM</th>
                <th className="border border-gray-700 px-2 py-2 text-center w-16">CANT.</th>
                <th className="border border-gray-700 px-2 py-2 text-left">DESCRIPCIÓN</th>
                <th className="border border-gray-700 px-2 py-2 text-center w-14">UND.</th>
                <th className="border border-gray-700 px-2 py-2 text-center w-24">Prec. Unit.</th>
                <th className="border border-gray-700 px-2 py-2 text-center w-28">SUBTOTAL</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-0.5" colSpan={4}></th>
                <th className="border border-gray-300 px-2 py-0.5 text-center text-xs font-bold text-gray-600">{currencyLabel}</th>
                <th className="border border-gray-300 px-2 py-0.5 text-center text-xs font-bold text-gray-600">{currencyLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="border-x border-gray-300 px-2 py-2 text-center text-gray-600">{idx + 1}</td>
                  <td className="border-x border-gray-300 px-2 py-2 text-center font-mono">
                    {Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}
                  </td>
                  <td className="border-x border-gray-300 px-3 py-2">{item.description}</td>
                  <td className="border-x border-gray-300 px-2 py-2 text-center text-gray-600 text-xs">{item.unit}</td>
                  <td className="border-x border-gray-300 px-2 py-2 text-right font-mono">{fmt(item.unitPrice)}</td>
                  <td className="border-x border-gray-300 px-2 py-2 text-right font-mono font-semibold">{fmt(item.subtotal)}</td>
                </tr>
              ))}
              {/* Fila vacía de cierre */}
              <tr>
                <td className="border border-gray-300 py-1" colSpan={6}></td>
              </tr>
            </tbody>
          </table>

          {/* Moneda + Totales + Condiciones comerciales */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-3">PRECIOS EXPRESADOS EN {currencyName}</p>

            <div className="grid grid-cols-[1fr_auto] gap-x-8">
              {/* Condiciones comerciales (izquierda) */}
              <div className="space-y-1.5 text-sm">
                <div className="flex">
                  <span className="w-36 text-gray-500 flex-shrink-0">Cond. de Pago:</span>
                  <span className="font-bold border-b border-gray-300 flex-1 pb-0.5">{data.paymentTerms}</span>
                </div>
                {data.deliveryTime && (
                  <div className="flex">
                    <span className="w-36 text-gray-500 flex-shrink-0">Tiempo de Entrega:</span>
                    <span className="font-bold border-b border-gray-300 flex-1 pb-0.5">{data.deliveryTime}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-36 text-gray-500 flex-shrink-0">Validez de la Oferta:</span>
                  <span className="border-b border-gray-300 flex-1 pb-0.5">{data.validityDays} días</span>
                </div>
              </div>

              {/* Totales (derecha) */}
              <div className="min-w-[200px]">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-1.5 font-bold text-center bg-gray-50">Sub total</td>
                      <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">{currencyLabel} {fmt(data.subtotal)}</td>
                    </tr>
                    {data.includeIgv && (
                      <tr>
                        <td className="border border-gray-300 px-3 py-1.5 font-bold text-center bg-gray-50">IGV 18%</td>
                        <td className="border border-gray-300 px-3 py-1.5 text-right font-mono">{currencyLabel} {fmt(data.igv)}</td>
                      </tr>
                    )}
                    <tr className="bg-[#DC2626] text-white">
                      <td className="border border-[#DC2626] px-3 py-2 font-bold text-center">TOTAL {currencyLabel}</td>
                      <td className="border border-[#DC2626] px-3 py-2 text-right font-mono font-bold text-lg">{fmt(data.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cuentas bancarias */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6 text-xs">
            <p className="font-bold text-gray-700 mb-2">DATOS BANCARIOS</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-600">Cuenta Soles - BCP</p>
                <p className="text-gray-500">Cta. Cte.: 194-2692841-0-17</p>
                <p className="text-gray-500">CCI: 002-194-002692841017-52</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Cuenta Dólares - BCP</p>
                <p className="text-gray-500">Cta. Cte.: 194-2714740-1-68</p>
                <p className="text-gray-500">CCI: 002-194-002714740168-55</p>
              </div>
            </div>
            <p className="text-gray-500 mt-2">Razón Social: AMAROT S.A.C. · RUC: 20612345678</p>
          </div>

          {/* Contacto */}
          <div className="text-xs text-gray-500 mb-6 text-center">
            <p>info@amarotperu.com · www.amarotperu.com · +51 999 999 999</p>
          </div>
        </div>

        {/* ── PAGE 2+: CONDICIONES (si las hay) ── */}
        {data.conditions.length > 0 && (
          <div className="px-8 pt-6 pb-4 print:px-12 print:break-before-page">
            {/* Header repetido en condiciones */}
            <div className="flex items-center justify-between mb-6 border-b-2 border-[#DC2626] pb-3">
              <img src="/images/logo.png" alt="AMAROT" className="h-10 w-auto" />
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-gray-700">{data.code}</span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-xs text-gray-500">Condiciones del Servicio</span>
              </div>
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">
              Consideraciones y Requerimientos
            </h2>

            <div className="space-y-5">
              {data.conditions.map((condition, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-bold text-gray-800 mb-1.5">{condition.title}</h3>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pl-2 border-l-2 border-gray-200">
                    {condition.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Notas adicionales */}
            {data.notes && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-1.5">Notas Adicionales</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{data.notes}</p>
              </div>
            )}

            {/* Firma */}
            <div className="mt-12 pt-8 grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mx-8">
                  <p className="text-sm font-semibold text-gray-800">AMAROT S.A.C.</p>
                  <p className="text-xs text-gray-500">Representante Comercial</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mx-8">
                  <p className="text-sm font-semibold text-gray-800">{data.clientName}</p>
                  <p className="text-xs text-gray-500">Aceptación del Cliente</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-xs text-gray-400 text-center">
              <p>info@amarotperu.com · www.amarotperu.com · +51 999 999 999</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
