import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirección 301 para preservar SEO
      // URL antigua → URL nueva
      {
        source: '/alquiler-de-productos',
        destination: '/alquiler',
        permanent: true, // 301 redirect
      },
      // URLs legacy del sitio WordPress anterior
      {
        source: '/productos',
        destination: '/alquiler',
        permanent: true,
      },
      {
        source: '/productos/:path*',
        destination: '/alquiler',
        permanent: true,
      },
      {
        source: '/contact-us',
        destination: '/contacto',
        permanent: true,
      },
      {
        source: '/inicio',
        destination: '/',
        permanent: true,
      },
      // URLs de blog con formato antiguo de WordPress (YYYY/MM/DD/slug)
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
