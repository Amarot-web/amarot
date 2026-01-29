'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

export async function updateGoogleAnalyticsId(
  measurementId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Validar formato del Measurement ID (G-XXXXXXXXXX)
  if (measurementId && !/^G-[A-Z0-9]+$/.test(measurementId)) {
    return { success: false, error: 'El ID debe tener formato G-XXXXXXXXXX' };
  }

  // Verificar si ya existe el registro
  const { data: existing } = await supabase
    .from('system_settings')
    .select('id')
    .eq('key', 'google_analytics_id')
    .single();

  if (existing) {
    // Actualizar
    const { error } = await supabase
      .from('system_settings')
      .update({
        value: measurementId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('key', 'google_analytics_id');

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Insertar
    const { error } = await supabase
      .from('system_settings')
      .insert({
        key: 'google_analytics_id',
        value: measurementId || null,
      });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/panel/analytics');
  revalidatePath('/'); // Revalidar el layout principal
  return { success: true };
}

export async function getGoogleAnalyticsId(): Promise<string | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'google_analytics_id')
    .single();

  if (data?.value && typeof data.value === 'string') {
    return data.value;
  }

  return null;
}
