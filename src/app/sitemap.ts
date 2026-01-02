import { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog/queries';

const BASE_URL = 'https://amarot.pe';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Slugs de servicios
  const serviceSlugs = [
    'perforaciones-diamantinas',
    'anclajes-quimicos',
    'deteccion-metales',
    'pruebas-anclaje-pull-out-test',
    'sellos-cortafuego',
  ];

  // Obtener posts publicados del blog
  let blogPosts: { slug: string; updatedAt: Date }[] = [];
  try {
    const { posts } = await getPublishedPosts({ limit: 100 });
    blogPosts = posts.map((post) => ({
      slug: post.slug,
      updatedAt: post.updatedAt,
    }));
  } catch (error) {
    console.error('[Sitemap] Error fetching blog posts:', error);
  }

  return [
    // Páginas principales
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Páginas de servicios individuales
    ...serviceSlugs.map((slug) => ({
      url: `${BASE_URL}/servicios/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/alquiler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    // Posts del blog
    ...blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
