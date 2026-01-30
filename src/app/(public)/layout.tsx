import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://amarotperu.com/#organization",
    name: "AMAROT PERÚ SAC",
    alternateName: "AMAROT",
    url: "https://amarotperu.com",
    logo: {
      "@type": "ImageObject",
      url: "https://amarotperu.com/images/logo.png",
      width: 400,
      height: 100,
    },
    image: "https://amarotperu.com/images/hero-bg.jpg",
    description:
      "Empresa peruana especializada en perforación diamantina, anclajes químicos, sellos cortafuego y detección de metales. +20 años de experiencia con equipos HILTI.",
    telephone: "+51 987 640 479",
    email: "contacto@amarotperu.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lima",
      addressRegion: "Lima",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -12.0464,
      longitude: -77.0428,
    },
    areaServed: {
      "@type": "Country",
      name: "Perú",
    },
    sameAs: [
      "https://www.facebook.com/amarotperu",
      "https://www.linkedin.com/company/amarotperu",
    ],
    serviceType: [
      "Perforación diamantina",
      "Anclajes químicos",
      "Sellos cortafuego",
      "Detección de metales",
      "Pruebas de anclaje",
      "Alquiler de equipos HILTI",
    ],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
