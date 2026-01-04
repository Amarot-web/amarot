import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getAssignmentRules, getTeamMembers } from '@/lib/crm/queries';
import { SERVICE_TYPE_LABELS, type ServiceType } from '@/lib/crm/types';
import AssignmentRulesClient from './AssignmentRulesClient';

export default async function AsignacionPage() {
  try {
    await requirePermission('quotations:view');
  } catch {
    redirect('/panel/dashboard');
  }

  const [rules, teamMembers] = await Promise.all([
    getAssignmentRules(),
    getTeamMembers(),
  ]);

  // Obtener tipos de servicio que no tienen regla
  const existingServiceTypes = new Set(rules.map((r) => r.serviceType));
  const availableServiceTypes = (Object.keys(SERVICE_TYPE_LABELS) as ServiceType[])
    .filter((st) => !existingServiceTypes.has(st));

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
          <span className="text-gray-900">Configuración de Asignación</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reglas de Asignación Automática
            </h1>
            <p className="text-gray-500 mt-1">
              Configura qué responsable se asigna automáticamente según el tipo de servicio
            </p>
          </div>
          <Link
            href="/panel/crm"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Volver al Pipeline
          </Link>
        </div>
      </div>

      <AssignmentRulesClient
        initialRules={rules}
        teamMembers={teamMembers}
        availableServiceTypes={availableServiceTypes}
      />
    </div>
  );
}
