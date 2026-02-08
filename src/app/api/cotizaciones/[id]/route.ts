import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        clients (
          id,
          company_name,
          contact_name,
          contact_email,
          contact_phone,
          address,
          ruc
        ),
        quotation_items (
          id,
          sequence,
          description,
          quantity,
          unit,
          unit_price,
          total_price
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { message: 'Cotización no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientName,
      clientRuc,
      clientEmail,
      clientPhone,
      clientAddress,
      items,
      subtotal,
      igv,
      total,
      currency,
      validityDays,
      deliveryTime,
      paymentTerms,
      notes,
      status,
      conditions,
    } = body;

    // Update or create client
    let clientId = null;

    if (clientName) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('company_name', clientName)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
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
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            company_name: clientName,
            contact_name: clientName,
            ruc: clientRuc || null,
            contact_email: clientEmail || null,
            contact_phone: clientPhone || '-',
            address: clientAddress || null,
          })
          .select('id')
          .single();

        if (newClient) {
          clientId = newClient.id;
        }
      }
    }

    // Calculate validity date
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + (validityDays || 15));

    // Update quotation
    const { error: quotationError } = await supabase
      .from('quotations')
      .update({
        client_id: clientId,
        status: status || 'draft',
        subtotal: subtotal || 0,
        igv: igv || 0,
        total: total || 0,
        currency: currency || 'PEN',
        validity_days: validityDays || 15,
        validity_date: validityDate.toISOString().split('T')[0],
        payment_terms: paymentTerms || 'Contado',
        notes: [deliveryTime, notes].filter(Boolean).join('\n'),
        conditions: conditions || [],
        updated_at: new Date().toISOString(),
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (quotationError) {
      return NextResponse.json(
        { message: 'Error al actualizar cotización', error: quotationError.message },
        { status: 500 }
      );
    }

    // Delete existing items and recreate
    await supabase
      .from('quotation_items')
      .delete()
      .eq('quotation_id', id);

    if (items && items.length > 0) {
      const quotationItems = items.map((item: {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        subtotal: number;
      }, index: number) => ({
        quotation_id: id,
        sequence: index,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || 'unit',
        unit_price: item.unitPrice,
        total_price: item.subtotal,
      }));

      await supabase.from('quotation_items').insert(quotationItems);
    }

    return NextResponse.json({
      id,
      message: 'Cotización actualizada exitosamente',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Check if quotation can be deleted (only drafts)
    const { data: quotation } = await supabase
      .from('quotations')
      .select('status')
      .eq('id', id)
      .single();

    if (!quotation) {
      return NextResponse.json(
        { message: 'Cotización no encontrada' },
        { status: 404 }
      );
    }

    if (quotation.status !== 'draft') {
      return NextResponse.json(
        { message: 'Solo se pueden eliminar cotizaciones en borrador' },
        { status: 400 }
      );
    }

    // Delete quotation (items will cascade)
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { message: 'Error al eliminar cotización', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Cotización eliminada exitosamente',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
