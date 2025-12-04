import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos y noticias sobre perforación diamantina, anclajes químicos y construcción en Perú.",
};

const posts = [
  {
    title: "¿Qué son los anclajes químicos y cuándo utilizarlos?",
    excerpt: "Los anclajes químicos son sistemas de fijación que utilizan resinas especiales para crear uniones de alta resistencia en concreto, piedra y mampostería...",
    date: "Agosto 2024",
    slug: "que-son-anclajes-quimicos",
    image: "/images/blog/anclajes-quimicos.svg",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-blog.svg')",
          }}
        />
        <div className="absolute inset-0 page-header-overlay" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
            BLOG
          </h1>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 relative">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${post.image}')`,
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[#DC2626] text-sm font-semibold mb-2">
                      {post.date}
                    </p>
                    <h2 className="text-xl font-bold text-[#1E3A8A] mb-3">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[#DC2626] font-semibold text-sm hover:underline"
                    >
                      Leer más →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Próximamente publicaremos contenido de interés.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
