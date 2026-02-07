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
  alternates: {
    canonical: 'https://amarotperu.com/alquiler',
  },
  openGraph: {
    title: 'Alquiler de Equipos HILTI en Lima | AMAROT',
    description:
      'Más de 30 equipos profesionales HILTI disponibles para tu proyecto en Lima. Perforadoras, rotomartillos, demoledores y más.',
    url: 'https://amarotperu.com/alquiler',
    siteName: 'AMAROT Perú',
    type: 'website',
    locale: 'es_PE',
    images: [
      {
        url: '/images/alquiler-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Alquiler de equipos HILTI - AMAROT Perú',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alquiler de Equipos HILTI en Lima | AMAROT Perú',
    description:
      'Más de 30 equipos profesionales HILTI disponibles para tu proyecto en Lima.',
    images: ['/images/alquiler-hero.jpg'],
  },
};

export default function AlquilerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Alquiler de Equipos HILTI',
    description:
      'Catálogo de equipos HILTI disponibles para alquiler en Lima y Perú',
    url: 'https://amarotperu.com/alquiler',
    numberOfItems: 4,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          '@id': 'https://amarotperu.com/alquiler#perforadoras',
          name: 'Alquiler de Perforadoras Diamantinas HILTI',
          description: 'Servicio de alquiler de perforadoras diamantinas HILTI para obras de construcción en Lima',
          provider: {
            '@type': 'LocalBusiness',
            name: 'AMAROT PERÚ SAC',
          },
          areaServed: 'Lima, Perú',
          serviceType: 'Alquiler de equipos de construcción',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          '@id': 'https://amarotperu.com/alquiler#rotomartillos',
          name: 'Alquiler de Rotomartillos HILTI',
          description: 'Servicio de alquiler de rotomartillos HILTI para perforación y demolición en Lima',
          provider: {
            '@type': 'LocalBusiness',
            name: 'AMAROT PERÚ SAC',
          },
          areaServed: 'Lima, Perú',
          serviceType: 'Alquiler de equipos de construcción',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          '@id': 'https://amarotperu.com/alquiler#demoledores',
          name: 'Alquiler de Demoledores HILTI',
          description: 'Servicio de alquiler de demoledores eléctricos HILTI para obras de demolición en Lima',
          provider: {
            '@type': 'LocalBusiness',
            name: 'AMAROT PERÚ SAC',
          },
          areaServed: 'Lima, Perú',
          serviceType: 'Alquiler de equipos de construcción',
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Service',
          '@id': 'https://amarotperu.com/alquiler#detectores',
          name: 'Alquiler de Detectores de Metal HILTI',
          description: 'Servicio de alquiler de detectores de metal y escáneres HILTI para localización de armaduras en Lima',
          provider: {
            '@type': 'LocalBusiness',
            name: 'AMAROT PERÚ SAC',
          },
          areaServed: 'Lima, Perú',
          serviceType: 'Alquiler de equipos de construcción',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
