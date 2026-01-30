import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros - Expertos en Perforación Diamantina y Anclajes | AMAROT",
  description:
    "Conoce a AMAROT Perú: +20 años de experiencia en perforación diamantina, anclajes químicos y equipos Hilti. Fundada por ex-profesional Hilti con más de 200 proyectos ejecutados en Lima y todo el Perú.",
  keywords: [
    "empresa perforación diamantina Lima",
    "especialistas anclajes químicos Perú",
    "servicios Hilti Lima",
    "empresa construcción especializada",
    "perforaciones concreto profesional",
    "AMAROT Perú historia",
  ],
  openGraph: {
    title: "Nosotros - AMAROT Perú | Especialistas en Perforación y Anclajes",
    description:
      "+20 años de experiencia. Más de 200 proyectos ejecutados incluyendo hospitales, colegios y la Línea 2 del Metro de Lima.",
    url: "https://amarotperu.com/nosotros",
    siteName: "AMAROT Perú",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "https://amarotperu.com/images/og-nosotros.jpg",
        width: 1200,
        height: 630,
        alt: "Equipo AMAROT Perú - Especialistas en perforación diamantina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nosotros - AMAROT Perú | Especialistas en Perforación",
    description:
      "+20 años de experiencia en perforación diamantina y anclajes químicos.",
  },
  alternates: {
    canonical: "https://amarotperu.com/nosotros",
  },
};

export default function NosotrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre AMAROT Perú",
    description:
      "Empresa peruana especializada en perforación diamantina, anclajes químicos y servicios técnicos con equipos Hilti.",
    url: "https://amarotperu.com/nosotros",
    mainEntity: {
      "@type": "Organization",
      name: "AMAROT PERÚ SAC",
      foundingDate: "2021",
      description:
        "Empresa peruana especializada en servicios técnicos para la construcción e industria.",
      numberOfEmployees: {
        "@type": "QuantitativeValue",
        minValue: 10,
        maxValue: 50,
      },
      areaServed: {
        "@type": "Country",
        name: "Perú",
      },
      knowsAbout: [
        "Perforación diamantina",
        "Anclajes químicos",
        "Anclajes mecánicos",
        "Sellos cortafuego",
        "Detección de metales",
        "Equipos Hilti",
      ],
    },
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
