'use client';

import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import AnimatedSection from "@/components/AnimatedSection";
import StatsSection from "@/components/StatsSection";

const services = [
  {
    title: "Perforación Diamantina",
    description: "Perforaciones de alta precisión en muros, losas y vigas de concreto armado, con equipos HILTI de última generación.",
    image: "/images/perforacion-diamantina.jpg",
    icon: "/icons/perforacion.svg",
    href: "/servicios/perforaciones-diamantinas",
    size: "large",
  },
  {
    title: "Anclajes Químicos",
    description: "Fijación segura de fierros de construcción y varillas roscadas con adhesivos químicos estructurales HILTI.",
    image: "/images/anclajes-quimicos.png",
    icon: "/icons/anclajes.svg",
    href: "/servicios/anclajes-quimicos",
    size: "large",
  },
  {
    title: "Detección de Metales",
    description: "Escaneo de estructuras con detectores HILTI. Reportes técnicos e imágenes 3D.",
    image: "/images/deteccion-metales.webp",
    icon: "/icons/deteccion.svg",
    href: "/servicios/deteccion-metales",
    size: "small",
  },
  {
    title: "Pruebas de Anclaje",
    description: "Pull Out Test para verificar resistencia real de anclajes. Informes técnicos detallados.",
    image: "/images/pruebas-anclaje.jpg",
    icon: "/icons/pullout.svg",
    href: "/servicios/pruebas-anclaje-pull-out-test",
    size: "small",
  },
  {
    title: "Sellos Cortafuego",
    description: "Sellado de juntas y penetraciones. Compartimentación contra fuego y humo.",
    image: "/images/sellos-cortafuegos.jpg",
    icon: "/icons/cortafuegos.svg",
    href: "/servicios/sellos-cortafuego",
    size: "small",
  },
];

const clients = [
  { name: "Alicorp", logo: "/images/clients/alicorp.png", scale: 1 },
  { name: "Cissac", logo: "/images/clients/cissac.jpg", scale: 1.3 },
  { name: "Hilti", logo: "/images/clients/hilti.png", scale: 1 },
  { name: "Alsud", logo: "/images/clients/alsud.jpg", scale: 1.3 },
  { name: "Horoton", logo: "/images/clients/horoton.png", scale: 1 },
  { name: "JJC", logo: "/images/clients/jjc.webp", scale: 1 },
  { name: "V&V Bravo", logo: "/images/clients/vyvbravo.png", scale: 1 },
  { name: "Mega Estructuras", logo: "/images/clients/megaestructuras.png", scale: 1.3 },
  { name: "Pentatech", logo: "/images/clients/pentatech.webp", scale: 1.3 },
  { name: "Ransa", logo: "/images/clients/ransa.jpg", scale: 1 },
];

export default function Home() {
  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">
              NUESTROS SERVICIOS
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Soluciones técnicas especializadas con equipos HILTI y más de 20 años de experiencia
            </p>
          </AnimatedSection>

          {/* Grid Asimétrico 2+3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {services.map((service, index) => {
              const isLarge = service.size === 'large';
              const isRed = index === 0 || index === 3;
              const bgClass = isRed ? 'service-card-red' : 'service-card-dark';
              const colSpan = isLarge ? 'lg:col-span-3' : 'lg:col-span-2';
              const height = isLarge ? 'h-[350px] md:h-[400px]' : 'h-[280px] md:h-[300px]';

              return (
                <AnimatedSection
                  key={service.title}
                  animation="fade-up"
                  delay={index * 100}
                  className={`${colSpan}`}
                >
                  <Link
                    href={service.href}
                    className={`service-card group rounded-lg overflow-hidden shadow-lg ${bgClass} relative block ${height}`}
                  >
                    {/* Imagen con zoom en hover */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url('${service.image}')`,
                        }}
                      />
                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>

                    {/* Ícono superior derecho */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <img
                        src={service.icon}
                        alt=""
                        className="w-7 h-7"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>

                    {/* Contenido en la parte inferior */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {/* Línea decorativa animada */}
                      <div className="h-0.5 bg-white/20 mb-4">
                        <div className={`h-full ${isRed ? 'bg-white' : 'bg-red-500'} w-0 group-hover:w-full transition-all duration-700`} />
                      </div>

                      <h3 className={`font-bold ${isLarge ? 'text-xl md:text-2xl' : 'text-lg'} text-white mb-2`}>
                        {service.title}
                      </h3>
                      <p className={`${isLarge ? 'text-sm md:text-base' : 'text-sm'} leading-relaxed text-white/80 mb-4`}>
                        {service.description}
                      </p>

                      {/* CTA */}
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                        Ver servicio
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Link a todos los servicios */}
          <AnimatedSection animation="fade-up" delay={600} className="text-center mt-10">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 text-[#1E3A8A] font-semibold hover:text-red-600 transition-colors"
            >
              Ver todos los servicios
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Historia CTA - Compact */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-red-600 text-sm font-medium">Desde 2021</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-6">
              NUESTRA HISTORIA
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Nacimos de más de 20 años de experiencia en HILTI. Hoy, con más de 200 proyectos ejecutados
              —incluyendo hospitales, colegios emblemáticos y la Línea 2 del Metro de Lima—
              seguimos aportando soluciones técnicas confiables al desarrollo del Perú.
            </p>
            <Link
              href="/nosotros"
              className="inline-flex items-center gap-2 text-[#1E3A8A] font-semibold hover:text-red-600 transition-colors group"
            >
              Conoce nuestra historia
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 border-t border-b overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">
              CONFÍAN EN NOSOTROS
            </h2>
          </AnimatedSection>

          {/* Carousel container */}
          <div className="relative">
            {/* Fade edges */}
            <div className="clients-fade-left" />
            <div className="clients-fade-right" />

            <div className="clients-carousel flex items-center gap-16">
              {/* First set of logos */}
              {clients.map((client) => (
                <div
                  key={client.name}
                  className="flex-shrink-0"
                >
                  <div className="h-20 w-44 flex items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="object-contain client-logo"
                      style={{ transform: `scale(${client.scale})` }}
                    />
                  </div>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {clients.map((client) => (
                <div
                  key={`${client.name}-duplicate`}
                  className="flex-shrink-0"
                >
                  <div className="h-20 w-44 flex items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="object-contain client-logo"
                      style={{ transform: `scale(${client.scale})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
