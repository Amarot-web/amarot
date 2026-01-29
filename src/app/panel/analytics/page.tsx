import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getGoogleAnalyticsId } from '@/lib/analytics/actions';
import GoogleAnalyticsForm from './GoogleAnalyticsForm';

export default async function AnalyticsPage() {
  try {
    await requirePermission('team:view'); // Solo admins
  } catch {
    redirect('/panel/dashboard');
  }

  const gaId = await getGoogleAnalyticsId();

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">
          Configura Google Analytics para tu sitio web
        </p>
      </div>

      {/* Google Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.84 2.9982V21.0018C22.84 21.5538 22.3918 22 21.8398 22H2.16016C1.60816 22 1.16 21.5538 1.16 21.0018V2.9982C1.16 2.4462 1.60816 2 2.16016 2H21.8398C22.3918 2 22.84 2.4462 22.84 2.9982ZM19.84 14L19.84 10L16.5 10L16.5 14L19.84 14ZM14.5 14L14.5 7L11.16 7L11.16 14L14.5 14ZM9.16 14L9.16 11L5.82 11L5.82 14L9.16 14Z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Google Analytics 4
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Conecta tu cuenta de Google Analytics para rastrear visitas y comportamiento de usuarios.
            </p>
          </div>
        </div>

        <GoogleAnalyticsForm initialId={gaId} />

        {/* Ayuda */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            ¿Cómo obtener el Measurement ID?
          </h3>
          <ol className="text-sm text-gray-500 space-y-2 list-decimal list-inside">
            <li>Ve a <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics</a></li>
            <li>Selecciona o crea una propiedad GA4</li>
            <li>Ve a <strong>Administrar</strong> → <strong>Flujos de datos</strong></li>
            <li>Selecciona tu flujo web</li>
            <li>Copia el <strong>ID de medición</strong> (formato: G-XXXXXXXXXX)</li>
          </ol>
        </div>
      </div>

      {/* Estado actual */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          {gaId ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Google Analytics está <strong className="text-green-600">activo</strong>
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Google Analytics está <strong className="text-gray-500">inactivo</strong>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
