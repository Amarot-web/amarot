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
import type { PipelineStageSummary } from '@/lib/crm/types';

interface PipelineChartProps {
  data: PipelineStageSummary[];
  showValue?: boolean;
}

export default function PipelineChart({ data, showValue = true }: PipelineChartProps) {
  // Filtrar etapas cerradas (won/lost) para el gráfico del embudo
  const activeStages = data.filter((s) => !s.isWon && !s.isLost);

  const chartData = activeStages.map((stage) => ({
    name: stage.displayName,
    leads: stage.leadCount,
    value: stage.totalRevenue,
    weightedValue: stage.weightedRevenue,
    color: stage.color,
  }));

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
            <span className="font-medium">{data.leads}</span> leads
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
        No hay datos del pipeline
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
            tickFormatter={(v) => (showValue ? formatCurrency(v) : String(v))}
            fontSize={12}
            stroke="#9ca3af"
          />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            fontSize={12}
            stroke="#9ca3af"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={showValue ? 'value' : 'leads'}
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
