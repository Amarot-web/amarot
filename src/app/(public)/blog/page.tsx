import Link from "next/link";
import { getPublishedPosts, getPostsByTag, getTags } from "@/lib/blog/queries";
import AnimatedSection from "@/components/AnimatedSection";

interface Props {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const tagFilter = params.tag;

  // Ejecutar consultas en paralelo y usar función correcta según filtro
  const [postsData, tags] = await Promise.all([
    tagFilter
      ? getPostsByTag(tagFilter, { page: currentPage, limit: 9 })
      : getPublishedPosts({ page: currentPage, limit: 9 }),
    getTags(),
  ]);

  const { posts, totalPages, total } = postsData;

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-blog.avif')" }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-[#1E3A8A]/70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Blog
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Guías técnicas, consejos prácticos y novedades del sector construcción en Perú
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <section className="py-6 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Filtrar por:</span>
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !tagFilter
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                }`}
              >
                Todos
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tagFilter === tag.slug
                      ? "bg-[#1E3A8A] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                  }`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <>
              {/* Posts Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => {
                  const publishDate = post.publishAt
                    ? new Intl.DateTimeFormat("es-PE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(post.publishAt))
                    : null;

                  return (
                    <AnimatedSection
                      key={post.id}
                      animation="fade-up"
                      delay={index * 100}
                    >
                      <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group h-full flex flex-col border border-gray-100">
                        {/* Image */}
                        <Link href={`/blog/${post.slug}`} className="block relative h-52 overflow-hidden">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center">
                              <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                          )}
                          {/* Tags overlay */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="bg-white/90 backdrop-blur-sm text-[#1E3A8A] text-xs font-semibold px-2.5 py-1 rounded-full"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          {/* Date & Author */}
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            {publishDate && (
                              <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {publishDate}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <p className="text-lg font-bold text-[#1E3A8A] mb-3 group-hover:text-[#DC2626] transition-colors leading-snug">
                            <Link href={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </p>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Read more */}
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 text-[#DC2626] font-semibold text-sm hover:gap-3 transition-all mt-auto"
                          >
                            Leer artículo
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </article>
                    </AnimatedSection>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/blog?page=${currentPage - 1}${tagFilter ? `&tag=${tagFilter}` : ""}`}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
                    >
                      Anterior
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/blog?page=${page}${tagFilter ? `&tag=${tagFilter}` : ""}`}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === currentPage
                          ? "bg-[#1E3A8A] text-white"
                          : "border border-gray-200 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                      }`}
                    >
                      {page}
                    </Link>
                  ))}

                  {currentPage < totalPages && (
                    <Link
                      href={`/blog?page=${currentPage + 1}${tagFilter ? `&tag=${tagFilter}` : ""}`}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
                    >
                      Siguiente
                    </Link>
                  )}
                </div>
              )}

              {/* Results count */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Mostrando {posts.length} de {total} artículos
              </p>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {tagFilter ? "No hay artículos con esta etiqueta" : "Próximamente"}
              </h2>
              <p className="text-gray-500 text-lg mb-6">
                {tagFilter
                  ? "Intenta con otra etiqueta o explora todos los artículos."
                  : "Estamos preparando contenido técnico de valor para ti."}
              </p>
              {tagFilter && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-[#1E3A8A] font-semibold hover:text-[#DC2626] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Ver todos los artículos
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Nuestro equipo técnico está listo para asesorarte en perforación diamantina, anclajes químicos y más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Solicitar Cotización
              </Link>
              <a
                href="https://wa.me/51987640479"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
