'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuotationStore } from '@/stores/quotationStore';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import {
  quotationItemToDb,
  laborCostToDb,
  logisticsCostToDb,
  materialCostToDb,
  equipmentCostToDb,
} from '@/types/database';

export default function StepSummary() {
  const router = useRouter();
  const {
    client,
    quotationType,
    currency,
    durationDays,
    items,
    laborCosts,
    logisticsCosts,
    materialCosts,
    equipmentCosts,
    validityDays,
    setValidityDays,
    paymentTerms,
    setPaymentTerms,
    notes,
    setNotes,
    getTotals,
    prevStep,
    reset,
  } = useQuotationStore();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCosts, setShowCosts] = useState(false);

  const totals = getTotals();

  // Guardar cotización
  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!client) {
      setError('No hay cliente seleccionado');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Calcular fecha de validez
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + validityDays);

      // Crear cotización
      // MODELO CORRECTO: El precio viene de los items, no de costos + margen
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          client_id: client.id,
          type: quotationType,
          status,
          duration_days: durationDays,
          duration_months: Math.ceil(durationDays / 30),
          // Precio de venta (lo que ve el cliente)
          subtotal: totals.subtotal,
          igv: totals.igv,
          total: totals.total,
          // Análisis interno (para seguimiento de rentabilidad)
          margin_percentage: totals.profitPercentage, // Rentabilidad calculada
          margin_amount: totals.profitAmount, // Ganancia estimada
          currency,
          validity_days: validityDays,
          validity_date: validityDate.toISOString().split('T')[0],
          payment_terms: paymentTerms,
          notes,
          created_by: user?.id,
          sent_at: status === 'sent' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Insertar items
      if (items.length > 0) {
        const itemsData = items.map((item, idx) => ({
          ...quotationItemToDb({ ...item, quotationId: quotation.id }),
          sequence: idx,
        }));
        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(itemsData);
        if (itemsError) throw itemsError;
      }

      // Insertar costos de mano de obra
      if (laborCosts.length > 0) {
        const laborData = laborCosts.map((cost) =>
          laborCostToDb({ ...cost, quotationId: quotation.id })
        );
        const { error: laborError } = await supabase
          .from('labor_costs')
          .insert(laborData);
        if (laborError) throw laborError;
      }

      // Insertar costos logísticos
      if (logisticsCosts.length > 0) {
        const logisticsData = logisticsCosts.map((cost) =>
          logisticsCostToDb({ ...cost, quotationId: quotation.id })
        );
        const { error: logisticsError } = await supabase
          .from('logistics_costs')
          .insert(logisticsData);
        if (logisticsError) throw logisticsError;
      }

      // Insertar costos de materiales
      if (materialCosts.length > 0) {
        const materialsData = materialCosts.map((cost) =>
          materialCostToDb({ ...cost, quotationId: quotation.id })
        );
        const { error: materialsError } = await supabase
          .from('material_costs')
          .insert(materialsData);
        if (materialsError) throw materialsError;
      }

      // Insertar costos de equipos
      if (equipmentCosts.length > 0) {
        const equipmentData = equipmentCosts.map((cost) =>
          equipmentCostToDb({ ...cost, quotationId: quotation.id })
        );
        const { error: equipmentError } = await supabase
          .from('equipment_costs')
          .insert(equipmentData);
        if (equipmentError) throw equipmentError;
      }

      // Limpiar store y redirigir
      reset();
      router.push(`/cotizador/${quotation.id}`);
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Resumen del cliente */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Cliente</h3>
        <p className="text-lg">{client?.companyName}</p>
        <p className="text-gray-600">{client?.contactName} • {client?.contactPhone}</p>
      </div>

      {/* ==================== COTIZACIÓN (lo que ve el cliente) ==================== */}
      <div className="border-2 border-[#1E3A8A] rounded-lg overflow-hidden">
        <div className="bg-[#1E3A8A] px-4 py-3">
          <h3 className="font-semibold text-white">
            Cotización
          </h3>
        </div>

        {/* Lista de servicios */}
        <div className="max-h-48 overflow-y-auto border-b">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Servicio</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Cant.</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">P.Unit</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.filter(item => item.displayType === 'product').map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {formatCurrency(item.unitPrice, currency)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(item.totalPrice, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales de la cotización */}
        <div className="p-4 space-y-2 bg-white">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(totals.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>IGV (18%):</span>
            <span>{formatCurrency(totals.igv, currency)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t-2 border-[#1E3A8A] pt-3 mt-2">
            <span>TOTAL A FACTURAR:</span>
            <span className="text-[#DC2626]">{formatCurrency(totals.total, currency)}</span>
          </div>
        </div>
      </div>

      {/* ==================== ANÁLISIS INTERNO (costos y rentabilidad) ==================== */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowCosts(!showCosts)}
          className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-semibold text-gray-700">Análisis de Rentabilidad</span>
            <span className="text-xs text-gray-500">(uso interno)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${totals.profitPercentage >= 30 ? 'text-green-600' : totals.profitPercentage >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
              {formatPercentage(totals.profitPercentage)}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showCosts ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showCosts && (
          <div className="p-4 space-y-4 bg-white">
            {/* Desglose de costos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600">Personal</p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(totals.laborTotal, currency)}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-600">Logística</p>
                <p className="text-lg font-bold text-yellow-900">
                  {formatCurrency(totals.logisticsTotal, currency)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600">Materiales</p>
                <p className="text-lg font-bold text-orange-900">
                  {formatCurrency(totals.materialsTotal, currency)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600">Equipos</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(totals.equipmentTotal, currency)}
                </p>
              </div>
            </div>

            {/* Resumen de rentabilidad */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Ingresos (sin IGV):</span>
                <span>{formatCurrency(totals.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Costos:</span>
                <span className="text-red-600">-{formatCurrency(totals.costsTotal, currency)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 mt-2">
                <span>Rentabilidad Estimada:</span>
                <span className={totals.profitAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(totals.profitAmount, currency)} ({formatPercentage(totals.profitPercentage)})
                </span>
              </div>
            </div>

            {/* Indicador visual de rentabilidad */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Rentabilidad:</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    totals.profitPercentage >= 30 ? 'bg-green-500' :
                    totals.profitPercentage >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(Math.max(totals.profitPercentage, 0), 100)}%` }}
                />
              </div>
              <span className={`font-medium ${
                totals.profitPercentage >= 30 ? 'text-green-600' :
                totals.profitPercentage >= 15 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {totals.profitPercentage >= 30 ? 'Buena' : totals.profitPercentage >= 15 ? 'Regular' : 'Baja'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Condiciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Validez (días)
          </label>
          <input
            type="number"
            min="1"
            value={validityDays}
            onChange={(e) => setValidityDays(parseInt(e.target.value) || 15)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condiciones de Pago
          </label>
          <input
            type="text"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            placeholder="50% adelanto, 50% contra entrega"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas adicionales
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
          placeholder="Observaciones, exclusiones, condiciones especiales..."
        />
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <button
          onClick={prevStep}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <div className="flex-1" />

        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-[#1E3A8A] text-[#1E3A8A] rounded-lg hover:bg-[#1E3A8A]/5 font-semibold disabled:opacity-50"
        >
          {saving ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          )}
          Guardar Borrador
        </button>

        <button
          onClick={() => handleSave('sent')}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          Generar Cotización
        </button>
      </div>
    </div>
  );
}
