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
 * Obtiene leads agrupados por etapa (para Kanban)
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

  const { data, error } = await supabase
    .from('pipeline_summary')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('[getPipelineSummary] Error:', error);
    return [];
  }

  return (data || []).map((row) => ({
    stageId: row.stage_id,
    stageName: row.stage_name,
    displayName: row.display_name,
    color: row.color,
    position: row.position,
    isWon: row.is_won,
    isLost: row.is_lost,
    leadCount: Number(row.lead_count) || 0,
    totalRevenue: Number(row.total_revenue) || 0,
    weightedRevenue: Number(row.weighted_revenue) || 0,
  }));
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

  // Leads cerrados en período actual (para conversión y ciclo)
  const { data: closedCurrent } = await supabase
    .from('leads')
    .select('id, expected_revenue, stage_id, created_at, date_closed')
    .gte('date_closed', dateFrom.toISOString())
    .lte('date_closed', dateTo.toISOString())
    .in('stage_id', closedStageIds);

  // Leads cerrados en período anterior
  const { data: closedPrev } = await supabase
    .from('leads')
    .select('id, expected_revenue, stage_id, created_at, date_closed')
    .gte('date_closed', prevDateFrom.toISOString())
    .lte('date_closed', prevDateTo.toISOString())
    .in('stage_id', closedStageIds);

  // Leads activos (no cerrados) - para pipeline value
  const { data: activeLeads } = await supabase
    .from('leads')
    .select('id, expected_revenue, probability')
    .not('stage_id', 'in', `(${closedStageIds.join(',')})`);

  // Calcular métricas período actual
  const totalLeads = currentLeads?.length || 0;
  const wonCurrent = (closedCurrent || []).filter((l) => wonStageIds.includes(l.stage_id));
  const lostCurrent = (closedCurrent || []).filter((l) => lostStageIds.includes(l.stage_id));

  const wonLeads = wonCurrent.length;
  const lostLeads = lostCurrent.length;
  const totalClosed = wonLeads + lostLeads;
  const conversionRate = totalClosed > 0 ? (wonLeads / totalClosed) * 100 : 0;

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

  // Calcular métricas período anterior para comparación
  const prevTotalLeads = prevLeads?.length || 0;
  const wonPrev = (closedPrev || []).filter((l) => wonStageIds.includes(l.stage_id));
  const lostPrev = (closedPrev || []).filter((l) => lostStageIds.includes(l.stage_id));
  const prevTotalClosed = wonPrev.length + lostPrev.length;
  const prevConversionRate = prevTotalClosed > 0 ? (wonPrev.length / prevTotalClosed) * 100 : 0;
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
    wonCount: data.wonCount,
    conversionRate: data.count > 0 ? Math.round((data.wonCount / data.count) * 100) : 0,
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

