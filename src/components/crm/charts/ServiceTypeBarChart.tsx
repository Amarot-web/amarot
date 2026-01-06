'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { LeadsByService } from '@/lib/crm/types';
import { SERVICE_TYPE_COLORS } from '@/lib/crm/types';

interface ServiceTypeBarChartProps {
  data: LeadsByService[];
}

export default function ServiceTypeBarChart({ data }: ServiceTypeBarChartProps) {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.serviceLabel,
      value: item.value,
      weightedValue: item.weightedValue,
      count: item.count,
      color: SERVICE_TYPE_COLORS[item.serviceType] || '#6B7280',
    }))
    .sort((a, b) => b.value - a.value);

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
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.count}</span> leads
          </p>
          <p className="text-sm text-gray-600">
            Valor: <span className="font-medium">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-sm text-gray-500">
            Ponderado: {formatCurrency(data.weightedValue)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos de servicios
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            fontSize={12}
            stroke="#9ca3af"
          />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            fontSize={11}
            stroke="#9ca3af"
            tickFormatter={(value) => value.length > 18 ? `${value.slice(0, 18)}...` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
