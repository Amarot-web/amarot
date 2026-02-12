import { createClient } from '@/lib/supabase/server';
import QuotationBuilder from '../components/QuotationBuilder';

interface Client {
  id: string;
  name: string;
  ruc?: string;
}

export default async function NuevaCotizacionPage() {
  const supabase = await createClient();

  // Generate new quotation code
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .ilike('code', `COT-${year}-%`);

  const nextNumber = (count || 0) + 1;
  const newCode = `COT-${year}-${String(nextNumber).padStart(4, '0')}`;

  // Get existing clients for autocomplete
  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, company_name, ruc')
    .order('company_name', { ascending: true })
    .limit(100);

  // Transform to the format expected by QuotationBuilder
  const clients: Client[] = (clientsData || []).map(c => ({
    id: c.id,
    name: c.company_name,
    ruc: c.ruc || undefined,
  }));

  return (
    <QuotationBuilder
      mode="create"
      initialCode={newCode}
      existingClients={clients}
    />
  );
}
