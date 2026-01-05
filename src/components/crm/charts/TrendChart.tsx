'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { LeadsByPeriod } from '@/lib/crm/types';

interface TrendChartProps {
  data: LeadsByPeriod[];
  showRevenue?: boolean;
}

export default function TrendChart({ data, showRevenue = false }: TrendChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `S/.${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `S/.${(value / 1000).toFixed(0)}k`;
    }
    return `S/.${value}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'revenue'
                ? `Ingresos: ${formatCurrency(entry.value)}`
                : `${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos para el período seleccionado
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="periodLabel"
            fontSize={12}
            stroke="#9ca3af"
            tickLine={false}
          />
          <YAxis
            fontSize={12}
            stroke="#9ca3af"
            tickLine={false}
            tickFormatter={(v) => (showRevenue ? formatCurrency(v) : String(v))}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => (
              <span className="text-sm text-gray-600">
                {value === 'newLeads'
                  ? 'Nuevos'
                  : value === 'wonLeads'
                  ? 'Ganados'
                  : value === 'revenue'
                  ? 'Ingresos'
                  : value}
              </span>
            )}
          />
          {showRevenue ? (
            <Area
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#8B5CF6"
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="newLeads"
                name="newLeads"
                stroke="#3B82F6"
                fill="url(#colorLeads)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="wonLeads"
                name="wonLeads"
                stroke="#22C55E"
                fill="url(#colorWon)"
                strokeWidth={2}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
