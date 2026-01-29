// Layout para las páginas del CRM
// Incluye el Agente CRM cuando está activado

import { CRMAgent } from '@/components/crm/agents/crm-agent';
import { getAuthUser } from '@/lib/auth/permissions';

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Feature flag para el agente CRM
  const showAgent = process.env.NEXT_PUBLIC_FEATURE_CRM_AGENT === 'true';

  // Obtener usuario para el contexto del agente
  let userName: string | undefined;
  if (showAgent) {
    const user = await getAuthUser();
    userName = user?.profile?.fullName;
  }

  return (
    <>
      {children}
      {showAgent && <CRMAgent userName={userName} />}
    </>
  );
}
