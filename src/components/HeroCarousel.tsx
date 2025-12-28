'use client';

import { useState, useEffect } from 'react';

const heroImages = [
  '/images/hero-bg.jpg',
  '/images/hero-2.jpg',
  '/images/hero-3.jpg',
  '/images/hero-4.jpg',
  '/images/hero-5.jpg',
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 96,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-[100svh] min-h-[600px] bg-gray-900 overflow-hidden">
      {/* Background Images with Ken Burns effect */}
      {heroImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100 hero-ken-burns' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image}')`,
          }}
        />
      ))}

      {/* Overlay with gradient */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium tracking-wide">+20 años de experiencia</span>
          </div>

          {/* Headline */}
          <h1
            className={`text-white leading-[1.1] mb-4 transition-all duration-700 delay-100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              Perforación
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#DC2626]">
              de Precisión
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-white/80 text-lg sm:text-xl md:text-2xl font-light mb-8 max-w-xl transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Especialistas en perforación diamantina y anclajes químicos para proyectos exigentes
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <a
              href="/contacto"
              className="btn-primary text-center"
            >
              Solicitar Cotización
            </a>
            <a
              href="/brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-white/30 text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Brochure
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-all duration-500 cursor-pointer ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '500ms' }}
        aria-label="Scroll hacia abajo"
      >
        <span className="text-xs uppercase tracking-widest">Explorar</span>
        <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-current rounded-full animate-scroll-indicator"></div>
        </div>
      </button>

      {/* Slide Indicators - Vertical on desktop */}
      <div className="absolute bottom-8 right-8 hidden md:flex flex-col gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1 transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'bg-white h-8'
                : 'bg-white/40 h-4 hover:bg-white/60'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
