import { Metadata } from "next";
import SquaresPattern from "@/components/SquaresPattern";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce a AMAROT Perú - Más de 20 años de experiencia en perforación diamantina y anclajes químicos con equipos Hilti.",
};

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
        <div className="absolute inset-0 page-header-overlay" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
            NOSOTROS
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <SquaresPattern size="medium" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="relative h-[400px] md:h-[600px]">
              <div
                className="absolute inset-0 bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage: "url('/images/about.jpg')",
                }}
              />
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-6">
                ¿QUIÉNES SOMOS?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Somos una empresa peruana especializada en servicios de perforación diamantina y aplicación de anclajes químicos para la construcción, industria y minería con equipos y herramientas de la más alta calidad. Nuestros especialistas cuentan con más de 20 años de experiencia brindando servicios y asesoramiento a importantes empresas en Perú.
              </p>

              {/* Misión */}
              <div className="flex gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#DC2626]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#DC2626] mb-2">MISIÓN</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Ser reconocidos como la mejor empresa de servicios de perforación y anclajes del mercado gracias a la eficiencia de nuestros servicio y a la calidad de nuestros productos.
                  </p>
                </div>
              </div>

              {/* Visión */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#DC2626]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#DC2626] mb-2">VISIÓN</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Proveer servicios y productos de la más alta calidad para brindar rápidas y eficientes soluciones a los proyectos más exigentes de nuestros clientes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
