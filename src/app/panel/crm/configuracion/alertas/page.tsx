import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getAlertSettings } from '@/lib/crm/queries';
import AlertSettingsClient from './AlertSettingsClient';

export default async function AlertasConfigPage() {
  try {
    await requirePermission('team:view');
  } catch {
    redirect('/panel/dashboard');
  }

  const settings = await getAlertSettings();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/panel/crm" className="hover:text-[#DC2626]">
            Pipeline
          </Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/panel/crm/alertas" className="hover:text-[#DC2626]">
            Alertas
          </Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Configuracion</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuracion de Alertas
            </h1>
            <p className="text-gray-500 mt-1">
              Define los tiempos para disparar cada tipo de alerta en el CRM
            </p>
          </div>
          <Link
            href="/panel/crm/alertas"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Ver Alertas
          </Link>
        </div>
      </div>

      <AlertSettingsClient initialSettings={settings} />
    </div>
  );
}
