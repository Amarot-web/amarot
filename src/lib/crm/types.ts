// Tipos para el CRM de AMAROT

// ==================== ENUMS ====================

export type ServiceType =
  | 'perforacion_diamantina'
  | 'anclajes_quimicos'
  | 'deteccion_metales'
  | 'pruebas_anclaje'
  | 'sellos_cortafuego'
  | 'alquiler_equipos_hilti'
  | 'otro';

export type LeadSource =
  | 'contact_form'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'referral'
  | 'other';

export type ActivityType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'visit'
  | 'task'
  | 'note';

export type LeadType = 'lead' | 'opportunity';

export type Priority = 'high' | 'medium' | 'low';

export const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: '#DC2626', borderClass: 'border-l-red-500' },
  medium: { label: 'Media', color: '#F59E0B', borderClass: 'border-l-amber-500' },
  low: { label: 'Baja', color: '#22C55E', borderClass: 'border-l-green-500' },
} as const;

// ==================== LEAD STAGE ====================

export interface LeadStage {
  id: string;
  name: string;
  displayName: string;
  probability: number;
  color: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
  isOpportunity: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface DbLeadStage {
  id: string;
  name: string;
  display_name: string;
  probability: number;
  color: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
  is_opportunity: boolean;
  is_active: boolean;
  created_at: string;
}

// ==================== LOST REASON ====================

export interface LostReason {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: Date;
}

export interface DbLostReason {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

// ==================== LEAD ====================

export interface Lead {
  id: string;
  code: string;
  // Contacto
  company: string;
  contactName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  // Servicio
  serviceType: ServiceType;
  description: string | null;
  // Pipeline
  stageId: string;
  probability: number;
  expectedRevenue: number;
  dateDeadline: Date | null;
  priority: Priority | null;
  // Asignación
  userId: string | null;
  source: LeadSource;
  // Vínculos
  sourceMessageId: string | null;
  clientId: string | null;
  quotationId: string | null;
  // Cierre
  lostReasonId: string | null;
  lostNotes: string | null;
  dateClosed: Date | null;
  // Tipo (lead | opportunity)
  type: LeadType;
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  // Joins
  stage?: LeadStage;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  lostReason?: LostReason;
  // Campos calculados
  pendingActivitiesCount?: number;
  nextActivityDate?: Date | null;
}

export interface DbLead {
  id: string;
  code: string;
  company: string;
  contact_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  service_type: ServiceType;
  description: string | null;
  stage_id: string;
  probability: number;
  expected_revenue: number;
  date_deadline: string | null;
  priority: string | null;
  user_id: string | null;
  source: LeadSource;
  source_message_id: string | null;
  client_id: string | null;
  quotation_id: string | null;
  lost_reason_id: string | null;
  lost_notes: string | null;
  date_closed: string | null;
  type: LeadType;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// ==================== LEAD ACTIVITY ====================

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: ActivityType;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
  isCompleted: boolean;
  userId: string | null;
  createdAt: Date;
  createdBy: string | null;
  // Joins
  assignedTo?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface DbLeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  is_completed: boolean;
  user_id: string | null;
  created_at: string;
  created_by: string | null;
}

// ==================== LEAD NOTE ====================

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdAt: Date;
  createdBy: string | null;
  // Joins
  author?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface DbLeadNote {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
  created_by: string | null;
}

// ==================== FORM TYPES ====================

export interface LeadFormData {
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  location?: string;
  serviceType: ServiceType;
  description?: string;
  stageId?: string;
  expectedRevenue?: number;
  dateDeadline?: Date;
  userId?: string;
  source: LeadSource;
}

export interface ActivityFormData {
  activityType: ActivityType;
  title: string;
  description?: string;
  dueDate?: Date;
  userId?: string;
}

export interface NoteFormData {
  content: string;
}

export interface MarkAsLostFormData {
  lostReasonId: string;
  lostNotes?: string;
}

// ==================== QUERY OPTIONS ====================

export interface LeadQueryOptions {
  page?: number;
  limit?: number;
  stageId?: string;
  userId?: string;
  serviceType?: ServiceType;
  source?: LeadSource;
  search?: string;
  orderBy?: 'created_at' | 'updated_at' | 'expected_revenue' | 'date_deadline';
  orderDir?: 'asc' | 'desc';
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== PIPELINE SUMMARY ====================

export interface PipelineStageSummary {
  stageId: string;
  stageName: string;
  displayName: string;
  color: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
  leadCount: number;
  totalRevenue: number;
  weightedRevenue: number;
}

// ==================== LABELS ====================

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  perforacion_diamantina: 'Perforación Diamantina',
  anclajes_quimicos: 'Anclajes Químicos',
  deteccion_metales: 'Detección de Metales',
  pruebas_anclaje: 'Pruebas de Anclaje',
  sellos_cortafuego: 'Sellos Cortafuego',
  alquiler_equipos_hilti: 'Alquiler de Equipos HILTI',
  otro: 'Otro',
};

export const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  perforacion_diamantina: '#DC2626', // Rojo
  anclajes_quimicos: '#22C55E', // Verde
  deteccion_metales: '#3B82F6', // Azul
  pruebas_anclaje: '#F97316', // Naranja
  sellos_cortafuego: '#EAB308', // Amarillo
  alquiler_equipos_hilti: '#8B5CF6', // Violeta
  otro: '#6B7280', // Gris
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  contact_form: 'Formulario Web',
  whatsapp: 'WhatsApp',
  phone: 'Llamada Entrante',
  email: 'Email',
  referral: 'Referido',
  other: 'Otro',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: 'Llamada',
  email: 'Email',
  meeting: 'Reunión',
  visit: 'Visita',
  task: 'Tarea',
  note: 'Nota',
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  call: '📞',
  email: '✉️',
  meeting: '👥',
  visit: '🏗️',
  task: '✅',
  note: '📝',
};

// ==================== FASE 2: TIPOS ADICIONALES ====================

// Mensaje de contacto para conversión
export interface ContactMessage {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  serviceType: string | null;
  location: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'spam' | 'converted';
  leadId: string | null;
  convertedAt: Date | null;
  createdAt: Date;
}

export interface DbContactMessage {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service_type: string | null;
  location: string | null;
  message: string;
  status: string;
  lead_id: string | null;
  converted_at: string | null;
  created_at: string;
}

// Datos para convertir mensaje a lead
export interface ConvertMessageData {
  messageId: string;
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  location?: string;
  serviceType: ServiceType;
  description?: string;
  expectedRevenue?: number;
  userId?: string;
}

// Plantilla de email
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
}

