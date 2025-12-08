// Lógica de cálculos para el Sistema de Cotización AMAROT
// Basado en cotizaciones reales analizadas (ROKKA, Consorcio Ríos del Norte)

import type {
  QuotationItem,
  LaborCost,
  LogisticsCost,
  MaterialCost,
  EquipmentCost,
  QuotationTotals,
} from '@/types/database';

// ==================== CONSTANTES ====================

export const IGV_RATE = 0.18; // 18% IGV Perú

// Factor de altura para perforación
// A mayor altura, mayor dificultad y precio
export const HEIGHT_FACTORS: Record<string, number> = {
  '0-2': 1.0,    // Hasta 2m: precio base
  '2-4': 1.15,   // 2-4m: +15%
  '4-6': 1.30,   // 4-6m: +30%
  '6+': 1.50,    // +6m: +50%
};

// Descuento por volumen (cantidad de perforaciones)
export const VOLUME_DISCOUNTS: Record<number, number> = {
  100: 0.05,     // 100+ perforaciones: 5% descuento
  500: 0.10,     // 500+ perforaciones: 10% descuento
  1000: 0.15,    // 1000+ perforaciones: 15% descuento
};

// Vida útil de brocas por diámetro (perforaciones por broca)
export const DRILL_BIT_LIFE: Record<number, number> = {
  3: 200,        // 3" → ~200 perforaciones
  4: 150,        // 4" → ~150 perforaciones
  5: 120,        // 5" → ~120 perforaciones
  7: 80,         // 7" → ~80 perforaciones
};

// Precios base por diámetro (referencia, deben venir del catálogo)
export const BASE_PRICES: Record<number, number> = {
  3: 90,         // S/90 por perforación 3"
  4: 100,        // S/100 por perforación 4"
  5: 110,        // S/110 por perforación 5"
  7: 230,        // S/230 por perforación 7"
};

// Costos de referencia por día-persona
export const DAILY_COSTS = {
  food: 50,      // S/50 alimentación por día
  lodging: 50,   // S/50 hospedaje por día
  transport: 600, // S/600 transporte ida/vuelta (vuelo + bus)
};

// ==================== FUNCIONES DE CÁLCULO ====================

/**
 * Obtiene el factor de altura según los metros de trabajo
 */
export function getHeightFactor(height: number): number {
  if (height <= 2) return HEIGHT_FACTORS['0-2'];
  if (height <= 4) return HEIGHT_FACTORS['2-4'];
  if (height <= 6) return HEIGHT_FACTORS['4-6'];
  return HEIGHT_FACTORS['6+'];
}

/**
 * Obtiene el descuento por volumen según cantidad
 */
export function getVolumeDiscount(quantity: number): number {
  if (quantity >= 1000) return VOLUME_DISCOUNTS[1000];
  if (quantity >= 500) return VOLUME_DISCOUNTS[500];
  if (quantity >= 100) return VOLUME_DISCOUNTS[100];
  return 0;
}

/**
 * Calcula el precio de una perforación considerando factores
 */
export function calculatePerforationPrice(
  basePrice: number,
  quantity: number,
  workingHeight: number = 0
): number {
  const heightFactor = getHeightFactor(workingHeight);
  const volumeDiscount = getVolumeDiscount(quantity);

  // Precio = Base × Factor Altura × (1 - Descuento Volumen) × Cantidad
  return basePrice * heightFactor * (1 - volumeDiscount) * quantity;
}

/**
 * Calcula el precio unitario ajustado (para mostrar en cotización)
 */
export function calculateAdjustedUnitPrice(
  basePrice: number,
  quantity: number,
  workingHeight: number = 0
): number {
  const heightFactor = getHeightFactor(workingHeight);
  const volumeDiscount = getVolumeDiscount(quantity);

  return basePrice * heightFactor * (1 - volumeDiscount);
}

/**
 * Calcula cuántas brocas se necesitan según perforaciones y diámetro
 */
export function calculateDrillBitsNeeded(
  totalPerforations: number,
  diameter: number
): number {
  const lifePerBit = DRILL_BIT_LIFE[diameter] || 100; // Default 100 si no está definido
  return Math.ceil(totalPerforations / lifePerBit);
}

/**
 * Suma el total de items de cotización
 */
export function sumItems(items: QuotationItem[]): number {
  return items
    .filter((item) => item.displayType === 'product')
    .reduce((sum, item) => sum + item.totalPrice, 0);
}

/**
 * Suma el total de costos de mano de obra
 */
export function sumLaborCosts(laborCosts: LaborCost[]): number {
  return laborCosts.reduce((sum, cost) => {
    let total = cost.totalCost;
    // Agregar beneficios sociales si aplica
    if (cost.includeBenefits && cost.benefitsPercentage) {
      total += total * (cost.benefitsPercentage / 100);
    }
    return sum + total;
  }, 0);
}

/**
 * Suma el total de costos logísticos
 */
export function sumLogisticsCosts(logisticsCosts: LogisticsCost[]): number {
  return logisticsCosts.reduce((sum, cost) => sum + cost.totalCost, 0);
}

/**
 * Suma el total de costos de materiales
 */
export function sumMaterialCosts(materialCosts: MaterialCost[]): number {
  return materialCosts.reduce((sum, cost) => sum + cost.totalCost, 0);
}

/**
 * Suma el total de costos de equipos
 */
export function sumEquipmentCosts(equipmentCosts: EquipmentCost[]): number {
  return equipmentCosts.reduce((sum, cost) => sum + cost.totalCost, 0);
}

