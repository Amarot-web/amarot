import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Get original quotation with items
    const { data: original, error: fetchError } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (
          sequence,
          display_type,
          service_type,
          description,
          diameter,
          depth,
          working_height,
          quantity,
          unit,
          unit_price,
          total_price
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      return NextResponse.json(
        { message: 'Cotización no encontrada' },
        { status: 404 }
      );
    }

    // Generate new code
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .ilike('code', `COT-${year}-%`);

    const nextNumber = (count || 0) + 1;
    const newCode = `COT-${year}-${String(nextNumber).padStart(4, '0')}`;

    // Calculate new validity date
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + (original.validity_days || 15));

    // Create new quotation
    const { data: newQuotation, error: createError } = await supabase
      .from('quotations')
      .insert({
        code: newCode,
        client_id: original.client_id,
        type: original.type,
        status: 'draft', // Always start as draft
        duration_days: original.duration_days,
        duration_months: original.duration_months,
        subtotal: original.subtotal,
        margin_percentage: original.margin_percentage,
        margin_amount: original.margin_amount,
        igv: original.igv,
        total: original.total,
        currency: original.currency,
        validity_days: original.validity_days,
        validity_date: validityDate.toISOString().split('T')[0],
        payment_terms: original.payment_terms,
        notes: original.notes,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (createError || !newQuotation) {
      return NextResponse.json(
        { message: 'Error al duplicar cotización', error: createError?.message },
        { status: 500 }
      );
    }

    // Duplicate items
    if (original.quotation_items && original.quotation_items.length > 0) {
      const newItems = original.quotation_items.map((item: {
        sequence: number;
        display_type: string | null;
        service_type: string | null;
        description: string;
        diameter: number | null;
        depth: number | null;
        working_height: number | null;
        quantity: number;
        unit: string;
        unit_price: number;
        total_price: number;
      }) => ({
        quotation_id: newQuotation.id,
        sequence: item.sequence,
        display_type: item.display_type,
        service_type: item.service_type,
        description: item.description,
        diameter: item.diameter,
        depth: item.depth,
        working_height: item.working_height,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(newItems);

      if (itemsError) {
        console.error('Error duplicating items:', itemsError);
      }
    }

    return NextResponse.json({
      id: newQuotation.id,
      code: newCode,
      message: 'Cotización duplicada exitosamente',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
