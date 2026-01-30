import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios de Perforación Diamantina y Anclajes | AMAROT Perú",
  description:
    "Servicios especializados en construcción: perforación diamantina, anclajes químicos, sellos cortafuego, detección de metales y pruebas de anclaje. +20 años de experiencia con equipos HILTI en Lima y Perú.",
  keywords: [
    "servicios perforación diamantina Lima",
    "anclajes químicos Perú",
    "sellos cortafuego Lima",
    "detección de metales construcción",
    "pruebas pull out test",
    "servicios construcción especializada",
    "equipos HILTI servicios",
  ],
  alternates: {
    canonical: "https://amarotperu.com/servicios",
  },
  openGraph: {
    title: "Servicios Especializados en Construcción | AMAROT Perú",
    description:
      "Perforación diamantina, anclajes químicos, sellos cortafuego y más. +20 años de experiencia con equipos HILTI.",
    url: "https://amarotperu.com/servicios",
    siteName: "AMAROT Perú",
    type: "website",
    locale: "es_PE",
    images: [
      {
        url: "/images/servicios-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Servicios especializados AMAROT Perú",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios de Perforación y Anclajes | AMAROT Perú",
    description:
      "Servicios especializados: perforación diamantina, anclajes químicos, sellos cortafuego. Equipos HILTI.",
    images: ["/images/servicios-hero.jpg"],
  },
};

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Servicios de AMAROT Perú",
    description: "Lista de servicios especializados en construcción",
    url: "https://amarotperu.com/servicios",
    numberOfItems: 5,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Service",
          name: "Perforaciones Diamantinas",
          url: "https://amarotperu.com/servicios/perforaciones-diamantinas",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Service",
          name: "Anclajes Químicos",
          url: "https://amarotperu.com/servicios/anclajes-quimicos",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "Service",
          name: "Sellos Cortafuego",
          url: "https://amarotperu.com/servicios/sellos-cortafuego",
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "Service",
          name: "Detección de Metales",
          url: "https://amarotperu.com/servicios/deteccion-metales",
        },
      },
      {
        "@type": "ListItem",
        position: 5,
        item: {
          "@type": "Service",
          name: "Pruebas de Anclaje (Pull Out Test)",
          url: "https://amarotperu.com/servicios/pruebas-anclaje-pull-out-test",
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
