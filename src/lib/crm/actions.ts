'use server';

// Server Actions para el CRM de AMAROT

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';
import {
  leadFormSchema,
  activityFormSchema,
  noteFormSchema,
  markAsLostSchema,
  stageChangeSchema,
  assignUserSchema,
} from './validation';
import type { Lead, LeadActivity, LeadNote } from './types';

// ========================================
// LEADS
// ========================================

/**
 * Crea un nuevo lead
 */
export async function createLead(formData: FormData): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const rawData = {
    company: formData.get('company') as string,
    contactName: formData.get('contactName') as string,
    email: formData.get('email') as string || undefined,
    phone: formData.get('phone') as string || undefined,
    location: formData.get('location') as string || undefined,
    serviceType: formData.get('serviceType') as string,
    description: formData.get('description') as string || undefined,
    stageId: formData.get('stageId') as string || undefined,
    expectedRevenue: formData.get('expectedRevenue') ? Number(formData.get('expectedRevenue')) : undefined,
    dateDeadline: formData.get('dateDeadline') ? new Date(formData.get('dateDeadline') as string) : undefined,
    userId: formData.get('userId') as string || undefined,
    source: formData.get('source') as string,
    clientId: formData.get('clientId') as string || undefined,
  };

  const parsed = leadFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  // Obtener etapa inicial si no se especificó
  let stageId = parsed.data.stageId;
  if (!stageId) {
    const { data: stages } = await supabase
      .from('lead_stages')
      .select('id')
      .eq('name', 'new')
      .single();
    stageId = stages?.id;
  }

  if (!stageId) {
    return { success: false, error: 'No se encontró la etapa inicial' };
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      company: parsed.data.company,
      contact_name: parsed.data.contactName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      location: parsed.data.location || null,
      service_type: parsed.data.serviceType,
      description: parsed.data.description || null,
      stage_id: stageId,
      expected_revenue: parsed.data.expectedRevenue || 0,
      date_deadline: parsed.data.dateDeadline?.toISOString() || null,
      user_id: parsed.data.userId || null,
      source: parsed.data.source,
      client_id: rawData.clientId || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[createLead] Error:', error);
    return { success: false, error: 'Error al crear el lead' };
  }

  revalidatePath('/panel/crm');
  return { success: true, lead: data as unknown as Lead };
}

/**
 * Actualiza un lead existente
 */
export async function updateLead(
  leadId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const clientId = formData.get('clientId') as string || null;

  const rawData = {
    company: formData.get('company') as string,
    contactName: formData.get('contactName') as string,
    email: formData.get('email') as string || undefined,
    phone: formData.get('phone') as string || undefined,
    location: formData.get('location') as string || undefined,
    serviceType: formData.get('serviceType') as string,
    description: formData.get('description') as string || undefined,
    expectedRevenue: formData.get('expectedRevenue') ? Number(formData.get('expectedRevenue')) : undefined,
    dateDeadline: formData.get('dateDeadline') ? new Date(formData.get('dateDeadline') as string) : undefined,
    userId: formData.get('userId') as string || undefined,
    source: formData.get('source') as string,
  };

  const parsed = leadFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('leads')
    .update({
      company: parsed.data.company,
      contact_name: parsed.data.contactName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      location: parsed.data.location || null,
      service_type: parsed.data.serviceType,
      description: parsed.data.description || null,
      expected_revenue: parsed.data.expectedRevenue || 0,
      date_deadline: parsed.data.dateDeadline?.toISOString() || null,
      user_id: parsed.data.userId || null,
      source: parsed.data.source,
      client_id: clientId,
    })
    .eq('id', leadId);

  if (error) {
    console.error('[updateLead] Error:', error);
    return { success: false, error: 'Error al actualizar el lead' };
  }

  revalidatePath('/panel/crm');
  revalidatePath(`/panel/crm/leads/${leadId}`);
  return { success: true };
}

/**
 * Elimina un lead
 */
export async function deleteLead(leadId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (error) {
    console.error('[deleteLead] Error:', error);
    return { success: false, error: 'Error al eliminar el lead' };
  }

  revalidatePath('/panel/crm');
  return { success: true };
}

/**
 * Cambia la etapa de un lead (drag & drop)
 */
