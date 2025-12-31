import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuotationEditWizard from '@/components/quotation/QuotationEditWizard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Obtener cotización completa
  const { data: quotation, error } = await supabase
    .from('quotations')
    .select(`
      *,
      clients (*)
    `)
    .eq('id', id)
    .single();

  if (error || !quotation) {
    notFound();
  }

  // Solo se pueden editar borradores
  if (quotation.status !== 'draft') {
    redirect(`/panel/cotizador/${id}`);
  }

  // Obtener items
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', id)
    .order('sequence');

  // Obtener costos
  const { data: laborCosts } = await supabase
    .from('labor_costs')
    .select('*')
    .eq('quotation_id', id);

  const { data: logisticsCosts } = await supabase
    .from('logistics_costs')
    .select('*')
    .eq('quotation_id', id);

  const { data: materialCosts } = await supabase
    .from('material_costs')
    .select('*')
    .eq('quotation_id', id);

  const { data: equipmentCosts } = await supabase
    .from('equipment_costs')
    .select('*')
    .eq('quotation_id', id);

  // Preparar datos iniciales para el wizard
  const initialData = {
    quotationId: quotation.id,
    client: quotation.clients ? {
      id: quotation.clients.id,
      companyName: quotation.clients.company_name,
      ruc: quotation.clients.ruc,
      contactName: quotation.clients.contact_name,
      contactEmail: quotation.clients.contact_email,
      contactPhone: quotation.clients.contact_phone,
      address: quotation.clients.address,
      createdAt: new Date(quotation.clients.created_at),
      updatedAt: new Date(quotation.clients.updated_at),
    } : null,
    quotationType: quotation.type as 'small' | 'large',
    currency: quotation.currency as 'PEN' | 'USD',
    durationDays: quotation.duration_days,
    marginPercentage: Number(quotation.margin_percentage),
    validityDays: quotation.validity_days,
    paymentTerms: quotation.payment_terms || '',
    notes: quotation.notes || '',
    items: (items || []).map((item) => ({
      id: item.id,
      quotationId: item.quotation_id,
      sequence: item.sequence,
      displayType: item.display_type as 'product' | 'section' | 'note',
      serviceType: item.service_type,
      description: item.description,
      diameter: item.diameter,
      depth: item.depth,
      workingHeight: item.working_height,
      quantity: item.quantity,
      unit: item.unit as 'unit' | 'meter' | 'sqm' | 'hour' | 'day',
      unitPrice: Number(item.unit_price),
      totalPrice: Number(item.total_price),
    })),
    laborCosts: (laborCosts || []).map((cost) => ({
      id: cost.id,
      quotationId: cost.quotation_id,
      role: cost.role as 'leader' | 'operator' | 'helper',
      description: cost.description,
      quantity: cost.quantity,
      dailyRate: Number(cost.daily_rate),
      daysWorked: cost.days_worked,
      totalCost: Number(cost.total_cost),
      includeBenefits: cost.include_benefits,
      benefitsPercentage: cost.benefits_percentage ? Number(cost.benefits_percentage) : null,
    })),
    logisticsCosts: (logisticsCosts || []).map((cost) => ({
      id: cost.id,
      quotationId: cost.quotation_id,
      type: cost.type as 'food' | 'lodging' | 'transport' | 'fuel' | 'other',
      description: cost.description,
      quantity: cost.quantity,
      unitCost: Number(cost.unit_cost),
      totalCost: Number(cost.total_cost),
    })),
    materialCosts: (materialCosts || []).map((cost) => ({
      id: cost.id,
      quotationId: cost.quotation_id,
      type: cost.type as 'drill_bits' | 'anchors' | 'chemicals' | 'ppe' | 'other',
      description: cost.description,
      quantity: cost.quantity,
      unitCost: Number(cost.unit_cost),
      totalCost: Number(cost.total_cost),
      perforationsPerUnit: cost.perforations_per_unit,
    })),
    equipmentCosts: (equipmentCosts || []).map((cost) => ({
      id: cost.id,
      quotationId: cost.quotation_id,
      type: cost.type as 'drill' | 'generator' | 'scanner' | 'vehicle' | 'other',
      description: cost.description,
      quantity: cost.quantity,
      dailyRate: Number(cost.daily_rate),
      daysUsed: cost.days_used,
      totalCost: Number(cost.total_cost),
      isOwned: cost.is_owned,
    })),
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Cotización</h1>
        <p className="text-gray-500 mt-1">
          {quotation.code} - {quotation.clients?.company_name || 'Sin cliente'}
        </p>
      </div>
      <QuotationEditWizard initialData={initialData} />
    </div>
  );
}
