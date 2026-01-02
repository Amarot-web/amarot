import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InternalSidebar from './components/InternalSidebar';

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay usuario, el middleware ya debería haber redirigido
  // pero por seguridad lo verificamos aquí también
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <InternalSidebar user={user} />
      <main className="lg:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
