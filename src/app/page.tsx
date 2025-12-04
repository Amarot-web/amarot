import Link from "next/link";
import SquaresPattern from "@/components/SquaresPattern";

const services = [
  {
    title: "Perforación Diamantina",
    description: "Nos especializamos en perforaciones diamantinas de todos los diámetros y profundidades posibles usando equipos Hilti de las más alta calidad, perforamos muros, losas y vigas de cualquier grosor.",
    image: "/images/perforacion-diamantina.svg",
  },
  {
    title: "Aplicación de Sellos Cortafuegos",
    description: "Sellamos juntas de drywall, ductos de ventilación, bandejas de cableado y más utilizando químicos cortafuego Hilti o la marca de la preferencia del cliente.",
    image: "/images/sellos-cortafuegos.svg",
  },
  {
    title: "Aplicación de Anclajes Químicos",
    description: "Perforación y aplicación de adhesivos químicos para la fijación de fierros de construcción o varillas roscadas para la instalación de diferentes estructuras.",
    image: "/images/anclajes-quimicos.svg",
  },
  {
    title: "Servicios de Detección de Metales",
    description: "Escaneo de superficies con detectores de metales Hilti PS 30/ PS 50/ PS 200/ PS 1000 para la detección de fierros cables o tuberías.",
    image: "/images/deteccion-metales.svg",
  },
];

const clients = [
  { name: "Grupo T&C", logo: "/images/clients/tyc.svg" },
  { name: "Mondelez", logo: "/images/clients/mondelez.svg" },
  { name: "Abril", logo: "/images/clients/abril.svg" },
  { name: "INCOT", logo: "/images/clients/incot.svg" },
  { name: "FLAT", logo: "/images/clients/flat.svg" },
  { name: "Direnzzo", logo: "/images/clients/direnzzo.svg" },
  { name: "V&V Bravo", logo: "/images/clients/vvbravo.svg" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] bg-gray-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-bg.svg')",
          }}
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Especializados en perforación diamantina y aplicación de anclajes químicos
            </h1>
            <Link href="/contacto" className="btn-primary inline-block">
              Descargar Brochure
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <SquaresPattern size="medium" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] md:h-[500px]">
              <div
                className="absolute inset-0 bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage: "url('/images/about.svg')",
                }}
              />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-6">
                ¿QUIÉNES SOMOS?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Somos una empresa peruana especializada en servicios de perforación diamantina y aplicación de anclajes químicos para la construcción, industria y minería con equipos y herramientas de la más alta calidad. Nuestros especialistas cuentan con más de 20 años de experiencia brindando servicios y asesoramiento a importantes empresas en Perú.
              </p>
              <Link href="/nosotros" className="btn-primary inline-block">
                Saber Más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1E3A8A] mb-12">
            NUESTROS SERVICIOS
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`service-card bg-white rounded-lg overflow-hidden shadow-lg ${
                  index === 0 ? 'bg-[#DC2626] text-white' : ''
                }`}
              >
                <div className="h-48 relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${service.image}')`,
                    }}
                  />
                  {index !== 0 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  )}
                </div>
                <div className={`p-6 ${index === 0 ? 'bg-[#DC2626]' : ''}`}>
                  <h3 className={`font-bold text-lg mb-3 ${index === 0 ? 'text-white' : 'text-[#1E3A8A]'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${index === 0 ? 'text-white/90' : 'text-gray-600'}`}>
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clients.map((client) => (
              <div
                key={client.name}
                className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              >
                <div className="h-12 w-24 flex items-center justify-center">
                  <span className="text-gray-400 font-semibold text-sm">{client.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
