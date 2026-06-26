import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

const DEFAULT_WHATSAPP = '987667280';
export const WHATSAPP_TAG = 'whatsapp-number';

/** Lee el número (solo dígitos) desde system_settings, cacheado con tag para revalidar. */
export const getWhatsAppNumber = unstable_cache(
  async (): Promise<string> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single();
    const v = typeof data?.value === 'string' ? data.value : null;
    return v && /^\d{9}$/.test(v) ? v : DEFAULT_WHATSAPP;
  },
  ['whatsapp-number'],
  { tags: [WHATSAPP_TAG] }
);

/** Deriva todos los formatos a partir de los 9 dígitos. */
export function whatsappLinks(phone: string) {
  const digits = (phone || DEFAULT_WHATSAPP).replace(/\D/g, '').slice(-9);
  const display = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return {
    digits,
    waLink: `https://wa.me/51${digits}`,
    telLink: `tel:+51${digits}`,
    display,                 // 987 667 280
    schema: `+51 ${display}`, // +51 987 667 280
  };
}
