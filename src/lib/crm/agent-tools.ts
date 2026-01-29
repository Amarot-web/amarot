// Herramientas del Agente CRM para function calling (AI SDK v6)
import { z } from 'zod';
import {
  getLeads,
  getCRMMetrics,
  getPipelineSummary,
  getLeadsRequiringAttention,
  getTeamMembers,
  getLeadStages,
  getLeadById,
} from './queries';
import { createAdminClient } from '@/lib/supabase/server';
import { LEAD_SOURCE_LABELS, SERVICE_TYPE_LABELS, type ServiceType, type LeadSource } from './types';

// ========================================
// SCHEMAS DE PARÁMETROS
// ========================================

const getLeadsSchema = z.object({
  search: z.string().optional().describe('Texto para buscar en empresa, contacto o código'),
  stageId: z.string().optional().describe('ID de la etapa del pipeline'),
  serviceType: z.string().optional().describe('Tipo de servicio'),
  userId: z.string().optional().describe('ID del usuario asignado'),
  source: z.string().optional().describe('Fuente del lead (web, whatsapp, referido, etc.)'),
  limit: z.number().default(10).describe('Número máximo de resultados'),
});

const getLeadByIdSchema = z.object({
  id: z.string().describe('ID o código del lead'),
});

const getPendingActivitiesSchema = z.object({
  filterByUser: z.boolean().default(false).describe('SOLO true si el usuario dice "mis actividades". Por defecto false para mostrar actividades de todos.'),
  userId: z.string().optional().describe('ID del usuario asignado - SOLO si filterByUser es true'),
  leadId: z.string().optional().describe('ID del lead para filtrar sus actividades'),
  leadCode: z.string().optional().describe('Código del lead (ej: LEAD-2026-0001) para filtrar sus actividades'),
  filterByDate: z.boolean().default(false).describe('SOLO true si el usuario pide explícitamente un rango de fechas. Por defecto false para mostrar TODAS las actividades.'),
  dateFrom: z.string().optional().describe('Fecha desde (ISO) - SOLO si filterByDate es true'),
  dateTo: z.string().optional().describe('Fecha hasta (ISO) - SOLO si filterByDate es true'),
});

const getMetricsSchema = z.object({
  days: z.number().default(30).describe('Número de días hacia atrás'),
});

const emptySchema = z.object({});

const getLeadsReportSchema = z.object({
  filterByUser: z.boolean().default(false).describe('SOLO true si el usuario dice "mis leads" o menciona un nombre específico. Por defecto false para reportes generales.'),
  userId: z.string().optional().describe('ID del usuario asignado - SOLO usar si filterByUser es true'),
  groupBy: z.enum(['source', 'stage', 'both']).default('both').describe('Agrupar por origen, etapa o ambos'),
  dateFrom: z.string().optional().describe('Fecha desde (ISO) - SOLO si el usuario pide un período específico'),
  dateTo: z.string().optional().describe('Fecha hasta (ISO) - SOLO si el usuario pide un período específico'),
});

const getActivitiesReportSchema = z.object({
  userId: z.string().optional().describe('ID del usuario asignado'),
  period: z.enum(['today', 'this_week', 'this_month', 'custom']).default('this_week'),
  dateFrom: z.string().optional().describe('Fecha desde (solo si period=custom)'),
  dateTo: z.string().optional().describe('Fecha hasta (solo si period=custom)'),
});

const getPipelineValueReportSchema = z.object({
  userId: z.string().optional().describe('ID del usuario asignado'),
  stageId: z.string().optional().describe('ID de etapa específica'),
});

// Schemas para herramientas de CREACIÓN
const createLeadSchema = z.object({
  company: z.string().describe('Nombre de la empresa (requerido)'),
  contactName: z.string().describe('Nombre del contacto (requerido)'),
  source: z.enum(['contact_form', 'whatsapp', 'phone', 'email', 'referral', 'other'])
    .describe('Fuente del lead: contact_form=Formulario Web, whatsapp=WhatsApp, phone=Teléfono, email=Email, referral=Referido, other=Otro'),
  serviceType: z.enum(['perforacion_diamantina', 'anclajes_quimicos', 'deteccion_metales', 'pruebas_anclaje', 'sellos_cortafuego', 'alquiler_equipos_hilti', 'otro'])
    .describe('Tipo de servicio: perforacion_diamantina=Perforación Diamantina, anclajes_quimicos=Anclajes Químicos, deteccion_metales=Detección de Metales, pruebas_anclaje=Pruebas de Anclaje, sellos_cortafuego=Sellos Cortafuego, alquiler_equipos_hilti=Alquiler Equipos HILTI, otro=Otro'),
  email: z.string().optional().describe('Email del contacto'),
  phone: z.string().optional().describe('Teléfono del contacto'),
  location: z.string().optional().describe('Ubicación del proyecto'),
  description: z.string().optional().describe('Descripción o notas adicionales'),
  expectedRevenue: z.number().optional().describe('Valor esperado en soles (S/)'),
});

