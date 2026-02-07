'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Clock,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  realtime: {
    activeUsers: number;
  };
  summary: {
    users: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  topPages: Array<{ path: string; views: number }>;
  trafficSources: Array<{ source: string; sessions: number }>;
  devices: Array<{ device: string; sessions: number }>;
  daily: Array<{ date: string; users: number; pageViews: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cargar datos');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Actualizar cada 60 segundos
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    // Format: YYYYMMDD
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${day}/${month}`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-500">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const maxPageViews = Math.max(...data.daily.map((d) => d.pageViews), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Estadísticas de los últimos 30 días</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Google Analytics
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Realtime */}
      <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-600 font-medium">
            En tiempo real
          </span>
        </div>
        <p className="text-4xl font-bold text-gray-900 mt-2">
          {data.realtime.activeUsers}
        </p>
        <p className="text-gray-500 text-sm">usuarios activos ahora</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Usuarios"
          value={data.summary.users.toLocaleString()}
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Páginas vistas"
          value={data.summary.pageViews.toLocaleString()}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Duración media"
          value={formatDuration(data.summary.avgSessionDuration)}
        />
        <StatCard
          icon={<MousePointerClick className="w-5 h-5" />}
          label="Tasa de rebote"
          value={`${(data.summary.bounceRate * 100).toFixed(1)}%`}
        />
      </div>

      {/* Chart */}
      <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Visitas últimos 14 días
        </h2>
        <div className="flex">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-40 pr-3 text-right">
            <span className="text-xs text-gray-500">{maxPageViews}</span>
            <span className="text-xs text-gray-500">{Math.round(maxPageViews * 0.75)}</span>
            <span className="text-xs text-gray-500">{Math.round(maxPageViews * 0.5)}</span>
            <span className="text-xs text-gray-500">{Math.round(maxPageViews * 0.25)}</span>
            <span className="text-xs text-gray-500">0</span>
          </div>

          {/* Chart area */}
          <div className="flex-1 relative">
            <div className="h-40 border-l border-b border-gray-200 relative">
              {/* Grid lines */}
              <div className="absolute inset-0">
                <div className="absolute w-full border-t border-gray-100" style={{ top: '0%' }} />
                <div className="absolute w-full border-t border-gray-100" style={{ top: '25%' }} />
                <div className="absolute w-full border-t border-gray-100" style={{ top: '50%' }} />
                <div className="absolute w-full border-t border-gray-100" style={{ top: '75%' }} />
              </div>

              {/* SVG Line */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={data.daily.map((day, i) => {
                    const x = (i / (data.daily.length - 1)) * 100;
                    const y = 100 - (day.pageViews / maxPageViews) * 100;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>

              {/* Data points */}
              {data.daily.map((day, i) => {
                const leftPercent = (i / (data.daily.length - 1)) * 100;
                const topPercent = 100 - (day.pageViews / maxPageViews) * 100;
                return (
                  <div
                    key={day.date}
                    className="absolute w-3 h-3 -ml-1.5 -mt-1.5 bg-[#1E3A8A] rounded-full border-2 border-white shadow group cursor-pointer"
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.pageViews} vistas
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2">
              {data.daily.map((day, i) => (
                <span key={day.date} className="text-xs text-gray-500">
                  {formatDate(day.date)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Páginas populares
          </h2>
          <div className="space-y-3">
            {data.topPages.slice(0, 5).map((page) => (
              <div key={page.path} className="flex items-center justify-between">
                <span className="text-sm text-gray-500 truncate max-w-[200px]">
                  {page.path}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {page.views.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Fuentes de tráfico
          </h2>
          <div className="space-y-3">
            {data.trafficSources.map((source) => (
              <div
                key={source.source}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-500">
                  {source.source || '(direct)'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {source.sessions.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dispositivos
          </h2>
          <div className="space-y-3">
            {data.devices.map((device) => (
              <div
                key={device.device}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-gray-500">
                  {getDeviceIcon(device.device)}
                  <span className="text-sm capitalize">{device.device}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {device.sessions.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
