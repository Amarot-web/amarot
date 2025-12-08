// Tipos para el Sistema de Cotización AMAROT
// Basado en el análisis de cotizaciones reales + mejoras de Odoo

// ==================== ENUMS ====================

export type QuotationType = 'small' | 'large';

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export type ServiceType =
  | 'perforation'      // Perforación diamantina
  | 'anchors'          // Anclajes químicos
  | 'firestop'         // Protección contra fuego
  | 'detection'        // Detección de instalaciones
  | 'equipment_rental'; // Alquiler de equipos

export type WorkerRole = 'leader' | 'operator' | 'helper';

export type LogisticsType = 'food' | 'lodging' | 'transport' | 'fuel' | 'other';

export type MaterialType = 'drill_bits' | 'anchors' | 'chemicals' | 'ppe' | 'other';

export type EquipmentType = 'drill' | 'generator' | 'scanner' | 'vehicle' | 'other';

export type ItemDisplayType = 'product' | 'section' | 'note';

export type Currency = 'PEN' | 'USD';

// ==================== ENTIDADES PRINCIPALES ====================

export interface Client {
  id: string;
  companyName: string;
  ruc: string | null;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quotation {
  id: string;
  code: string;                          // COT-2025-0001
  clientId: string;
  type: QuotationType;
  status: QuotationStatus;

  // Duración del proyecto
  durationDays: number;
  durationMonths: number | null;         // Para proyectos grandes

  // Financieros
  subtotal: number;                      // Costo + margen (sin IGV)
  marginPercentage: number;              // 50-70%
  marginAmount: number;                  // Calculated
  igv: number;                           // 18%
  total: number;
  currency: Currency;

  // Condiciones
  validityDays: number;                  // Días de vigencia
  validityDate: Date | null;             // Fecha de vencimiento (calculated)
  paymentTerms: string | null;           // "50% adelanto, 50% contra entrega"
  notes: string | null;                  // Términos y condiciones

  // Campos de Odoo incorporados
  origin: string | null;                 // ID de cotización origen (si es duplicada)
  clientOrderRef: string | null;         // Referencia del cliente
  locked: boolean;                       // Bloqueada para edición

  // Firma digital (Fase 2)
  signature: string | null;              // Base64
  signedBy: string | null;
  signedOn: Date | null;

  // Metadata
  createdBy: string;                     // User ID
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;

  // Relaciones (para queries con joins)
  client?: Client;
  items?: QuotationItem[];
  laborCosts?: LaborCost[];
  logisticsCosts?: LogisticsCost[];
  materialCosts?: MaterialCost[];
  equipmentCosts?: EquipmentCost[];
}

// ==================== ITEMS DE COTIZACIÓN ====================

export interface QuotationItem {
  id: string;
  quotationId: string;
  sequence: number;                      // Orden de visualización
  displayType: ItemDisplayType;          // 'product' | 'section' | 'note'

  // Datos del servicio
  serviceType: ServiceType | null;       // null para secciones/notas
  description: string;

  // Parámetros de perforación (cuando aplica)
  diameter: number | null;               // En pulgadas (3, 4, 5, 7)
  depth: number | null;                  // En cm
  workingHeight: number | null;          // En metros

  // Cantidades y precios
  quantity: number;
  unit: 'unit' | 'meter' | 'sqm' | 'hour' | 'day';
  unitPrice: number;
  totalPrice: number;                    // quantity * unitPrice
}

// ==================== COSTOS OPERATIVOS ====================

export interface LaborCost {
  id: string;
  quotationId: string;
  role: WorkerRole;
  description: string;                   // "Operario de perforación"
  quantity: number;                      // Número de trabajadores
  dailyRate: number;                     // Jornal o sueldo diario
  daysWorked: number;                    // Días de trabajo
  totalCost: number;                     // quantity * dailyRate * daysWorked

