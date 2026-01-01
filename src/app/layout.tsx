import type { Metadata } from "next";
import { Barlow_Condensed, Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
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
      <body className={`${barlowCondensed.variable} ${openSans.variable} antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
