'use client';

const steps = [
  {
    number: '01',
    title: 'Contacta y Cotiza',
    description: 'Escríbenos por WhatsApp o llámanos para solicitar cotización del equipo que necesitas.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Define Plazo y Entrega',
    description: 'Acordamos el período de alquiler, forma de pago y coordinamos la entrega del equipo.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Recibe el Equipo',
    description: 'Te entregamos el equipo HILTI revisado, calibrado y listo para operar en tu obra.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Soporte y Devolución',
    description: 'Durante el alquiler te brindamos soporte técnico. Al finalizar, coordinamos la devolución.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function ProcessSteps() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
      {steps.map((step, index) => (
        <div key={step.number} className="relative">
          {/* Connector line (desktop only) */}
          {index < steps.length - 1 && (
            <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-200 rotate-45" />
            </div>
          )}

          <div className="relative bg-white rounded-xl p-6 border border-gray-100 hover:border-red-200 hover:shadow-md transition-all duration-300 h-full">
            {/* Number badge */}
            <div className="absolute -top-3 left-6 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              {step.number}
            </div>

            {/* Icon */}
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4 mt-2">
              {step.icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
