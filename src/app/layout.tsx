import type { Metadata } from "next";
import { Barlow_Condensed, Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AMAROT Perú - Perforación Diamantina y anclajes químicos",
    template: "%s | AMAROT Perú",
  },
  description: "Empresa peruana con más de 20 años de experiencia especializada en perforaciones diamantinas, anclajes químicos y alquiler de equipos HILTI.",
  keywords: [
    "perforación diamantina Lima",
    "anclajes químicos Perú",
    "sellos cortafuegos Lima",
    "detección de metales construcción",
    "equipos Hilti Perú",
    "perforación concreto Lima",
    "anclajes estructurales",
    "servicios construcción especializada",
  ],
  authors: [{ name: "AMAROT Perú" }],
  creator: "AMAROT PERÚ SAC",
  publisher: "AMAROT PERÚ SAC",
  metadataBase: new URL("https://amarotperu.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://amarotperu.com",
    siteName: "AMAROT Perú",
    title: "AMAROT Perú - Perforación Diamantina y anclajes químicos",
    description: "Empresa peruana con más de 20 años de experiencia especializada en perforaciones diamantinas, anclajes químicos y alquiler de equipos HILTI.",
    images: [
      {
        url: "/images/og-amarot-final.png",
        width: 1200,
        height: 630,
        alt: "AMAROT Perú - Perforación Diamantina y anclajes químicos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMAROT Perú - Perforación Diamantina y anclajes químicos",
    description: "Empresa peruana con más de 20 años de experiencia especializada en perforaciones diamantinas, anclajes químicos y alquiler de equipos HILTI.",
    images: ["/images/og-amarot-final.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "zfDzAdunBOSnaX3_Ve-3rHt_JmwA0dHjlc0L2CFUBtA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${barlowCondensed.variable} ${openSans.variable} antialiased`}>
        <GoogleAnalytics />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
