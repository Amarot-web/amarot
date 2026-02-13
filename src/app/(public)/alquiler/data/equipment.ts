export interface Equipment {
  id: string;
  model: string;
  description: string;
  specs: { label: string; value: string }[];
  image: string;
  featured?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  equipment: Equipment[];
}

export const categories: Category[] = [
  {
    slug: 'diamantinas',
    name: 'Perforadoras Diamantinas',
    shortName: 'Diamantinas',
    description: 'Equipos de perforación de alta precisión para concreto armado',
    color: '#DC2626', // Rojo HILTI
    equipment: [
      {
        id: 'dd-120',
        model: 'DD 120',
        description: 'Equipo compacto para perforaciones pequeñas y medianas en concreto.',
        specs: [
          { label: 'Diámetro', value: '16 – 132 mm' },
          { label: 'Aplicación', value: 'Anclajes, pases eléctricos y sanitarios' },
          { label: 'Uso', value: 'Seco y húmedo' },
          { label: 'Montaje', value: 'Manual o con soporte' },
        ],
        image: '/images/alquiler/diamantinas/dd-120.jpg',
        featured: true,
      },
      {
        id: 'dd-150',
        model: 'DD 150',
        description: 'Diamantina versátil para perforaciones estructurales medianas.',
        specs: [
          { label: 'Diámetro', value: 'Hasta 162 mm' },
          { label: 'Motor', value: 'Eléctrico con control electrónico' },
          { label: 'Uso', value: 'Intensivo en concreto armado' },
          { label: 'Montaje', value: 'Compatible con columna' },
        ],
        image: '/images/alquiler/diamantinas/dd-150.jpg',
      },
      {
        id: 'dd-160',
        model: 'DD 160',
        description: 'Equipo robusto para perforaciones frecuentes en obra.',
        specs: [
          { label: 'Diámetro', value: 'Hasta 200 mm' },
          { label: 'Característica', value: 'Alta estabilidad y precisión' },
          { label: 'Ideal para', value: 'Instalaciones MEP' },
        ],
        image: '/images/alquiler/diamantinas/dd-160.jpg',
      },
      {
        id: 'dd-200',
        model: 'DD 200',
        description: 'Diamantina de alto rendimiento para perforaciones grandes.',
        specs: [
          { label: 'Diámetro', value: 'Hasta 250 mm' },
          { label: 'Sistema', value: 'Avance con columna' },
          { label: 'Uso', value: 'Continuo en concreto armado' },
        ],
        image: '/images/alquiler/diamantinas/dd-200.jpg',
      },
      {
        id: 'dd-250',
        model: 'DD 250',
        description: 'Equipo profesional para perforaciones estructurales exigentes.',
        specs: [
          { label: 'Diámetro', value: 'Hasta 300 mm' },
          { label: 'Característica', value: 'Alto torque y control de carga' },
          { label: 'Ideal para', value: 'Obras industriales' },
        ],
        image: '/images/alquiler/diamantinas/dd-250.png',
      },
      {
        id: 'dd-350',
        model: 'DD 350',
        description: 'Diamantina de alta capacidad para diámetros grandes.',
        specs: [
          { label: 'Diámetro', value: 'Hasta 400 mm' },
          { label: 'Aplicación', value: 'Estructuras pesadas' },
          { label: 'Montaje', value: 'Exclusivo con soporte' },
        ],
        image: '/images/alquiler/diamantinas/dd-350.jpg',
      },
      {
        id: 'dd-500',
        model: 'DD 500',
        description: 'Diamantina de máxima capacidad para grandes diámetros.',
        specs: [
          { label: 'Diámetro', value: 'Hasta 500 mm' },
          { label: 'Aplicación', value: 'Túneles, puentes, muros estructurales' },
          { label: 'Montaje', value: 'Exclusivo con soporte' },
        ],
        image: '/images/alquiler/diamantinas/dd-500.jpg',
      },
    ],
  },
  {
    slug: 'accesorios',
    name: 'Accesorios para Diamantinas',
    shortName: 'Accesorios',
    description: 'Complementos esenciales para perforación diamantina',
    color: '#6B7280', // Gris
    equipment: [
      {
        id: 'base-succion',
        model: 'DD-HD30-VBP',
        description: 'Base a succión para perforadora diamantina. Fijación segura sin anclajes.',
        specs: [
          { label: 'Tipo', value: 'Base a succión' },
          { label: 'Compatible', value: 'Perforadoras DD' },
        ],
        image: '/images/alquiler/accesorios/base-succion-dd-hd30.jpg',
      },
      {
        id: 'bomba-agua',
        model: 'DWP 10',
        description: 'Bomba de agua HILTI para refrigeración en perforación húmeda.',
        specs: [
          { label: 'Tipo', value: 'Bomba de agua' },
          { label: 'Uso', value: 'Perforación húmeda' },
        ],
        image: '/images/alquiler/accesorios/bomba-agua-dwp-10.jpg',
      },
      {
        id: 'bomba-vacio',
        model: 'DD VP-U',
        description: 'Bomba de vacío para fijación de bases de perforación.',
        specs: [
          { label: 'Tipo', value: 'Bomba de vacío' },
          { label: 'Uso', value: 'Fijación de base' },
        ],
        image: '/images/alquiler/accesorios/bomba-vacio-dd-vp-u.jpg',
      },
    ],
  },
  {
    slug: 'rotomartillos',
    name: 'Rotomartillos',
    shortName: 'Rotomartillos',
    description: 'Equipos para perforación y cincelado en concreto',
    color: '#1E3A8A', // Azul
    equipment: [
      {
        id: 'te-50',
        model: 'TE 50 AVR',
        description: 'Rotomartillo SDS Max para perforación y cincelado ligero.',
        specs: [
          { label: 'Energía', value: 'Media' },
          { label: 'Uso', value: 'Perforaciones medianas en concreto' },
          { label: 'Función', value: 'Perforar y cincelar' },
        ],
        image: '/images/alquiler/rotomartillos/te-50.jpg',
        featured: true,
      },
      {
        id: 'te-70',
        model: 'TE 70 ATC AVR',
        description: 'Equipo potente para perforaciones profundas.',
        specs: [
          { label: 'Energía', value: 'Mayor que TE 50' },
          { label: 'Uso', value: 'Continuo en concreto armado' },
          { label: 'Ideal para', value: 'Anclajes estructurales' },
        ],
        image: '/images/alquiler/rotomartillos/te-70.jpg',
      },
    ],
  },
  {
    slug: 'demoledores',
    name: 'Demoledores',
    shortName: 'Demoledores',
    description: 'Equipos de alta potencia para demolición de concreto',
    color: '#EA580C', // Naranja
    equipment: [
      {
        id: 'te-700',
        model: 'TE 700 AVR',
        description: 'Equipo combinado para perforación pesada y demolición ligera.',
        specs: [
          { label: 'Rendimiento', value: 'Alto' },
          { label: 'Control', value: 'Reducción de vibración' },
          { label: 'Uso', value: 'Estructural' },
        ],
        image: '/images/alquiler/demoledores/te-700.jpg',
      },
      {
        id: 'te-1000',
        model: 'TE 1000 AVR',
        description: 'Demolición ligera a media en muros y losas.',
        specs: [
          { label: 'Energía', value: 'Alta' },
          { label: 'Uso', value: 'Prolongado en obra' },
          { label: 'Aplicación', value: 'Muros y losas' },
        ],
        image: '/images/alquiler/demoledores/te-1000.jpg',
        featured: true,
      },
      {
        id: 'te-1500',
        model: 'TE 1500 AVR',
        description: 'Demoledor potente con reducción activa de vibraciones.',
        specs: [
          { label: 'Aplicación', value: 'Losas, vigas, muros' },
          { label: 'Sistema', value: 'AVR para menor fatiga' },
          { label: 'Potencia', value: 'Alta' },
        ],
        image: '/images/alquiler/demoledores/te-1500.jpg',
      },
      {
        id: 'te-3000',
        model: 'TE 3000 AVR',
        description: 'Demoledor pesado para concreto masivo.',
        specs: [
          { label: 'Energía', value: 'Muy alta' },
          { label: 'Uso', value: 'Cimentaciones, losas gruesas' },
          { label: 'Aplicación', value: 'Estructuras masivas' },
        ],
        image: '/images/alquiler/demoledores/te-3000.jpg',
      },
    ],
  },
  {
    slug: 'taladros',
    name: 'Taladros',
    shortName: 'Taladros',
    description: 'Taladros inalámbricos y con cable para diversos usos',
    color: '#059669', // Verde
    equipment: [
      {
        id: 't4-a22',
        model: 'T4 A22',
        description: 'Taladro inalámbrico compacto para trabajos generales.',
        specs: [
          { label: 'Voltaje', value: '22 V' },
          { label: 'Tipo', value: 'A batería' },
          { label: 'Uso', value: 'Metal, madera y fijaciones' },
        ],
        image: '/images/alquiler/taladros/t4-a22.jpg',
      },
      {
        id: 't6-a36',
        model: 'T6 A36',
        description: 'Taladro inalámbrico de alto torque.',
        specs: [
          { label: 'Voltaje', value: '36 V' },
          { label: 'Tipo', value: 'A batería' },
          { label: 'Uso', value: 'Profesional intensivo' },
        ],
        image: '/images/alquiler/taladros/t6-a36.webp',
      },
      {
        id: 'te-30-a36',
        model: 'TE 30 A36',
        description: 'Rotomartillo inalámbrico SDS Plus.',
        specs: [
          { label: 'Voltaje', value: '36 V' },
          { label: 'Tipo', value: 'A batería' },
          { label: 'Uso', value: 'Perforación en concreto' },
          { label: 'Ideal para', value: 'Anclajes en obra' },
        ],
        image: '/images/alquiler/taladros/te-30-a36.jpg',
        featured: true,
      },
      {
        id: 'te-30-cable',
        model: 'TE 30',
        description: 'Rotomartillo SDS Plus con cable.',
        specs: [
          { label: 'Tipo', value: 'Con cable' },
          { label: 'Uso', value: 'Perforación continua' },
          { label: 'Ideal para', value: 'Trabajos prolongados' },
        ],
        image: '/images/alquiler/taladros/te-30-cable.jpg',
      },
    ],
  },
  {
    slug: 'atornilladoras',
    name: 'Atornilladoras',
    shortName: 'Atornilladoras',
    description: 'Atornilladoras de impacto para fijaciones estructurales',
    color: '#4B5563', // Gris oscuro
    equipment: [
      {
        id: 'sf-8m-a22',
        model: 'SF 8M-A22',
        description: 'Atornilladora robusta para fijaciones estructurales.',
        specs: [
          { label: 'Voltaje', value: '22 V' },
          { label: 'Torque', value: 'Alto' },
          { label: 'Uso', value: 'Metal y madera' },
        ],
        image: '/images/alquiler/atornilladoras/sf-8m-a22.jpg',
      },
      {
        id: 'sf-6h-a22',
        model: 'SF 6H-A22',
        description: 'Taladro atornillador de impacto versátil.',
        specs: [
          { label: 'Voltaje', value: '22 V' },
          { label: 'Función', value: 'Impacto' },
          { label: 'Uso', value: 'Concreto liviano' },
          { label: 'Característica', value: 'Portátil y potente' },
        ],
        image: '/images/alquiler/atornilladoras/sf-6h-a22.jpg',
      },
    ],
  },
  {
    slug: 'detectores',
    name: 'Detectores de Metal',
    shortName: 'Detectores',
    description: 'Equipos de detección y escaneo estructural',
    color: '#7C3AED', // Púrpura
    equipment: [
      {
        id: 'ps-38',
        model: 'PS 38',
        description: 'Detector básico para acero y cables.',
        specs: [
          { label: 'Tipo', value: 'Detector básico' },
          { label: 'Uso', value: 'Previo a perforación' },
          { label: 'Detecta', value: 'Acero y cables' },
        ],
        image: '/images/alquiler/detectores/ps-38.jpg',
      },
      {
        id: 'ps-200',
        model: 'PS 200',
        description: 'Detector avanzado con mayor profundidad.',
        specs: [
          { label: 'Tipo', value: 'Detector avanzado' },
          { label: 'Profundidad', value: 'Mayor alcance' },
          { label: 'Función', value: 'Identificación de objetos empotrados' },
        ],
        image: '/images/alquiler/detectores/ps-200.jpg',
        featured: true,
      },
      {
        id: 'ps-1000',
        model: 'PS 1000 Ferroscan',
        description: 'Sistema profesional de escaneo estructural.',
        specs: [
          { label: 'Tipo', value: 'Ferroscan profesional' },
          { label: 'Detecta', value: 'Acero, cables y vacíos' },
          { label: 'Uso', value: 'Ingeniería y evaluación estructural' },
          { label: 'Reportes', value: 'Imágenes 3D' },
        ],
        image: '/images/alquiler/detectores/ps-1000.jpg',
      },
    ],
  },
  {
    slug: 'esmeriles',
    name: 'Esmeriles',
    shortName: 'Esmeriles',
    description: 'Esmeriles angulares para corte y desbaste',
    color: '#4B5563',
    equipment: [
      {
        id: 'dcg-230',
        model: 'DCG 230',
        description: 'Esmeril angular grande para corte y desbaste.',
        specs: [
          { label: 'Disco', value: '230 mm' },
          { label: 'Uso', value: 'Concreto y acero' },
          { label: 'Tipo', value: 'Angular grande' },
        ],
        image: '/images/alquiler/esmeriles/dcg-230.jpg',
      },
    ],
  },
  {
    slug: 'cortadoras',
    name: 'Cortadoras de Muro',
    shortName: 'Cortadoras',
    description: 'Cortadoras manuales para concreto y mampostería',
    color: '#4B5563',
    equipment: [
      {
        id: 'dch-300',
        model: 'DCH 300',
        description: 'Cortadora manual para concreto y mampostería.',
        specs: [
          { label: 'Corte', value: 'En seco' },
          { label: 'Uso', value: 'Aperturas y ranuras' },
          { label: 'Material', value: 'Concreto y mampostería' },
        ],
        image: '/images/alquiler/cortadoras/dch-300.png',
      },
    ],
  },
  {
    slug: 'fijadoras',
    name: 'Fijadoras de Clavos',
    shortName: 'Fijadoras',
    description: 'Herramientas de fijación directa a pólvora',
    color: '#4B5563',
    equipment: [
      {
        id: 'dx-76',
        model: 'DX 76',
        description: 'Fijadora a pólvora para anclajes directos.',
        specs: [
          { label: 'Tipo', value: 'Disparo a pólvora' },
          { label: 'Uso', value: 'Acero a concreto/acero' },
          { label: 'Productividad', value: 'Alta' },
        ],
        image: '/images/alquiler/fijadoras/dx-76.jpg',
      },
      {
        id: 'dx-460',
        model: 'DX 460',
        description: 'Fijadora a pólvora semiautomática para concreto y acero.',
        specs: [
          { label: 'Tipo', value: 'Cartucho calibre 6.8/11 M (.27)' },
          { label: 'Energía máx.', value: '325 J' },
          { label: 'Regulación', value: '4 niveles de potencia' },
          { label: 'Pernos', value: '12 – 72 mm' },
          { label: 'Peso', value: '3.5 kg' },
          { label: 'Material base', value: 'Concreto y acero' },
        ],
        image: '/images/alquiler/fijadoras/dx-460.jpg',
      },
    ],
  },
  {
    slug: 'aspiradoras',
    name: 'Aspiradoras y Recirculadoras',
    shortName: 'Aspiradoras',
    description: 'Equipos para gestión de polvo y agua en obra',
    color: '#4B5563',
    equipment: [
      {
        id: 'vc-20',
        model: 'VC 20',
        description: 'Aspiradora industrial para polvo de obra.',
        specs: [
          { label: 'Clase', value: 'L' },
          { label: 'Compatible', value: 'Herramientas eléctricas' },
          { label: 'Uso', value: 'Polvo de obra' },
        ],
        image: '/images/alquiler/aspiradoras/vc-20.jpg',
      },
      {
        id: 'wsm-100',
        model: 'WSM 100',
        description: 'Sistema de recirculación de agua para diamantinas.',
        specs: [
          { label: 'Tipo', value: 'Recirculadora de agua' },
          { label: 'Beneficio', value: 'Reduce consumo de agua' },
          { label: 'Uso', value: 'Perforación diamantada' },
        ],
        image: '/images/alquiler/aspiradoras/wsm-100.jpg',
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function getAllEquipment(): Equipment[] {
  return categories.flatMap((cat) => cat.equipment);
}

export function getFeaturedEquipment(): Equipment[] {
  return getAllEquipment().filter((eq) => eq.featured);
}

export function getTotalEquipmentCount(): number {
  return getAllEquipment().length;
}