const createActivitySchema = z.object({
  leadId: z.string().describe('ID del lead al que asociar la actividad (requerido)'),
  activityType: z.enum(['call', 'email', 'meeting', 'visit', 'task', 'note'])
    .describe('Tipo de actividad: call=Llamada, email=Email, meeting=Reunión, visit=Visita, task=Tarea, note=Nota'),
  title: z.string().describe('Título de la actividad (requerido)'),
  description: z.string().optional().describe('Descripción de la actividad'),
  dueDate: z.string().optional().describe('Fecha de vencimiento (formato YYYY-MM-DD)'),
});

const updateActivitySchema = z.object({
  activityId: z.string().describe('ID de la actividad a modificar (requerido)'),
  dueDate: z.string().optional().describe('Nueva fecha de vencimiento (formato YYYY-MM-DD) - para postergar/adelantar'),
  title: z.string().optional().describe('Nuevo título de la actividad'),
  description: z.string().optional().describe('Nueva descripción'),
  isCompleted: z.boolean().optional().describe('Marcar como completada (true) o pendiente (false)'),
});

const deleteActivitySchema = z.object({
  activityId: z.string().describe('ID de la actividad a eliminar (requerido)'),
});

const updateLeadSchema = z.object({
  leadId: z.string().describe('ID del lead a modificar (requerido)'),
  company: z.string().optional().describe('Nuevo nombre de empresa'),
  contactName: z.string().optional().describe('Nuevo nombre de contacto'),
  email: z.string().optional().describe('Nuevo email'),
  phone: z.string().optional().describe('Nuevo teléfono'),
  location: z.string().optional().describe('Nueva ubicación'),
  description: z.string().optional().describe('Nueva descripción'),
  expectedRevenue: z.number().optional().describe('Nuevo valor esperado en soles'),
  priority: z.enum(['high', 'medium', 'low']).optional().describe('Nueva prioridad: high=Alta, medium=Media, low=Baja'),
});

const changeLeadStageSchema = z.object({
  leadId: z.string().describe('ID del lead (requerido)'),
  stageId: z.string().describe('ID de la nueva etapa (requerido). Usa getLeadStages para obtener los IDs disponibles.'),
});

const markLeadAsWonSchema = z.object({
  leadId: z.string().describe('ID del lead a marcar como ganado (requerido)'),
  finalRevenue: z.number().optional().describe('Valor final de la venta en soles (opcional, usa el valor esperado si no se proporciona)'),
});

const markLeadAsLostSchema = z.object({
  leadId: z.string().describe('ID del lead a marcar como perdido (requerido)'),
  lostReasonId: z.string().describe('ID del motivo de pérdida (requerido). Usa getLostReasons para ver los motivos disponibles.'),
  lostNotes: z.string().optional().describe('Notas adicionales sobre por qué se perdió'),
});

const getLostReasonsSchema = z.object({});

// ========================================
// DEFINICIÓN DE HERRAMIENTAS (Para AI SDK v6)
// ========================================

