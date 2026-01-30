import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/panel/', '/api/', '/login'],
      },
    ],
    sitemap: 'https://amarotperu.com/sitemap.xml',
  };
}
