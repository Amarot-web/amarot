import Link from 'next/link';
import { getLeadsRequiringAttention } from '@/lib/crm/queries';
import { requirePermission } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import {
  ALERT_TYPE_LABELS,
  ALERT_TYPE_COLORS,
  ALERT_TYPE_ICONS,
  SERVICE_TYPE_LABELS,
} from '@/lib/crm/types';
import type { AlertType } from '@/lib/crm/types';

export default async function AlertasPage() {
  try {
    await requirePermission('quotations:view');
  } catch {
    redirect('/panel/dashboard');
  }

  const leadsWithAlerts = await getLeadsRequiringAttention();

  // Agrupar leads por tipo de alerta
  const alertGroups: Record<AlertType, typeof leadsWithAlerts> = {
    no_contact: [],
    overdue_activity: [],
    quotation_no_response: [],
    stalled: [],
  };

  leadsWithAlerts.forEach((lead) => {
    (lead.alerts as AlertType[]).forEach((alert) => {
      if (alertGroups[alert]) {
        // Evitar duplicados
        if (!alertGroups[alert].find((l) => l.id === lead.id)) {
          alertGroups[alert].push(lead);
        }
      }
    });
  });

  const totalAlerts = leadsWithAlerts.length;

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/panel/crm" className="hover:text-[#DC2626]">
            Pipeline
          </Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Alertas</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Leads que Requieren Atención
            </h1>
            <p className="text-gray-500 mt-1">
              {totalAlerts === 0
                ? 'No hay alertas pendientes'
                : `${totalAlerts} lead${totalAlerts > 1 ? 's' : ''} con alertas`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/panel/crm/configuracion/alertas"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configurar alertas"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <Link
              href="/panel/crm"
              className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg font-medium transition-colors"
            >
              Ver Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(Object.keys(alertGroups) as AlertType[]).map((alertType) => (
          <div
            key={alertType}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: ALERT_TYPE_COLORS[alertType] }}
              >
                <span className="text-lg">{ALERT_TYPE_ICONS[alertType]}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {alertGroups[alertType].length}
                </p>
                <p className="text-xs text-gray-500">{ALERT_TYPE_LABELS[alertType]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert sections */}
      <div className="space-y-8">
        {(Object.keys(alertGroups) as AlertType[]).map((alertType) => {
          const leads = alertGroups[alertType];
          if (leads.length === 0) return null;

          return (
            <div key={alertType} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div
                className="px-6 py-4 border-b border-gray-100 flex items-center gap-3"
                style={{ borderLeftWidth: 4, borderLeftColor: ALERT_TYPE_COLORS[alertType] }}
              >
                <span className="text-xl">{ALERT_TYPE_ICONS[alertType]}</span>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {ALERT_TYPE_LABELS[alertType]}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {leads.length} lead{leads.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/panel/crm/leads/${lead.id}`}
                          className="font-medium text-gray-900 hover:text-[#DC2626] transition-colors"
                        >
                          {lead.company}
                        </Link>
                        <span className="text-xs font-mono text-gray-400">
                          {lead.code}
                        </span>
                        {lead.stageName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                            {lead.stageName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{lead.contactName}</span>
                        <span>
                          {SERVICE_TYPE_LABELS[lead.serviceType as keyof typeof SERVICE_TYPE_LABELS] || lead.serviceType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Responsable */}
                      {lead.assignedToName ? (
                        <span className="text-sm text-gray-600">
                          {lead.assignedToName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin asignar</span>
                      )}

                      {/* Fecha de creación */}
                      <span className="text-sm text-gray-400">
                        {formatDate(lead.createdAt)}
                      </span>

                      {/* Acción rápida */}
                      <Link
                        href={`/panel/crm/leads/${lead.id}`}
                        className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                        title="Ver lead"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {totalAlerts === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Todo está bajo control
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No hay leads que requieran atención inmediata.
            Continúa con el seguimiento regular de tu pipeline.
          </p>
          <Link
            href="/panel/crm"
            className="inline-block mt-6 px-6 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors"
          >
            Ir al Pipeline
          </Link>
        </div>
      )}
    </div>
  );
}
