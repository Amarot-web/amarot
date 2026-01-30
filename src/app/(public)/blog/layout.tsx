import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog de Construcción y Perforación | AMAROT Perú",
    template: "%s | Blog AMAROT",
  },
  description:
    "Artículos y guías técnicas sobre perforación diamantina, anclajes químicos, detección de metales y soluciones especializadas para construcción en Lima y Perú.",
  keywords: [
    "blog construcción Perú",
    "guías perforación diamantina",
    "artículos anclajes químicos",
    "técnicas construcción Lima",
    "equipos HILTI guías",
    "blog ingeniería civil",
  ],
  alternates: {
    canonical: "https://amarotperu.com/blog",
  },
  openGraph: {
    title: "Blog de Construcción y Perforación | AMAROT Perú",
    description:
      "Artículos y guías técnicas sobre perforación diamantina, anclajes químicos y soluciones para construcción.",
    url: "https://amarotperu.com/blog",
    siteName: "AMAROT Perú",
    type: "website",
    locale: "es_PE",
    images: [
      {
        url: "/images/hero-blog.avif",
        width: 1200,
        height: 630,
        alt: "Blog AMAROT Perú - Artículos técnicos de construcción",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog de Construcción | AMAROT Perú",
    description:
      "Guías técnicas sobre perforación diamantina, anclajes y construcción especializada.",
    images: ["/images/hero-blog.avif"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog AMAROT Perú",
    description:
      "Artículos y guías técnicas sobre perforación diamantina, anclajes químicos y construcción especializada",
    url: "https://amarotperu.com/blog",
    publisher: {
      "@type": "Organization",
      name: "AMAROT PERÚ SAC",
      logo: {
        "@type": "ImageObject",
        url: "https://amarotperu.com/images/logo-amarot.png",
      },
    },
    blogPost: {
      "@type": "ItemList",
      itemListElement: [],
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
