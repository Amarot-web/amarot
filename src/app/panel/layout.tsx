import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/permissions';
import PanelSidebar from './components/PanelSidebar';
import PanelMain from './components/PanelMain';
import { PermissionsProvider } from '@/hooks/usePermissions';
import { SidebarProvider } from './components/SidebarContext';

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
      <SidebarProvider>
        <div className="min-h-screen bg-gray-100">
          <PanelSidebar user={user} />
          <PanelMain>{children}</PanelMain>
        </div>
      </SidebarProvider>
    </PermissionsProvider>
  );
}
