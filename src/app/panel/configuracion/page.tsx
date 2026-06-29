import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/permissions';
import { getNotificationEmails } from '@/lib/contact/actions';
import { getWhatsAppNumber } from '@/lib/contact/whatsapp';
import NotificationEmailsForm from './NotificationEmailsForm';
import WhatsAppNumberForm from './WhatsAppNumberForm';

export default async function ConfiguracionPage() {
  try {
    await requireRole('manager'); // Admins y gerentes
  } catch {
    redirect('/panel/dashboard');
  }

  const emails = await getNotificationEmails();
  const whatsapp = await getWhatsAppNumber();

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">
          Configura las opciones del sistema
        </p>
      </div>

      {/* Notification Emails */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Emails de Notificación
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Los nuevos mensajes del formulario de contacto se enviarán a estos emails.
        </p>

        <NotificationEmailsForm initialEmails={emails} />
      </div>

      {/* Número de WhatsApp / contacto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Número de WhatsApp / contacto
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Se usa en los botones de WhatsApp y teléfonos de toda la web.
        </p>

        <WhatsAppNumberForm initial={whatsapp} />
      </div>
    </div>
  );
}