export async function changeLeadStage(
  leadId: string,
  stageId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const parsed = stageChangeSchema.safeParse({ leadId, stageId });
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  // Usar la función de base de datos para mover el lead
  const { error } = await supabase.rpc('move_lead_to_stage', {
    p_lead_id: leadId,
    p_stage_id: stageId,
    p_user_id: user.id,
  });

  if (error) {
    console.error('[changeLeadStage] Error:', error);
    return { success: false, error: 'Error al cambiar la etapa' };
  }

  revalidatePath('/panel/crm');
  revalidatePath(`/panel/crm/leads/${leadId}`);
  return { success: true };
}

/**
 * Asigna un usuario a un lead
 */
export async function assignLeadToUser(
  leadId: string,
  userId: string | null
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const parsed = assignUserSchema.safeParse({ leadId, userId });
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('leads')
    .update({ user_id: userId })
    .eq('id', leadId);

  if (error) {
    console.error('[assignLeadToUser] Error:', error);
    return { success: false, error: 'Error al asignar el responsable' };
  }

  revalidatePath('/panel/crm');
  revalidatePath(`/panel/crm/leads/${leadId}`);
  return { success: true };
}

/**
 * Marca un lead como ganado
 */
export async function markLeadAsWon(leadId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.rpc('mark_lead_as_won', {
    p_lead_id: leadId,
    p_user_id: user.id,
  });

  if (error) {
    console.error('[markLeadAsWon] Error:', error);
    return { success: false, error: 'Error al marcar como ganado' };
  }

  revalidatePath('/panel/crm');
  revalidatePath(`/panel/crm/leads/${leadId}`);
  return { success: true };
}

/**
 * Marca un lead como perdido
 */
export async function markLeadAsLost(
  leadId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const rawData = {
    lostReasonId: formData.get('lostReasonId') as string,
    lostNotes: formData.get('lostNotes') as string || undefined,
  };

  const parsed = markAsLostSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.rpc('mark_lead_as_lost', {
    p_lead_id: leadId,
    p_lost_reason_id: parsed.data.lostReasonId,
    p_notes: parsed.data.lostNotes || null,
    p_user_id: user.id,
  });

  if (error) {
    console.error('[markLeadAsLost] Error:', error);
    return { success: false, error: 'Error al marcar como perdido' };
  }

  revalidatePath('/panel/crm');
  revalidatePath(`/panel/crm/leads/${leadId}`);
  return { success: true };
}

// ========================================
// ACTIVITIES
// ========================================

/**
 * Crea una nueva actividad
 */
export async function createActivity(
  leadId: string,
  formData: FormData
): Promise<{ success: boolean; activity?: LeadActivity; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  // Parsear fecha preservando el día local (sin conversión UTC)
  const dueDateStr = formData.get('dueDate') as string;
  let dueDate: Date | undefined;
  if (dueDateStr) {
    const [year, month, day] = dueDateStr.split('-').map(Number);
    dueDate = new Date(year, month - 1, day, 12, 0, 0); // Mediodía para evitar problemas de zona horaria
  }

  const rawData = {
    activityType: formData.get('activityType') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
    dueDate,
    userId: formData.get('userId') as string || undefined,
  };

  const parsed = activityFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: leadId,
      activity_type: parsed.data.activityType,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_date: parsed.data.dueDate?.toISOString() || null,
      user_id: parsed.data.userId || user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[createActivity] Error:', error);
    return { success: false, error: 'Error al crear la actividad' };
  }

  revalidatePath(`/panel/crm/leads/${leadId}`);
  return { success: true, activity: data as unknown as LeadActivity };
}

/**
 * Completa una actividad
 */
export async function completeActivity(activityId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  // Obtener el lead_id para revalidar
  const { data: activity } = await supabase
    .from('lead_activities')
    .select('lead_id')
    .eq('id', activityId)
    .single();

  const { error } = await supabase
    .from('lead_activities')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', activityId);

  if (error) {
    console.error('[completeActivity] Error:', error);
    return { success: false, error: 'Error al completar la actividad' };
  }

  if (activity?.lead_id) {
    revalidatePath(`/panel/crm/leads/${activity.lead_id}`);
  }
  return { success: true };
}

/**
 * Desmarca una actividad como pendiente
 */
export async function uncompleteActivity(activityId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const { data: activity } = await supabase
    .from('lead_activities')
    .select('lead_id')
    .eq('id', activityId)
    .single();

  const { error } = await supabase
    .from('lead_activities')
    .update({
      is_completed: false,
      completed_at: null,
    })
    .eq('id', activityId);

  if (error) {
    console.error('[uncompleteActivity] Error:', error);
    return { success: false, error: 'Error al desmarcar la actividad' };
  }

  if (activity?.lead_id) {
    revalidatePath(`/panel/crm/leads/${activity.lead_id}`);
  }
  return { success: true };
}

