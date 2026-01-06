// Queries para el CRM de AMAROT

import { createClient, createAdminClient } from '@/lib/supabase/server';
import type {
  Lead,
  LeadStage,
  LostReason,
  LeadActivity,
  LeadNote,
  LeadQueryOptions,
  LeadsResponse,
  PipelineStageSummary,
  DbLead,
  DbLeadStage,
  DbLostReason,
  DbLeadActivity,
  DbLeadNote,
  ClientBasic,
  AlertSetting,
  CRMMetrics,
  LeadsByPeriod,
  LeadsBySource,
  LeadsByService,
  UserPerformance,
  LeadSource,
  ServiceType,
  ForecastColumn,
} from './types';
import { LEAD_SOURCE_LABELS, SERVICE_TYPE_LABELS } from './types';

/**
 * Sanitiza input de búsqueda para prevenir inyección en queries
 */
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_\\]/g, '\\$&')
    .replace(/[(),.'":]/g, '')
    .trim()
    .slice(0, 100);
}

// ========================================
// STAGES
// ========================================

/**
 * Obtiene todas las etapas del pipeline
 */
export async function getLeadStages(): Promise<LeadStage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lead_stages')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('[getLeadStages] Error:', error);
    return [];
  }

  return (data || []).map(transformStage);
}

/**
 * Obtiene una etapa por ID
 */
export async function getLeadStageById(id: string): Promise<LeadStage | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lead_stages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return transformStage(data);
}

// ========================================
// LOST REASONS
// ========================================

/**
 * Obtiene todas las razones de pérdida
 */
export async function getLostReasons(): Promise<LostReason[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lost_reasons')
    .select('*')
    .eq('is_active', true)
    .order('display_name', { ascending: true });

  if (error) {
    console.error('[getLostReasons] Error:', error);
    return [];
  }

  return (data || []).map(transformLostReason);
}

// ========================================
// LEADS
// ========================================

/**
 * Obtiene leads con filtros y paginación
 */
export async function getLeads(
  options: LeadQueryOptions = {}
): Promise<LeadsResponse> {
  const supabase = createAdminClient();
  const {
    page = 1,
    limit = 50,
    stageId,
    userId,
    serviceType,
    source,
    search,
    orderBy = 'created_at',
    orderDir = 'desc',
  } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('leads')
    .select(
      `
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url),
      lost_reason:lost_reasons(*)
    `,
      { count: 'exact' }
    )
    .order(orderBy, { ascending: orderDir === 'asc' })
    .range(offset, offset + limit - 1);

  if (stageId) {
    query = query.eq('stage_id', stageId);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (serviceType) {
    query = query.eq('service_type', serviceType);
  }

  if (source) {
    query = query.eq('source', source);
  }

  if (search) {
    const sanitized = sanitizeSearchInput(search);
    if (sanitized) {
      query = query.or(
        `company.ilike.%${sanitized}%,contact_name.ilike.%${sanitized}%,code.ilike.%${sanitized}%`
      );
    }
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[getLeads] Error:', error);
    return { leads: [], total: 0, page, limit, totalPages: 0 };
  }

  const leads = transformLeads(data || []);
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { leads, total, page, limit, totalPages };
}

/**
 * Obtiene leads agrupados por etapa (para Kanban Pipeline)
 * Excluye leads perdidos (lost_reason_id IS NOT NULL)
 */
export async function getLeadsByStage(): Promise<Map<string, Lead[]>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads')
    .select(
      `
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url)
    `
    )
    .is('lost_reason_id', null) // Excluir perdidos
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getLeadsByStage] Error:', error);
    return new Map();
  }

  const leads = transformLeads(data || []);
  const grouped = new Map<string, Lead[]>();

  for (const lead of leads) {
    const stageId = lead.stageId;
    if (!grouped.has(stageId)) {
      grouped.set(stageId, []);
    }
    grouped.get(stageId)!.push(lead);
  }

  return grouped;
}

/**
 * Obtiene leads PERDIDOS agrupados por etapa (para vista Perdidas)
 * Solo incluye leads con lost_reason_id IS NOT NULL
 */
export async function getLostLeadsByStage(): Promise<Map<string, Lead[]>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads')
    .select(
      `
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url),
      lost_reason:lost_reasons(*)
    `
    )
    .not('lost_reason_id', 'is', null) // Solo perdidos
    .order('date_closed', { ascending: false });

  if (error) {
    console.error('[getLostLeadsByStage] Error:', error);
    return new Map();
  }

  const leads = transformLeads(data || []);
  const grouped = new Map<string, Lead[]>();

  for (const lead of leads) {
    const stageId = lead.stageId;
    if (!grouped.has(stageId)) {
      grouped.set(stageId, []);
    }
    grouped.get(stageId)!.push(lead);
  }

  return grouped;
}

/**
 * Obtiene un lead por ID
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads')
    .select(
      `
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url),
      lost_reason:lost_reasons(*)
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return transformLead(data);
}

/**
 * Obtiene un lead por código
 */
export async function getLeadByCode(code: string): Promise<Lead | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads')
    .select(
      `
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url),
      lost_reason:lost_reasons(*)
    `
    )
    .eq('code', code)
    .single();

  if (error || !data) return null;

  return transformLead(data);
}

// ========================================
// ACTIVITIES
// ========================================

/**
 * Obtiene actividades de un lead
 */
export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('lead_activities')
    .select(
      `
      *,
      assigned_to:user_profiles!lead_activities_user_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getLeadActivities] Error:', error);
    return [];
  }

  return (data || []).map(transformActivity);
}

/**
 * Obtiene actividades pendientes (para alertas)
 */
export async function getPendingActivities(userId?: string): Promise<LeadActivity[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from('lead_activities')
    .select(
      `
      *,
      assigned_to:user_profiles!lead_activities_user_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq('is_completed', false)
    .order('due_date', { ascending: true });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getPendingActivities] Error:', error);
    return [];
  }

  return (data || []).map(transformActivity);
}

