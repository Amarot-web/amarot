import { createAdminClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { serviceTypeLabels } from '@/lib/contact/validation';
import MessageItem from './MessageItem';

interface Message {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service_type: string | null;
  location: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'spam' | 'converted';
  lead_id: string | null;
  lead_code?: string | null;
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  read: { label: 'Leído', color: 'bg-gray-100 text-gray-800' },
  replied: { label: 'Respondido', color: 'bg-green-100 text-green-800' },
  spam: { label: 'Spam', color: 'bg-red-100 text-red-800' },
  converted: { label: 'Convertido', color: 'bg-purple-100 text-purple-800' },
};

export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  try {
    await requirePermission('clients:view'); // Usamos el permiso de clientes por ahora
  } catch {
    redirect('/panel/dashboard');
  }

  const params = await searchParams;
  const statusFilter = params.status || 'all';

  const supabase = createAdminClient();

  // Obtener mensajes con información del lead vinculado
  let query = supabase
    .from('contact_messages')
    .select(`
      *,
      lead:leads(id, code)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: rawMessages, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
  }

  // Transformar mensajes para incluir lead_code
  const messages = (rawMessages || []).map((msg: { lead?: { id: string; code: string } | null } & Record<string, unknown>) => ({
    ...msg,
    lead_code: msg.lead?.code || null,
  }));

  // Obtener team members para el modal de conversión
  const { data: teamMembers } = await supabase
    .from('user_profiles')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name');

  const formattedTeamMembers = (teamMembers || []).map((m: { id: string; full_name: string }) => ({
    id: m.id,
    fullName: m.full_name,
  }));

  // Obtener conteos por status
  const { data: allMessages } = await supabase
    .from('contact_messages')
    .select('status');

  const counts = {
    all: allMessages?.length || 0,
    new: allMessages?.filter(m => m.status === 'new').length || 0,
    read: allMessages?.filter(m => m.status === 'read').length || 0,
    replied: allMessages?.filter(m => m.status === 'replied').length || 0,
    converted: allMessages?.filter(m => m.status === 'converted').length || 0,
    spam: allMessages?.filter(m => m.status === 'spam').length || 0,
  };


  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Mensajes de Contacto</h1>
        <p className="text-gray-500 mt-1">
          Gestiona los mensajes recibidos desde el formulario de contacto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { key: 'all', label: 'Todos', count: counts.all, color: 'bg-gray-500' },
          { key: 'new', label: 'Nuevos', count: counts.new, color: 'bg-blue-500' },
          { key: 'read', label: 'Leídos', count: counts.read, color: 'bg-gray-400' },
          { key: 'replied', label: 'Respondidos', count: counts.replied, color: 'bg-green-500' },
          { key: 'converted', label: 'Convertidos', count: counts.converted, color: 'bg-purple-500' },
          { key: 'spam', label: 'Spam', count: counts.spam, color: 'bg-red-500' },
        ].map((stat) => (
          <a
            key={stat.key}
            href={`/panel/mensajes${stat.key === 'all' ? '' : `?status=${stat.key}`}`}
            className={`p-4 rounded-lg border transition-all ${
              statusFilter === stat.key || (stat.key === 'all' && statusFilter === 'all')
                ? 'border-[#DC2626] bg-red-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {messages && messages.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {(messages as Message[]).map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                teamMembers={formattedTeamMembers}
                serviceTypeLabels={serviceTypeLabels}
                statusLabels={statusLabels}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500">No hay mensajes {statusFilter !== 'all' ? `con estado "${statusLabels[statusFilter]?.label || statusFilter}"` : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