/**
 * Actualiza una actividad
 */
export async function updateActivity(
  activityId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  // Parsear fecha preservando el día local
  const dueDateStr = formData.get('dueDate') as string;
  let dueDate: Date | undefined;
  if (dueDateStr) {
    const [year, month, day] = dueDateStr.split('-').map(Number);
    dueDate = new Date(year, month - 1, day, 12, 0, 0);
  }

  const rawData = {
    activityType: formData.get('activityType') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
    dueDate,
    userId: formData.get('userId') as string || undefined,
  };

  const parsed = activityFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  const { data: activity } = await supabase
    .from('lead_activities')
    .select('lead_id')
    .eq('id', activityId)
    .single();

  const { error } = await supabase
    .from('lead_activities')
    .update({
      activity_type: parsed.data.activityType,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_date: parsed.data.dueDate?.toISOString() || null,
      user_id: parsed.data.userId || null,
    })
    .eq('id', activityId);

  if (error) {
    console.error('[updateActivity] Error:', error);
    return { success: false, error: 'Error al actualizar la actividad' };
  }

  if (activity?.lead_id) {
    revalidatePath(`/panel/crm/leads/${activity.lead_id}`);
  }
  return { success: true };
}

/**
 * Elimina una actividad
 */
export async function deleteActivity(activityId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  // Obtener el lead_id para revalidar
  const { data: activity } = await supabase
    .from('lead_activities')
    .select('lead_id')
    .eq('id', activityId)
    .single();

  const { error } = await supabase
    .from('lead_activities')
    .delete()
    .eq('id', activityId);

  if (error) {
    console.error('[deleteActivity] Error:', error);
    return { success: false, error: 'Error al eliminar la actividad' };
  }

  if (activity?.lead_id) {
    revalidatePath(`/panel/crm/leads/${activity.lead_id}`);
  }
  return { success: true };
}

// ========================================
// NOTES
// ========================================

/**
 * Crea una nueva nota
 */
export async function createNote(
  leadId: string,
  formData: FormData
): Promise<{ success: boolean; note?: LeadNote; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const rawData = {
    content: formData.get('content') as string,
  };

  const parsed = noteFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('lead_notes')
    .insert({
      lead_id: leadId,
      content: parsed.data.content,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[createNote] Error:', error);
    return { success: false, error: 'Error al crear la nota' };
  }

  revalidatePath(`/panel/crm/leads/${leadId}`);
  return { success: true, note: data as unknown as LeadNote };
}

/**
 * Elimina una nota
 */
export async function deleteNote(noteId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  // Obtener el lead_id para revalidar
  const { data: note } = await supabase
    .from('lead_notes')
    .select('lead_id')
    .eq('id', noteId)
    .single();

  const { error } = await supabase
    .from('lead_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('[deleteNote] Error:', error);
    return { success: false, error: 'Error al eliminar la nota' };
  }

  if (note?.lead_id) {
    revalidatePath(`/panel/crm/leads/${note.lead_id}`);
  }
  return { success: true };
}

// ========================================
// FASE 2: CONVERSIÓN DE MENSAJES
// ========================================

/**
 * Convierte un mensaje de contacto en un lead
 */
export async function convertMessageToLead(
  formData: FormData
): Promise<{ success: boolean; leadCode?: string; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const messageId = formData.get('messageId') as string;
  const serviceType = formData.get('serviceType') as string;
  const company = formData.get('company') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string || null;
  const phone = formData.get('phone') as string || null;
  const location = formData.get('location') as string || null;
  const description = formData.get('description') as string || null;
  const expectedRevenue = formData.get('expectedRevenue') ? Number(formData.get('expectedRevenue')) : 0;
  const userId = formData.get('userId') as string || null;

  if (!messageId || !serviceType || !company || !contactName) {
    return { success: false, error: 'Faltan campos requeridos' };
  }

  const supabase = createAdminClient();

  // Obtener la etapa inicial
  const { data: stage } = await supabase
    .from('lead_stages')
    .select('id')
    .eq('name', 'new')
    .single();

  if (!stage) {
    return { success: false, error: 'No se encontró la etapa inicial' };
  }

  // Verificar que el mensaje no esté ya convertido
  const { data: message } = await supabase
    .from('contact_messages')
    .select('lead_id')
    .eq('id', messageId)
    .single();

  if (message?.lead_id) {
    return { success: false, error: 'Este mensaje ya fue convertido a lead' };
  }

  // Buscar regla de asignación si no se especificó usuario
  let assignedUserId = userId;
  if (!assignedUserId) {
    const { data: rule } = await supabase
      .from('assignment_rules')
      .select('user_id')
      .eq('service_type', serviceType)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1)
      .single();

    if (rule) {
      assignedUserId = rule.user_id;
    }
  }

  // Crear el lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      company,
      contact_name: contactName,
      email,
      phone,
      location,
      service_type: serviceType,
      description,
      stage_id: stage.id,
      expected_revenue: expectedRevenue,
      user_id: assignedUserId,
      source: 'contact_form',
      source_message_id: messageId,
      created_by: user.id,
    })
    .select('id, code')
    .single();

  if (leadError) {
    console.error('[convertMessageToLead] Error creating lead:', leadError);
    return { success: false, error: 'Error al crear el lead' };
  }

  // Actualizar el mensaje
  const { error: messageError } = await supabase
    .from('contact_messages')
    .update({
      lead_id: lead.id,
      converted_at: new Date().toISOString(),
      status: 'converted',
    })
    .eq('id', messageId);

  if (messageError) {
    console.error('[convertMessageToLead] Error updating message:', messageError);
    // El lead ya se creó, no hacemos rollback
  }

  // Crear actividad inicial
  await supabase.from('lead_activities').insert({
    lead_id: lead.id,
    activity_type: 'note',
    title: 'Lead creado desde formulario de contacto',
    description: `Mensaje original convertido a lead`,
    user_id: assignedUserId,
    is_completed: true,
    completed_at: new Date().toISOString(),
    created_by: user.id,
  });

  revalidatePath('/panel/mensajes');
  revalidatePath('/panel/crm');

  return { success: true, leadCode: lead.code };
}