// ========================================
// NOTES
// ========================================

/**
 * Obtiene notas de un lead
 */
export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('lead_notes')
    .select(
      `
      *,
      author:user_profiles!lead_notes_created_by_fkey(id, full_name, avatar_url)
    `
    )
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getLeadNotes] Error:', error);
    return [];
  }

  return (data || []).map(transformNote);
}

// ========================================
// PIPELINE SUMMARY
// ========================================

/**
 * Obtiene resumen del pipeline por etapa
 */
export async function getPipelineSummary(): Promise<PipelineStageSummary[]> {
  const supabase = createAdminClient();

  // Obtener etapas activas
  const { data: stages, error: stagesError } = await supabase
    .from('lead_stages')
    .select('id, name, display_name, color, position, probability, is_won, is_lost')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (stagesError || !stages) {
    console.error('[getPipelineSummary] Error:', stagesError);
    return [];
  }

  // Obtener leads activos (sin lost_reason_id)
  const { data: leads } = await supabase
    .from('leads')
    .select('id, stage_id, expected_revenue, probability')
    .is('lost_reason_id', null);

  // Agrupar leads por etapa
  const leadsByStage = new Map<string, { count: number; revenue: number; weighted: number }>();
  for (const lead of leads || []) {
    if (!leadsByStage.has(lead.stage_id)) {
      leadsByStage.set(lead.stage_id, { count: 0, revenue: 0, weighted: 0 });
    }
    const group = leadsByStage.get(lead.stage_id)!;
    const revenue = Number(lead.expected_revenue) || 0;
    const prob = Number(lead.probability) || 0;
    group.count++;
    group.revenue += revenue;
    group.weighted += revenue * (prob / 100);
  }

  return stages.map((stage) => {
    const stats = leadsByStage.get(stage.id) || { count: 0, revenue: 0, weighted: 0 };
    return {
      stageId: stage.id,
      stageName: stage.name,
      displayName: stage.display_name,
      color: stage.color,
      position: stage.position,
      isWon: stage.is_won,
      isLost: stage.is_lost,
      leadCount: stats.count,
      totalRevenue: stats.revenue,
      weightedRevenue: Math.round(stats.weighted),
    };
  });
}

// ========================================
// TEAM MEMBERS (for assignment)
// ========================================

/**
 * Obtiene miembros del equipo para asignación
 */
export async function getTeamMembers(): Promise<Array<{ id: string; fullName: string; email: string; avatarUrl: string | null }>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, avatar_url')
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('[getTeamMembers] Error:', error);
    return [];
  }

  return (data || []).map((u) => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    avatarUrl: u.avatar_url,
  }));
}

// ========================================
// TRANSFORMERS
// ========================================

interface DbLeadWithRelations extends DbLead {
  stage?: DbLeadStage;
  assigned_to?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  lost_reason?: DbLostReason | null;
}

interface DbActivityWithRelations extends DbLeadActivity {
  assigned_to?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface DbNoteWithRelations extends DbLeadNote {
  author?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

function transformStage(data: DbLeadStage): LeadStage {
  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    probability: data.probability,
    color: data.color,
    position: data.position,
    isWon: data.is_won,
    isLost: data.is_lost,
    isOpportunity: data.is_opportunity ?? false,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
  };
}

function transformLostReason(data: DbLostReason): LostReason {
  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
  };
}

function transformLead(data: DbLeadWithRelations): Lead {
  return {
    id: data.id,
    code: data.code,
    company: data.company,
    contactName: data.contact_name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    serviceType: data.service_type,
    description: data.description,
    stageId: data.stage_id,
    probability: data.probability,
    expectedRevenue: Number(data.expected_revenue) || 0,
    dateDeadline: data.date_deadline ? new Date(data.date_deadline) : null,
    priority: data.priority as Lead['priority'],
    userId: data.user_id,
    source: data.source,
    sourceMessageId: data.source_message_id,
    clientId: data.client_id,
    quotationId: data.quotation_id,
    lostReasonId: data.lost_reason_id,
    lostNotes: data.lost_notes,
    dateClosed: data.date_closed ? new Date(data.date_closed) : null,
    type: data.type ?? 'lead',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    createdBy: data.created_by,
    stage: data.stage ? transformStage(data.stage) : undefined,
    assignedTo: data.assigned_to
      ? {
          id: data.assigned_to.id,
          fullName: data.assigned_to.full_name,
          email: data.assigned_to.email,
          avatarUrl: data.assigned_to.avatar_url,
        }
      : undefined,
    lostReason: data.lost_reason
      ? transformLostReason(data.lost_reason)
      : undefined,
  };
}

function transformLeads(data: DbLeadWithRelations[]): Lead[] {
  return data.map(transformLead);
}

function transformActivity(data: DbActivityWithRelations): LeadActivity {
  return {
    id: data.id,
    leadId: data.lead_id,
    activityType: data.activity_type,
    title: data.title,
    description: data.description,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    completedAt: data.completed_at ? new Date(data.completed_at) : null,
    isCompleted: data.is_completed,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
    createdBy: data.created_by,
    assignedTo: data.assigned_to
      ? {
          id: data.assigned_to.id,
          fullName: data.assigned_to.full_name,
          avatarUrl: data.assigned_to.avatar_url,
        }
      : undefined,
  };
}

function transformNote(data: DbNoteWithRelations): LeadNote {
  return {
    id: data.id,
    leadId: data.lead_id,
    content: data.content,
    createdAt: new Date(data.created_at),
    createdBy: data.created_by,
    author: data.author
      ? {
          id: data.author.id,
          fullName: data.author.full_name,
          avatarUrl: data.author.avatar_url,
        }
      : undefined,
  };
}

