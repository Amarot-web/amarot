import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getLeadById,
  getLeadStages,
  getLostReasons,
  getLeadActivities,
  getLeadNotes,
  getTeamMembers,
  getLinkedDocuments,
  type LinkedDocument,
} from '@/lib/crm/queries';
import { SERVICE_TYPE_LABELS, LEAD_SOURCE_LABELS, PRIORITY_CONFIG } from '@/lib/crm/types';
import LeadActions from '@/components/crm/LeadActions';
import ActivityList from '@/components/crm/ActivityList';
import NoteList from '@/components/crm/NoteList';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch lead first to get linked IDs
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  // Fetch remaining data in parallel (including linked documents)
  const [stages, lostReasons, activities, notes, teamMembers, linkedDocuments] = await Promise.all([
    getLeadStages(),
    getLostReasons(),
    getLeadActivities(id),
    getLeadNotes(id),
    getTeamMembers(),
    getLinkedDocuments({
      sourceMessageId: lead.sourceMessageId,
      clientId: lead.clientId,
      quotationId: lead.quotationId,
    }),
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/panel/crm" className="hover:text-[#DC2626]">
          Pipeline
        </Link>
        <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">{lead.code}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-gray-400">{lead.code}</span>
                  {lead.stage && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${lead.stage.color}20`,
                        color: lead.stage.color,
                      }}
                    >
                      {lead.stage.displayName}
                    </span>
                  )}
                  {lead.priority && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                      style={{ backgroundColor: PRIORITY_CONFIG[lead.priority].color }}
                    >
                      Prioridad {PRIORITY_CONFIG[lead.priority].label}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{lead.company}</h1>
                <p className="text-gray-600">{lead.contactName}</p>
              </div>
              <Link
                href={`/panel/crm/leads/${lead.id}/editar`}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Editar
              </Link>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${lead.email}`} className="text-[#1E3A8A] hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${lead.phone}`} className="text-[#1E3A8A] hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {lead.location}
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Servicio
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Tipo de Servicio</span>
                <p className="font-medium text-gray-900">
                  {SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Origen</span>
                <p className="font-medium text-gray-900">
                  {LEAD_SOURCE_LABELS[lead.source] || lead.source}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Valor Esperado</span>
                <p className="font-medium text-green-600 text-lg">
                  {formatCurrency(lead.expectedRevenue)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Probabilidad</span>
                <p className="font-medium text-gray-900">{lead.probability}%</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Fecha Límite</span>
                <p className="font-medium text-gray-900">{formatDate(lead.dateDeadline)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Creado</span>
                <p className="font-medium text-gray-900">{formatDate(lead.createdAt)}</p>
              </div>
            </div>

            {lead.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500 block mb-1">Descripción</span>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
              </div>
            )}

            {/* Lost Reason */}
            {lead.lostNotes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500 block mb-1">Notas de Pérdida</span>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.lostNotes}</p>
              </div>
            )}
          </div>

          {/* Documentos Vinculados */}
          {linkedDocuments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Documentos Vinculados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {linkedDocuments.map((doc) => (
                  <Link
                    key={`${doc.type}-${doc.id}`}
                    href={doc.href}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#DC2626] hover:bg-gray-50 transition-colors group"
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${
                      doc.type === 'message' ? 'bg-blue-100 text-blue-600' :
                      doc.type === 'client' ? 'bg-green-100 text-green-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {doc.type === 'message' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {doc.type === 'client' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                      {doc.type === 'quotation' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#DC2626] transition-colors">
                        {doc.label}
                      </p>
                      {doc.sublabel && (
                        <p className="text-xs text-gray-500 truncate">{doc.sublabel}</p>
                      )}
                    </div>
                    {/* Arrow */}
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#DC2626] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          <ActivityList leadId={lead.id} activities={activities} teamMembers={teamMembers} />

          {/* Notes */}
          <NoteList leadId={lead.id} notes={notes} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <LeadActions lead={lead} stages={stages} lostReasons={lostReasons} />

          {/* Assigned To */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Responsable</h3>
            {lead.assignedTo ? (
              <div className="flex items-center gap-3">
                {lead.assignedTo.avatarUrl ? (
                  <img
                    src={lead.assignedTo.avatarUrl}
                    alt={lead.assignedTo.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                    {lead.assignedTo.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{lead.assignedTo.fullName}</p>
                  <p className="text-sm text-gray-500">{lead.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Sin asignar</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actividades Pendientes</span>
                <span className="font-medium text-gray-900">
                  {activities.filter((a) => !a.isCompleted).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actividades Completadas</span>
                <span className="font-medium text-gray-900">
                  {activities.filter((a) => a.isCompleted).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Notas</span>
                <span className="font-medium text-gray-900">{notes.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
