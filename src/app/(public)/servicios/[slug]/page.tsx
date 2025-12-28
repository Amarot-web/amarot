import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnimatedSection from '@/components/AnimatedSection';
import { services, getServiceBySlug, getAllServiceSlugs } from '../data/services';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for all services
export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: 'Servicio no encontrado | AMAROT Perú',
    };
  }

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      type: 'website',
      locale: 'es_PE',
      images: [
        {
          url: service.image,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Get other services for sidebar
  const otherServices = services.filter(s => s.slug !== slug);

  // Schema markup for SEO
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.metaDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: 'AMAROT PERÚ SAC',
      telephone: '+51 987 640 479',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lima',
        addressCountry: 'PE',
      },
    },
    areaServed: {
      '@type': 'Country',
      name: 'Perú',
    },
  };

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

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
              <Link href="/servicios" className="text-gray-500 hover:text-[#1E3A8A] transition-colors">
                Servicios
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-[#1E3A8A] font-medium">{service.shortTitle}</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-[#1E3A8A] to-[#0f1d45] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection animation="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <img
                  src={service.icon}
                  alt=""
                  className="w-8 h-8"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                Equipos HILTI
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
              {service.heroSubtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content - 70% */}
            <div className="lg:col-span-2 space-y-12">
              {/* Intro */}
              <AnimatedSection animation="fade-up">
                <div className="prose prose-lg max-w-none">
                  {service.intro.map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </AnimatedSection>

              {/* What Is */}
              <AnimatedSection animation="fade-up" delay={100}>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4">
                  ¿En qué consiste el servicio?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {service.whatIs}
                </p>
              </AnimatedSection>

              {/* Applications */}
              <AnimatedSection animation="fade-up" delay={200}>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-6">
                  Aplicaciones más comunes en obra
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.applications.map((application, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{application}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Equipment */}
              <AnimatedSection animation="fade-up" delay={300}>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-6">
                  Equipos y Tecnología HILTI
                </h2>
                <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0f1d45] rounded-xl p-6 md:p-8 text-white">
                  <p className="text-blue-100 mb-6">{service.equipment.intro}</p>
                  <ul className="space-y-3 mb-6">
                    {service.equipment.items.map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {service.equipment.outro && (
                    <p className="text-blue-100 text-sm border-t border-white/20 pt-4">
                      {service.equipment.outro}
                    </p>
                  )}
                </div>
              </AnimatedSection>

              {/* Advantages */}
              <AnimatedSection animation="fade-up" delay={400}>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-6">
                  Ventajas de {service.shortTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.advantages.map((advantage, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{advantage}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Why AMAROT */}
              <AnimatedSection animation="fade-up" delay={500}>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-6">
                  ¿Por qué AMAROT PERÚ SAC?
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.whyAmarot.map((reason, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Sidebar - 30% */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* CTA Card */}
                <AnimatedSection animation="fade-left">
                  <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="text-lg font-bold mb-3">¿Necesitas este servicio?</h3>
                    <p className="text-red-100 text-sm mb-6">
                      Solicita una evaluación técnica sin compromiso
                    </p>
                    <div className="space-y-3">
                      <a
                        href="tel:+51987640479"
                        className="flex items-center justify-center gap-3 bg-white text-red-600 px-4 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        987 640 479
                      </a>
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

                {/* Other Services */}
                <AnimatedSection animation="fade-left" delay={100}>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">
                      Otros Servicios
                    </h3>
                    <ul className="space-y-2">
                      {otherServices.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/servicios/${s.slug}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors group"
                          >
                            <img
                              src={s.icon}
                              alt=""
                              className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity"
                              style={{ filter: 'brightness(0) saturate(100%) invert(22%) sepia(95%) saturate(1000%) hue-rotate(205deg)' }}
                            />
                            <span className="text-gray-600 group-hover:text-[#1E3A8A] transition-colors text-sm">
                              {s.shortTitle}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
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
              Solicita una Evaluación Técnica
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              {service.cta}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/51987640479"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar por WhatsApp
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#152c6b] transition-colors"
              >
                Ver formulario de contacto
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
