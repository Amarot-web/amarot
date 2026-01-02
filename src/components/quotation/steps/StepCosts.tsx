'use client';

import { useState } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { formatCurrency } from '@/lib/calculations';
import type { LaborCost, LogisticsCost, MaterialCost, EquipmentCost } from '@/types/database';

type CostTab = 'labor' | 'logistics' | 'materials' | 'equipment';

const roleLabels: Record<string, string> = {
  leader: 'Líder/Capataz',
  operator: 'Operario',
  helper: 'Ayudante',
};

const logisticsTypeLabels: Record<string, string> = {
  food: 'Alimentación',
  lodging: 'Hospedaje',
  transport: 'Transporte',
  fuel: 'Combustible',
  other: 'Otros',
};

const materialTypeLabels: Record<string, string> = {
  drill_bits: 'Brocas',
  anchors: 'Anclajes',
  chemicals: 'Químicos',
  ppe: 'EPP',
  other: 'Otros',
};

const equipmentTypeLabels: Record<string, string> = {
  drill: 'Perforadora',
  generator: 'Generador',
  scanner: 'Detector',
  vehicle: 'Vehículo',
  other: 'Otros',
};

export default function StepCosts() {
  const {
    quotationType,
    currency,
    durationDays,
    laborCosts,
    logisticsCosts,
    materialCosts,
    equipmentCosts,
    addLaborCost,
    removeLaborCost,
    addLogisticsCost,
    removeLogisticsCost,
    addMaterialCost,
    removeMaterialCost,
    addEquipmentCost,
    removeEquipmentCost,
    getRequiredDrillBits,
    prevStep,
    nextStep,
  } = useQuotationStore();

  const [activeTab, setActiveTab] = useState<CostTab>('labor');

  // Estados de formularios
  const [newLabor, setNewLabor] = useState<Omit<LaborCost, 'id' | 'quotationId' | 'totalCost'>>({
    role: 'operator',
    description: '',
    quantity: 1,
    dailyRate: 80,
    daysWorked: durationDays,
    includeBenefits: false,
    benefitsPercentage: 40,
  });

  const [newLogistics, setNewLogistics] = useState<Omit<LogisticsCost, 'id' | 'quotationId' | 'totalCost'>>({
    type: 'food',
    description: '',
    quantity: 1,
    unitCost: 0,
  });

  const [newMaterial, setNewMaterial] = useState<Omit<MaterialCost, 'id' | 'quotationId' | 'totalCost'>>({
    type: 'drill_bits',
    description: '',
    quantity: 1,
    unitCost: 0,
    perforationsPerUnit: null,
  });

  const [newEquipment, setNewEquipment] = useState<Omit<EquipmentCost, 'id' | 'quotationId' | 'totalCost'>>({
    type: 'drill',
    description: '',
    quantity: 1,
    dailyRate: 0,
    daysUsed: durationDays,
    isOwned: true,
  });

  // Calcular totales
  const laborTotal = laborCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const logisticsTotal = logisticsCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const materialsTotal = materialCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const equipmentTotal = equipmentCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const grandTotal = laborTotal + logisticsTotal + materialsTotal + equipmentTotal;

  // Brocas requeridas
  const requiredBits = getRequiredDrillBits();

  // Agregar costo de mano de obra
  const handleAddLabor = () => {
    if (!newLabor.description) {
      alert('Ingresa una descripción');
      return;
    }
    addLaborCost(newLabor);
    setNewLabor({
      ...newLabor,
      description: '',
      quantity: 1,
    });
  };

  // Agregar plantilla rápida de personal
  const addQuickLabor = (role: 'leader' | 'operator' | 'helper', rate: number) => {
    addLaborCost({
      role,
      description: roleLabels[role],
      quantity: 1,
      dailyRate: rate,
      daysWorked: durationDays,
      includeBenefits: false,
      benefitsPercentage: 40,
    });
  };

  // Agregar costo logístico
  const handleAddLogistics = () => {
    if (!newLogistics.description || newLogistics.unitCost <= 0) {
      alert('Completa descripción y costo');
      return;
    }
    addLogisticsCost(newLogistics);
    setNewLogistics({
      ...newLogistics,
      description: '',
      quantity: 1,
      unitCost: 0,
    });
  };

  // Agregar costo de material
  const handleAddMaterial = () => {
    if (!newMaterial.description || newMaterial.unitCost <= 0) {
      alert('Completa descripción y costo');
      return;
    }
    addMaterialCost(newMaterial);
    setNewMaterial({
      ...newMaterial,
      description: '',
      quantity: 1,
      unitCost: 0,
    });
  };

  // Agregar costo de equipo
  const handleAddEquipment = () => {
    if (!newEquipment.description || newEquipment.dailyRate <= 0) {
      alert('Completa descripción y tarifa');
      return;
    }
    addEquipmentCost(newEquipment);
    setNewEquipment({
      ...newEquipment,
      description: '',
      quantity: 1,
      dailyRate: 0,
    });
  };

  const tabs = [
    { id: 'labor' as CostTab, name: 'Personal', count: laborCosts.length, total: laborTotal },
    { id: 'logistics' as CostTab, name: 'Logística', count: logisticsCosts.length, total: logisticsTotal },
    { id: 'materials' as CostTab, name: 'Materiales', count: materialCosts.length, total: materialsTotal },
    { id: 'equipment' as CostTab, name: 'Equipos', count: equipmentCosts.length, total: equipmentTotal },
  ];

  // Vista simplificada para proyectos pequeños
  if (quotationType === 'small') {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Proyecto Pequeño:</strong> Vista simplificada de costos. Solo personal y viáticos básicos.
          </p>
        </div>

        {/* Personal simplificado */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Personal</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => addQuickLabor('operator', 80)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              + Operario (S/ 80/día)
            </button>
            <button
              onClick={() => addQuickLabor('helper', 50)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              + Ayudante (S/ 50/día)
            </button>
          </div>

          {laborCosts.length > 0 && (
            <div className="space-y-2">
              {laborCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>
                    {cost.quantity}x {cost.description} × {cost.daysWorked} días
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(cost.totalCost, currency)}</span>
                    <button onClick={() => removeLaborCost(cost.id)} className="text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Viáticos simplificados */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Viáticos</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => addLogisticsCost({
                type: 'food',
                description: 'Alimentación equipo',
                quantity: durationDays,
                unitCost: 25,
              })}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              + Alimentación (S/ 25/día)
            </button>
            <button
              onClick={() => addLogisticsCost({
                type: 'transport',
                description: 'Movilidad',
                quantity: durationDays,
                unitCost: 30,
              })}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              + Movilidad (S/ 30/día)
            </button>
          </div>

          {logisticsCosts.length > 0 && (
            <div className="space-y-2">
              {logisticsCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{cost.description} × {cost.quantity}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(cost.totalCost, currency)}</span>
                    <button onClick={() => removeLogisticsCost(cost.id)} className="text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Costos Operativos:</span>
            <span className="text-[#1E3A8A]">{formatCurrency(grandTotal, currency)}</span>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex justify-between pt-4 border-t">
          <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          <button onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg font-semibold">
            Continuar
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Vista completa para proyectos grandes
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1E3A8A] text-[#1E3A8A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Resumen de costos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tabs.map((tab) => (
          <div key={tab.id} className={`p-3 rounded-lg ${activeTab === tab.id ? 'bg-[#1E3A8A]/10 border border-[#1E3A8A]/30' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500">{tab.name}</p>
            <p className="text-lg font-bold">{formatCurrency(tab.total, currency)}</p>
          </div>
        ))}
        <div className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold text-[#DC2626]">{formatCurrency(grandTotal, currency)}</p>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="border border-gray-200 rounded-lg p-4">
        {/* Tab Personal */}
        {activeTab === 'labor' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => addQuickLabor('leader', 120)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm">+ Líder (S/ 120)</button>
              <button onClick={() => addQuickLabor('operator', 80)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm">+ Operario (S/ 80)</button>
              <button onClick={() => addQuickLabor('helper', 50)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm">+ Ayudante (S/ 50)</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select value={newLabor.role} onChange={(e) => setNewLabor({ ...newLabor, role: e.target.value as LaborCost['role'] })} className="px-3 py-2 border rounded-lg">
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input type="text" placeholder="Descripción" value={newLabor.description} onChange={(e) => setNewLabor({ ...newLabor, description: e.target.value })} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="1" placeholder="Cant." value={newLabor.quantity || ''} onChange={(e) => setNewLabor({ ...newLabor, quantity: parseInt(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="0" placeholder="Jornal" value={newLabor.dailyRate || ''} onChange={(e) => setNewLabor({ ...newLabor, dailyRate: parseFloat(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <button onClick={handleAddLabor} className="bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90">Agregar</button>
            </div>

            {laborCosts.length > 0 && (
              <table className="min-w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2">Rol</th><th>Descripción</th><th>Cant.</th><th>Jornal</th><th>Días</th><th className="text-right">Total</th><th></th></tr></thead>
                <tbody>
                  {laborCosts.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2">{roleLabels[c.role]}</td>
                      <td>{c.description}</td>
                      <td>{c.quantity}</td>
                      <td>{formatCurrency(c.dailyRate, currency)}</td>
                      <td>{c.daysWorked}</td>
                      <td className="text-right font-medium">{formatCurrency(c.totalCost, currency)}</td>
                      <td><button onClick={() => removeLaborCost(c.id)} className="text-red-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Logística */}
        {activeTab === 'logistics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select value={newLogistics.type} onChange={(e) => setNewLogistics({ ...newLogistics, type: e.target.value as LogisticsCost['type'] })} className="px-3 py-2 border rounded-lg">
                {Object.entries(logisticsTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input type="text" placeholder="Descripción" value={newLogistics.description} onChange={(e) => setNewLogistics({ ...newLogistics, description: e.target.value })} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="1" placeholder="Cant." value={newLogistics.quantity || ''} onChange={(e) => setNewLogistics({ ...newLogistics, quantity: parseInt(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="0" placeholder="Costo Unit." value={newLogistics.unitCost || ''} onChange={(e) => setNewLogistics({ ...newLogistics, unitCost: parseFloat(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <button onClick={handleAddLogistics} className="bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90">Agregar</button>
            </div>

            {logisticsCosts.length > 0 && (
              <table className="min-w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2">Tipo</th><th>Descripción</th><th>Cant.</th><th>C. Unit</th><th className="text-right">Total</th><th></th></tr></thead>
                <tbody>
                  {logisticsCosts.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2">{logisticsTypeLabels[c.type]}</td>
                      <td>{c.description}</td>
                      <td>{c.quantity}</td>
                      <td>{formatCurrency(c.unitCost, currency)}</td>
                      <td className="text-right font-medium">{formatCurrency(c.totalCost, currency)}</td>
                      <td><button onClick={() => removeLogisticsCost(c.id)} className="text-red-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Materiales */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            {Object.keys(requiredBits).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium">Brocas requeridas (estimación):</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(requiredBits).map(([diameter, count]) => (
                    <span key={diameter} className="px-2 py-1 bg-yellow-100 rounded text-sm">
                      Ø{diameter}": {count} brocas
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select value={newMaterial.type} onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as MaterialCost['type'] })} className="px-3 py-2 border rounded-lg">
                {Object.entries(materialTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input type="text" placeholder="Descripción" value={newMaterial.description} onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="1" placeholder="Cant." value={newMaterial.quantity || ''} onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="0" placeholder="Costo Unit." value={newMaterial.unitCost || ''} onChange={(e) => setNewMaterial({ ...newMaterial, unitCost: parseFloat(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <button onClick={handleAddMaterial} className="bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90">Agregar</button>
            </div>

            {materialCosts.length > 0 && (
              <table className="min-w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2">Tipo</th><th>Descripción</th><th>Cant.</th><th>C. Unit</th><th className="text-right">Total</th><th></th></tr></thead>
                <tbody>
                  {materialCosts.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2">{materialTypeLabels[c.type]}</td>
                      <td>{c.description}</td>
                      <td>{c.quantity}</td>
                      <td>{formatCurrency(c.unitCost, currency)}</td>
                      <td className="text-right font-medium">{formatCurrency(c.totalCost, currency)}</td>
                      <td><button onClick={() => removeMaterialCost(c.id)} className="text-red-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Equipos */}
        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select value={newEquipment.type} onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value as EquipmentCost['type'] })} className="px-3 py-2 border rounded-lg">
                {Object.entries(equipmentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input type="text" placeholder="Descripción" value={newEquipment.description} onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="1" placeholder="Cant." value={newEquipment.quantity || ''} onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <input type="number" min="0" placeholder="Tarifa/día" value={newEquipment.dailyRate || ''} onChange={(e) => setNewEquipment({ ...newEquipment, dailyRate: parseFloat(e.target.value) || 0 })} onFocus={(e) => e.target.select()} className="px-3 py-2 border rounded-lg" />
              <button onClick={handleAddEquipment} className="bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90">Agregar</button>
            </div>

            {equipmentCosts.length > 0 && (
              <table className="min-w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2">Tipo</th><th>Descripción</th><th>Cant.</th><th>Tarifa</th><th>Días</th><th className="text-right">Total</th><th></th></tr></thead>
                <tbody>
                  {equipmentCosts.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2">{equipmentTypeLabels[c.type]}</td>
                      <td>{c.description}</td>
                      <td>{c.quantity}</td>
                      <td>{formatCurrency(c.dailyRate, currency)}</td>
                      <td>{c.daysUsed}</td>
                      <td className="text-right font-medium">{formatCurrency(c.totalCost, currency)}</td>
                      <td><button onClick={() => removeEquipmentCost(c.id)} className="text-red-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t">
        <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        <button onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg font-semibold">
          Continuar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
