'use client';

import { ALERT_TYPE_LABELS, ALERT_TYPE_COLORS, ALERT_TYPE_ICONS } from '@/lib/crm/types';
import type { AlertType } from '@/lib/crm/types';

interface AlertBadgeProps {
  alerts: AlertType[];
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export default function AlertBadge({
  alerts,
  size = 'sm',
  showTooltip = true,
}: AlertBadgeProps) {
  if (!alerts || alerts.length === 0) return null;

  // Ordenar alertas por prioridad (más urgente primero)
  const alertPriority: Record<AlertType, number> = {
    no_contact: 1,
    overdue_activity: 2,
    quotation_no_response: 3,
    stalled: 4,
  };

  const sortedAlerts = [...alerts].sort(
    (a, b) => alertPriority[a] - alertPriority[b]
  );

  // Mostrar solo el alert más urgente si hay múltiples
  const primaryAlert = sortedAlerts[0];
  const hasMultiple = sortedAlerts.length > 1;

  const sizeClasses = size === 'sm'
    ? 'w-5 h-5 text-xs'
    : 'w-6 h-6 text-sm';

  const tooltipContent = sortedAlerts
    .map((alert) => `${ALERT_TYPE_ICONS[alert]} ${ALERT_TYPE_LABELS[alert]}`)
    .join('\n');

  return (
    <div className="relative group">
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center font-medium text-white`}
        style={{ backgroundColor: ALERT_TYPE_COLORS[primaryAlert] }}
        title={!showTooltip ? tooltipContent : undefined}
      >
        {hasMultiple ? sortedAlerts.length : ALERT_TYPE_ICONS[primaryAlert]}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
            <div className="font-medium mb-1">Alertas:</div>
            <ul className="space-y-1">
              {sortedAlerts.map((alert) => (
                <li key={alert} className="flex items-center gap-2">
                  <span>{ALERT_TYPE_ICONS[alert]}</span>
                  <span>{ALERT_TYPE_LABELS[alert]}</span>
                </li>
              ))}
            </ul>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

// Component for displaying alerts inline (for lists)
export function AlertIndicators({ alerts }: { alerts: AlertType[] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {alerts.map((alert) => (
        <span
          key={alert}
          className="text-sm"
          title={ALERT_TYPE_LABELS[alert]}
        >
          {ALERT_TYPE_ICONS[alert]}
        </span>
      ))}
    </div>
  );
}