// ========================================
// FASE 2: DEDUPLICACIÓN Y FUSIÓN
// ========================================

import {
  findDuplicateLeads as findDuplicateLeadsQuery,
  getClients as getClientsQuery,
  getEmailTemplates as getEmailTemplatesQuery,
} from './queries';

/**
 * Server action para verificar leads duplicados
 * (Wrapper para poder llamar desde Client Components)
 */
export async function checkDuplicateLeads(
  email?: string,
  phone?: string
): Promise<Lead[]> {
  return findDuplicateLeadsQuery(email, phone);
}

/**
 * Server action para obtener clientes
 * (Wrapper para poder llamar desde Client Components)
 */
export async function fetchClients(): Promise<Array<{ id: string; name: string; ruc: string | null; email: string | null }>> {
  return getClientsQuery();
}

interface MergeLeadData {
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  location?: string;
  serviceType?: string;
  description?: string;
  source?: string;
}

/**
 * Fusiona información nueva con un lead existente
 * Agrega una nota al lead con los datos del nuevo contacto
 */
export async function mergeLeadWithExisting(
  targetLeadId: string,
  newData: MergeLeadData
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  // Verificar que el lead existe
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, code, company, email, phone')
    .eq('id', targetLeadId)
    .single();

  if (leadError || !lead) {
    return { success: false, error: 'Lead no encontrado' };
  }

  // Construir contenido de la nota con la información nueva
  const noteLines: string[] = [
    '📋 **Información de contacto potencialmente duplicado:**',
    '',
  ];

  if (newData.company) noteLines.push(`• Empresa: ${newData.company}`);
  if (newData.contactName) noteLines.push(`• Contacto: ${newData.contactName}`);
  if (newData.email) noteLines.push(`• Email: ${newData.email}`);
  if (newData.phone) noteLines.push(`• Teléfono: ${newData.phone}`);
  if (newData.location) noteLines.push(`• Ubicación: ${newData.location}`);
  if (newData.serviceType) noteLines.push(`• Tipo de servicio: ${newData.serviceType}`);
  if (newData.source) noteLines.push(`• Origen: ${newData.source}`);
  if (newData.description) {
    noteLines.push('');
    noteLines.push('**Descripción:**');
    noteLines.push(newData.description);
  }

  noteLines.push('');
  noteLines.push('_Fusionado automáticamente por detección de duplicado_');

  // Crear nota en el lead existente
  const { error: noteError } = await supabase
    .from('lead_notes')
    .insert({
      lead_id: targetLeadId,
      content: noteLines.join('\n'),
      created_by: user.id,
    });

  if (noteError) {
    console.error('[mergeLeadWithExisting] Error creating note:', noteError);
    return { success: false, error: 'Error al crear la nota de fusión' };
  }

  // Actualizar campos vacíos del lead con la nueva información
  const updates: Record<string, string> = {};

  if (!lead.email && newData.email) {
    updates.email = newData.email;
  }
  if (!lead.phone && newData.phone) {
    updates.phone = newData.phone;
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('leads')
      .update(updates)
      .eq('id', targetLeadId);
  }

  revalidatePath('/panel/crm');
  revalidatePath(`/panel/crm/leads/${targetLeadId}`);

  return { success: true };
}

