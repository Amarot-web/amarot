'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

export async function updateMessageStatus(
  messageId: string,
  status: 'new' | 'read' | 'replied' | 'spam'
): Promise<{ success: boolean; error?: string }> {
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
