'use client';

import { useState, useEffect } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getHeightFactor, getVolumeDiscount } from '@/lib/calculations';
import type { QuotationItem } from '@/types/database';

interface PriceListItem {
  id: string;
  serviceType: string;
  description: string;
  diameter: number | null;
  basePrice: number;
  unit: string;
}

const serviceTypeLabels: Record<string, string> = {
  perforation: 'Perforación Diamantina',
  anchors: 'Anclajes Químicos',
  firestop: 'Sellado Cortafuego',
  detection: 'Detección de Instalaciones',
  equipment_rental: 'Alquiler de Equipos',
};

const unitLabels: Record<string, string> = {
  unit: 'und',
  meter: 'm',
  sqm: 'm²',
  hour: 'hora',
  day: 'día',
};

export default function StepServices() {
  const {
    items,
    addItem,
    updateItem,
    removeItem,
    currency,
    prevStep,
    nextStep,
  } = useQuotationStore();

  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Estado del formulario de nuevo item
  const [newItem, setNewItem] = useState({
    serviceType: 'perforation',
    priceListId: '',
    description: '',
    diameter: 0,
    depth: 0,
    workingHeight: 0,
    quantity: 1,
    unit: 'unit',
    unitPrice: 0,
  });

  // Cargar lista de precios
  useEffect(() => {
    const loadPriceList = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('price_list')
        .select('*')
        .eq('is_active', true)
        .order('service_type')
        .order('diameter');

      if (!error && data) {
        setPriceList(
          data.map((p) => ({
            id: p.id,
            serviceType: p.service_type,
            description: p.description,
            diameter: p.diameter,
            basePrice: parseFloat(p.base_price),
            unit: p.unit,
          }))
        );
      }
      setLoading(false);
    };
    loadPriceList();
  }, []);

  // Cuando se selecciona un item del catálogo
  const handleSelectFromCatalog = (item: PriceListItem) => {
    setNewItem({
      ...newItem,
      priceListId: item.id,
      serviceType: item.serviceType,
      description: item.description,
      diameter: item.diameter || 0,
      unit: item.unit,
      unitPrice: item.basePrice,
    });
  };

  // Agregar item
  const handleAddItem = () => {
    if (!newItem.description || newItem.quantity <= 0) {
      alert('Completa la descripción y cantidad');
      return;
    }

    addItem({
      serviceType: newItem.serviceType as QuotationItem['serviceType'],
      displayType: 'product',
      description: newItem.description,
      diameter: newItem.diameter || null,
      depth: newItem.depth || null,
      workingHeight: newItem.workingHeight || null,
      quantity: newItem.quantity,
      unit: newItem.unit as QuotationItem['unit'],
      unitPrice: newItem.unitPrice,
      totalPrice: 0, // Se calcula en el store
    });

    // Reset form
    setNewItem({
      serviceType: 'perforation',
      priceListId: '',
      description: '',
      diameter: 0,
      depth: 0,
      workingHeight: 0,
      quantity: 1,
      unit: 'unit',
      unitPrice: 0,
    });
    setShowAddForm(false);
  };

  // Calcular precio con factores
  const calculateDisplayPrice = () => {
    const heightFactor = getHeightFactor(newItem.workingHeight);
    const volumeDiscount = getVolumeDiscount(newItem.quantity);
    const baseTotal = newItem.unitPrice * newItem.quantity;
    const withHeight = baseTotal * heightFactor;
    const withDiscount = withHeight * (1 - volumeDiscount);
    return { baseTotal, heightFactor, volumeDiscount, finalTotal: withDiscount };
  };

  const priceCalc = calculateDisplayPrice();

  // Agrupar precios por tipo de servicio
  const groupedPrices = priceList.reduce((acc, item) => {
    if (!acc[item.serviceType]) acc[item.serviceType] = [];
    acc[item.serviceType].push(item);
    return acc;
  }, {} as Record<string, PriceListItem[]>);

  const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Lista de items agregados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Servicios ({items.length})
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-sm bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-500">No hay items agregados</p>
            <p className="text-sm text-gray-400">Haz clic en "Agregar Item" para comenzar</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Cant.
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    P. Unit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {item.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {serviceTypeLabels[item.serviceType || ''] || item.serviceType}
                        {item.diameter && ` • Ø${item.diameter}"`}
                        {item.depth && ` • ${item.depth}cm prof.`}
                        {item.workingHeight && item.workingHeight > 2 && ` • ${item.workingHeight}m altura`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })
                        }
                        onFocus={(e) => e.target.select()}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatCurrency(item.unitPrice, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">
                      {formatCurrency(item.totalPrice, currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium">
                    Subtotal Servicios:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-lg">
                    {formatCurrency(itemsTotal, currency)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Formulario agregar item */}
      {showAddForm && (
        <div className="border border-[#1E3A8A]/30 bg-[#1E3A8A]/5 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Nuevo Item</h4>

          {/* Catálogo rápido */}
          {loading ? (
            <p className="text-gray-500">Cargando catálogo...</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Selecciona del catálogo o ingresa manualmente:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(groupedPrices).map(([type, typeItems]) => (
                  <div key={type} className="w-full">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {serviceTypeLabels[type]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {typeItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectFromCatalog(item)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            newItem.priceListId === item.id
                              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#1E3A8A]'
                          }`}
                        >
                          {item.description} - {formatCurrency(item.basePrice, currency)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="Descripción del servicio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newItem.unitPrice || ''}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Campos adicionales para perforación */}
          {newItem.serviceType === 'perforation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diámetro (pulgadas)
                </label>
                <select
                  value={newItem.diameter}
                  onChange={(e) => setNewItem({ ...newItem, diameter: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                >
                  <option value={0}>Seleccionar</option>
                  <option value={3}>3"</option>
                  <option value={4}>4"</option>
                  <option value={5}>5"</option>
                  <option value={7}>7"</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profundidad (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newItem.depth || ''}
                  onChange={(e) => setNewItem({ ...newItem, depth: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura de trabajo (m)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newItem.workingHeight || ''}
                  onChange={(e) => setNewItem({ ...newItem, workingHeight: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="2"
                />
              </div>
            </div>
          )}

          {/* Preview de cálculo */}
          {newItem.unitPrice > 0 && newItem.quantity > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600">
                Base: {formatCurrency(priceCalc.baseTotal, currency)}
                {priceCalc.heightFactor > 1 && (
                  <span className="text-orange-600">
                    {' '}× {priceCalc.heightFactor.toFixed(2)} (altura)
                  </span>
                )}
                {priceCalc.volumeDiscount > 0 && (
                  <span className="text-green-600">
                    {' '}- {(priceCalc.volumeDiscount * 100).toFixed(0)}% (volumen)
                  </span>
                )}
              </p>
              <p className="text-lg font-bold text-[#1E3A8A]">
                Total: {formatCurrency(priceCalc.finalTotal, currency)}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleAddItem}
              className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Agregar Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        <button
          onClick={nextStep}
          disabled={items.length === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors
            ${
              items.length > 0
                ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continuar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