// ========================================
// FASE 2: PLANTILLAS DE EMAIL
// ========================================

import type { EmailTemplate } from './types';

/**
 * Server action para obtener plantillas de email
 * (Wrapper para poder llamar desde Client Components)
 */
export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  const templates = await getEmailTemplatesQuery();
  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    variables: t.variables,
    category: t.category,
    position: 0,
    isActive: true,
    createdAt: new Date(),
  }));
}

// ========================================
// FASE 2: REGLAS DE ASIGNACIÓN
// ========================================

/**
 * Crea una nueva regla de asignación
 */
export async function createAssignmentRule(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const serviceType = formData.get('serviceType') as string;
  const userId = formData.get('userId') as string;
  const priority = parseInt(formData.get('priority') as string) || 1;

  if (!serviceType || !userId) {
    return { success: false, error: 'Faltan campos requeridos' };
  }

  const supabase = createAdminClient();

  // Verificar que no exista una regla para este tipo de servicio
  const { data: existing } = await supabase
    .from('assignment_rules')
    .select('id')
    .eq('service_type', serviceType)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: 'Ya existe una regla para este tipo de servicio' };
  }

  const { error } = await supabase
    .from('assignment_rules')
    .insert({
      service_type: serviceType,
      user_id: userId,
      priority,
      is_active: true,
    });

  if (error) {
    console.error('[createAssignmentRule] Error:', error);
    return { success: false, error: 'Error al crear la regla' };
  }

  revalidatePath('/panel/crm/configuracion/asignacion');
  return { success: true };
}

/**
 * Actualiza una regla de asignación
 */
export async function updateAssignmentRule(
  ruleId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};

  const userId = formData.get('userId');
  if (userId) updates.user_id = userId;

  const priority = formData.get('priority');
  if (priority) updates.priority = parseInt(priority as string);

  const isActive = formData.get('isActive');
  if (isActive !== null) updates.is_active = isActive === 'true';

  if (Object.keys(updates).length === 0) {
    return { success: false, error: 'No hay cambios para guardar' };
  }

  const { error } = await supabase
    .from('assignment_rules')
    .update(updates)
    .eq('id', ruleId);

  if (error) {
    console.error('[updateAssignmentRule] Error:', error);
    return { success: false, error: 'Error al actualizar la regla' };
  }

  revalidatePath('/panel/crm/configuracion/asignacion');
  return { success: true };
}

/**
 * Elimina una regla de asignación
 */
export async function deleteAssignmentRule(
  ruleId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('assignment_rules')
    .delete()
    .eq('id', ruleId);

  if (error) {
    console.error('[deleteAssignmentRule] Error:', error);
    return { success: false, error: 'Error al eliminar la regla' };
  }

  revalidatePath('/panel/crm/configuracion/asignacion');
  return { success: true };
}

// ========================================
// EMAIL TEMPLATES CRUD
// ========================================

/**
 * Obtiene todas las plantillas de email (para configuración)
 */
export async function fetchAllEmailTemplates(): Promise<Array<{
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  position: number;
  isActive: boolean;
}>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('[fetchAllEmailTemplates] Error:', error);
    return [];
  }

  return (data || []).map((t) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    variables: Array.isArray(t.variables) ? t.variables : [],
    category: t.category || 'general',
    position: t.position || 0,
    isActive: t.is_active ?? true,
  }));
}

/**
 * Crea una nueva plantilla de email
 */
