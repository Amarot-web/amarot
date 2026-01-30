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
    '@type': 'OfferCatalog',
    name: 'Alquiler de Equipos HILTI',
    description:
      'Catálogo de equipos HILTI disponibles para alquiler en Lima y Perú',
    url: 'https://amarotperu.com/alquiler',
    provider: {
      '@type': 'LocalBusiness',
      name: 'AMAROT PERÚ SAC',
      telephone: '+51 987 640 479',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lima',
        addressCountry: 'PE',
      },
    },
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Perforadoras Diamantinas HILTI',
          category: 'Perforación',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Rotomartillos HILTI',
          category: 'Perforación y demolición',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Demoledores HILTI',
          category: 'Demolición',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Detectores de Metal HILTI',
          category: 'Detección',
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
