import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      clientName,
      clientRuc,
      clientEmail,
      clientPhone,
      clientAddress,
      items,
      subtotal,
      igv,
      total,
      includeIgv,
      currency,
      validityDays,
      deliveryTime,
      paymentTerms,
      notes,
      status = 'draft',
    } = body;

    // First, create or find client
    let clientId = null;

    if (clientName) {
      // Check if client exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('company_name', clientName)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;

        // Update client info
        await supabase
          .from('clients')
          .update({
            ruc: clientRuc || null,
            contact_email: clientEmail || null,
            contact_phone: clientPhone || null,
            address: clientAddress || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', clientId);
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            company_name: clientName,
            contact_name: clientName,
            ruc: clientRuc || null,
            contact_email: clientEmail || null,
            contact_phone: clientPhone || null,
            address: clientAddress || null,
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Error creating client:', clientError);
        } else {
          clientId = newClient.id;
        }
      }
    }

    // Calculate validity date
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + (validityDays || 15));

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        code,
        client_id: clientId,
        type: 'small', // Default type for simplified quotations
        status,
        duration_days: 1,
        subtotal: subtotal || 0,
        igv: igv || 0,
        total: total || 0,
        currency: currency || 'PEN',
        validity_days: validityDays || 15,
        validity_date: validityDate.toISOString().split('T')[0],
        payment_terms: paymentTerms || 'Contado',
        notes: [deliveryTime, notes].filter(Boolean).join('\n'),
        created_by: user.id,
      })
      .select('id')
      .single();

    if (quotationError) {
      console.error('Error creating quotation:', quotationError);
      return NextResponse.json(
        { message: 'Error al crear cotización', error: quotationError.message },
        { status: 500 }
      );
    }

    // Create quotation items
    if (items && items.length > 0) {
      const quotationItems = items.map((item: {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        subtotal: number;
      }, index: number) => ({
        quotation_id: quotation.id,
        sequence: index,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || 'unit',
        unit_price: item.unitPrice,
        total_price: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(quotationItems);

      if (itemsError) {
        console.error('Error creating items:', itemsError);
      }
    }

    return NextResponse.json({
      id: quotation.id,
      message: 'Cotización creada exitosamente',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: quotations, error } = await supabase
      .from('quotations')
      .select(`
        *,
        clients (
          company_name,
          contact_name,
          contact_email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { message: 'Error al obtener cotizaciones', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(quotations);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
