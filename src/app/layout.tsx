import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "AMAROT Perú - Perforación Diamantina y Anclajes Químicos",
    template: "%s | AMAROT Perú",
  },
  description: "Empresa peruana especializada en perforación diamantina, anclajes químicos, sellos cortafuegos y detección de metales. +20 años de experiencia con equipos Hilti.",
  keywords: ["perforación diamantina", "anclajes químicos", "sellos cortafuegos", "detección de metales", "Hilti", "Lima", "Perú", "construcción"],
  authors: [{ name: "AMAROT Perú" }],
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://amarotperu.com",
    siteName: "AMAROT Perú",
    title: "AMAROT Perú - Perforación Diamantina y Anclajes Químicos",
    description: "Empresa peruana especializada en perforación diamantina, anclajes químicos, sellos cortafuegos y detección de metales.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} ${openSans.variable} antialiased`}>
        <Header />
        <main className="pt-20">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
