import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alquiler de Equipos Hilti",
  description: "Alquiler de equipos Hilti en Lima: rotomartillos TE 1000, TE 70, detectores de metal PS 200, PS 1000, diamantinas y más.",
};

const productCategories = [
  {
    title: "ALQUILER DE DIAMANTINAS HILTI",
    subtitle: "AMAROTPERÚ",
    products: [],
    image: null,
  },
  {
    title: "ALQUILER DE ROTOMARTILLOS HILTI",
    subtitle: "AMAROTPERÚ",
    products: [
      { name: "TE 1000", image: "/images/products/te-1000.svg" },
      { name: "TE 70", image: "/images/products/te-70.svg" },
      { name: "TE 50", image: "/images/products/te-50.svg" },
      { name: "TE 30", image: "/images/products/te-30.svg" },
    ],
  },
  {
    title: "ALQUILER DE TALADROS HILTI",
    subtitle: "AMAROTPERÚ",
    products: [],
    image: "/images/products/taladro.svg",
  },
  {
    title: "ALQUILER DE DETECTORES DE METAL HILTI",
    subtitle: "AMAROTPERÚ",
    description: "PS 30/ PS 50/ PS 200/ PS 1000",
    products: [],
    image: "/images/products/detector.svg",
  },
];

export default function AlquilerPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-alquiler.svg')",
          }}
        />
        <div className="absolute inset-0 page-header-overlay" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
            ALQUILER DE EQUIPOS
          </h1>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {productCategories.map((category, index) => (
              <div key={category.title} className="border-b pb-16 last:border-b-0">
                {/* Category Header */}
                <div className="mb-8">
                  <p className="text-[#DC2626] text-sm font-semibold tracking-wider uppercase mb-2">
                    {category.subtitle}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A]">
                    {category.title}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 mt-2">{category.description}</p>
                  )}
                </div>

                {/* Products Grid */}
                {category.products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {category.products.map((product) => (
                      <div
                        key={product.name}
                        className="product-card bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <div className="h-40 mb-4 flex items-center justify-center">
                          <div
                            className="w-full h-full bg-contain bg-center bg-no-repeat"
                            style={{
                              backgroundImage: `url('${product.image}')`,
                            }}
                          />
                        </div>
                        <p className="text-center font-semibold text-[#1E3A8A]">
                          {product.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : category.image ? (
                  <div className="flex justify-center md:justify-start">
                    <div className="w-64 h-48">
                      <div
                        className="w-full h-full bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url('${category.image}')`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Consulte disponibilidad</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-[#1E3A8A] rounded-lg p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿Necesitas alquilar equipos?
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Contáctanos para conocer disponibilidad, precios y condiciones de alquiler de nuestros equipos Hilti.
            </p>
            <Link
              href="/contacto"
              className="btn-primary inline-block"
            >
              Solicitar Cotización
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
