import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnimatedSection from '@/components/AnimatedSection';
import { TipTapRenderer } from '@/components/blog/tiptap-renderer';
import { getPostBySlug, getAdjacentPosts } from '@/lib/blog/queries';
import { getAuthUser } from '@/lib/auth/permissions';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  const post = await getPostBySlug(slug, isPreview);

  if (!post) {
    return {
      title: 'Artículo no encontrado | AMAROT Perú',
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || '';

  return {
    title: `${title} | Blog AMAROT`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'es_PE',
      publishedTime: post.publishAt?.toISOString(),
      authors: post.author?.fullName ? [post.author.fullName] : undefined,
      images: post.ogImageUrl ? [
        {
          url: post.ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.ogImageUrl ? [post.ogImageUrl] : undefined,
    },
    robots: isPreview ? { index: false, follow: false } : (post.noindex ? { index: false, follow: true } : undefined),
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
  };
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  // En modo preview, verificar autenticación
  if (isPreview) {
    const user = await getAuthUser();
    if (!user) {
      notFound(); // No mostrar preview a usuarios no autenticados
    }
  }

  const post = await getPostBySlug(slug, isPreview);

  if (!post) {
    notFound();
  }

  const adjacentPosts = await getAdjacentPosts(post.publishAt);

  // Format date
  const publishDate = post.publishAt
    ? new Intl.DateTimeFormat('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(post.publishAt))
    : null;

  // Schema markup for SEO
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.ogImageUrl,
    datePublished: post.publishAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.fullName || 'AMAROT Perú',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AMAROT PERÚ SAC',
      logo: {
        '@type': 'ImageObject',
        url: 'https://amarot.com.pe/images/logo-amarot.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://amarot.com.pe/blog/${post.slug}`,
    },
  };

  return (
    <>
      {/* Schema Markup */}
      {!isPreview && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}

      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-amber-500 text-amber-950 py-2 px-4 text-center text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Modo Vista Previa — Este contenido no es visible públicamente
            {post.status !== 'published' && (
              <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                {post.status === 'draft' ? 'Borrador' : post.status}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#1E3A8A] transition-colors">
                Inicio
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/blog" className="text-gray-500 hover:text-[#1E3A8A] transition-colors">
                Blog
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-[#1E3A8A] font-medium truncate max-w-[200px]">
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-[#1E3A8A] to-[#0f1d45] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection animation="fade-up">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              {publishDate && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{publishDate}</span>
                </div>
              )}

              {post.author && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{post.author.fullName}</span>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Main Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Article Content - 70% */}
            <article className="lg:col-span-2">
              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-[#DC2626] pl-4">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <TipTapRenderer
                content={post.content}
                className=""
              />

              {/* Post Navigation */}
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adjacentPosts.prev && (
                      <Link
                        href={`/blog/${adjacentPosts.prev.slug}`}
                        className="group flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1E3A8A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">Anterior</p>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-[#1E3A8A] truncate transition-colors">
                            {adjacentPosts.prev.title}
                          </p>
                        </div>
                      </Link>
                    )}

                    {adjacentPosts.next && (
                      <Link
                        href={`/blog/${adjacentPosts.next.slug}`}
                        className="group flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors md:text-right md:ml-auto"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">Siguiente</p>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-[#1E3A8A] truncate transition-colors">
                            {adjacentPosts.next.title}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1E3A8A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            </article>

            {/* Sidebar - 30% */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <AnimatedSection animation="fade-left" delay={100}>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/blog?tag=${tag.slug}`}
                            className="bg-white text-gray-600 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
                          >
                            {tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </AnimatedSection>
                )}

                {/* CTA Card */}
                <AnimatedSection animation="fade-left" delay={200}>
                  <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="text-lg font-bold mb-3">¿Necesitas asesoría técnica?</h3>
                    <p className="text-red-100 text-sm mb-6">
                      Contáctanos para una evaluación sin compromiso
                    </p>
                    <div className="space-y-3">
                      <a
                        href="https://wa.me/51987640479"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                      <Link
                        href="/contacto"
                        className="flex items-center justify-center gap-2 border-2 border-white text-white px-4 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
                      >
                        Contactar
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Back to Blog */}
                <AnimatedSection animation="fade-left" delay={300}>
                  <Link
                    href="/blog"
                    className="flex items-center justify-center gap-2 text-[#1E3A8A] font-medium hover:text-[#DC2626] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al Blog
                  </Link>
                </AnimatedSection>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4">
              ¿Te resultó útil este artículo?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Conoce más sobre nuestros servicios de perforación diamantina, anclajes químicos y soluciones técnicas para construcción.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/servicios"
                className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#152c6b] transition-colors"
              >
                Ver Servicios
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#1E3A8A] text-[#1E3A8A] px-8 py-4 rounded-lg font-semibold hover:bg-[#1E3A8A] hover:text-white transition-colors"
              >
                Contactar
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
