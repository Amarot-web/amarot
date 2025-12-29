import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alquiler de Equipos HILTI',
  description:
    'Alquiler de equipos HILTI en Lima: perforadoras diamantinas, rotomartillos, demoledores, detectores de metal y más. Equipos certificados y soporte técnico profesional.',
  keywords: [
    'alquiler equipos HILTI',
    'alquiler diamantinas Lima',
    'alquiler rotomartillos',
    'alquiler demoledores HILTI',
    'alquiler detectores metal',
    'equipos construcción alquiler Perú',
  ],
  openGraph: {
    title: 'Alquiler de Equipos HILTI',
    description:
      'Más de 30 equipos profesionales HILTI disponibles para tu proyecto. Perforadoras, rotomartillos, demoledores y más.',
    type: 'website',
    locale: 'es_PE',
  },
};

export default function AlquilerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
