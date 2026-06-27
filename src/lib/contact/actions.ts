'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';
import { WHATSAPP_TAG } from './whatsapp';

async function requireAuth() {
  const user = await getAuthUser();
  if (!user) throw new Error('No autorizado');
  return user;
}

export async function updateMessageStatus(
  messageId: string,
  status: 'new' | 'read' | 'replied' | 'spam'
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = { status };

  if (status === 'read') {
    updateData.read_at = new Date().toISOString();
  } else if (status === 'replied') {
    updateData.replied_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('contact_messages')
    .update(updateData)
    .eq('id', messageId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/mensajes');
  return { success: true };
}

export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/mensajes');
  return { success: true };
}

export async function getMessageStats(): Promise<{
  total: number;
  new: number;
  read: number;
  replied: number;
  spam: number;
}> {
  await requireAuth();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('contact_messages')
    .select('status');

  if (error || !data) {
    return { total: 0, new: 0, read: 0, replied: 0, spam: 0 };
  }

  return {
    total: data.length,
    new: data.filter(m => m.status === 'new').length,
    read: data.filter(m => m.status === 'read').length,
    replied: data.filter(m => m.status === 'replied').length,
    spam: data.filter(m => m.status === 'spam').length,
  };
}

export async function updateNotificationEmails(
  emails: string[]
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden cambiar emails de notificación' };
  }
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('system_settings')
    .update({
      value: emails,
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'contact_notification_emails');

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/configuracion');
  return { success: true };
}

export async function getNotificationEmails(): Promise<string[]> {
  await requireAuth();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'contact_notification_emails')
    .single();

  if (data?.value && Array.isArray(data.value)) {
    return data.value;
  }

  return ['jaromerohassinger@gmail.com'];
}

export async function updateWhatsAppNumber(
  phone: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden cambiar el número' };
  }
  const digits = (phone || '').replace(/\D/g, '');
  if (!/^9\d{8}$/.test(digits)) {
    return { success: false, error: 'Número inválido: deben ser 9 dígitos y empezar en 9' };
  }
  const supabase = createAdminClient();
  // upsert: crea la fila si no existe (clave única en `key`) o la actualiza si ya existe.
  // Así el panel funciona en prod sin tener que insertar la fila manualmente.
  const { error } = await supabase
    .from('system_settings')
    .upsert(
      { key: 'whatsapp_number', value: digits, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) return { success: false, error: error.message };

  revalidatePath('/panel/configuracion');
  // Next.js 16: revalidateTag exige un segundo argumento (cacheLife profile).
  revalidateTag(WHATSAPP_TAG, 'max');
  return { success: true };
}
