'use client';

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";

// Experiencia adquirida en HILTI
const experiencia = [
  "Las exigencias reales de obra",
  "Los estándares de seguridad, calidad y productividad",
  "El uso correcto de equipos y sistemas HILTI",
  "La atención técnica especializada según cada tipo de proyecto",
];

// Formación del equipo
const formacion = [
  {
    title: "Perforaciones Diamantinas",
    description: "En muros, losas y vigas de cualquier grosor",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <circle cx="12" cy="12" r="4" strokeWidth={2} />
      </svg>
    ),
  },
  {
    title: "Anclajes Mecánicos y Químicos",
    description: "Aplicación profesional para todo tipo de estructuras",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  },
  {
    title: "Equipos HILTI",
    description: "Uso profesional y configuración óptima para cada proyecto",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Seguridad y Calidad",
    description: "Buenas prácticas y control de calidad en obra",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

// Proyectos destacados
const proyectos = [
  { name: "Hospitales", icon: "🏥" },
  { name: "Colegios Emblemáticos", icon: "🏫" },
  { name: "Línea 2 del Metro de Lima", icon: "🚇" },
];

// Compromiso
const compromiso = [
  "Servicios técnicos especializados",
  "Uso exclusivo de equipos y soluciones HILTI",
  "Seguridad, eficiencia y calidad en cada intervención",
  "Relación profesional y de largo plazo con nuestros clientes",
];

export default function NosotrosPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/nosotros-hero.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-[#1E3A8A]/70" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
            NOSOTROS
          </h1>
        </div>
      </section>

      {/* Intro - Nuestra Historia */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-red-600 text-sm font-medium">Fundada en 2021</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-6">
              NUESTRA HISTORIA
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              AMAROT PERÚ SAC es una empresa peruana especializada en servicios técnicos para la construcción e industria, fundada con el objetivo de brindar soluciones confiables en perforaciones diamantinas, anclajes, sellos cortafuego, detección de metales y alquiler de equipos HILTI en todo el Perú.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              La empresa nace a partir de la experiencia de nuestro fundador, profesional con <strong className="text-[#1E3A8A]">más de 20 años de trayectoria en HILTI</strong>, donde desarrolló una carrera sólida, reconocida por su desempeño técnico y resultados excepcionales en proyectos de alta exigencia.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Experiencia desde la Obra */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4 text-center">
              EXPERIENCIA QUE NACE DESDE LA OBRA
            </h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              Durante más de dos décadas de trabajo en HILTI, nuestro fundador participó activamente en soluciones técnicas para las principales empresas constructoras y mineras del Perú, adquiriendo un conocimiento profundo de:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {experiencia.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-center mt-8 text-sm">
              Esta experiencia directa en campo es hoy la base sobre la cual se construye el enfoque técnico de AMAROT PERÚ SAC.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Formación del Equipo */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4">
              FORMACIÓN Y ESPECIALIZACIÓN DEL EQUIPO
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestro fundador ha liderado la capacitación continua de todo el personal técnico, fortaleciendo conocimientos en:
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {formacion.map((item, index) => (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 100}
                className="text-center p-6 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-[#1E3A8A] group-hover:text-red-600 transition-colors shadow-sm">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#1E3A8A] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </AnimatedSection>
            ))}
          </div>

          <p className="text-gray-600 text-center mt-10 max-w-2xl mx-auto">
            Este enfoque nos permite ofrecer soluciones técnicas adaptadas a cada necesidad, seleccionando el equipo, procedimiento y configuración más adecuada para cada proyecto.
          </p>
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section className="py-16 md:py-24 bg-[#111827]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center">
            <span className="text-6xl md:text-7xl font-bold text-red-500 block mb-4">200+</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              PROYECTOS ATENDIDOS EN EL PERÚ
            </h2>
            <p className="text-white/70 mb-10 max-w-xl mx-auto">
              Desde nuestra fundación, hemos participado en proyectos de alto impacto para el desarrollo del país:
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {proyectos.map((proyecto, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-6 py-3"
                >
                  <span className="text-2xl">{proyecto.icon}</span>
                  <span className="text-white font-medium">{proyecto.name}</span>
                </div>
              ))}
            </div>

            <p className="text-white/60 mt-10 text-sm max-w-xl mx-auto">
              Estos proyectos exigen altos estándares técnicos y operativos, y representan el compromiso de AMAROT PERÚ SAC con la infraestructura y el crecimiento del Perú.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Misión */}
            <AnimatedSection animation="fade-right" className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600">MISIÓN</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ser reconocidos como la mejor empresa de servicios de perforación y anclajes del mercado gracias a la eficiencia de nuestro servicio y a la calidad de nuestros productos.
              </p>
            </AnimatedSection>

            {/* Visión */}
            <AnimatedSection animation="fade-left" delay={200} className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#1E3A8A]">VISIÓN</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Proveer servicios y productos de la más alta calidad para brindar rápidas y eficientes soluciones a los proyectos más exigentes de nuestros clientes.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Nuestro Compromiso */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4 text-center">
              NUESTRO COMPROMISO
            </h2>
            <p className="text-gray-600 text-center mb-10">
              En AMAROT PERÚ SAC trabajamos con una filosofía clara:
            </p>

            <div className="space-y-4 max-w-xl mx-auto">
              {compromiso.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-gray-50 p-5 rounded-lg shadow-sm border-l-4 border-red-500"
                >
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-center mt-10 italic max-w-2xl mx-auto">
              "Seguimos creciendo con el mismo propósito con el que iniciamos: resolver desafíos reales de obra con soluciones técnicas confiables, aportando valor a cada proyecto y contribuyendo al desarrollo del país."
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-[#1E3A8A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿LISTO PARA TRABAJAR JUNTOS?
            </h2>
            <p className="text-white/80 mb-8">
              Contáctanos para conocer cómo podemos ayudarte en tu próximo proyecto.
            </p>
            <Link
              href="/contacto"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded transition-colors"
            >
              SOLICITAR COTIZACIÓN
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
