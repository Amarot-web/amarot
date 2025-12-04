import Link from 'next/link';
import SquaresPattern from './SquaresPattern';

const footerLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Servicios', href: '/servicios' },
  { name: 'Productos', href: '/alquiler' },
  { name: 'Contacto', href: '/contacto' },
];

const services = [
  'Perforación Diamantina',
  'Aplicación de Sellos Cortafuegos',
  'Aplicación de Anclajes Químicos',
  'Servicios de Detección de Metales',
];

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <Link href="/" className="block mb-4">
              <img
                src="/images/logo.png"
                alt="AMAROT Perú"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Somos una empresa peruana especializada en servicios de perforación diamantina y aplicación de anclajes químicos para la construcción
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h6 className="text-[#DC2626] font-semibold mb-4 uppercase text-sm tracking-wide">
              Enlace
            </h6>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-[#DC2626] transition-colors footer-link"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h6 className="text-[#DC2626] font-semibold mb-4 uppercase text-sm tracking-wide">
              Servicios
            </h6>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-sm text-gray-600">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h6 className="text-[#DC2626] font-semibold mb-4 uppercase text-sm tracking-wide">
              Contacto
            </h6>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#DC2626] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">
                  Jirón Vizcardo y Guzmán, Pueblo Libre
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#DC2626] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div className="text-sm text-gray-600">
                  <p>987 640 479</p>
                  <p>983 150 353</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#DC2626] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div className="text-sm text-gray-600">
                  <p>j.amado@amarotperu.com</p>
                  <p>g.amado@amarotperu.com</p>
                  <p>amarot.servicios@gmail.com</p>
                </div>
              </li>
            </ul>
            <div className="mt-4">
              <SquaresPattern size="small" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-gray-500">
            © 2024 Derechos Reservados, exclusiva para AMAROTPERÚ
          </p>
        </div>
      </div>
    </footer>
  );
}