export interface DbEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

// Regla de asignación
export interface AssignmentRule {
  id: string;
  serviceType: ServiceType;
  userId: string;
  priority: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  // Join
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface DbAssignmentRule {
  id: string;
  service_type: string;
  user_id: string;
  priority: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

// Tipos de alerta
export type AlertType =
  | 'no_contact'        // Sin contactar (48h)
  | 'overdue_activity'  // Actividad vencida
  | 'quotation_no_response' // Cotización sin respuesta (5 días)
  | 'stalled';          // Lead estancado (14 días)

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  no_contact: 'Sin contactar',
  overdue_activity: 'Actividad vencida',
  quotation_no_response: 'Cotización sin respuesta',
  stalled: 'Lead estancado',
};

export const ALERT_TYPE_COLORS: Record<AlertType, string> = {
  no_contact: '#EF4444',      // Rojo
  overdue_activity: '#F97316', // Naranja
  quotation_no_response: '#EAB308', // Amarillo
  stalled: '#8B5CF6',         // Violeta
};

export const ALERT_TYPE_ICONS: Record<AlertType, string> = {
  no_contact: '🔴',
  overdue_activity: '🟠',
  quotation_no_response: '🟡',
  stalled: '🟣',
};

// Lead con alertas
export interface LeadWithAlerts extends Lead {
  alerts: AlertType[];
}

// Cliente básico para selector
export interface ClientBasic {
  id: string;
  name: string;
  ruc: string | null;
  email: string | null;
}

// Configuración de alertas
export interface AlertSetting {
  id: string;
  setting_key: string;
  value: number;
  unit: 'hours' | 'days';
  label: string;
  description: string | null;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== MÉTRICAS CRM ====================

// Métricas principales del dashboard
export interface CRMMetrics {
  // KPIs principales
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;      // % (ganados / total cerrados)
  avgTicket: number;           // S/. promedio de ventas ganadas
  avgSalesCycle: number;       // días promedio hasta cierre
  pipelineValue: number;       // S/. valor ponderado del pipeline
  salesForecast: number;       // S/. pronóstico próximos 30 días

  // Comparación con período anterior (%)
  leadsChange: number;
  conversionChange: number;
  ticketChange: number;
  cycleChange: number;
  pipelineChange: number;

  // Período
  periodStart: Date;
  periodEnd: Date;
}

// Datos para gráfico de leads por período
export interface LeadsByPeriod {
  period: string;       // "2025-01", "2025-W02", "2025-01-15"
  periodLabel: string;  // "Ene 2025", "Sem 2", "15 Ene"
  newLeads: number;
  wonLeads: number;
  lostLeads: number;
  revenue: number;
}

// Datos para gráfico de leads por fuente
export interface LeadsBySource {
  source: LeadSource;
  sourceLabel: string;
  count: number;
  value: number;
  wonCount: number;
  conversionRate: number;
}

// Datos para gráfico de leads por servicio
export interface LeadsByService {
  serviceType: ServiceType;
  serviceLabel: string;
  count: number;
  value: number;
  wonCount: number;
  conversionRate: number;
}

// Rendimiento por vendedor
export interface UserPerformance {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  totalRevenue: number;
  avgTicket: number;
  avgCycle: number;
}

// Colores para gráficos de fuentes
export const LEAD_SOURCE_COLORS: Record<LeadSource, string> = {
  contact_form: '#3B82F6',  // Azul
  whatsapp: '#22C55E',      // Verde
  phone: '#F97316',         // Naranja
  email: '#8B5CF6',         // Violeta
  referral: '#EC4899',      // Rosa
  other: '#6B7280',         // Gris
};

// ==================== FORECAST VIEW ====================

// Columna de forecast (por mes de cierre)
export interface ForecastColumn {
  monthKey: string;       // "2025-01" o "none" para sin fecha
  monthLabel: string;     // "Enero 2025" o "Sin fecha"
  leads: Lead[];
  totalValue: number;
  weightedValue: number;
  leadCount: number;
}
