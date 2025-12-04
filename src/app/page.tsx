import Link from "next/link";
import SquaresPattern from "@/components/SquaresPattern";
import HeroCarousel from "@/components/HeroCarousel";

const services = [
  {
    title: "Perforación Diamantina",
    description: "Nos especializamos en perforaciones diamantinas de todos los diámetros y profundidades posibles usando equipos Hilti de las más alta calidad, perforamos muros, losas y vigas de cualquier grosor.",
    image: "/images/perforacion-diamantina.jpg",
  },
  {
    title: "Aplicación de Sellos Cortafuegos",
    description: "Sellamos juntas de drywall, ductos de ventilación, bandejas de cableado y más utilizando químicos cortafuego Hilti o la marca de la preferencia del cliente.",
    image: "/images/sellos-cortafuegos.jpg",
  },
  {
    title: "Aplicación de Anclajes Químicos",
    description: "Perforación y aplicación de adhesivos químicos para la fijación de fierros de construcción o varillas roscadas para la instalación de diferentes estructuras.",
    image: "/images/anclajes-quimicos.png",
  },
  {
    title: "Servicios de Detección de Metales",
    description: "Escaneo de superficies con detectores de metales Hilti PS 30/ PS 50/ PS 200/ PS 1000 para la detección de fierros cables o tuberías.",
    image: "/images/deteccion-metales.webp",
  },
];

const clients = [
  { name: "Grupo T&C", logo: "/images/clients/tyc.png" },
  { name: "Mondelez", logo: "/images/clients/mondelez.jpg" },
  { name: "Abril", logo: "/images/clients/abril.jpg" },
  { name: "INCOT", logo: "/images/clients/incot.png" },
  { name: "FLAT", logo: "/images/clients/flat.png" },
  { name: "Direnzzo", logo: "/images/clients/direnzzo.png" },
  { name: "V&V Bravo", logo: "/images/clients/vvbravo.jpg" },
];

export default function Home() {
  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

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
                  backgroundImage: "url('/images/about.jpg')",
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
            {services.map((service, index) => {
              // Patrón de colores: rojo-negro-rojo-negro (como en el sitio original)
              const isRed = index === 0 || index === 2;
              const isDark = index === 1 || index === 3;

              const bgClass = isRed ? 'service-card-red' : 'service-card-dark';
              const textClass = 'text-white';
              const descClass = 'text-white/90';

              return (
                <div
                  key={service.title}
                  className={`service-card rounded-lg overflow-hidden shadow-lg ${bgClass}`}
                >
                  <div className="h-48 relative">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${service.image}')`,
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className={`font-bold text-lg mb-3 ${textClass}`}>
                      {service.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${descClass}`}>
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 border-t border-b overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1E3A8A] mb-12">
            CONFÍAN EN NOSOTROS
          </h2>

          {/* Carousel container */}
          <div className="relative">
            <div className="clients-carousel flex items-center gap-12">
              {/* First set of logos */}
              {clients.map((client) => (
                <div
                  key={client.name}
                  className="flex-shrink-0"
                >
                  <div className="h-16 w-32 flex items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-full max-w-full object-contain"
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
                  <div className="h-16 w-32 flex items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-full max-w-full object-contain"
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
