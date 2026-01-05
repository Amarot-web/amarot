'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import type { Lead, AlertType } from '@/lib/crm/types';
import { SERVICE_TYPE_LABELS } from '@/lib/crm/types';
import AlertBadge from './AlertBadge';

interface LeadCardProps {
  lead: Lead;
  alerts?: AlertType[];
}

export default function LeadCard({ lead, alerts }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: 'lead',
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDeadline = () => {
    if (!lead.dateDeadline) return null;
    const today = new Date();
    const deadline = new Date(lead.dateDeadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilDeadline();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab
        hover:shadow-md hover:border-gray-300 transition-all
        ${isDragging ? 'opacity-50 shadow-lg rotate-2' : ''}
      `}
    >
      {/* Header with code, alerts and service */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">{lead.code}</span>
          {alerts && alerts.length > 0 && <AlertBadge alerts={alerts} size="sm" />}
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap">
          {SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType}
        </span>
      </div>

      {/* Company name */}
      <Link
        href={`/panel/crm/leads/${lead.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block font-semibold text-gray-900 hover:text-[#DC2626] transition-colors mb-1 line-clamp-2"
      >
        {lead.company}
      </Link>

      {/* Contact name */}
      <p className="text-sm text-gray-600 mb-3">{lead.contactName}</p>

      {/* Expected revenue */}
      {lead.expectedRevenue > 0 && (
        <div className="flex items-center gap-1 text-sm font-medium text-green-700 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatCurrency(lead.expectedRevenue)}
        </div>
      )}

      {/* Footer with deadline and assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {/* Deadline */}
        {daysUntil !== null && (
          <span
            className={`text-xs flex items-center gap-1 ${
              daysUntil < 0
                ? 'text-red-600'
                : daysUntil <= 3
                  ? 'text-amber-600'
                  : 'text-gray-500'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {daysUntil < 0
              ? `Vencido hace ${Math.abs(daysUntil)}d`
              : daysUntil === 0
                ? 'Hoy'
                : `${daysUntil}d`}
          </span>
        )}

        {/* Assignee */}
        {lead.assignedTo ? (
          <div className="flex items-center gap-1.5">
            {lead.assignedTo.avatarUrl ? (
              <img
                src={lead.assignedTo.avatarUrl}
                alt={lead.assignedTo.fullName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {lead.assignedTo.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">Sin asignar</span>
        )}
      </div>
    </div>
  );
}
