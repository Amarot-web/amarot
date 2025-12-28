import Link from 'next/link';

const footerLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Servicios', href: '/servicios' },
  { name: 'Alquiler', href: '/alquiler' },
  { name: 'Contacto', href: '/contacto' },
];

const services = [
  { name: 'Perforación Diamantina', href: '/servicios#perforacion' },
  { name: 'Sellos Cortafuegos', href: '/servicios#cortafuegos' },
  { name: 'Anclajes Químicos', href: '/servicios#anclajes' },
  { name: 'Detección de Metales', href: '/servicios#deteccion' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] relative overflow-hidden">
      {/* Gradiente sutil de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] opacity-50" />

      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo y Descripción */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-6">
              <img
                src="/images/logo.png"
                alt="AMAROT Perú"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empresa peruana especializada en servicios de perforación diamantina y aplicación de anclajes químicos para la construcción, industria y minería.
            </p>
            {/* Badge de experiencia */}
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-medium">+20 años de experiencia</span>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h6 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">
              Navegación
            </h6>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-red-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h6 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">
              Servicios
            </h6>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full group-hover:scale-125 transition-transform" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h6 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">
              Contacto
            </h6>
            <ul className="space-y-4">
              {/* Ubicación */}
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Ubicación</p>
                  <p className="text-gray-400 text-sm">Pueblo Libre, Lima</p>
                </div>
              </li>

              {/* Teléfonos */}
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Teléfonos</p>
                  <p className="text-gray-400 text-sm">987 640 479</p>
                  <p className="text-gray-400 text-sm">983 150 353</p>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Email</p>
                  <p className="text-gray-400 text-sm">j.amado@amarotperu.com</p>
                  <p className="text-gray-400 text-sm">g.amado@amarotperu.com</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} AMAROT Perú. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <span>Equipos</span>
              <img
                src="/images/clients/hilti.png"
                alt="Hilti"
                className="h-4 w-auto opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