export async function createEmailTemplate(
  data: {
    name: string;
    subject: string;
    body: string;
    variables?: string[];
    category?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  if (!data.name || !data.subject || !data.body) {
    return { success: false, error: 'Nombre, asunto y cuerpo son obligatorios' };
  }

  const supabase = createAdminClient();

  // Obtener la posición más alta actual
  const { data: maxPos } = await supabase
    .from('email_templates')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = (maxPos?.position || 0) + 1;

  const { error } = await supabase
    .from('email_templates')
    .insert({
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables || [],
      category: data.category || 'general',
      position: nextPosition,
      is_active: true,
    });

  if (error) {
    console.error('[createEmailTemplate] Error:', error);
    return { success: false, error: 'Error al crear la plantilla' };
  }

  revalidatePath('/panel/crm/configuracion/plantillas');
  return { success: true };
}

/**
 * Actualiza una plantilla de email
 */
export async function updateEmailTemplate(
  templateId: string,
  data: {
    name?: string;
    subject?: string;
    body?: string;
    variables?: string[];
    category?: string;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.subject !== undefined) updates.subject = data.subject;
  if (data.body !== undefined) updates.body = data.body;
  if (data.variables !== undefined) updates.variables = data.variables;
  if (data.category !== undefined) updates.category = data.category;
  if (data.isActive !== undefined) updates.is_active = data.isActive;

  const { error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', templateId);

  if (error) {
    console.error('[updateEmailTemplate] Error:', error);
    return { success: false, error: 'Error al actualizar la plantilla' };
  }

  revalidatePath('/panel/crm/configuracion/plantillas');
  return { success: true };
}

/**
 * Elimina una plantilla de email
 */
export async function deleteEmailTemplate(
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('[deleteEmailTemplate] Error:', error);
    return { success: false, error: 'Error al eliminar la plantilla' };
  }

  revalidatePath('/panel/crm/configuracion/plantillas');
  return { success: true };
}

// ========================================
// FASE 2.5: VINCULACIÓN LEAD → CLIENTE
// ========================================

import { findMatchingClients as findMatchingClientsQuery } from './queries';
import type { ClientBasic } from './types';

/**
 * Busca clientes que coincidan por email o nombre de empresa
 * (Wrapper para poder llamar desde Client Components)
 */
export async function searchMatchingClients(
  email?: string,
  companyName?: string
): Promise<{ matches: ClientBasic[]; all: ClientBasic[] }> {
  return findMatchingClientsQuery(email, companyName);
}

/**
 * Gana un lead y opcionalmente lo vincula a un cliente
 * @param leadId - ID del lead
 * @param action - 'create' para crear cliente, 'link' para vincular existente, 'none' para no vincular
 * @param clientId - ID del cliente existente (requerido si action === 'link')
 */
export async function winLeadWithClient(
  leadId: string,
  action: 'create' | 'link' | 'none',
  clientId?: string
): Promise<{ success: boolean; clientId?: string; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  // Obtener datos del lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, company, contact_name, email, phone, location')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    console.error('[winLeadWithClient] Lead not found:', leadError);
    return { success: false, error: 'Lead no encontrado' };
  }

  let finalClientId: string | null = null;

  // Procesar según la acción
  if (action === 'create') {
    // Crear nuevo cliente desde datos del lead
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        company_name: lead.company,
        contact_name: lead.contact_name,
        contact_email: lead.email,
        contact_phone: lead.phone,
        address: lead.location,
      })
      .select('id')
      .single();

    if (clientError) {
      console.error('[winLeadWithClient] Error creating client:', clientError);
      return { success: false, error: 'Error al crear el cliente' };
    }

    finalClientId = newClient.id;
  } else if (action === 'link') {
    if (!clientId) {
      return { success: false, error: 'Debe seleccionar un cliente para vincular' };
    }

    // Verificar que el cliente existe
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    if (!existingClient) {
      return { success: false, error: 'Cliente no encontrado' };
    }

    finalClientId = clientId;
  }
  // Si action === 'none', finalClientId queda null

  // Actualizar el lead con el client_id
  if (finalClientId) {
    const { error: updateError } = await supabase
      .from('leads')
      .update({ client_id: finalClientId })
      .eq('id', leadId);

    if (updateError) {
      console.error('[winLeadWithClient] Error updating lead client_id:', updateError);
      // Continuamos aunque falle el update, ya que el RPC marcará como ganado
    }
  }

  // Marcar como ganado usando la función existente
  const { error: wonError } = await supabase.rpc('mark_lead_as_won', {
    p_lead_id: leadId,
    p_user_id: user.id,
  });

  if (wonError) {
    console.error('[winLeadWithClient] Error marking as won:', wonError);
    return { success: false, error: 'Error al marcar como ganado' };
  }

  revalidatePath('/panel/crm');
  revalidatePath(`/panel/crm/leads/${leadId}`);
  if (finalClientId) {
    revalidatePath('/panel/clientes');
    revalidatePath(`/panel/clientes/${finalClientId}`);
  }

  return { success: true, clientId: finalClientId || undefined };
}

