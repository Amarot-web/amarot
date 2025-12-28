export interface ServiceData {
  slug: string;
  title: string;
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  image: string;
  icon: string;
  shortDescription: string;
  intro: string[];
  whatIs: string;
  applications: string[];
  equipment: {
    intro: string;
    items: string[];
    outro?: string;
  };
  advantages: string[];
  whyAmarot: string[];
  cta: string;
  priority: 'core' | 'complementary';
}

export const services: ServiceData[] = [
  {
    slug: 'perforaciones-diamantinas',
    title: 'Perforaciones Diamantinas en Concreto en Perú',
    shortTitle: 'Perforación Diamantina',
    metaTitle: 'Perforaciones Diamantinas en Concreto | AMAROT Perú',
    metaDescription: 'Realizamos perforaciones diamantinas de alta precisión en muros, losas y vigas con equipos HILTI. Más de 20 años de experiencia en Perú.',
    heroSubtitle: 'Alta precisión en muros, losas y vigas de concreto',
    image: '/images/perforacion-diamantina.jpg',
    icon: '/icons/perforacion.svg',
    shortDescription: 'Perforaciones de todos los diámetros y profundidades en estructuras de concreto armado, con equipos HILTI de última generación.',
    intro: [
      'En AMAROT PERÚ SAC realizamos perforaciones diamantinas de alta precisión en muros, losas y vigas de concreto, utilizando exclusivamente equipos HILTI y un equipo técnico con más de 20 años de experiencia en obra en Perú.',
      'Ejecutamos perforaciones de todos los diámetros y profundidades, incluso en estructuras altamente reforzadas con fierro, asegurando precisión, seguridad y continuidad del proyecto.'
    ],
    whatIs: 'La perforación diamantina permite realizar orificios circulares exactos en concreto armado y otros materiales, con mínima vibración y sin dañar la estructura. Es el método recomendado para obras donde se requiere control técnico, limpieza y exactitud.',
    applications: [
      'Pases para instalaciones sanitarias, eléctricas y HVAC',
      'Perforaciones para anclajes mecánicos y químicos',
      'Aperturas en muros cortafuego',
      'Trabajos en edificios ocupados o estructuras existentes'
    ],
    equipment: {
      intro: 'Trabajamos con diamantinas HILTI desde DD 120 hasta DD 350, seleccionando el equipo adecuado según:',
      items: [
        'Diámetro requerido',
        'Espesor del elemento',
        'Nivel de refuerzo de acero'
      ],
      outro: 'Utilizamos sistemas de montaje en columna y coronas diamantadas específicas para cada tipo de estructura.'
    },
    advantages: [
      'Alta precisión en diámetro y alineación',
      'Menor vibración, protege la estructura',
      'Ideal para concreto armado',
      'Permite trabajar sin demoliciones ni retrabajos'
    ],
    whyAmarot: [
      'Más de 20 años de experiencia técnica',
      'Especialistas en perforaciones diamantinas en Perú',
      'Uso exclusivo de equipos HILTI',
      'Enfoque en seguridad, control y eficiencia en obra'
    ],
    cta: 'Si tu proyecto requiere perforaciones diamantinas en concreto, en AMAROT PERÚ SAC te ayudamos a definir el método y equipo adecuado para que la obra avance sin riesgos ni retrasos.',
    priority: 'core'
  },
  {
    slug: 'anclajes-quimicos',
    title: 'Aplicación de Anclajes Químicos en Concreto en Perú',
    shortTitle: 'Anclajes Químicos',
    metaTitle: 'Aplicación de Anclajes Químicos en Concreto | AMAROT Perú',
    metaDescription: 'Aplicación profesional de anclajes químicos para fijación de fierros y varillas roscadas. Equipos HILTI y 20+ años de experiencia.',
    heroSubtitle: 'Fijación segura de fierros y varillas roscadas',
    image: '/images/anclajes-quimicos.png',
    icon: '/icons/anclajes.svg',
    shortDescription: 'Aplicación de adhesivos químicos estructurales para la fijación segura de fierros de construcción y varillas roscadas en concreto armado.',
    intro: [
      'En AMAROT PERÚ SAC realizamos la aplicación de anclajes químicos para la fijación segura de fierros de construcción y varillas roscadas en concreto armado, utilizando equipos HILTI y un equipo técnico con más de 20 años de experiencia en obra en Perú.',
      'Este sistema permite instalar elementos estructurales y no estructurales con alta capacidad de carga, precisión y control, incluso en estructuras existentes o zonas donde no es viable el anclaje mecánico tradicional.'
    ],
    whatIs: 'La aplicación de anclajes químicos consiste en la perforación del elemento de concreto y la posterior inyección de adhesivos químicos estructurales, sobre los cuales se fijan barras de acero o varillas roscadas. Este método garantiza una adhesión uniforme entre el concreto y el anclaje, ofreciendo mayor desempeño en comparación con sistemas convencionales, especialmente en condiciones exigentes.',
    applications: [
      'Fijación de estructuras metálicas',
      'Instalación de placas base y soportes',
      'Anclaje de barandas, pasamanos y escaleras',
      'Refuerzos estructurales y ampliaciones',
      'Anclajes en elementos existentes de concreto'
    ],
    equipment: {
      intro: 'Trabajamos con equipos HILTI y adhesivos químicos de alto desempeño, seleccionados según:',
      items: [
        'Tipo de estructura',
        'Diámetro y profundidad del anclaje',
        'Condiciones de carga'
      ],
      outro: 'El proceso incluye perforación precisa, limpieza del orificio y correcta inyección del adhesivo, asegurando un anclaje confiable y duradero.'
    },
    advantages: [
      'Alta capacidad de carga',
      'Distribución uniforme de esfuerzos',
      'Ideal para concreto armado',
      'Menor riesgo de fisuración',
      'Solución limpia y controlada'
    ],
    whyAmarot: [
      'Más de 20 años de experiencia técnica',
      'Especialistas en anclajes químicos en Perú',
      'Uso exclusivo de tecnología HILTI',
      'Enfoque en seguridad y precisión en obra'
    ],
    cta: 'Si tu proyecto requiere aplicación de anclajes químicos en concreto, en AMAROT PERÚ SAC te asesoramos para definir el tipo de anclaje y procedimiento adecuado según las condiciones reales de tu obra.',
    priority: 'core'
  },
  {
    slug: 'deteccion-metales',
    title: 'Servicios de Detección de Metales y Escaneo de Estructuras en Perú',
    shortTitle: 'Detección de Metales',
    metaTitle: 'Detección de Metales y Escaneo de Estructuras | AMAROT Perú',
    metaDescription: 'Escaneo de estructuras con detectores HILTI PS 200 y PS 1000. Reportes técnicos e imágenes 3D. Más de 20 años de experiencia.',
    heroSubtitle: 'Escaneo de estructuras con reportes técnicos e imágenes 3D',
    image: '/images/deteccion-metales.webp',
    icon: '/icons/deteccion.svg',
    shortDescription: 'Detección de metales y escaneo de superficies en estructuras de concreto, con capacidad de generar reportes técnicos e imágenes 3D.',
    intro: [
      'En AMAROT PERÚ SAC brindamos servicios de detección de metales y escaneo de superficies en estructuras de concreto, utilizando detectores de metales HILTI y un equipo técnico con más de 20 años de experiencia en obra en Perú.',
      'Además del escaneo en campo, contamos con la capacidad de generar reportes técnicos detallados e imágenes 3D, gracias al uso de equipos HILTI PS 200 y PS 1000, lo que permite una mejor interpretación de los resultados y una correcta toma de decisiones técnicas en obra.'
    ],
    whatIs: 'El escaneo de estructuras con detectores de metales es un método no destructivo que permite identificar la posición, profundidad y distribución de elementos embebidos en losas, muros y vigas de concreto. Trabajamos con detectores HILTI PS 30, PS 50, PS 200 y PS 1000, seleccionados según el nivel de detalle requerido, el tipo de estructura y las condiciones del proyecto.',
    applications: [
      'Ubicación de fierros de refuerzo antes de perforar',
      'Detección de cables eléctricos embebidos',
      'Identificación de tuberías dentro del concreto',
      'Escaneo previo a perforaciones diamantinas y anclajes químicos',
      'Evaluación de estructuras existentes en remodelaciones y ampliaciones'
    ],
    equipment: {
      intro: 'Con los equipos HILTI PS 200 y PS 1000, en AMAROT PERÚ SAC podemos entregar:',
      items: [
        'Reportes técnicos detallados del escaneo',
        'Imágenes y visualizaciones 3D del refuerzo y elementos detectados',
        'Información clara para ingenieros, supervisores y proyectistas'
      ],
      outro: 'Estos reportes son especialmente útiles en losas postensadas y estructuras con alta densidad de acero, donde la precisión es crítica.'
    },
    advantages: [
      'Reduce el riesgo de cortar fierros, cables o tuberías',
      'Protege la integridad estructural',
      'Evita retrabajos y retrasos en obra',
      'Mejora la seguridad y planificación',
      'Permite contar con documentación técnica del escaneo'
    ],
    whyAmarot: [
      'Más de 20 años de experiencia técnica en obra',
      'Especialistas en detección de metales y escaneo de estructuras en Perú',
      'Uso exclusivo de tecnología HILTI',
      'Entrega de reportes técnicos e imágenes 3D',
      'Enfoque preventivo, técnico y orientado a obra real'
    ],
    cta: 'Si tu proyecto requiere detección de metales, escaneo de estructuras y reportes técnicos, en AMAROT PERÚ SAC te ayudamos a identificar zonas seguras de intervención, minimizando riesgos antes de perforar o anclar.',
    priority: 'complementary'
  },
  {
    slug: 'pruebas-anclaje-pull-out-test',
    title: 'Pruebas de Anclaje (Pull Out Test) en Perú',
    shortTitle: 'Pruebas de Anclaje',
    metaTitle: 'Pruebas de Anclaje Pull Out Test | AMAROT Perú',
    metaDescription: 'Realizamos pruebas de anclaje (pull out test) para verificar resistencia de fijaciones. Equipos HILTI HAT 28 y HAT 30. Informes técnicos.',
    heroSubtitle: 'Verificación de resistencia real de anclajes y fijaciones',
    image: '/images/pruebas-anclaje.jpg',
    icon: '/icons/pullout.svg',
    shortDescription: 'Pruebas de anclaje para medir la fuerza de sujeción y resistencia real de anclajes instalados, con informes técnicos detallados.',
    intro: [
      'En AMAROT PERÚ SAC realizamos pruebas de anclaje (pull out test) para medir la fuerza de sujeción y resistencia real de anclajes y fijaciones instaladas en materiales de construcción, utilizando equipos HILTI y un equipo técnico con más de 20 años de experiencia en obra en Perú.',
      'Este servicio permite verificar en campo si los anclajes cumplen con la carga de diseño y los requisitos de seguridad, aportando información confiable para la validación de estructuras y sistemas de fijación.'
    ],
    whatIs: 'La prueba de anclaje o pull out test consiste en aplicar una carga controlada y progresiva sobre el anclaje instalado, midiendo su comportamiento hasta alcanzar la carga de ensayo definida o la resistencia máxima del sistema. Estas pruebas se realizan sin dañar la estructura, permitiendo evaluar el desempeño real del anclaje en condiciones de obra.',
    applications: [
      'Varillas roscadas',
      'Pernos de anclaje',
      'Anclajes mecánicos',
      'Anclajes químicos',
      'Sistemas de fijación especiales según proyecto'
    ],
    equipment: {
      intro: 'En AMAROT PERÚ SAC utilizamos equipos HILTI HAT 28 y HAT 30, que permiten:',
      items: [
        'Aplicar cargas precisas y controladas',
        'Medir la resistencia y desplazamiento del anclaje',
        'Evaluar diferentes diámetros y tipos de fijación'
      ],
      outro: 'Estos equipos garantizan resultados confiables y repetibles, alineados con buenas prácticas de ingeniería.'
    },
    advantages: [
      'Verificación de la capacidad real de los anclajes',
      'Mayor seguridad estructural',
      'Control de calidad en obra',
      'Soporte técnico ante supervisión o auditorías',
      'Reducción de riesgos y retrabajos'
    ],
    whyAmarot: [
      'Más de 20 años de experiencia técnica',
      'Especialistas en pruebas de anclaje en Perú',
      'Uso exclusivo de equipos HILTI',
      'Entrega de informes técnicos detallados',
      'Enfoque profesional y orientado a obra real'
    ],
    cta: 'Si tu proyecto requiere pruebas de anclaje o pull out test, en AMAROT PERÚ SAC te brindamos resultados confiables y documentados, garantizando la seguridad y desempeño de tus fijaciones.',
    priority: 'complementary'
  },
  {
    slug: 'sellos-cortafuego',
    title: 'Aplicación de Sellos Cortafuego en Perú',
    shortTitle: 'Sellos Cortafuego',
    metaTitle: 'Aplicación de Sellos Cortafuego | AMAROT Perú',
    metaDescription: 'Aplicación profesional de sellos cortafuego en juntas, ductos y penetraciones. Químicos HILTI certificados. 20+ años de experiencia.',
    heroSubtitle: 'Compartimentación contra fuego, humo y gases calientes',
    image: '/images/sellos-cortafuegos.jpg',
    icon: '/icons/cortafuegos.svg',
    shortDescription: 'Sellado de juntas, pases y penetraciones en elementos constructivos, garantizando la compartimentación contra fuego y humo.',
    intro: [
      'En AMAROT PERÚ SAC realizamos la aplicación de sellos cortafuego para el sellado de juntas, pases y penetraciones en elementos constructivos, garantizando la compartimentación contra fuego, humo y gases calientes en edificaciones e instalaciones industriales en Perú.',
      'Nuestro equipo cuenta con más de 20 años de experiencia en obra y aplica sistemas certificados utilizando químicos cortafuego HILTI o la marca especificada por el cliente, respetando los requerimientos del proyecto y las buenas prácticas de seguridad.'
    ],
    whatIs: 'Los sellos cortafuego son sistemas diseñados para restaurar la resistencia al fuego de muros, losas y tabiques que han sido perforados para el paso de instalaciones. Su correcta aplicación permite evitar la propagación del fuego, controlar el paso de humo y gases tóxicos, proteger rutas de evacuación y cumplir con normativas de seguridad contra incendios.',
    applications: [
      'Juntas de drywall y muros cortafuego',
      'Ductos de ventilación',
      'Bandejas portacables',
      'Pases de tuberías y conducciones eléctricas',
      'Penetraciones en losas y muros de concreto'
    ],
    equipment: {
      intro: 'En AMAROT PERÚ SAC trabajamos con:',
      items: [
        'Químicos cortafuego HILTI certificados',
        'Sistemas equivalentes de otras marcas, según especificación del cliente',
        'Selladores, morteros y espumas cortafuego de alto desempeño'
      ],
      outro: 'Cada sistema se selecciona en función del tipo de penetración, material base (concreto, drywall, mampostería) y clasificación requerida de resistencia al fuego.'
    },
    advantages: [
      'Cumplimiento de estándares de seguridad contra incendios',
      'Protección de personas y activos',
      'Reducción de riesgos en auditorías y supervisiones',
      'Integración adecuada con instalaciones eléctricas y mecánicas'
    ],
    whyAmarot: [
      'Más de 20 años de experiencia técnica',
      'Especialistas en sellos cortafuego en Perú',
      'Uso de químicos HILTI y marcas certificadas',
      'Aplicación profesional y ordenada en obra',
      'Enfoque técnico y orientado a la seguridad'
    ],
    cta: 'Si tu proyecto requiere aplicación de sellos cortafuego en juntas, ductos o penetraciones, en AMAROT PERÚ SAC te ofrecemos un servicio confiable, alineado a los estándares de seguridad y exigencias del proyecto.',
    priority: 'complementary'
  }
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return services.find(service => service.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return services.map(service => service.slug);
}