// ========================================
// FASE 2: FUNCIONES ADICIONALES
// ========================================

/**
 * Normaliza un teléfono para comparación
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Eliminar todo excepto números
  let normalized = phone.replace(/[^0-9]/g, '');
  // Eliminar prefijo 51 (Perú)
  if (normalized.length > 9 && normalized.startsWith('51')) {
    normalized = normalized.substring(2);
  }
  // Eliminar 0 inicial
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  return normalized;
}

/**
 * Busca leads duplicados por email o teléfono
 */
export async function findDuplicateLeads(
  email?: string,
  phone?: string
): Promise<Lead[]> {
  if (!email && !phone) return [];

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[findDuplicateLeads] Error:', error);
    return [];
  }

  const normalizedPhone = phone ? normalizePhone(phone) : '';
  const normalizedEmail = email?.toLowerCase().trim() || '';

  // Filtrar por coincidencias
  const matches = (data || []).filter((lead) => {
    // Coincidencia por email
    if (normalizedEmail && lead.email?.toLowerCase().trim() === normalizedEmail) {
      return true;
    }
    // Coincidencia por teléfono
    if (normalizedPhone && lead.phone) {
      const leadPhone = normalizePhone(lead.phone);
      if (leadPhone && leadPhone.includes(normalizedPhone.slice(-9))) {
        return true;
      }
    }
    return false;
  });

  return transformLeads(matches);
}

/**
 * Obtiene clientes para el selector
 */
export async function getClients(): Promise<Array<{ id: string; name: string; ruc: string | null; email: string | null }>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, ruc, contact_email')
    .order('company_name', { ascending: true });

  if (error) {
    console.error('[getClients] Error:', error);
    return [];
  }

  // Mapear a la estructura esperada por el formulario
  return (data || []).map(client => ({
    id: client.id,
    name: client.company_name,
    ruc: client.ruc || null,
    email: client.contact_email || null,
  }));
}

/**
 * Obtiene plantillas de email activas
 */
export async function getEmailTemplates(): Promise<Array<{
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
}>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('email_templates')
    .select('id, name, subject, body, variables, category')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('[getEmailTemplates] Error:', error);
    return [];
  }

  return (data || []).map((t) => ({
    ...t,
    variables: Array.isArray(t.variables) ? t.variables : [],
  }));
}

/**
 * Obtiene regla de asignación por tipo de servicio
 */
export async function getAssignmentRule(serviceType: string): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('assignment_rules')
    .select('user_id')
    .eq('service_type', serviceType)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.user_id;
}

/**
 * Obtiene todas las reglas de asignación
 */
export async function getAssignmentRules(): Promise<Array<{
  id: string;
  serviceType: string;
  userId: string;
  userName: string;
  priority: number;
  isActive: boolean;
}>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('assignment_rules')
    .select(`
      id,
      service_type,
      user_id,
      priority,
      is_active,
      user:user_profiles!assignment_rules_user_id_fkey(full_name)
    `)
    .order('service_type', { ascending: true });

  if (error) {
    console.error('[getAssignmentRules] Error:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((r: any) => ({
    id: r.id,
    serviceType: r.service_type,
    userId: r.user_id,
    userName: Array.isArray(r.user) ? r.user[0]?.full_name : r.user?.full_name || 'Desconocido',
    priority: r.priority,
    isActive: r.is_active,
  }));
}

/**
 * Obtiene alertas de un lead específico
 */
