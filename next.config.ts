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
    ];
  },
};

export default nextConfig;
