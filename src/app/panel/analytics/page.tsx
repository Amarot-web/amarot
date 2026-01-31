import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getGoogleAnalyticsId } from '@/lib/analytics/actions';
import GoogleAnalyticsForm from './GoogleAnalyticsForm';
import AnalyticsDashboard from './AnalyticsDashboard';

// Verificar si las credenciales de API están configuradas
const isApiConfigured = () => {
  return !!(
    process.env.GA_PROPERTY_ID &&
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
};

export default async function AnalyticsPage() {
  try {
    await requirePermission('team:view'); // Solo admins
  } catch {
    redirect('/panel/dashboard');
  }

  const gaId = await getGoogleAnalyticsId();
  const apiConfigured = isApiConfigured();

  return (
    <div className="space-y-8">
      {/* Dashboard de Analytics (solo si está configurado) */}
      {apiConfigured ? (
        <AnalyticsDashboard />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-2">
            Dashboard no disponible
          </h2>
          <p className="text-amber-700 text-sm">
            Para ver las estadísticas aquí, se necesita configurar las credenciales
            de la API de Google Analytics. Mientras tanto, puedes ver los datos en{' '}
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Google Analytics
            </a>
            .
          </p>
        </div>
      )}

      {/* Configuración del Measurement ID */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.84 2.9982V21.0018C22.84 21.5538 22.3918 22 21.8398 22H2.16016C1.60816 22 1.16 21.5538 1.16 21.0018V2.9982C1.16 2.4462 1.60816 2 2.16016 2H21.8398C22.3918 2 22.84 2.4462 22.84 2.9982ZM19.84 14L19.84 10L16.5 10L16.5 14L19.84 14ZM14.5 14L14.5 7L11.16 7L11.16 14L14.5 14ZM9.16 14L9.16 11L5.82 11L5.82 14L9.16 14Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Configuración de Google Analytics
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                El Measurement ID se usa para rastrear visitas en el sitio web.
              </p>
            </div>
          </div>

          <GoogleAnalyticsForm initialId={gaId} />

          {/* Estado actual */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {gaId ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Tracking activo: <code className="bg-gray-100 px-2 py-0.5 rounded">{gaId}</code>
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Google Analytics no está configurado
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
