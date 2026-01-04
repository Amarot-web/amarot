import Link from 'next/link';
import { getLeadStages, getTeamMembers } from '@/lib/crm/queries';
import LeadForm from '@/components/crm/LeadForm';

export default async function NuevoLeadPage() {
  const [stages, teamMembers] = await Promise.all([
    getLeadStages(),
    getTeamMembers(),
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/panel/crm" className="hover:text-[#DC2626]">
            Pipeline
          </Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Nuevo Lead</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Lead</h1>
        <p className="text-gray-500 mt-1">
          Registra una nueva oportunidad de negocio
        </p>
      </div>

      {/* Form */}
      <LeadForm stages={stages} teamMembers={teamMembers} />
    </div>
  );
}
