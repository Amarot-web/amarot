import { create } from 'zustand';
import type {
  Client,
  QuotationItem,
  LaborCost,
  LogisticsCost,
  MaterialCost,
  EquipmentCost,
} from '@/types/database';
import {
  calculateItemPrice,
  calculateTotals,
  calculateRequiredDrillBits,
} from '@/lib/calculations';

export type QuotationType = 'small' | 'large';
export type Currency = 'PEN' | 'USD';

interface QuotationState {
  // Paso actual del wizard
  currentStep: number;

  // Datos del cliente
  client: Client | null;
  isNewClient: boolean;

  // Configuración general
  quotationType: QuotationType;
  currency: Currency;
  durationDays: number;

  // Items de servicio
  items: QuotationItem[];

  // Costos operativos
  laborCosts: LaborCost[];
  logisticsCosts: LogisticsCost[];
  materialCosts: MaterialCost[];
  equipmentCosts: EquipmentCost[];

  // Financieros
  marginPercentage: number;

  // Condiciones
  validityDays: number;
  paymentTerms: string;
  notes: string;

  // Acciones de navegación
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Acciones de cliente
  setClient: (client: Client | null) => void;
  setIsNewClient: (isNew: boolean) => void;

  // Acciones de configuración
  setQuotationType: (type: QuotationType) => void;
  setCurrency: (currency: Currency) => void;
  setDurationDays: (days: number) => void;

  // Acciones de items
  addItem: (item: Omit<QuotationItem, 'id' | 'quotationId' | 'sequence'>) => void;
  updateItem: (id: string, item: Partial<QuotationItem>) => void;
  removeItem: (id: string) => void;

  // Acciones de costos
  addLaborCost: (cost: Omit<LaborCost, 'id' | 'quotationId' | 'totalCost'>) => void;
  updateLaborCost: (id: string, cost: Partial<LaborCost>) => void;
  removeLaborCost: (id: string) => void;

  addLogisticsCost: (cost: Omit<LogisticsCost, 'id' | 'quotationId' | 'totalCost'>) => void;
  updateLogisticsCost: (id: string, cost: Partial<LogisticsCost>) => void;
  removeLogisticsCost: (id: string) => void;

  addMaterialCost: (cost: Omit<MaterialCost, 'id' | 'quotationId' | 'totalCost'>) => void;
  updateMaterialCost: (id: string, cost: Partial<MaterialCost>) => void;
  removeMaterialCost: (id: string) => void;

  addEquipmentCost: (cost: Omit<EquipmentCost, 'id' | 'quotationId' | 'totalCost'>) => void;
  updateEquipmentCost: (id: string, cost: Partial<EquipmentCost>) => void;
  removeEquipmentCost: (id: string) => void;

  // Acciones financieras
  setMarginPercentage: (margin: number) => void;

  // Acciones de condiciones
  setValidityDays: (days: number) => void;
  setPaymentTerms: (terms: string) => void;
  setNotes: (notes: string) => void;

  // Cálculos
  getTotals: () => ReturnType<typeof calculateTotals>;
  getRequiredDrillBits: () => ReturnType<typeof calculateRequiredDrillBits>;

  // Reset
  reset: () => void;
}

const generateId = () => crypto.randomUUID();

const initialState = {
  currentStep: 0,
  client: null,
  isNewClient: false,
  quotationType: 'small' as QuotationType,
  currency: 'PEN' as Currency,
  durationDays: 1,
  items: [],
  laborCosts: [],
  logisticsCosts: [],
  materialCosts: [],
  equipmentCosts: [],
  marginPercentage: 55,
  validityDays: 15,
  paymentTerms: '50% adelanto, 50% contra entrega',
  notes: '',
};

