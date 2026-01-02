import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alquiler de Equipos HILTI en Lima | AMAROT Perú',
  description:
    'Alquiler de equipos de perforación HILTI en Lima, Perú: perforadoras diamantinas, rotomartillos, demoledores, detectores de metal y más. Equipos certificados y soporte técnico profesional.',
  keywords: [
    'alquiler equipos HILTI Lima',
    'alquiler equipos de perforación Hilti Lima',
    'alquiler diamantinas Lima',
    'alquiler rotomartillos Lima',
    'alquiler demoledores HILTI',
    'alquiler detectores metal',
    'equipos construcción alquiler Perú',
  ],
  openGraph: {
    title: 'Alquiler de Equipos HILTI en Lima | AMAROT',
    description:
      'Más de 30 equipos profesionales HILTI disponibles para tu proyecto en Lima. Perforadoras, rotomartillos, demoledores y más.',
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
