import { createAdminClient } from '@/lib/supabase/server';
import {
  getCRMMetrics,
  getLeadsByPeriod,
  getPipelineSummary,
  getLeadsRequiringAttention,
} from '@/lib/crm/queries';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createAdminClient();

  // Calcular fechas para el período actual (último mes)
  const now = new Date();
  const dateFrom = new Date(now);
  dateFrom.setMonth(dateFrom.getMonth() - 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch all data in parallel
  const [
    metrics,
    pipeline,
    trendData,
    alertLeads,
    messagesResult,
    clientsResult,
    recentLeadsResult,
    recentClientsResult,
    recentMessagesResult,
    blogResult,
  ] = await Promise.all([
    // CRM Metrics
    getCRMMetrics(dateFrom, now),

    // Pipeline summary
    getPipelineSummary(),

    // Trend data for last 30 days
    getLeadsByPeriod('day', dateFrom, now),

    // Leads requiring attention
    getLeadsRequiringAttention(),

    // Message stats
    supabase
      .from('contact_messages')
      .select('id, status')
      .then(({ data }) => ({
        total: data?.length || 0,
        new: data?.filter(m => m.status === 'new').length || 0,
      })),

    // Client stats
    Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('clients').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    ]).then(([total, newThisMonth]) => ({
      total: total.count || 0,
      newThisMonth: newThisMonth.count || 0,
    })),

    // Recent leads (last 5)
    supabase
      .from('leads')
      .select('id, code, company, contact_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent clients (last 5)
    supabase
      .from('clients')
      .select('id, company_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent messages (last 5)
    supabase
      .from('contact_messages')
      .select('id, name, company, created_at')
      .order('created_at', { ascending: false })
      .limit(5),

    // Blog stats
    Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ]).then(([total, published]) => ({
      total: total.count || 0,
      published: published.count || 0,
    })),
  ]);

  // Compile recent activity feed
  type ActivityItem = {
    id: string;
    type: 'lead' | 'client' | 'message';
    title: string;
    subtitle: string;
    date: Date;
    href: string;
  };

  const recentActivity: ActivityItem[] = [];

  // Add recent leads
  if (recentLeadsResult.data) {
    for (const lead of recentLeadsResult.data) {
      recentActivity.push({
        id: `lead-${lead.id}`,
        type: 'lead',
        title: lead.company || 'Sin empresa',
        subtitle: `Lead ${lead.code} • ${lead.contact_name}`,
        date: new Date(lead.created_at),
        href: `/panel/crm/leads/${lead.id}`,
      });
    }
  }

  // Add recent clients
  if (recentClientsResult.data) {
    for (const client of recentClientsResult.data) {
      recentActivity.push({
        id: `client-${client.id}`,
        type: 'client',
        title: client.company_name,
        subtitle: 'Nuevo cliente registrado',
        date: new Date(client.created_at),
        href: `/panel/clientes/${client.id}`,
      });
    }
  }

  // Add recent messages
  if (recentMessagesResult.data) {
    for (const msg of recentMessagesResult.data) {
      recentActivity.push({
        id: `msg-${msg.id}`,
        type: 'message',
        title: msg.name,
        subtitle: msg.company || 'Mensaje de contacto',
        date: new Date(msg.created_at),
        href: '/panel/mensajes',
      });
    }
  }

  // Sort by date descending and take top 8
  recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
  const topActivity = recentActivity.slice(0, 8);

  return (
    <DashboardClient
      metrics={metrics}
      pipeline={pipeline}
      trendData={trendData}
      alertLeads={alertLeads}
      recentActivity={topActivity}
      messageStats={messagesResult}
      clientStats={clientsResult}
      blogStats={blogResult}
    />
  );
}
