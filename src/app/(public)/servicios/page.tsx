'use client';

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { services } from "./data/services";

const diferenciadores = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "+20 Años",
    description: "De experiencia técnica en obra",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Equipos HILTI",
    description: "Uso exclusivo de tecnología premium",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Informes Técnicos",
    description: "Documentación detallada de cada trabajo",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Todo el Perú",
    description: "Cobertura nacional de servicios",
  },
];

export default function ServiciosPage() {
  // Separar servicios core y complementarios
  const coreServices = services.filter(s => s.priority === 'core');
  const complementaryServices = services.filter(s => s.priority === 'complementary');

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[350px] md:h-[450px] bg-[#111827]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('/images/servicios-hero.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111827]/50 to-[#111827]" />

        {/* Breadcrumb */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <nav className="text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Servicios</span>
          </nav>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <AnimatedSection animation="fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              SERVICIOS ESPECIALIZADOS
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              Soluciones técnicas para construcción e industria con equipos HILTI y más de 20 años de experiencia en obra
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center">
            <p className="text-gray-600 text-lg leading-relaxed">
              En AMAROT PERÚ SAC brindamos servicios técnicos especializados para la construcción, industria y minería.
              Nuestro equipo cuenta con más de dos décadas de experiencia trabajando con las principales empresas
              constructoras del Perú, utilizando exclusivamente equipos y soluciones HILTI de alta calidad.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Servicios Core - Grid 2 columnas grandes */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-1 bg-red-600" />
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">Servicios Principales</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A]">
              Nuestros Servicios Core
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {coreServices.map((service, index) => (
              <AnimatedSection
                key={service.slug}
                animation="fade-up"
                delay={index * 150}
              >
                <Link
                  href={`/servicios/${service.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  {/* Imagen */}
                  <div className="h-[220px] relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${service.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Servicio Principal
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1E3A8A] mb-3 group-hover:text-red-600 transition-colors">
                      {service.shortTitle}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.shortDescription}
                    </p>

                    {/* Aplicaciones preview */}
                    <ul className="space-y-2 mb-4">
                      {service.applications.slice(0, 3).map((app, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {app}
                        </li>
                      ))}
                    </ul>

                    <span className="inline-flex items-center gap-2 text-red-600 font-semibold group-hover:gap-3 transition-all">
                      Ver servicio completo
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios Complementarios - Grid 3 columnas */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-1 bg-[#1E3A8A]" />
              <span className="text-[#1E3A8A] font-semibold text-sm uppercase tracking-wider">Servicios Complementarios</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A]">
              Servicios Técnicos Adicionales
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {complementaryServices.map((service, index) => (
              <AnimatedSection
                key={service.slug}
                animation="fade-up"
                delay={index * 150}
              >
                <Link
                  href={`/servicios/${service.slug}`}
                  className="group block bg-gray-50 rounded-xl overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-500 h-full"
                >
                  {/* Imagen */}
                  <div className="h-[180px] relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${service.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Ícono */}
                    <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                      <img src={service.icon} alt="" className="w-6 h-6" style={{ filter: 'invert(15%) sepia(50%) saturate(2000%) hue-rotate(200deg) brightness(90%) contrast(95%)' }} />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#1E3A8A] mb-2 group-hover:text-red-600 transition-colors">
                      {service.shortTitle}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {service.shortDescription}
                    </p>

                    <span className="inline-flex items-center gap-2 text-sm text-[#1E3A8A] font-semibold group-hover:text-red-600 group-hover:gap-3 transition-all">
                      Ver más
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ¿Por qué AMAROT? */}
      <section className="py-16 md:py-24 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿POR QUÉ ELEGIR AMAROT PERÚ?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Nuestra experiencia y compromiso nos respaldan en cada proyecto
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciadores.map((item, index) => (
              <AnimatedSection
                key={item.title}
                animation="fade-up"
                delay={index * 100}
                className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿NECESITAS ALGUNO DE NUESTROS SERVICIOS?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Contáctanos para una evaluación técnica sin compromiso
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="inline-block bg-white text-red-600 font-semibold px-8 py-4 rounded hover:bg-gray-100 transition-colors"
              >
                SOLICITAR COTIZACIÓN
              </Link>
              <a
                href="tel:+51987640479"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                987 640 479
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
