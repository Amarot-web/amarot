import type { NextConfig } from "next";

// En desarrollo se permite conectar al Supabase local (Docker, 127.0.0.1/localhost) en la CSP.
// En producción la CSP queda estricta (solo https://*.supabase.co).
const isDev = process.env.NODE_ENV !== "production";
const devConnectSrc = isDev
  ? " http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*"
  : "";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://www.google-analytics.com https://va.vercel-scripts.com${devConnectSrc}`,
              "frame-src https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
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
      // URLs legacy de WordPress - patrones comunes que generan 404
      {
        source: '/category/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/author/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/tag/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/feed/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/feed',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-content/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-admin/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-login.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:file(wp-[\\w-]+\\.php)',
        destination: '/',
        permanent: true,
      },
      {
        source: '/elementor-hf/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/page/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