export async function getLeadAlerts(leadId: string): Promise<string[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('get_lead_alerts', {
    p_lead_id: leadId,
  });

  if (error) {
    console.error('[getLeadAlerts] Error:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene alertas de todos los leads activos (para el Kanban)
 */
export async function getLeadAlertsMap(): Promise<Record<string, string[]>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads_requiring_attention')
    .select('id, alerts');

  if (error) {
    console.error('[getLeadAlertsMap] Error:', error);
    return {};
  }

  // Crear mapa de leadId -> alerts
  const alertsMap: Record<string, string[]> = {};
  for (const row of data || []) {
    if (row.alerts && row.alerts.length > 0) {
      alertsMap[row.id] = row.alerts;
    }
  }

  return alertsMap;
}

/**
 * Obtiene leads que requieren atención
 */
export async function getLeadsRequiringAttention(): Promise<Array<{
  id: string;
  code: string;
  company: string;
  contactName: string;
  serviceType: string;
  stageName: string;
  assignedToName: string | null;
  alerts: string[];
  createdAt: Date;
}>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads_requiring_attention')
    .select('*')
    .order('alert_priority', { ascending: true })
    .limit(50);

  if (error) {
    console.error('[getLeadsRequiringAttention] Error:', error);
    return [];
  }

  return (data || []).map((l) => ({
    id: l.id,
    code: l.code,
    company: l.company,
    contactName: l.contact_name,
    serviceType: l.service_type,
    stageName: l.stage_name,
    assignedToName: l.assigned_to_name,
    alerts: l.alerts || [],
    createdAt: new Date(l.created_at),
  }));
}

// ========================================
// FASE 2.5: VINCULACIÓN LEAD → CLIENTE
// ========================================

/**
 * Busca clientes que coincidan por email o nombre de empresa
 */
export async function findMatchingClients(
  email?: string,
  companyName?: string
): Promise<{ matches: ClientBasic[]; all: ClientBasic[] }> {
  const supabase = createAdminClient();

  // Obtener todos los clientes activos
  const { data: allData, error: allError } = await supabase
    .from('clients')
    .select('id, company_name, ruc, contact_email')
    .order('company_name', { ascending: true });

  if (allError) {
    console.error('[findMatchingClients] Error:', allError);
    return { matches: [], all: [] };
  }

  const all: ClientBasic[] = (allData || []).map((c) => ({
    id: c.id,
    name: c.company_name,
    ruc: c.ruc || null,
    email: c.contact_email || null,
  }));

  // Buscar coincidencias
  const matches: ClientBasic[] = [];
  const normalizedEmail = email?.toLowerCase().trim() || '';
  const normalizedCompany = companyName?.toLowerCase().trim() || '';

  for (const client of all) {
    let isMatch = false;

    // Coincidencia por email
    if (normalizedEmail && client.email?.toLowerCase().trim() === normalizedEmail) {
      isMatch = true;
    }

    // Coincidencia parcial por nombre de empresa
    if (normalizedCompany && client.name.toLowerCase().includes(normalizedCompany)) {
      isMatch = true;
    }

    if (isMatch) {
      matches.push(client);
    }
  }

  return { matches, all };
}

/**
 * Obtiene leads cerrados (ganados o perdidos) con filtros
 */
export async function getClosedLeads(options: {
  status?: 'won' | 'lost' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  limit?: number;
} = {}): Promise<Lead[]> {
  const supabase = createAdminClient();
  const { status = 'all', dateFrom, dateTo, userId, limit = 50 } = options;

  // Obtener IDs de etapas ganadas/perdidas
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won, is_lost')
    .or('is_won.eq.true,is_lost.eq.true');

  if (!stagesData || stagesData.length === 0) {
    return [];
  }

  const wonStageIds = stagesData.filter((s) => s.is_won).map((s) => s.id);
  const lostStageIds = stagesData.filter((s) => s.is_lost).map((s) => s.id);

  let targetStageIds: string[] = [];
  if (status === 'won') {
    targetStageIds = wonStageIds;
  } else if (status === 'lost') {
    targetStageIds = lostStageIds;
  } else {
    targetStageIds = [...wonStageIds, ...lostStageIds];
  }

  if (targetStageIds.length === 0) {
    return [];
  }

  let query = supabase
    .from('leads')
    .select(`
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url),
      lost_reason:lost_reasons(*)
    `)
    .in('stage_id', targetStageIds)
    .order('date_closed', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (dateFrom) {
    query = query.gte('date_closed', dateFrom.toISOString());
  }

  if (dateTo) {
    query = query.lte('date_closed', dateTo.toISOString());
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getClosedLeads] Error:', error);
    return [];
  }

  return transformLeads(data || []);
}

// ========================================
// CONFIGURACIÓN DE ALERTAS
// ========================================

/**
 * Obtiene todas las configuraciones de alertas
 */
export async function getAlertSettings(): Promise<AlertSetting[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('crm_alert_settings')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('[getAlertSettings] Error:', error);
    return [];
  }

  return (data || []).map((s) => ({
    id: s.id,
    setting_key: s.setting_key,
    value: s.value,
    unit: s.unit,
    label: s.label,
    description: s.description,
    position: s.position,
    is_enabled: s.is_enabled,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

/**
 * Obtiene una configuración de alerta por su clave
 */
export async function getAlertSettingByKey(
  key: string
): Promise<AlertSetting | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('crm_alert_settings')
    .select('*')
    .eq('setting_key', key)
    .single();

  if (error) {
    console.error('[getAlertSettingByKey] Error:', error);
    return null;
  }

  return data
    ? {
        id: data.id,
        setting_key: data.setting_key,
        value: data.value,
        unit: data.unit,
        label: data.label,
        description: data.description,
        position: data.position,
        is_enabled: data.is_enabled,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    : null;
}

// ========================================
// MÉTRICAS CRM
// ========================================

/**
 * Obtiene las métricas principales del CRM para un período
 */
export async function getCRMMetrics(
  dateFrom: Date,
  dateTo: Date
): Promise<CRMMetrics> {
  const supabase = createAdminClient();

  // Calcular período anterior para comparación
  const periodLength = dateTo.getTime() - dateFrom.getTime();
  const prevDateTo = new Date(dateFrom.getTime() - 1);
  const prevDateFrom = new Date(prevDateTo.getTime() - periodLength);

  // Obtener etapas ganadas/perdidas
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won, is_lost');

  const wonStageIds = (stagesData || []).filter((s) => s.is_won).map((s) => s.id);
  const lostStageIds = (stagesData || []).filter((s) => s.is_lost).map((s) => s.id);
  const closedStageIds = [...wonStageIds, ...lostStageIds];

  // Período actual: leads creados
  const { data: currentLeads } = await supabase
    .from('leads')
    .select('id, expected_revenue, stage_id, created_at, date_closed')
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString());

  // Período anterior: leads creados
  const { data: prevLeads } = await supabase
    .from('leads')
    .select('id, expected_revenue, stage_id, created_at, date_closed')
    .gte('created_at', prevDateFrom.toISOString())
    .lte('created_at', prevDateTo.toISOString());

  // Leads cerrados en período actual (ganados o perdidos)
  // Los perdidos se identifican por lost_reason_id (no por stage_id)
  const { data: closedCurrent } = await supabase
    .from('leads')
    .select('id, expected_revenue, stage_id, lost_reason_id, created_at, date_closed')
    .gte('date_closed', dateFrom.toISOString())
    .lte('date_closed', dateTo.toISOString());

  // Leads cerrados en período anterior
  const { data: closedPrev } = await supabase
    .from('leads')
    .select('id, expected_revenue, stage_id, lost_reason_id, created_at, date_closed')
    .gte('date_closed', prevDateFrom.toISOString())
    .lte('date_closed', prevDateTo.toISOString());

  // Leads activos (sin date_closed y sin lost_reason_id)
  const { data: activeLeads } = await supabase
    .from('leads')
    .select('id, expected_revenue, probability, date_deadline')
    .is('date_closed', null)
    .is('lost_reason_id', null);

  // Calcular métricas período actual
  const totalLeads = currentLeads?.length || 0;
  // Ganados: etapa con is_won = true
  const wonCurrent = (closedCurrent || []).filter((l) => wonStageIds.includes(l.stage_id));
  // Perdidos: tienen lost_reason_id (independiente de la etapa)
  const lostCurrent = (closedCurrent || []).filter((l) => l.lost_reason_id !== null);

  const wonLeads = wonCurrent.length;
  const lostLeads = lostCurrent.length;
  // Tasa de conversión = Ganados / Total Leads del período
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  const totalRevenueWon = wonCurrent.reduce((sum, l) => sum + (Number(l.expected_revenue) || 0), 0);
  const avgTicket = wonLeads > 0 ? totalRevenueWon / wonLeads : 0;

  // Ciclo de venta promedio (días desde creación hasta cierre para ganados)
  let avgSalesCycle = 0;
  if (wonCurrent.length > 0) {
    const cycles = wonCurrent
      .filter((l) => l.date_closed && l.created_at)
      .map((l) => {
        const created = new Date(l.created_at).getTime();
        const closed = new Date(l.date_closed!).getTime();
        return (closed - created) / (1000 * 60 * 60 * 24); // días
      });
    avgSalesCycle = cycles.length > 0 ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;
  }

  // Valor del pipeline (leads activos × probabilidad)
  const pipelineValue = (activeLeads || []).reduce(
    (sum, l) => sum + (Number(l.expected_revenue) || 0) * ((l.probability || 0) / 100),
    0
  );

  // Pronóstico de ventas: leads con fecha límite en próximos 30 días × probabilidad
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const salesForecast = (activeLeads || [])
    .filter((l) => {
      if (!l.date_deadline) return false;
      const deadline = new Date(l.date_deadline);
      return deadline >= now && deadline <= thirtyDaysLater;
    })
    .reduce(
      (sum, l) => sum + (Number(l.expected_revenue) || 0) * ((l.probability || 0) / 100),
      0
    );

  // Calcular métricas período anterior para comparación
  const prevTotalLeads = prevLeads?.length || 0;
  const wonPrev = (closedPrev || []).filter((l) => wonStageIds.includes(l.stage_id));
  const lostPrev = (closedPrev || []).filter((l) => lostStageIds.includes(l.stage_id));
  // Tasa de conversión del período anterior
  const prevConversionRate = prevTotalLeads > 0 ? (wonPrev.length / prevTotalLeads) * 100 : 0;
  const prevRevenueWon = wonPrev.reduce((sum, l) => sum + (Number(l.expected_revenue) || 0), 0);
  const prevAvgTicket = wonPrev.length > 0 ? prevRevenueWon / wonPrev.length : 0;

  let prevAvgCycle = 0;
  if (wonPrev.length > 0) {
    const cycles = wonPrev
      .filter((l) => l.date_closed && l.created_at)
      .map((l) => {
        const created = new Date(l.created_at).getTime();
        const closed = new Date(l.date_closed!).getTime();
        return (closed - created) / (1000 * 60 * 60 * 24);
      });
    prevAvgCycle = cycles.length > 0 ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;
  }

  // Calcular cambios porcentuales
  const leadsChange = prevTotalLeads > 0 ? ((totalLeads - prevTotalLeads) / prevTotalLeads) * 100 : 0;
  const conversionChange = prevConversionRate > 0 ? conversionRate - prevConversionRate : 0;
  const ticketChange = prevAvgTicket > 0 ? ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100 : 0;
  const cycleChange = prevAvgCycle > 0 ? avgSalesCycle - prevAvgCycle : 0;

  return {
    totalLeads,
    activeLeads: activeLeads?.length || 0,
    wonLeads,
    lostLeads,
    conversionRate: Math.round(conversionRate * 10) / 10,
    avgTicket: Math.round(avgTicket),
    avgSalesCycle: Math.round(avgSalesCycle),
    pipelineValue: Math.round(pipelineValue),
    salesForecast: Math.round(salesForecast),
    leadsChange: Math.round(leadsChange),
    conversionChange: Math.round(conversionChange * 10) / 10,
    ticketChange: Math.round(ticketChange),
    cycleChange: Math.round(cycleChange),
    pipelineChange: 0, // No calculamos cambio de pipeline histórico
    periodStart: dateFrom,
    periodEnd: dateTo,
  };
}

/**
 * Obtiene leads agrupados por período para gráfico temporal
 */
export async function getLeadsByPeriod(
  groupBy: 'day' | 'week' | 'month',
  dateFrom: Date,
  dateTo: Date
): Promise<LeadsByPeriod[]> {
  const supabase = createAdminClient();

  // Obtener etapas ganadas/perdidas
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won, is_lost');

  const wonStageIds = (stagesData || []).filter((s) => s.is_won).map((s) => s.id);
  const lostStageIds = (stagesData || []).filter((s) => s.is_lost).map((s) => s.id);

  // Obtener todos los leads en el rango
  const { data: leads } = await supabase
    .from('leads')
    .select('id, expected_revenue, stage_id, created_at, date_closed')
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString());

  if (!leads || leads.length === 0) {
    return [];
  }

  // Agrupar por período
  const groups = new Map<string, { newLeads: number; wonLeads: number; lostLeads: number; revenue: number }>();

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  for (const lead of leads) {
    const created = new Date(lead.created_at);
    let periodKey: string;
    let periodLabel: string;

    if (groupBy === 'day') {
      periodKey = created.toISOString().slice(0, 10);
      periodLabel = `${created.getDate()} ${monthNames[created.getMonth()]}`;
    } else if (groupBy === 'week') {
      // Calcular inicio de semana (lunes)
      const day = created.getDay();
      const diff = created.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(created.setDate(diff));
      periodKey = weekStart.toISOString().slice(0, 10);
      periodLabel = `Sem ${periodKey.slice(8, 10)}/${periodKey.slice(5, 7)}`;
    } else {
      periodKey = created.toISOString().slice(0, 7);
      periodLabel = `${monthNames[created.getMonth()]} ${created.getFullYear()}`;
    }

    if (!groups.has(periodKey)) {
      groups.set(periodKey, { newLeads: 0, wonLeads: 0, lostLeads: 0, revenue: 0 });
    }

    const group = groups.get(periodKey)!;
    group.newLeads++;

    if (wonStageIds.includes(lead.stage_id)) {
      group.wonLeads++;
      group.revenue += Number(lead.expected_revenue) || 0;
    } else if (lostStageIds.includes(lead.stage_id)) {
      group.lostLeads++;
    }
  }

  // Convertir a array ordenado
  const result: LeadsByPeriod[] = Array.from(groups.entries())
    .map(([period, data]) => {
      const date = new Date(period);
      let periodLabel: string;

      if (groupBy === 'day') {
        periodLabel = `${date.getDate()} ${monthNames[date.getMonth()]}`;
      } else if (groupBy === 'week') {
        periodLabel = `Sem ${period.slice(8, 10)}/${period.slice(5, 7)}`;
      } else {
        periodLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      }

      return {
        period,
        periodLabel,
        ...data,
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));

  return result;
}

/**
 * Obtiene leads agrupados por fuente
 */
export async function getLeadsBySource(
  dateFrom?: Date,
  dateTo?: Date
): Promise<LeadsBySource[]> {
  const supabase = createAdminClient();

  // Obtener etapas ganadas
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won');

  const wonStageIds = (stagesData || []).filter((s) => s.is_won).map((s) => s.id);

  // Query base
  let query = supabase
    .from('leads')
    .select('id, source, expected_revenue, stage_id');

  if (dateFrom) {
    query = query.gte('created_at', dateFrom.toISOString());
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo.toISOString());
  }

  const { data: leads } = await query;

  if (!leads || leads.length === 0) {
    return [];
  }

  // Agrupar por fuente
  const groups = new Map<LeadSource, { count: number; value: number; wonCount: number }>();

  for (const lead of leads) {
    const source = lead.source as LeadSource;
    if (!groups.has(source)) {
      groups.set(source, { count: 0, value: 0, wonCount: 0 });
    }

    const group = groups.get(source)!;
    group.count++;
    group.value += Number(lead.expected_revenue) || 0;

    if (wonStageIds.includes(lead.stage_id)) {
      group.wonCount++;
    }
  }

  return Array.from(groups.entries()).map(([source, data]) => ({
    source,
    sourceLabel: LEAD_SOURCE_LABELS[source] || source,
    count: data.count,
    value: data.value,
    wonCount: data.wonCount,
    conversionRate: data.count > 0 ? Math.round((data.wonCount / data.count) * 100) : 0,
  }));
}

/**
 * Obtiene leads agrupados por fuente SOLO del pipeline activo
 * (excluye ganados y perdidos)
 */
export async function getSourcePipeline(): Promise<LeadsBySource[]> {
  const supabase = createAdminClient();

  // Obtener etapas activas (no won, no lost)
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won, is_lost');

  const activeStageIds = (stagesData || [])
    .filter((s) => !s.is_won && !s.is_lost)
    .map((s) => s.id);

  if (activeStageIds.length === 0) {
    return [];
  }

  // Query solo leads en etapas activas Y sin lost_reason_id
  const { data: leads } = await supabase
    .from('leads')
    .select('id, source, expected_revenue')
    .in('stage_id', activeStageIds)
    .is('lost_reason_id', null);

  if (!leads || leads.length === 0) {
    return [];
  }

  // Agrupar por fuente
  const groups = new Map<LeadSource, { count: number; value: number }>();

  for (const lead of leads) {
    const source = lead.source as LeadSource;
    if (!groups.has(source)) {
      groups.set(source, { count: 0, value: 0 });
    }

    const group = groups.get(source)!;
    group.count++;
    group.value += Number(lead.expected_revenue) || 0;
  }

  return Array.from(groups.entries()).map(([source, data]) => ({
    source,
    sourceLabel: LEAD_SOURCE_LABELS[source] || source,
    count: data.count,
    value: data.value,
    wonCount: 0, // No aplica para pipeline activo
    conversionRate: 0, // No aplica para pipeline activo
  }));
}

/**
 * Obtiene leads agrupados por tipo de servicio
 */
export async function getLeadsByService(
  dateFrom?: Date,
  dateTo?: Date
): Promise<LeadsByService[]> {
  const supabase = createAdminClient();

  // Obtener etapas ganadas
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won');

  const wonStageIds = (stagesData || []).filter((s) => s.is_won).map((s) => s.id);

  // Query base
  let query = supabase
    .from('leads')
    .select('id, service_type, expected_revenue, stage_id');

  if (dateFrom) {
    query = query.gte('created_at', dateFrom.toISOString());
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo.toISOString());
  }

  const { data: leads } = await query;

  if (!leads || leads.length === 0) {
    return [];
  }

  // Agrupar por servicio
  const groups = new Map<ServiceType, { count: number; value: number; wonCount: number }>();

  for (const lead of leads) {
    const serviceType = lead.service_type as ServiceType;
    if (!groups.has(serviceType)) {
      groups.set(serviceType, { count: 0, value: 0, wonCount: 0 });
    }

    const group = groups.get(serviceType)!;
    group.count++;
    group.value += Number(lead.expected_revenue) || 0;

    if (wonStageIds.includes(lead.stage_id)) {
      group.wonCount++;
    }
  }

  return Array.from(groups.entries()).map(([serviceType, data]) => ({
    serviceType,
    serviceLabel: SERVICE_TYPE_LABELS[serviceType] || serviceType,
    count: data.count,
    value: data.value,
    weightedValue: 0, // No calculado en esta función
    wonCount: data.wonCount,
    conversionRate: data.count > 0 ? Math.round((data.wonCount / data.count) * 100) : 0,
  }));
}

/**
 * Obtiene leads agrupados por tipo de servicio SOLO del pipeline activo
 * (excluye ganados y perdidos)
 */
export async function getServiceTypePipeline(): Promise<LeadsByService[]> {
  const supabase = createAdminClient();

  // Obtener etapas activas (no won, no lost) con su probabilidad
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, probability, is_won, is_lost');

  const activeStages = (stagesData || []).filter((s) => !s.is_won && !s.is_lost);
  const activeStageIds = activeStages.map((s) => s.id);
  const stageProbability = new Map(activeStages.map((s) => [s.id, s.probability / 100]));

  if (activeStageIds.length === 0) {
    return [];
  }

  // Query solo leads en etapas activas Y sin lost_reason_id
  const { data: leads } = await supabase
    .from('leads')
    .select('id, service_type, expected_revenue, stage_id')
    .in('stage_id', activeStageIds)
    .is('lost_reason_id', null);

  if (!leads || leads.length === 0) {
    return [];
  }

  // Agrupar por servicio
  const groups = new Map<ServiceType, { count: number; value: number; weightedValue: number }>();

  for (const lead of leads) {
    const serviceType = lead.service_type as ServiceType;
    if (!groups.has(serviceType)) {
      groups.set(serviceType, { count: 0, value: 0, weightedValue: 0 });
    }

    const group = groups.get(serviceType)!;
    const revenue = Number(lead.expected_revenue) || 0;
    const probability = stageProbability.get(lead.stage_id) || 0;

    group.count++;
    group.value += revenue;
    group.weightedValue += revenue * probability;
  }

  return Array.from(groups.entries()).map(([serviceType, data]) => ({
    serviceType,
    serviceLabel: SERVICE_TYPE_LABELS[serviceType] || serviceType,
    count: data.count,
    value: data.value,
    weightedValue: Math.round(data.weightedValue),
    wonCount: 0, // No aplica para pipeline activo
    conversionRate: 0, // No aplica para pipeline activo
  }));
}

/**
 * Obtiene rendimiento por vendedor
 */
export async function getUserPerformance(
  dateFrom?: Date,
  dateTo?: Date
): Promise<UserPerformance[]> {
  const supabase = createAdminClient();

  // Obtener etapas
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won, is_lost');

  const wonStageIds = (stagesData || []).filter((s) => s.is_won).map((s) => s.id);
  const lostStageIds = (stagesData || []).filter((s) => s.is_lost).map((s) => s.id);
  const closedStageIds = [...wonStageIds, ...lostStageIds];

  // Query leads
  let query = supabase
    .from('leads')
    .select('id, user_id, expected_revenue, stage_id, created_at, date_closed');

  if (dateFrom) {
    query = query.gte('created_at', dateFrom.toISOString());
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo.toISOString());
  }

  const { data: leads } = await query;

  // Obtener usuarios
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, full_name, avatar_url')
    .eq('is_active', true);

  if (!leads || !users) {
    return [];
  }

  // Crear mapa de usuarios
  const userMap = new Map(users.map((u) => [u.id, { name: u.full_name, avatarUrl: u.avatar_url }]));

  // Agrupar por usuario
  const groups = new Map<string, {
    totalLeads: number;
    activeLeads: number;
    wonLeads: number;
    lostLeads: number;
    totalRevenue: number;
    cycles: number[];
  }>();

  for (const lead of leads) {
    const userId = lead.user_id || 'unassigned';
    if (!groups.has(userId)) {
      groups.set(userId, {
        totalLeads: 0,
        activeLeads: 0,
        wonLeads: 0,
        lostLeads: 0,
        totalRevenue: 0,
        cycles: [],
      });
    }

    const group = groups.get(userId)!;
    group.totalLeads++;

    if (wonStageIds.includes(lead.stage_id)) {
      group.wonLeads++;
      group.totalRevenue += Number(lead.expected_revenue) || 0;

      // Calcular ciclo de venta
      if (lead.date_closed && lead.created_at) {
        const created = new Date(lead.created_at).getTime();
        const closed = new Date(lead.date_closed).getTime();
        group.cycles.push((closed - created) / (1000 * 60 * 60 * 24));
      }
    } else if (lostStageIds.includes(lead.stage_id)) {
      group.lostLeads++;
    } else {
      group.activeLeads++;
    }
  }

  return Array.from(groups.entries())
    .filter(([userId]) => userId !== 'unassigned')
    .map(([userId, data]) => {
      const user = userMap.get(userId);
      const totalClosed = data.wonLeads + data.lostLeads;
      return {
        userId,
        userName: user?.name || 'Usuario desconocido',
        avatarUrl: user?.avatarUrl || null,
        totalLeads: data.totalLeads,
        activeLeads: data.activeLeads,
        wonLeads: data.wonLeads,
        lostLeads: data.lostLeads,
        conversionRate: totalClosed > 0 ? Math.round((data.wonLeads / totalClosed) * 100) : 0,
        totalRevenue: Math.round(data.totalRevenue),
        avgTicket: data.wonLeads > 0 ? Math.round(data.totalRevenue / data.wonLeads) : 0,
        avgCycle: data.cycles.length > 0
          ? Math.round(data.cycles.reduce((a, b) => a + b, 0) / data.cycles.length)
          : 0,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Obtiene leads agrupados por mes de cierre previsto (para vista Forecast)
 * Incluye leads activos y ganados (excluye perdidos)
 */
export async function getLeadsByClosingMonth(): Promise<ForecastColumn[]> {
  const supabase = createAdminClient();

  // Obtener etapas para identificar perdidos
  const { data: stagesData } = await supabase
    .from('lead_stages')
    .select('id, is_won, is_lost');

  const lostStageIds = (stagesData || [])
    .filter((s) => s.is_lost)
    .map((s) => s.id);

  // Obtener leads (activos + ganados, excluir perdidos)
  let query = supabase
    .from('leads')
    .select(`
      *,
      stage:lead_stages(*),
      assigned_to:user_profiles!leads_user_id_fkey(id, full_name, email, avatar_url)
    `)
    .order('expected_revenue', { ascending: false });

  // Excluir leads perdidos
  if (lostStageIds.length > 0) {
    query = query.not('stage_id', 'in', `(${lostStageIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getLeadsByClosingMonth] Error:', error);
    return [];
  }

  const leads = transformLeads(data || []);

  // Agrupar por mes de cierre
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const groups = new Map<string, {
    leads: Lead[];
    totalValue: number;
    weightedValue: number;
  }>();

  // Inicializar grupo "none" para leads sin fecha
  groups.set('none', { leads: [], totalValue: 0, weightedValue: 0 });

  for (const lead of leads) {
    let monthKey: string;

    if (lead.dateDeadline) {
      const deadline = new Date(lead.dateDeadline);
      monthKey = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}`;
    } else {
      monthKey = 'none';
    }

    if (!groups.has(monthKey)) {
      groups.set(monthKey, { leads: [], totalValue: 0, weightedValue: 0 });
    }

    const group = groups.get(monthKey)!;
    group.leads.push(lead);
    group.totalValue += lead.expectedRevenue;
    group.weightedValue += lead.expectedRevenue * (lead.probability / 100);
  }

  // Convertir a array y ordenar por fecha
  const result: ForecastColumn[] = [];

  // Primero agregar "Sin fecha" si tiene leads
  const noDateGroup = groups.get('none');
  if (noDateGroup && noDateGroup.leads.length > 0) {
    result.push({
      monthKey: 'none',
      monthLabel: 'Sin fecha',
      leads: noDateGroup.leads,
      totalValue: Math.round(noDateGroup.totalValue),
      weightedValue: Math.round(noDateGroup.weightedValue),
      leadCount: noDateGroup.leads.length,
    });
  }

  // Luego agregar meses ordenados
  const monthKeys = Array.from(groups.keys())
    .filter((k) => k !== 'none')
    .sort();

  for (const monthKey of monthKeys) {
    const group = groups.get(monthKey)!;
    const [year, month] = monthKey.split('-');
    const monthIndex = parseInt(month, 10) - 1;

    result.push({
      monthKey,
      monthLabel: `${monthNames[monthIndex]} ${year}`,
      leads: group.leads,
      totalValue: Math.round(group.totalValue),
      weightedValue: Math.round(group.weightedValue),
      leadCount: group.leads.length,
    });
  }

  return result;
}

// ========================================
// DOCUMENTOS VINCULADOS (para detalle del lead)
// ========================================

/**
 * Info básica de un documento vinculado
 */
export interface LinkedDocument {
  type: 'message' | 'client' | 'quotation';
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  status?: string;
}

/**
 * Obtiene los documentos vinculados a un lead
 */
export async function getLinkedDocuments(lead: {
  sourceMessageId: string | null;
  clientId: string | null;
  quotationId: string | null;
}): Promise<LinkedDocument[]> {
  const supabase = createAdminClient();
  const documents: LinkedDocument[] = [];

  // Fetch en paralelo
  const [messageResult, clientResult, quotationResult] = await Promise.all([
    // Mensaje origen
    lead.sourceMessageId
      ? supabase
          .from('contact_messages')
          .select('id, name, company, status, created_at')
          .eq('id', lead.sourceMessageId)
          .single()
      : Promise.resolve({ data: null, error: null }),

    // Cliente vinculado
    lead.clientId
      ? supabase
          .from('clients')
          .select('id, company_name, ruc')
          .eq('id', lead.clientId)
          .single()
      : Promise.resolve({ data: null, error: null }),

    // Cotización vinculada
    lead.quotationId
      ? supabase
          .from('quotations')
          .select('id, code, status, total')
          .eq('id', lead.quotationId)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  // Procesar mensaje
  if (messageResult.data) {
    const msg = messageResult.data;
    const statusLabels: Record<string, string> = {
      new: 'nuevo',
      read: 'leído',
      replied: 'respondido',
      converted: 'convertido',
      spam: 'spam',
    };
    documents.push({
      type: 'message',
      id: msg.id,
      label: msg.company || msg.name,
      sublabel: `Mensaje ${statusLabels[msg.status] || msg.status}`,
      href: `/panel/mensajes?highlight=${msg.id}`,
      status: msg.status,
    });
  }

  // Procesar cliente
  if (clientResult.data) {
    const client = clientResult.data;
    documents.push({
      type: 'client',
      id: client.id,
      label: client.company_name,
      sublabel: client.ruc ? `RUC: ${client.ruc}` : undefined,
      href: `/panel/clientes/${client.id}`,
    });
  }

  // Procesar cotización
  if (quotationResult.data) {
    const quot = quotationResult.data;
    const statusLabels: Record<string, string> = {
      draft: 'borrador',
      sent: 'enviada',
      approved: 'aprobada',
      rejected: 'rechazada',
    };
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0,
      }).format(amount);

    documents.push({
      type: 'quotation',
      id: quot.id,
      label: quot.code,
      sublabel: `${statusLabels[quot.status] || quot.status} • ${formatCurrency(Number(quot.total) || 0)}`,
      href: `/panel/cotizador/${quot.id}`,
      status: quot.status,
    });
  }

  return documents;
}

