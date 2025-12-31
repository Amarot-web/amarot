import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getNotificationEmails } from '@/lib/contact/actions';
import NotificationEmailsForm from './NotificationEmailsForm';

export default async function ConfiguracionPage() {
  try {
    await requirePermission('team:view'); // Solo admins/gerentes
  } catch {
    redirect('/panel/dashboard');
  }

  const emails = await getNotificationEmails();

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
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
    </div>
  );
}
