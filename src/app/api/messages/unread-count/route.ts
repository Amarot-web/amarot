import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';

export async function GET() {
  try {
    // Verificar autenticación
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Contar mensajes con status 'new'
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (error) {
      console.error('Error fetching unread count:', error);
      return NextResponse.json({ count: 0 }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Unread count error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
