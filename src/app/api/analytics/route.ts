import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getAuthUser } from '@/lib/auth/permissions';

// Property ID de Google Analytics (configurar en .env)
const propertyId = process.env.GA_PROPERTY_ID;

// Inicializar cliente con credenciales desde variables de entorno
function getAnalyticsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY no configurado');
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      // Reemplazar \n literales por saltos de línea reales
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
  });
}

export async function GET() {
  // Verificar autenticación
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!propertyId) {
    return NextResponse.json(
      { error: 'GA_PROPERTY_ID no configurado' },
      { status: 500 }
    );
  }

  try {
    const client = getAnalyticsClient();

    // Obtener datos en paralelo
    const [realtime, last30Days, topPages, trafficSources, devices, dailyData] =
      await Promise.all([
        // Usuarios activos ahora (realtime)
        client.runRealtimeReport({
          property: `properties/${propertyId}`,
          metrics: [{ name: 'activeUsers' }],
        }),

        // Resumen últimos 30 días
        client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
          ],
        }),

        // Top páginas
        client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        }),

        // Fuentes de tráfico
        client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionSource' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 5,
        }),

        // Dispositivos
        client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }],
        }),

        // Datos diarios para el gráfico (últimos 14 días)
        client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '14daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
          orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
        }),
      ]);

    // Formatear respuesta
    const summary = last30Days[0]?.rows?.[0]?.metricValues || [];
    const realtimeUsers =
      realtime[0]?.rows?.[0]?.metricValues?.[0]?.value || '0';

    return NextResponse.json({
      realtime: {
        activeUsers: parseInt(realtimeUsers),
      },
      summary: {
        users: parseInt(summary[0]?.value || '0'),
        sessions: parseInt(summary[1]?.value || '0'),
        pageViews: parseInt(summary[2]?.value || '0'),
        avgSessionDuration: parseFloat(summary[3]?.value || '0'),
        bounceRate: parseFloat(summary[4]?.value || '0'),
      },
      topPages: (topPages[0]?.rows || []).map((row) => ({
        path: row.dimensionValues?.[0]?.value || '',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
      })),
      trafficSources: (trafficSources[0]?.rows || []).map((row) => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      })),
      devices: (devices[0]?.rows || []).map((row) => ({
        device: row.dimensionValues?.[0]?.value || '',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      })),
      daily: (dailyData[0]?.rows || []).map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[1]?.value || '0'),
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de analytics' },
      { status: 500 }
    );
  }
}
