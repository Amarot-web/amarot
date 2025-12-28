'use client';

import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import AnimatedSection, { AnimatedGrid } from "@/components/AnimatedSection";
import StatsSection from "@/components/StatsSection";

const services = [
  {
    title: "Perforación Diamantina",
    description: "Nos especializamos en perforaciones diamantinas de todos los diámetros y profundidades posibles usando equipos Hilti de las más alta calidad, perforamos muros, losas y vigas de cualquier grosor.",
    image: "/images/perforacion-diamantina.jpg",
    icon: "/icons/perforacion.svg",
  },
  {
    title: "Aplicación de Sellos Cortafuegos",
    description: "Sellamos juntas de drywall, ductos de ventilación, bandejas de cableado y más utilizando químicos cortafuego Hilti o la marca de la preferencia del cliente.",
    image: "/images/sellos-cortafuegos.jpg",
    icon: "/icons/cortafuegos.svg",
  },
  {
    title: "Aplicación de Anclajes Químicos",
    description: "Perforación y aplicación de adhesivos químicos para la fijación de fierros de construcción o varillas roscadas para la instalación de diferentes estructuras.",
    image: "/images/anclajes-quimicos.png",
    icon: "/icons/anclajes.svg",
  },
  {
    title: "Servicios de Detección de Metales",
    description: "Escaneo de superficies con detectores de metales Hilti PS 30/ PS 50/ PS 200/ PS 1000 para la detección de fierros cables o tuberías.",
    image: "/images/deteccion-metales.webp",
    icon: "/icons/deteccion.svg",
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
          </AnimatedSection>

          <AnimatedGrid
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            staggerDelay={150}
          >
            {services.map((service, index) => {
              const isRed = index === 0 || index === 2;
              const bgClass = isRed ? 'service-card-red' : 'service-card-dark';

              return (
                <div
                  key={service.title}
                  className={`service-card group rounded-lg overflow-hidden shadow-lg ${bgClass} relative`}
                >
                  {/* Imagen con zoom en hover */}
                  <div className="h-48 relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url('${service.image}')`,
                      }}
                    />
                    {/* Overlay oscuro en hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />

                    {/* Ícono centrado que aparece en hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500">
                        <img
                          src={service.icon}
                          alt=""
                          className="w-10 h-10"
                          style={{ filter: isRed ? 'invert(22%) sepia(93%) saturate(3292%) hue-rotate(350deg) brightness(84%) contrast(102%)' : 'invert(15%) sepia(50%) saturate(2000%) hue-rotate(200deg) brightness(90%) contrast(95%)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 relative">
                    {/* Línea decorativa animada */}
                    <div className={`absolute top-0 left-6 right-6 h-0.5 ${isRed ? 'bg-white/30' : 'bg-white/20'}`}>
                      <div className={`h-full ${isRed ? 'bg-white' : 'bg-red-500'} w-0 group-hover:w-full transition-all duration-700`} />
                    </div>

                    <h3 className="font-bold text-lg mb-3 text-white pt-3">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/90 mb-4">
                      {service.description}
                    </p>

                    {/* Botón que aparece en hover */}
                    <div className="overflow-hidden h-0 group-hover:h-10 transition-all duration-500">
                      <Link
                        href="/servicios"
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${isRed ? 'text-white hover:text-white/80' : 'text-red-400 hover:text-red-300'} transition-colors`}
                      >
                        Ver más
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </AnimatedGrid>
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