/**
 * Calcula todos los totales de una cotización
 */
export function calculateQuotationTotals(
  items: QuotationItem[],
  laborCosts: LaborCost[],
  logisticsCosts: LogisticsCost[],
  materialCosts: MaterialCost[],
  equipmentCosts: EquipmentCost[],
  marginPercentage: number
): QuotationTotals {
  const itemsSubtotal = sumItems(items);
  const laborSubtotal = sumLaborCosts(laborCosts);
  const logisticsSubtotal = sumLogisticsCosts(logisticsCosts);
  const materialsSubtotal = sumMaterialCosts(materialCosts);
  const equipmentSubtotal = sumEquipmentCosts(equipmentCosts);

  // Costo total = suma de todos los costos
  const costTotal =
    itemsSubtotal +
    laborSubtotal +
    logisticsSubtotal +
    materialsSubtotal +
    equipmentSubtotal;

  // Margen sobre el costo
  const marginAmount = costTotal * (marginPercentage / 100);

  // Subtotal = costo + margen (base para IGV)
  const subtotal = costTotal + marginAmount;

  // IGV 18%
  const igv = subtotal * IGV_RATE;

  // Total final
  const total = subtotal + igv;

  return {
    itemsSubtotal,
    laborSubtotal,
    logisticsSubtotal,
    materialsSubtotal,
    equipmentSubtotal,
    costTotal,
    marginAmount,
    subtotal,
    igv,
    total,
  };
}

/**
 * Calcula el costo de un item de mano de obra
 */
export function calculateLaborCost(
  quantity: number,
  dailyRate: number,
  daysWorked: number,
  includeBenefits: boolean = false,
  benefitsPercentage: number = 40
): number {
  const baseCost = quantity * dailyRate * daysWorked;
  if (includeBenefits) {
    return baseCost * (1 + benefitsPercentage / 100);
  }
  return baseCost;
}

/**
 * Calcula el costo de logística (hospedaje/alimentación)
 */
export function calculateLogisticsCost(
  workers: number,
  daysWorked: number,
  dailyCostPerPerson: number
): number {
  return workers * daysWorked * dailyCostPerPerson;
}

/**
 * Calcula el costo de brocas según perforaciones
 */
export function calculateDrillBitsCost(
  totalPerforations: number,
  diameter: number,
  costPerBit: number
): number {
  const bitsNeeded = calculateDrillBitsNeeded(totalPerforations, diameter);
  return bitsNeeded * costPerBit;
}

/**
 * Calcula el costo de equipos
 */
export function calculateEquipmentCost(
  quantity: number,
  dailyRate: number,
  daysUsed: number
): number {
  return quantity * dailyRate * daysUsed;
}

// ==================== FUNCIONES DE FORMATO ====================

/**
 * Formatea un número como moneda peruana
 */
export function formatCurrency(amount: number, currency: 'PEN' | 'USD' = 'PEN'): string {
  const symbol = currency === 'PEN' ? 'S/' : '$';
  return `${symbol} ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Genera el código de cotización
 * Formato: COT-YYYY-NNNN
 */
export function generateQuotationCode(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedNumber = sequenceNumber.toString().padStart(4, '0');
  return `COT-${year}-${paddedNumber}`;
}

/**
 * Calcula la fecha de vencimiento de la cotización
 */
export function calculateValidityDate(validityDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + validityDays);
  return date;
}

// ==================== FUNCIONES DE VALIDACIÓN ====================

/**
 * Valida que el margen esté en rango aceptable
 */
export function isValidMargin(marginPercentage: number): boolean {
  return marginPercentage >= 0 && marginPercentage <= 100;
}

/**
 * Calcula el margen implícito dado precio de venta y costo
 */
export function calculateImplicitMargin(sellingPrice: number, cost: number): number {
  if (cost === 0) return 0;
  return ((sellingPrice - cost) / cost) * 100;
}

/**
 * Estima el número de trabajadores necesarios según perforaciones y días
 */
export function estimateWorkersNeeded(
  totalPerforations: number,
  durationDays: number,
  perforationsPerWorkerPerDay: number = 20
): number {
  const dailyPerforations = totalPerforations / durationDays;
  return Math.ceil(dailyPerforations / perforationsPerWorkerPerDay);
}

// ==================== FUNCIONES PARA PROYECTOS GRANDES ====================

/**
 * Estima costos para proyecto grande (como Consorcio Ríos del Norte)
 */
export function estimateLargeProjectCosts(params: {
  totalPerforations: number;
  diameter: number;
  durationMonths: number;
  workersDays: number; // días de trabajo al mes
}): {
  estimatedWorkers: number;
  estimatedBits: number;
  estimatedFood: number;
  estimatedLodging: number;
} {
  const { totalPerforations, diameter, durationMonths, workersDays } = params;
  const totalDays = durationMonths * workersDays;

  // Estimar trabajadores (20 perforaciones por día por persona)
  const estimatedWorkers = estimateWorkersNeeded(totalPerforations, totalDays, 20);

  // Estimar brocas
  const estimatedBits = calculateDrillBitsNeeded(totalPerforations, diameter);

  // Estimar alimentación (S/50 por día por persona)
  const estimatedFood = estimatedWorkers * totalDays * DAILY_COSTS.food;

  // Estimar hospedaje (S/50 por día por persona)
  const estimatedLodging = estimatedWorkers * totalDays * DAILY_COSTS.lodging;

  return {
    estimatedWorkers,
    estimatedBits,
    estimatedFood,
    estimatedLodging,
  };
}
