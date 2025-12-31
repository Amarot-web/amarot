import { redirect } from 'next/navigation';

// Redirigir la raíz del panel al dashboard
export default function PanelPage() {
  redirect('/panel/dashboard');
}
