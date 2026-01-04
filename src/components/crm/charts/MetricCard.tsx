'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  format?: 'number' | 'currency' | 'percent' | 'days';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
};

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  format = 'number',
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        if (val >= 1000000) {
          return `S/.${(val / 1000000).toFixed(1)}M`;
        }
        if (val >= 1000) {
          return `S/.${(val / 1000).toFixed(1)}k`;
        }
        return `S/.${val.toLocaleString('es-PE')}`;
      case 'percent':
        return `${val}%`;
      case 'days':
        return `${val} días`;
      default:
        return val.toLocaleString('es-PE');
    }
  };

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const showChange = change !== undefined && change !== 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatValue(value)}
          </p>
          {showChange && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive && (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {isNegative && (
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {isPositive ? '+' : ''}{change}
                {format === 'percent' || format === 'days' ? '' : '%'}
                {changeLabel && <span className="text-gray-400 ml-1">{changeLabel}</span>}
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg border ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
