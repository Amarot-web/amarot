import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { contactFormSchema, serviceTypeLabels } from '@/lib/contact/validation';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting: máximo 3 envíos por hora por IP
async function checkRateLimit(supabase: ReturnType<typeof createAdminClient>, ip: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo);

  return (count || 0) < 3;
}

// Verificar Turnstile token con Cloudflare
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification');
    return true; // En desarrollo sin key, permitir
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Obtener emails de notificación desde configuración
async function getNotificationEmails(supabase: ReturnType<typeof createAdminClient>): Promise<string[]> {
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'contact_notification_emails')
    .single();

  if (data?.value && Array.isArray(data.value)) {
    return data.value;
  }

  return ['jaromerohassinger@gmail.com']; // Fallback
}

// Enviar email de notificación
async function sendNotificationEmail(
  emails: string[],
  data: {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    serviceType: string;
    location: string;
    message: string;
  }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return;
  }

  const serviceLabel = serviceTypeLabels[data.serviceType] || data.serviceType;

  try {
    const result = await resend.emails.send({
      from: 'AMAROT Web <onboarding@resend.dev>',
      to: emails,
      replyTo: data.email,
      subject: `Nuevo contacto: ${data.name} (${data.company}) - ${serviceLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E3A8A; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nuevo Mensaje de Contacto</h1>
          </div>

          <div style="padding: 20px; background-color: #f9fafb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 140px;">Nombre:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Empresa:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.company}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  <a href="mailto:${data.email}">${data.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Teléfono:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  ${data.phone ? `<a href="tel:${data.phone}">${data.phone}</a>` : 'No proporcionado'}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Servicio:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  <span style="background-color: #DC2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                    ${serviceLabel}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Ubicación:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.location}</td>
              </tr>
            </table>

            <div style="margin-top: 20px;">
              <h3 style="color: #1E3A8A; margin-bottom: 10px;">Mensaje:</h3>
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${data.message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>

          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Este mensaje fue enviado desde el formulario de contacto de amarotperu.com</p>
            <p>
              <a href="https://app.amarotperu.com/panel/mensajes" style="color: #DC2626;">
                Ver todos los mensajes en el panel
              </a>
            </p>
          </div>
        </div>
      `,
    });
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validar datos con Zod
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 2. Verificar honeypot
    if (data.website && data.website.length > 0) {
      // Bot detectado, pero respondemos como si fuera exitoso
      return NextResponse.json({ success: true });
    }

    // Obtener IP del cliente
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // 3. Verificar Turnstile
    const turnstileValid = await verifyTurnstile(data.turnstileToken, ip);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Verificación fallida. Intenta de nuevo.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 4. Rate limiting
    const withinLimit = await checkRateLimit(supabase, ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Has enviado demasiados mensajes. Intenta más tarde.' },
        { status: 429 }
      );
    }

    // 5. Guardar en base de datos
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || null,
        service_type: data.serviceType,
        location: data.location,
        message: data.message,
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || null,
      });

    if (dbError) {
      console.error('Error saving contact message:', dbError);
      return NextResponse.json(
        { error: 'Error al guardar el mensaje. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // 6. Enviar email de notificación
    const notificationEmails = await getNotificationEmails(supabase);
    await sendNotificationEmail(notificationEmails, {
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
      location: data.location,
      message: data.message,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Error del servidor. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
