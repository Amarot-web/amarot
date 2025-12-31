import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/permissions';
import PanelSidebar from './components/PanelSidebar';
import { PermissionsProvider } from '@/hooks/usePermissions';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    redirect('/login');
  }

  return (
    <PermissionsProvider initialUser={user}>
      <div className="min-h-screen bg-gray-100">
        <PanelSidebar user={user} />
        <main className="lg:pl-64">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </PermissionsProvider>
  );
}
