import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto - Cotiza Perforación Diamantina y Anclajes | AMAROT",
  description:
    "Solicita cotización para perforación diamantina, anclajes químicos, sellos cortafuego o alquiler de equipos Hilti. Atendemos en Lima y todo el Perú. Respuesta en 24 horas.",
  keywords: [
    "cotización perforación diamantina Lima",
    "presupuesto anclajes químicos",
    "contacto servicios Hilti Perú",
    "alquiler equipos construcción Lima",
    "cotizar perforaciones concreto",
  ],
  openGraph: {
    title: "Contacto - Solicita tu Cotización | AMAROT Perú",
    description:
      "Cotiza perforación diamantina, anclajes y alquiler de equipos Hilti. Respuesta en 24 horas. Lima y todo el Perú.",
    url: "https://amarotperu.com/contacto",
    siteName: "AMAROT Perú",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contacto - AMAROT Perú",
    description: "Solicita cotización para perforación diamantina y anclajes.",
  },
  alternates: {
    canonical: "https://amarotperu.com/contacto",
  },
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacto AMAROT Perú",
    description: "Página de contacto para solicitar cotizaciones y servicios.",
    url: "https://amarotperu.com/contacto",
    mainEntity: {
      "@type": "LocalBusiness",
      name: "AMAROT PERÚ SAC",
      image: "https://amarotperu.com/images/logo-amarot.png",
      "@id": "https://amarotperu.com",
      url: "https://amarotperu.com",
      telephone: "+51-999-999-999",
      email: "contacto@amarotperu.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Lima",
        addressLocality: "Lima",
        addressRegion: "Lima",
        addressCountry: "PE",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -12.0464,
        longitude: -77.0428,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      areaServed: {
        "@type": "Country",
        name: "Perú",
      },
      priceRange: "$$",
      serviceType: [
        "Perforación diamantina",
        "Anclajes químicos",
        "Sellos cortafuego",
        "Alquiler de equipos",
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