export const useQuotationStore = create<QuotationState>((set, get) => ({
  ...initialState,

  // Navegación
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  goToStep: (step) => set({ currentStep: Math.max(0, Math.min(step, 3)) }),

  // Cliente
  setClient: (client) => set({ client }),
  setIsNewClient: (isNew) => set({ isNewClient: isNew }),

  // Configuración
  setQuotationType: (type) => set({ quotationType: type }),
  setCurrency: (currency) => set({ currency }),
  setDurationDays: (days) => set({ durationDays: days }),

  // Items
  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          id: generateId(),
          quotationId: '',
          sequence: state.items.length,
          totalPrice: calculateItemPrice(
            item.unitPrice,
            item.quantity,
            item.workingHeight || 0,
            item.diameter || 0
          ),
        },
      ],
    })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        return {
          ...updated,
          totalPrice: calculateItemPrice(
            updated.unitPrice,
            updated.quantity,
            updated.workingHeight || 0,
            updated.diameter || 0
          ),
        };
      }),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  // Labor Costs
  addLaborCost: (cost) =>
    set((state) => ({
      laborCosts: [
        ...state.laborCosts,
        {
          ...cost,
          id: generateId(),
          quotationId: '',
          totalCost: cost.dailyRate * cost.daysWorked * cost.quantity,
        },
      ],
    })),
  updateLaborCost: (id, updates) =>
    set((state) => ({
      laborCosts: state.laborCosts.map((cost) => {
        if (cost.id !== id) return cost;
        const updated = { ...cost, ...updates };
        return {
          ...updated,
          totalCost: updated.dailyRate * updated.daysWorked * updated.quantity,
        };
      }),
    })),
  removeLaborCost: (id) =>
    set((state) => ({
      laborCosts: state.laborCosts.filter((cost) => cost.id !== id),
    })),

  // Logistics Costs
  addLogisticsCost: (cost) =>
    set((state) => ({
      logisticsCosts: [
        ...state.logisticsCosts,
        {
          ...cost,
          id: generateId(),
          quotationId: '',
          totalCost: cost.unitCost * cost.quantity,
        },
      ],
    })),
  updateLogisticsCost: (id, updates) =>
    set((state) => ({
      logisticsCosts: state.logisticsCosts.map((cost) => {
        if (cost.id !== id) return cost;
        const updated = { ...cost, ...updates };
        return {
          ...updated,
          totalCost: updated.unitCost * updated.quantity,
        };
      }),
    })),
  removeLogisticsCost: (id) =>
    set((state) => ({
      logisticsCosts: state.logisticsCosts.filter((cost) => cost.id !== id),
    })),

  // Material Costs
  addMaterialCost: (cost) =>
    set((state) => ({
      materialCosts: [
        ...state.materialCosts,
        {
          ...cost,
          id: generateId(),
          quotationId: '',
          totalCost: cost.unitCost * cost.quantity,
        },
      ],
    })),
  updateMaterialCost: (id, updates) =>
    set((state) => ({
      materialCosts: state.materialCosts.map((cost) => {
        if (cost.id !== id) return cost;
        const updated = { ...cost, ...updates };
        return {
          ...updated,
          totalCost: updated.unitCost * updated.quantity,
        };
      }),
    })),
  removeMaterialCost: (id) =>
    set((state) => ({
      materialCosts: state.materialCosts.filter((cost) => cost.id !== id),
    })),

  // Equipment Costs
  addEquipmentCost: (cost) =>
    set((state) => ({
      equipmentCosts: [
        ...state.equipmentCosts,
        {
          ...cost,
          id: generateId(),
          quotationId: '',
          totalCost: cost.dailyRate * cost.daysUsed * cost.quantity,
        },
      ],
    })),
  updateEquipmentCost: (id, updates) =>
    set((state) => ({
      equipmentCosts: state.equipmentCosts.map((cost) => {
        if (cost.id !== id) return cost;
        const updated = { ...cost, ...updates };
        return {
          ...updated,
          totalCost: updated.dailyRate * updated.daysUsed * updated.quantity,
        };
      }),
    })),
  removeEquipmentCost: (id) =>
    set((state) => ({
      equipmentCosts: state.equipmentCosts.filter((cost) => cost.id !== id),
    })),

  // Financieros
  setMarginPercentage: (margin) => set({ marginPercentage: margin }),

  // Condiciones
  setValidityDays: (days) => set({ validityDays: days }),
  setPaymentTerms: (terms) => set({ paymentTerms: terms }),
  setNotes: (notes) => set({ notes }),

  // Cálculos
  getTotals: () => {
    const state = get();
    return calculateTotals(
      state.items,
      state.laborCosts,
      state.logisticsCosts,
      state.materialCosts,
      state.equipmentCosts,
      state.marginPercentage
    );
  },

  getRequiredDrillBits: () => {
    const state = get();
    return calculateRequiredDrillBits(state.items);
  },

  // Reset
  reset: () => set(initialState),
}));