  // Para proyectos grandes
  includeBenefits: boolean;              // ¿Incluir beneficios sociales?
  benefitsPercentage: number | null;     // ~40% en Perú
}

export interface LogisticsCost {
  id: string;
  quotationId: string;
  type: LogisticsType;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface MaterialCost {
  id: string;
  quotationId: string;
  type: MaterialType;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;

  // Para brocas: vida útil
  perforationsPerUnit: number | null;    // Perforaciones por broca
}

export interface EquipmentCost {
  id: string;
  quotationId: string;
  type: EquipmentType;
  description: string;
  quantity: number;
  dailyRate: number;
  daysUsed: number;
  totalCost: number;
  isOwned: boolean;                      // true = propio, false = alquilado
}

// ==================== CATÁLOGO DE PRECIOS ====================

export interface PriceListItem {
  id: string;
  serviceType: ServiceType;
  description: string;

  // Para perforación
  diameter: number | null;               // 3, 4, 5, 7 pulgadas
  minDepth: number | null;               // cm
  maxDepth: number | null;               // cm

  basePrice: number;
  unit: 'unit' | 'meter' | 'sqm' | 'hour' | 'day';

  // Factores de ajuste
  heightFactor: Record<string, number>;  // { "0-2": 1.0, "2-4": 1.15, ... }
  volumeDiscount: Record<string, number>; // { "100": 0.05, "500": 0.10, ... }

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== HISTORIAL (AUDITORÍA) ====================

export interface QuotationHistory {
  id: string;
  quotationId: string;
  action: 'created' | 'updated' | 'sent' | 'approved' | 'rejected' | 'locked' | 'unlocked';
  changes: Record<string, { old: unknown; new: unknown }> | null;
  userId: string;
  createdAt: Date;
}

// ==================== TIPOS DE FORMULARIO ====================

export interface ClientFormData {
  companyName: string;
  ruc?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone: string;
  address?: string;
}

export interface QuotationFormData {
  clientId: string;
  type: QuotationType;
  durationDays: number;
  durationMonths?: number;
  marginPercentage: number;
  validityDays: number;
  paymentTerms?: string;
  notes?: string;
  clientOrderRef?: string;
}

export interface QuotationItemFormData {
  displayType: ItemDisplayType;
  serviceType?: ServiceType;
  description: string;
  diameter?: number;
  depth?: number;
  workingHeight?: number;
  quantity: number;
  unit: 'unit' | 'meter' | 'sqm' | 'hour' | 'day';
  unitPrice: number;
}

export interface LaborCostFormData {
  role: WorkerRole;
  description: string;
  quantity: number;
  dailyRate: number;
  daysWorked: number;
  includeBenefits?: boolean;
  benefitsPercentage?: number;
}

export interface LogisticsCostFormData {
  type: LogisticsType;
  description: string;
  quantity: number;
  unitCost: number;
}

export interface MaterialCostFormData {
  type: MaterialType;
  description: string;
  quantity: number;
  unitCost: number;
  perforationsPerUnit?: number;
}

export interface EquipmentCostFormData {
  type: EquipmentType;
  description: string;
  quantity: number;
  dailyRate: number;
  daysUsed: number;
  isOwned: boolean;
}

// ==================== TIPOS DE CÁLCULO ====================

export interface QuotationTotals {
  itemsSubtotal: number;
  laborSubtotal: number;
  logisticsSubtotal: number;
  materialsSubtotal: number;
  equipmentSubtotal: number;
  costTotal: number;                     // Suma de todos los costos
  marginAmount: number;
  subtotal: number;                      // costTotal + margin
  igv: number;
  total: number;
}

// ==================== TIPOS DE DATABASE (SUPABASE) ====================

// Tipos que coinciden con el schema de Supabase (snake_case)
export interface DbClient {
  id: string;
  company_name: string;
  ruc: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbQuotation {
  id: string;
  code: string;
  client_id: string;
  type: QuotationType;
  status: QuotationStatus;
  duration_days: number;
  duration_months: number | null;
  subtotal: number;
  margin_percentage: number;
  margin_amount: number;
  igv: number;
  total: number;
  currency: Currency;
  validity_days: number;
  validity_date: string | null;
  payment_terms: string | null;
  notes: string | null;
  origin: string | null;
  client_order_ref: string | null;
  locked: boolean;
  signature: string | null;
  signed_by: string | null;
  signed_on: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

export interface DbQuotationItem {
  id: string;
  quotation_id: string;
  sequence: number;
  display_type: ItemDisplayType;
  service_type: ServiceType | null;
  description: string;
  diameter: number | null;
  depth: number | null;
  working_height: number | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

// ==================== UTILIDADES ====================

// Convierte DB types (snake_case) a App types (camelCase)
export function dbClientToClient(db: DbClient): Client {
  return {
    id: db.id,
    companyName: db.company_name,
    ruc: db.ruc,
    contactName: db.contact_name,
    contactEmail: db.contact_email,
    contactPhone: db.contact_phone,
    address: db.address,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function clientToDbClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Omit<DbClient, 'id' | 'created_at' | 'updated_at'> {
  return {
    company_name: client.companyName,
    ruc: client.ruc,
    contact_name: client.contactName,
    contact_email: client.contactEmail,
    contact_phone: client.contactPhone,
    address: client.address,
  };
}

// Alias para compatibilidad
export const dbToClient = dbClientToClient;
export const clientToDb = clientToDbClient;

// Conversión de QuotationItem
export function quotationItemToDb(item: QuotationItem): Omit<DbQuotationItem, 'id'> {
  return {
    quotation_id: item.quotationId,
    sequence: item.sequence,
    display_type: item.displayType,
    service_type: item.serviceType,
    description: item.description,
    diameter: item.diameter,
    depth: item.depth,
    working_height: item.workingHeight,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
  };
}

// Tipos DB para costos
export interface DbLaborCost {
  id: string;
  quotation_id: string;
  role: WorkerRole;
  description: string;
  quantity: number;
  daily_rate: number;
  days_worked: number;
  total_cost: number;
  include_benefits: boolean;
  benefits_percentage: number | null;
}

export interface DbLogisticsCost {
  id: string;
  quotation_id: string;
  type: LogisticsType;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface DbMaterialCost {
  id: string;
  quotation_id: string;
  type: MaterialType;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  perforations_per_unit: number | null;
}

export interface DbEquipmentCost {
  id: string;
  quotation_id: string;
  type: EquipmentType;
  description: string;
  quantity: number;
  daily_rate: number;
  days_used: number;
  total_cost: number;
  is_owned: boolean;
}

// Conversiones de costos
export function laborCostToDb(cost: LaborCost): Omit<DbLaborCost, 'id'> {
  return {
    quotation_id: cost.quotationId,
    role: cost.role,
    description: cost.description,
    quantity: cost.quantity,
    daily_rate: cost.dailyRate,
    days_worked: cost.daysWorked,
    total_cost: cost.totalCost,
    include_benefits: cost.includeBenefits,
    benefits_percentage: cost.benefitsPercentage,
  };
}

export function logisticsCostToDb(cost: LogisticsCost): Omit<DbLogisticsCost, 'id'> {
  return {
    quotation_id: cost.quotationId,
    type: cost.type,
    description: cost.description,
    quantity: cost.quantity,
    unit_cost: cost.unitCost,
    total_cost: cost.totalCost,
  };
}

export function materialCostToDb(cost: MaterialCost): Omit<DbMaterialCost, 'id'> {
  return {
    quotation_id: cost.quotationId,
    type: cost.type,
    description: cost.description,
    quantity: cost.quantity,
    unit_cost: cost.unitCost,
    total_cost: cost.totalCost,
    perforations_per_unit: cost.perforationsPerUnit,
  };
}

export function equipmentCostToDb(cost: EquipmentCost): Omit<DbEquipmentCost, 'id'> {
  return {
    quotation_id: cost.quotationId,
    type: cost.type,
    description: cost.description,
    quantity: cost.quantity,
    daily_rate: cost.dailyRate,
    days_used: cost.daysUsed,
    total_cost: cost.totalCost,
    is_owned: cost.isOwned,
  };
}
