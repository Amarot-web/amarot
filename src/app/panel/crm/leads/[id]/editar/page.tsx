import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeadById, getLeadStages, getTeamMembers } from '@/lib/crm/queries';
import LeadForm from '@/components/crm/LeadForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadPage({ params }: PageProps) {
  const { id } = await params;

  const [lead, stages, teamMembers] = await Promise.all([
    getLeadById(id),
    getLeadStages(),
    getTeamMembers(),
  ]);

  if (!lead) {
    notFound();
  }

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
          <Link href={`/panel/crm/leads/${lead.id}`} className="hover:text-[#DC2626]">
            {lead.code}
          </Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Editar</span>
        </nav>
        <h1 className="text-xl font-bold text-gray-900">Editar Lead</h1>
        <p className="text-gray-500 mt-1">
          {lead.company} - {lead.contactName}
        </p>
      </div>

      {/* Form */}
      <LeadForm lead={lead} stages={stages} teamMembers={teamMembers} />
    </div>
  );
}
