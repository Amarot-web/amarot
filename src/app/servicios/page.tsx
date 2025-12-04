import { Metadata } from "next";
import Link from "next/link";
import SquaresPattern from "@/components/SquaresPattern";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Servicios especializados de perforación diamantina, sellos cortafuegos, anclajes químicos y detección de metales con equipos Hilti.",
};

const services = [
  {
    title: "Perforación Diamantina",
    description: "Nos especializamos en perforaciones diamantinas de todos los diámetros y profundidades posibles usando equipos Hilti de las más alta calidad. Podemos perforar: Muros, losas y vigas de cualquier grosor y reforzadas con fierro.",
    image: "/images/perforacion-diamantina.svg",
    reverse: false,
  },
  {
    title: "Aplicación de Sellos Cortafuegos",
    description: "Sellamos juntas de drywall, ductos de ventilación, bandejas de cableado y más utilizando químicos cortafuego Hilti o la marca de la preferencia del cliente.",
    image: "/images/sellos-cortafuegos.svg",
    reverse: true,
  },
  {
    title: "Aplicación de Anclajes Químicos",
    description: "Perforación y aplicación de adhesivos químicos para la fijación de fierros de construcción o varillas roscadas para la instalación de diferentes estructuras.",
    image: "/images/anclajes-quimicos.svg",
    reverse: false,
  },
  {
    title: "Servicios de Detección de Metales",
    description: "Escaneo de superficies con detectores de metales Hilti PS 30/ PS 50/ PS 200/ PS 1000 para la detección de fierros cables o tuberías.",
    image: "/images/deteccion-metales.svg",
    reverse: true,
  },
];

export default function ServiciosPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-servicios.svg')",
          }}
        />
        <div className="absolute inset-0 page-header-overlay" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
            SERVICIOS
          </h1>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  service.reverse ? 'md:grid-flow-dense' : ''
                }`}
              >
                {/* Image */}
                <div
                  className={`relative h-[300px] md:h-[400px] ${
                    service.reverse ? 'md:col-start-2' : ''
                  }`}
                >
                  <div className="flex justify-center mb-4">
                    <SquaresPattern size="small" />
                  </div>
                  <div
                    className="absolute inset-0 bg-cover bg-center rounded-lg"
                    style={{
                      backgroundImage: `url('${service.image}')`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className={service.reverse ? 'md:col-start-1 md:row-start-1' : ''}>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <Link
                    href="/contacto"
                    className="btn-primary inline-block"
                  >
                    Contratar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
