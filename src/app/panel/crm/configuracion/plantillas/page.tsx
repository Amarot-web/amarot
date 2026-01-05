import Link from 'next/link';
import { fetchAllEmailTemplates } from '@/lib/crm/actions';
import EmailTemplatesClient from './EmailTemplatesClient';

export default async function PlantillasConfigPage() {
  const templates = await fetchAllEmailTemplates();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/panel/crm" className="hover:text-[#DC2626]">
            Pipeline
          </Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Plantillas de Email</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Plantillas de Email</h1>
        <p className="text-gray-500 mt-1">
          Configura las plantillas de email para comunicación con leads
        </p>
      </div>

      <EmailTemplatesClient initialTemplates={templates} />
    </div>
  );
}