export const crmTools = {
  // Consultas básicas
  getLeads: {
    description: 'Buscar leads con filtros opcionales. Usa esto para encontrar leads específicos.',
    inputSchema: getLeadsSchema,
    execute: async (params: z.infer<typeof getLeadsSchema>) => {
      const result = await getLeads({
        search: params.search,
        stageId: params.stageId,
        serviceType: params.serviceType as ServiceType | undefined,
        userId: params.userId,
        source: params.source as LeadSource | undefined,
        limit: params.limit,
      });

      return {
        total: result.total,
        leads: result.leads.map(lead => ({
          id: lead.id,
          code: lead.code,
          company: lead.company,
          contactName: lead.contactName,
          stage: lead.stage?.displayName,
          stageStatus: lead.stage?.isWon ? 'ganado' : lead.stage?.isLost ? 'perdido' : 'activo',
          isLost: !!lead.lostReasonId || lead.stage?.isLost,
          isWon: lead.stage?.isWon,
          expectedRevenue: lead.expectedRevenue,
          probability: lead.probability,
          assignedTo: lead.assignedTo?.fullName,
          source: LEAD_SOURCE_LABELS[lead.source as keyof typeof LEAD_SOURCE_LABELS] || lead.source,
          serviceType: SERVICE_TYPE_LABELS[lead.serviceType as keyof typeof SERVICE_TYPE_LABELS] || lead.serviceType,
        })),
      };
    },
  },

  getLeadById: {
    description: 'Obtener información detallada de un lead específico por su ID o código',
    inputSchema: getLeadByIdSchema,
    execute: async ({ id }: z.infer<typeof getLeadByIdSchema>) => {
      const lead = await getLeadById(id);
      if (!lead) return { error: 'Lead no encontrado' };

      return {
        id: lead.id,
        code: lead.code,
        company: lead.company,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        location: lead.location,
        stage: lead.stage?.displayName,
        stageStatus: lead.stage?.isWon ? 'ganado' : lead.stage?.isLost ? 'perdido' : 'activo',
        isLost: !!lead.lostReasonId || lead.stage?.isLost,
        isWon: lead.stage?.isWon,
        lostNotes: lead.lostNotes,
        expectedRevenue: lead.expectedRevenue,
        probability: lead.probability,
        assignedTo: lead.assignedTo?.fullName,
        source: LEAD_SOURCE_LABELS[lead.source as keyof typeof LEAD_SOURCE_LABELS] || lead.source,
        serviceType: SERVICE_TYPE_LABELS[lead.serviceType as keyof typeof SERVICE_TYPE_LABELS] || lead.serviceType,
        description: lead.description,
        dateDeadline: lead.dateDeadline?.toISOString(),
        dateClosed: lead.dateClosed?.toISOString(),
        createdAt: lead.createdAt.toISOString(),
      };
    },
  },

  getPendingActivities: {
    description: 'Obtener actividades pendientes con información del lead asociado. Puede filtrar por usuario, lead específico y rango de fechas.',
    inputSchema: getPendingActivitiesSchema,
    execute: async (params: z.infer<typeof getPendingActivitiesSchema>) => {
      console.log('[getPendingActivities] Params recibidos:', JSON.stringify(params));
      const supabase = createAdminClient();

      // Detectar si se pasó un código de lead en lugar de UUID
      let leadIdToFilter: string | undefined;

      // Si leadId parece un código (LEAD-XXXX-XXXX), buscar por código
      if (params.leadId && params.leadId.startsWith('LEAD-')) {
        const { data: leadData } = await supabase
          .from('leads')
          .select('id')
          .eq('code', params.leadId)
          .single();
        if (leadData) {
          leadIdToFilter = leadData.id;
        }
      } else if (params.leadId) {
        // Es un UUID válido
        leadIdToFilter = params.leadId;
      }

      // Si se proporciona leadCode explícitamente
      if (params.leadCode && !leadIdToFilter) {
        const { data: leadData } = await supabase
          .from('leads')
          .select('id')
          .eq('code', params.leadCode)
          .single();
        if (leadData) {
          leadIdToFilter = leadData.id;
        }
      }

      console.log('[getPendingActivities] leadIdToFilter:', leadIdToFilter);

      // Query con join a leads para obtener código y empresa
      let query = supabase
        .from('lead_activities')
        .select(`
          id,
          lead_id,
          activity_type,
          title,
          description,
          due_date,
          is_completed,
          user_id,
          lead:leads(id, code, company, contact_name),
          assigned_to:user_profiles!lead_activities_user_id_fkey(id, full_name)
        `)
        .eq('is_completed', false)
        .order('due_date', { ascending: true });

      // Solo filtrar por userId si filterByUser es true explícitamente
      if (params.filterByUser === true && params.userId) {
        query = query.eq('user_id', params.userId);
      }

      if (leadIdToFilter) {
        query = query.eq('lead_id', leadIdToFilter);
      }

      const { data: activities, error } = await query;

      console.log('[getPendingActivities] Resultado query:', activities?.length || 0, 'actividades');
      console.log('[getPendingActivities] filterByUser:', params.filterByUser, '| filterByDate:', params.filterByDate);

      if (error) {
        console.error('[getPendingActivities Tool] Error:', error);
        return { error: 'Error al obtener actividades' };
      }

      // Solo filtrar por fechas si filterByDate es true explícitamente
      let filtered = activities || [];
      if (params.filterByDate === true) {
        if (params.dateFrom) {
          const from = new Date(params.dateFrom);
          filtered = filtered.filter(a => a.due_date && new Date(a.due_date) >= from);
        }
        if (params.dateTo) {
          const to = new Date(params.dateTo);
          filtered = filtered.filter(a => a.due_date && new Date(a.due_date) <= to);
        }
      }

      return {
        total: filtered.length,
        activities: filtered.map(a => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lead = a.lead as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const assignedTo = a.assigned_to as any;
          return {
            id: a.id,
            type: a.activity_type,
            title: a.title,
            description: a.description,
            dueDate: a.due_date,
            assignedTo: assignedTo?.full_name,
            leadId: a.lead_id,
            leadCode: lead?.code,
            leadCompany: lead?.company,
            leadContact: lead?.contact_name,
          };
        }),
      };
    },
  },

  getMetrics: {
    description: 'Obtener métricas generales del CRM para un período de días',
    inputSchema: getMetricsSchema,
    execute: async ({ days }: z.infer<typeof getMetricsSchema>) => {
      const dateTo = new Date();
      const dateFrom = new Date(dateTo.getTime() - days * 24 * 60 * 60 * 1000);
      const metrics = await getCRMMetrics(dateFrom, dateTo);

      return {
        periodo: `Últimos ${days} días`,
        leadsNuevos: metrics.totalLeads,
        leadsActivos: metrics.activeLeads,
        leadsGanados: metrics.wonLeads,
        leadsPerdidos: metrics.lostLeads,
        tasaConversion: `${metrics.conversionRate}%`,
        ticketPromedio: metrics.avgTicket,
        cicloVentaDias: metrics.avgSalesCycle,
        valorPipeline: metrics.pipelineValue,
        pronostico30Dias: metrics.salesForecast,
      };
    },
  },

  getPipelineSummary: {
    description: 'Obtener resumen del pipeline por etapa con cantidades y valores',
    inputSchema: emptySchema,
    execute: async () => {
      const summary = await getPipelineSummary();

      return {
        etapas: summary.map(s => ({
          nombre: s.displayName,
          leads: s.leadCount,
          valorTotal: s.totalRevenue,
          valorPonderado: s.weightedRevenue,
        })),
        totales: {
          leads: summary.reduce((acc, s) => acc + s.leadCount, 0),
          valorTotal: summary.reduce((acc, s) => acc + s.totalRevenue, 0),
          valorPonderado: summary.reduce((acc, s) => acc + s.weightedRevenue, 0),
        },
      };
    },
  },

  getLeadsRequiringAttention: {
    description: 'Obtener leads que requieren atención urgente (sin contacto, estancados, etc.)',
    inputSchema: emptySchema,
    execute: async () => {
      const leads = await getLeadsRequiringAttention();

      return {
        total: leads.length,
        leads: leads.map(l => ({
          code: l.code,
          company: l.company,
          contactName: l.contactName,
          stage: l.stageName,
          assignedTo: l.assignedToName,
          alertas: l.alerts,
        })),
      };
    },
  },

  getTeamMembers: {
    description: 'Obtener lista de miembros del equipo con sus IDs para filtrar por usuario',
    inputSchema: emptySchema,
    execute: async () => {
      const members = await getTeamMembers();
      return {
        miembros: members.map(m => ({
          id: m.id,
          nombre: m.fullName,
          email: m.email,
        })),
      };
    },
  },

  getLeadStages: {
    description: 'Obtener etapas del pipeline con sus IDs para filtrar por etapa',
    inputSchema: emptySchema,
    execute: async () => {
      const stages = await getLeadStages();
      return {
        etapas: stages.map(s => ({
          id: s.id,
          nombre: s.displayName,
          probabilidad: s.probability,
          esGanado: s.isWon,
          esPerdido: s.isLost,
        })),
      };
    },
  },

  // Reportes avanzados
  getLeadsReport: {
    description: 'Generar reporte de leads agrupados por origen y/o etapa. Ideal para tablas cruzadas. Incluye activos y ganados, excluye perdidos.',
    inputSchema: getLeadsReportSchema,
    execute: async (params: z.infer<typeof getLeadsReportSchema>) => {
      const supabase = createAdminClient();

      // Primero obtener IDs de etapas perdidas para excluirlas
      const { data: lostStages } = await supabase
        .from('lead_stages')
        .select('id')
        .eq('is_lost', true);

      const lostStageIds = (lostStages || []).map(s => s.id);

      // Construir query base - excluir leads perdidos
      let query = supabase
        .from('leads')
        .select(`
          id,
          source,
          stage_id,
          expected_revenue,
          user_id,
          created_at,
          stage:lead_stages(name, display_name, is_won, is_lost)
        `)
        .is('lost_reason_id', null);

      // Excluir etapas perdidas
      if (lostStageIds.length > 0) {
        query = query.not('stage_id', 'in', `(${lostStageIds.join(',')})`);
      }

      // Solo filtrar por userId si filterByUser es true explícitamente Y hay un userId válido
      if (params.filterByUser === true && params.userId) {
        query = query.eq('user_id', params.userId);
      }
      // Solo filtrar por fechas si son válidas y tienen contenido real
      if (params.dateFrom && params.dateFrom.length > 8) {
        query = query.gte('created_at', params.dateFrom);
      }
      if (params.dateTo && params.dateTo.length > 8) {
        query = query.lte('created_at', params.dateTo);
      }

      const { data: leads, error } = await query;

      if (error) {
        return { error: 'Error al obtener leads' };
      }

      // Agrupar según parámetro
      const groups = new Map<string, { count: number; totalValue: number }>();

      for (const lead of leads || []) {
        const source = LEAD_SOURCE_LABELS[lead.source as keyof typeof LEAD_SOURCE_LABELS] || lead.source;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stage = (lead.stage as any)?.display_name || 'Sin etapa';
        const value = Number(lead.expected_revenue) || 0;

        let key: string;
        if (params.groupBy === 'source') {
          key = source;
        } else if (params.groupBy === 'stage') {
          key = stage;
        } else {
          key = `${source}|${stage}`;
        }

        if (!groups.has(key)) {
          groups.set(key, { count: 0, totalValue: 0 });
        }
        const group = groups.get(key)!;
        group.count++;
        group.totalValue += value;
      }

      // Formatear resultado
      if (params.groupBy === 'both') {
        const sources = new Set<string>();
        const stages = new Set<string>();

        for (const key of groups.keys()) {
          const [source, stage] = key.split('|');
          sources.add(source);
          stages.add(stage);
        }

        const table: Record<string, Record<string, number>> = {};
        for (const source of sources) {
          table[source] = {};
          for (const stage of stages) {
            const key = `${source}|${stage}`;
            table[source][stage] = groups.get(key)?.count || 0;
          }
        }

        return {
          tipo: 'tabla_cruzada',
          etapas: Array.from(stages),
          datos: Object.entries(table).map(([source, stagesData]) => ({
            origen: source,
            ...stagesData,
            total: Object.values(stagesData).reduce((a, b) => a + b, 0),
          })),
        };
      } else {
        return {
          tipo: 'lista',
          datos: Array.from(groups.entries()).map(([key, data]) => ({
            [params.groupBy === 'source' ? 'origen' : 'etapa']: key,
            leads: data.count,
            valorTotal: data.totalValue,
          })),
        };
      }
    },
  },

  getActivitiesReport: {
    description: 'Reporte de actividades para un período específico, agrupadas por día',
    inputSchema: getActivitiesReportSchema,
    execute: async (params: z.infer<typeof getActivitiesReportSchema>) => {
      const supabase = createAdminClient();

      const now = new Date();
      let dateFrom: Date;
      let dateTo: Date;

      switch (params.period) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'this_week': {
          const dayOfWeek = now.getDay();
          const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          dateFrom = new Date(now.getFullYear(), now.getMonth(), diff);
          dateTo = new Date(dateFrom.getTime() + 6 * 24 * 60 * 60 * 1000);
          dateTo.setHours(23, 59, 59);
          break;
        }
        case 'this_month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'custom':
        default:
          dateFrom = params.dateFrom ? new Date(params.dateFrom) : now;
          dateTo = params.dateTo ? new Date(params.dateTo) : now;
          break;
      }

      let query = supabase
        .from('lead_activities')
        .select(`
          id,
          activity_type,
          title,
          description,
          due_date,
          is_completed,
          user_id,
          lead:leads(code, company),
          assigned_to:user_profiles!lead_activities_user_id_fkey(full_name)
        `)
        .gte('due_date', dateFrom.toISOString())
        .lte('due_date', dateTo.toISOString())
        .order('due_date', { ascending: true });

      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      const { data: activities, error } = await query;

      if (error) {
        return { error: 'Error al obtener actividades' };
      }

      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const byDay = new Map<string, Array<{
        tipo: string;
        titulo: string;
        lead: string;
        completada: boolean;
      }>>();

      for (const activity of activities || []) {
        const date = new Date(activity.due_date);
        const dayKey = dayNames[date.getDay()];

        if (!byDay.has(dayKey)) {
          byDay.set(dayKey, []);
        }

        byDay.get(dayKey)!.push({
          tipo: activity.activity_type,
          titulo: activity.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lead: (activity.lead as any)?.company || 'Sin lead',
          completada: activity.is_completed,
        });
      }

      const periodoLabel = params.period === 'today' ? 'Hoy' :
        params.period === 'this_week' ? 'Esta semana' :
        params.period === 'this_month' ? 'Este mes' : 'Período personalizado';

      return {
        periodo: periodoLabel,
        totalActividades: activities?.length || 0,
        completadas: activities?.filter(a => a.is_completed).length || 0,
        pendientes: activities?.filter(a => !a.is_completed).length || 0,
        porDia: Array.from(byDay.entries()).map(([dia, acts]) => ({
          dia,
          actividades: acts.length,
          detalle: acts,
        })),
      };
    },
  },

  getPipelineValueReport: {
    description: 'Valor del pipeline por etapa con desglose. Puede filtrar por usuario o etapa específica.',
    inputSchema: getPipelineValueReportSchema,
    execute: async (params: z.infer<typeof getPipelineValueReportSchema>) => {
      const supabase = createAdminClient();

      let query = supabase
        .from('leads')
        .select(`
          id,
          expected_revenue,
          probability,
          stage_id,
          stage:lead_stages(id, name, display_name, probability)
        `)
        .is('lost_reason_id', null)
        .is('date_closed', null);

      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }
      if (params.stageId) {
        query = query.eq('stage_id', params.stageId);
      }

      const { data: leads, error } = await query;

      if (error) {
        return { error: 'Error al obtener pipeline' };
      }

      const byStage = new Map<string, {
        nombre: string;
        leads: number;
        valorTotal: number;
        valorPonderado: number;
      }>();

      for (const lead of leads || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stage = lead.stage as any;
        const stageId = lead.stage_id;
        const stageName = stage?.display_name || 'Sin etapa';
        const value = Number(lead.expected_revenue) || 0;
        const prob = Number(lead.probability) || stage?.probability || 0;

        if (!byStage.has(stageId)) {
          byStage.set(stageId, {
            nombre: stageName,
            leads: 0,
            valorTotal: 0,
            valorPonderado: 0,
          });
        }

        const group = byStage.get(stageId)!;
        group.leads++;
        group.valorTotal += value;
        group.valorPonderado += value * (prob / 100);
      }

      const etapas = Array.from(byStage.values());

      return {
        etapas,
        totales: {
          leads: etapas.reduce((a, e) => a + e.leads, 0),
          valorTotal: etapas.reduce((a, e) => a + e.valorTotal, 0),
          valorPonderado: Math.round(etapas.reduce((a, e) => a + e.valorPonderado, 0)),
        },
      };
    },
  },

  // ========================================
  // HERRAMIENTAS DE CREACIÓN
  // ========================================

  createLead: {
    description: 'Crear un nuevo lead en el CRM. Requiere: empresa, contacto, fuente y tipo de servicio.',
    inputSchema: createLeadSchema,
    execute: async (params: z.infer<typeof createLeadSchema>) => {
      const supabase = createAdminClient();

      // Obtener etapa inicial "new"
      const { data: stage } = await supabase
        .from('lead_stages')
        .select('id')
        .eq('name', 'new')
        .single();

      if (!stage) {
        return { error: 'No se encontró la etapa inicial' };
      }

      // Crear el lead
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          company: params.company,
          contact_name: params.contactName,
          source: params.source,
          service_type: params.serviceType,
          email: params.email || null,
          phone: params.phone || null,
          location: params.location || null,
          description: params.description || null,
          expected_revenue: params.expectedRevenue || 0,
          stage_id: stage.id,
        })
        .select('id, code, company, contact_name')
        .single();

      if (error) {
        console.error('[createLead Tool] Error:', error);
        return { error: 'Error al crear el lead' };
      }

      return {
        success: true,
        mensaje: `Lead creado exitosamente`,
        lead: {
          codigo: lead.code,
          empresa: lead.company,
          contacto: lead.contact_name,
          id: lead.id,
        },
      };
    },
  },

  createActivity: {
    description: 'Crear una actividad para un lead existente. Primero usa getLeads para obtener el ID del lead.',
    inputSchema: createActivitySchema,
    execute: async (params: z.infer<typeof createActivitySchema>) => {
      const supabase = createAdminClient();

      // Verificar que el lead existe
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, code, company')
        .eq('id', params.leadId)
        .single();

      if (leadError || !lead) {
        return { error: 'Lead no encontrado. Verifica el ID del lead.' };
      }

      // Parsear fecha si se proporciona
      let dueDate: string | null = null;
      if (params.dueDate) {
        const [year, month, day] = params.dueDate.split('-').map(Number);
        dueDate = new Date(year, month - 1, day, 12, 0, 0).toISOString();
      }

      // Crear la actividad
      const { data: activity, error } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: params.leadId,
          activity_type: params.activityType,
          title: params.title,
          description: params.description || null,
          due_date: dueDate,
        })
        .select('id, title, activity_type')
        .single();

      if (error) {
        console.error('[createActivity Tool] Error:', error);
        return { error: 'Error al crear la actividad' };
      }

      const activityTypeLabels: Record<string, string> = {
        call: 'Llamada',
        email: 'Email',
        meeting: 'Reunión',
        visit: 'Visita',
        task: 'Tarea',
        note: 'Nota',
      };

      return {
        success: true,
        mensaje: `Actividad creada exitosamente`,
        actividad: {
          id: activity.id,
          tipo: activityTypeLabels[activity.activity_type] || activity.activity_type,
          titulo: activity.title,
          lead: `${lead.code} - ${lead.company}`,
        },
      };
    },
  },

  updateActivity: {
    description: 'Modificar una actividad existente. Usa esto para postergar, adelantar, cambiar título/descripción o marcar como completada. Primero usa getPendingActivities para obtener el ID de la actividad.',
    inputSchema: updateActivitySchema,
    execute: async (params: z.infer<typeof updateActivitySchema>) => {
      const supabase = createAdminClient();

      // Verificar que la actividad existe
      const { data: existingActivity, error: fetchError } = await supabase
        .from('lead_activities')
        .select(`
          id, title, due_date, is_completed,
          lead:leads(code, company)
        `)
        .eq('id', params.activityId)
        .single();

      if (fetchError || !existingActivity) {
        return { error: 'Actividad no encontrada. Verifica el ID de la actividad.' };
      }

      // Preparar datos de actualización
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {};

      if (params.dueDate) {
        const [year, month, day] = params.dueDate.split('-').map(Number);
        updateData.due_date = new Date(year, month - 1, day, 12, 0, 0).toISOString();
      }

      if (params.title) {
        updateData.title = params.title;
      }

      if (params.description !== undefined) {
        updateData.description = params.description;
      }

      if (params.isCompleted !== undefined) {
        updateData.is_completed = params.isCompleted;
        if (params.isCompleted) {
          updateData.completed_at = new Date().toISOString();
        } else {
          updateData.completed_at = null;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return { error: 'No se especificaron campos para actualizar' };
      }

      // Actualizar la actividad
      const { data: updated, error } = await supabase
        .from('lead_activities')
        .update(updateData)
        .eq('id', params.activityId)
        .select('id, title, due_date, is_completed')
        .single();

      if (error) {
        console.error('[updateActivity Tool] Error:', error);
        return { error: 'Error al actualizar la actividad' };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lead = existingActivity.lead as any;
      const cambios: string[] = [];

      if (params.dueDate) {
        cambios.push(`fecha: ${params.dueDate}`);
      }
      if (params.title) {
        cambios.push(`título: ${params.title}`);
      }
      if (params.isCompleted !== undefined) {
        cambios.push(params.isCompleted ? 'marcada como completada' : 'marcada como pendiente');
      }

      return {
        success: true,
        mensaje: `Actividad actualizada: ${cambios.join(', ')}`,
        actividad: {
          id: updated.id,
          titulo: updated.title,
          nuevaFecha: updated.due_date?.split('T')[0],
          completada: updated.is_completed,
          lead: `${lead?.code} - ${lead?.company}`,
        },
      };
    },
  },

  deleteActivity: {
    description: 'Eliminar una actividad. Primero usa getPendingActivities para obtener el ID de la actividad.',
    inputSchema: deleteActivitySchema,
    execute: async (params: z.infer<typeof deleteActivitySchema>) => {
      const supabase = createAdminClient();

      // Verificar que la actividad existe
      const { data: activity, error: fetchError } = await supabase
        .from('lead_activities')
        .select('id, title, lead:leads(code, company)')
        .eq('id', params.activityId)
        .single();

      if (fetchError || !activity) {
        return { error: 'Actividad no encontrada' };
      }

      // Eliminar la actividad
      const { error } = await supabase
        .from('lead_activities')
        .delete()
        .eq('id', params.activityId);

      if (error) {
        console.error('[deleteActivity Tool] Error:', error);
        return { error: 'Error al eliminar la actividad' };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lead = activity.lead as any;
      return {
        success: true,
        mensaje: `Actividad "${activity.title}" eliminada correctamente`,
        lead: `${lead?.code} - ${lead?.company}`,
      };
    },
  },

  updateLead: {
    description: 'Modificar datos de un lead existente. Primero usa getLeads o getLeadById para obtener el ID del lead.',
    inputSchema: updateLeadSchema,
    execute: async (params: z.infer<typeof updateLeadSchema>) => {
      const supabase = createAdminClient();

      // Verificar que el lead existe
      const { data: existingLead, error: fetchError } = await supabase
        .from('leads')
        .select('id, code, company')
        .eq('id', params.leadId)
        .single();

      if (fetchError || !existingLead) {
        return { error: 'Lead no encontrado' };
      }

      // Preparar datos de actualización
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {};

      if (params.company) updateData.company = params.company;
      if (params.contactName) updateData.contact_name = params.contactName;
      if (params.email !== undefined) updateData.email = params.email || null;
      if (params.phone !== undefined) updateData.phone = params.phone || null;
      if (params.location !== undefined) updateData.location = params.location || null;
      if (params.description !== undefined) updateData.description = params.description || null;
      if (params.expectedRevenue !== undefined) updateData.expected_revenue = params.expectedRevenue;
      if (params.priority) updateData.priority = params.priority;

      if (Object.keys(updateData).length === 0) {
        return { error: 'No se especificaron campos para actualizar' };
      }

      updateData.updated_at = new Date().toISOString();

      // Actualizar el lead
      const { data: updated, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', params.leadId)
        .select('id, code, company, contact_name')
        .single();

      if (error) {
        console.error('[updateLead Tool] Error:', error);
        return { error: 'Error al actualizar el lead' };
      }

      return {
        success: true,
        mensaje: `Lead actualizado correctamente`,
        lead: {
          codigo: updated.code,
          empresa: updated.company,
          contacto: updated.contact_name,
        },
      };
    },
  },

  changeLeadStage: {
    description: 'Mover un lead a otra etapa del pipeline. Usa getLeadStages para ver las etapas disponibles.',
    inputSchema: changeLeadStageSchema,
    execute: async (params: z.infer<typeof changeLeadStageSchema>) => {
      const supabase = createAdminClient();

      // Verificar que el lead existe
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, code, company, stage:lead_stages(display_name)')
        .eq('id', params.leadId)
        .single();

      if (leadError || !lead) {
        return { error: 'Lead no encontrado' };
      }

      // Verificar que la etapa existe
      const { data: newStage, error: stageError } = await supabase
        .from('lead_stages')
        .select('id, name, display_name, probability, is_won, is_lost')
        .eq('id', params.stageId)
        .single();

      if (stageError || !newStage) {
        return { error: 'Etapa no encontrada. Usa getLeadStages para ver las etapas disponibles.' };
      }

      // No permitir mover a etapas won/lost con esta herramienta
      if (newStage.is_won || newStage.is_lost) {
        return {
          error: `Para marcar como ${newStage.is_won ? 'ganado' : 'perdido'}, usa la herramienta ${newStage.is_won ? 'markLeadAsWon' : 'markLeadAsLost'}`
        };
      }

      // Actualizar la etapa
      const { error } = await supabase
        .from('leads')
        .update({
          stage_id: params.stageId,
          probability: newStage.probability,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.leadId);

      if (error) {
        console.error('[changeLeadStage Tool] Error:', error);
        return { error: 'Error al cambiar la etapa' };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldStage = (lead.stage as any)?.display_name || 'Sin etapa';

      return {
        success: true,
        mensaje: `Lead movido de "${oldStage}" a "${newStage.display_name}"`,
        lead: {
          codigo: lead.code,
          empresa: lead.company,
          nuevaEtapa: newStage.display_name,
          probabilidad: `${newStage.probability}%`,
        },
      };
    },
  },

  getLostReasons: {
    description: 'Obtener lista de motivos de pérdida disponibles para marcar un lead como perdido',
    inputSchema: getLostReasonsSchema,
    execute: async () => {
      const supabase = createAdminClient();

      const { data: reasons, error } = await supabase
        .from('lost_reasons')
        .select('id, name, display_name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('[getLostReasons Tool] Error:', error);
        return { error: 'Error al obtener motivos de pérdida' };
      }

      return {
        motivos: (reasons || []).map(r => ({
          id: r.id,
          nombre: r.display_name || r.name,
        })),
      };
    },
  },

  markLeadAsWon: {
    description: 'Marcar un lead como GANADO. Esto cierra el lead exitosamente.',
    inputSchema: markLeadAsWonSchema,
    execute: async (params: z.infer<typeof markLeadAsWonSchema>) => {
      const supabase = createAdminClient();

      // Obtener el lead actual
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, code, company, expected_revenue')
        .eq('id', params.leadId)
        .single();

      if (leadError || !lead) {
        return { error: 'Lead no encontrado' };
      }

      // Obtener la etapa "won"
      const { data: wonStage, error: stageError } = await supabase
        .from('lead_stages')
        .select('id, probability')
        .eq('is_won', true)
        .single();

      if (stageError || !wonStage) {
        return { error: 'No se encontró la etapa de "Ganado" en el sistema' };
      }

      const finalRevenue = params.finalRevenue ?? lead.expected_revenue;

      // Actualizar el lead
      const { error } = await supabase
        .from('leads')
        .update({
          stage_id: wonStage.id,
          probability: wonStage.probability,
          expected_revenue: finalRevenue,
          date_closed: new Date().toISOString(),
          type: 'opportunity',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.leadId);

      if (error) {
        console.error('[markLeadAsWon Tool] Error:', error);
        return { error: 'Error al marcar como ganado' };
      }

      return {
        success: true,
        mensaje: `¡Felicitaciones! Lead marcado como GANADO`,
        lead: {
          codigo: lead.code,
          empresa: lead.company,
          valorFinal: finalRevenue,
        },
      };
    },
  },

  markLeadAsLost: {
    description: 'Marcar un lead como PERDIDO. Requiere especificar el motivo de pérdida. Usa getLostReasons para ver los motivos disponibles.',
    inputSchema: markLeadAsLostSchema,
    execute: async (params: z.infer<typeof markLeadAsLostSchema>) => {
      const supabase = createAdminClient();

      // Obtener el lead actual
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, code, company, stage:lead_stages(display_name)')
        .eq('id', params.leadId)
        .single();

      if (leadError || !lead) {
        return { error: 'Lead no encontrado' };
      }

      // Verificar que el motivo existe
      const { data: reason, error: reasonError } = await supabase
        .from('lost_reasons')
        .select('id, display_name')
        .eq('id', params.lostReasonId)
        .single();

      if (reasonError || !reason) {
        return { error: 'Motivo de pérdida no encontrado. Usa getLostReasons para ver los motivos disponibles.' };
      }

      // NO cambiamos el stage_id - el lead se queda en su etapa original
      // Solo marcamos como perdido con lost_reason_id y date_closed
      const { error } = await supabase
        .from('leads')
        .update({
          lost_reason_id: params.lostReasonId,
          lost_notes: params.lostNotes || null,
          date_closed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.leadId);

      if (error) {
        console.error('[markLeadAsLost Tool] Error:', error);
        return { error: 'Error al marcar como perdido' };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stageName = (lead.stage as any)?.display_name || 'Sin etapa';

      return {
        success: true,
        mensaje: `Lead marcado como PERDIDO`,
        lead: {
          codigo: lead.code,
          empresa: lead.company,
          etapaOriginal: stageName,
          motivo: reason.display_name,
          notas: params.lostNotes || 'Sin notas adicionales',
        },
      };
    },
  },
};
