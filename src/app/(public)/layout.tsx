import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://amarotperu.com/#localbusiness",
    name: "AMAROT PERÚ SAC",
    alternateName: "AMAROT",
    url: "https://amarotperu.com",
    logo: "https://amarotperu.com/images/logo.png",
    image: "https://amarotperu.com/images/og-amarot-final.png",
    description:
      "Empresa peruana con más de 20 años de experiencia especializada en perforaciones diamantinas, anclajes químicos y alquiler de equipos HILTI.",
    telephone: "+51 987 640 479",
    email: ["j.amado@amarotperu.com", "g.amado@amarotperu.com"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lima",
      addressRegion: "Lima",
      addressCountry: "PE",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Lima",
      },
      {
        "@type": "Country",
        name: "Perú",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de construcción especializada",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Perforación Diamantina",
            description: "Perforaciones de alta precisión en concreto armado con equipos HILTI",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Anclajes Químicos",
            description: "Fijación estructural con adhesivos químicos HILTI",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Alquiler de Equipos HILTI",
            description: "Alquiler de equipos profesionales HILTI para construcción",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Sellos Cortafuego",
            description: "Sellado de penetraciones y compartimentación contra fuego",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Detección de Metales",
            description: "Escaneo de estructuras con detectores HILTI",
          },
        },
      ],
    },
    priceRange: "$$",
    currenciesAccepted: "PEN",
    paymentAccepted: "Efectivo, Transferencia bancaria",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "13:00",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
