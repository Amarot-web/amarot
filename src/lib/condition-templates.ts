// ============================================================================
// TEMPLATES DE CONDICIONES PARA COTIZACIONES
// Basados en documentos reales: N176-ROKKA (Lima) y N386-CONSORCIO RÍOS (provincial)
// Cada template tiene variantes para proyectos pequeños (Lima) y grandes (provincial)
// ============================================================================

export interface ConditionBlock {
  id: string;
  title: string;
  content: string;
}

export interface ConditionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  blocks: ConditionBlock[];
}

// Presets rápidos: combinaciones comunes de condiciones
export interface ConditionPreset {
  id: string;
  name: string;
  description: string;
  templateIds: string[];
}

export const CONDITION_TEMPLATES: ConditionTemplate[] = [
  // ── 1. ALCANCE DEL SERVICIO ──
  {
    id: 'scope',
    name: 'Alcance',
    description: 'Qué incluye el servicio',
    icon: '📋',
    blocks: [
      {
        id: 'scope-perforation',
        title: 'Alcance - Perforación Diamantina',
        content: `El servicio comprende la ejecución de perforaciones diamantinas en concreto armado según las especificaciones detalladas en la presente cotización.

Incluye:
- Perforaciones diamantinas en los diámetros y profundidades indicados
- Suministro de brocas diamantadas
- Equipo de perforación húmeda o seca según requerimiento
- Personal técnico calificado (operador certificado HILTI)
- Escaneo previo con detector de armaduras (Ferroscan PS 200)

No incluye suministro de agua ni energía eléctrica en punto de trabajo.`,
      },
      {
        id: 'scope-anchors',
        title: 'Alcance - Anclajes Químicos',
        content: `El servicio comprende la instalación de anclajes químicos post-instalados según especificaciones técnicas.

Incluye:
- Perforación para anclaje en diámetro y profundidad requeridos
- Suministro e instalación de resina química (Hilti HIT-RE 500 V3 o HIT-HY 270)
- Suministro de varillas roscadas en diámetro especificado
- Limpieza de perforaciones con protocolo certificado
- Ensayo de torque de verificación

Se entregará protocolo de instalación por cada anclaje.`,
      },
      {
        id: 'scope-firestop',
        title: 'Alcance - Sellado Cortafuego',
        content: `El servicio comprende la instalación de sistemas de sellado cortafuego certificados.

Incluye:
- Sellado de penetraciones según clasificación (tuberías, cables, bandejas)
- Suministro de materiales cortafuego certificados HILTI (CP 606, CP 636, CFS-SL)
- Instalación conforme a planos aprobados de compartimentación
- Etiquetado de sellos según norma
- Certificado de instalación con resistencia al fuego (EI)

Materiales con certificación UL/FM según ASTM E814.`,
      },
      {
        id: 'scope-detection',
        title: 'Alcance - Detección e Inspección',
        content: `El servicio comprende el escaneo y detección de elementos embebidos en estructuras de concreto.

Incluye:
- Escaneo con equipo Ferroscan PS 200 / X-Scan PS 1000
- Detección de armaduras de refuerzo, tuberías y ductos embebidos
- Mapeo de instalaciones ocultas con tecnología GPR
- Marcado in situ de elementos detectados
- Reporte técnico con imágenes y conclusiones

Profundidad de detección: hasta 300mm (PS 200) / hasta 800mm (PS 1000).`,
      },
      {
        id: 'scope-rental',
        title: 'Alcance - Alquiler de Equipos',
        content: `El servicio comprende el alquiler de equipos HILTI según especificaciones.

Incluye:
- Equipo(s) en condiciones óptimas de funcionamiento
- Accesorios estándar y consumibles iniciales
- Instrucción básica de operación al inicio del alquiler
- Soporte técnico durante el período de alquiler

El cliente es responsable del uso adecuado y devolución en las mismas condiciones.`,
      },
    ],
  },

  // ── 2. PLAZO DE EJECUCIÓN ──
  {
    id: 'timeline',
    name: 'Plazo',
    description: 'Tiempos y cronograma',
    icon: '⏱️',
    blocks: [
      {
        id: 'timeline-short',
        title: 'Plazo - Proyecto corto (1-5 días)',
        content: `Plazo de ejecución: [X] día(s) calendario, sujeto a:
- Libre acceso a las zonas de trabajo
- Disponibilidad de suministro eléctrico (220V/trifásico) y agua en punto de trabajo
- Superficies de trabajo liberadas y sin obstrucciones

El inicio de trabajos será coordinado con mínimo 48 horas de anticipación.`,
      },
      {
        id: 'timeline-medium',
        title: 'Plazo - Proyecto mediano (1-4 semanas)',
        content: `Plazo de ejecución: [X] semanas calendario.

Cronograma:
- Movilización e instalación: [X] día(s)
- Ejecución de trabajos: [X] día(s)
- Desmovilización y limpieza: [X] día(s)

El cronograma detallado será presentado dentro de los 3 días posteriores a la orden de servicio. El avance se reportará semanalmente.`,
      },
      {
        id: 'timeline-long',
        title: 'Plazo - Proyecto largo (1+ meses)',
        content: `Plazo de ejecución: [X] meses calendario.

Cronograma general:
- Fase 1 - Movilización: [X] días
- Fase 2 - Ejecución: [X] meses
- Fase 3 - Desmovilización: [X] días

Se presentará cronograma detallado con hitos de control y entregables parciales. Reportes de avance quincenales. Reuniones de coordinación semanales con supervisión del cliente.

Nota: El plazo no considera paralizaciones por causas ajenas a AMAROT (falta de frente de trabajo, lluvias, fuerza mayor, etc.).`,
      },
    ],
  },

  // ── 3. CONDICIONES COMERCIALES ──
  {
    id: 'commercial',
    name: 'Comercial',
    description: 'Pagos, validez, moneda',
    icon: '💰',
    blocks: [
      {
        id: 'commercial-cash',
        title: 'Condiciones Comerciales - Contado',
        content: `- Moneda: Soles (PEN) / Dólares americanos (USD)
- Forma de pago: Contado contra entrega de conformidad
- Los precios no incluyen IGV (18%)
- Validez de la oferta: 15 días calendario
- Facturación al término del servicio`,
      },
      {
        id: 'commercial-advance',
        title: 'Condiciones Comerciales - Con adelanto',
        content: `- Moneda: Soles (PEN) / Dólares americanos (USD)
- Forma de pago: 50% adelanto + 50% contra entrega de conformidad
- Los precios no incluyen IGV (18%)
- Validez de la oferta: 15 días calendario
- Facturación: 1era factura con adelanto, 2da factura al cierre
- El inicio de trabajos está sujeto a la recepción del adelanto`,
      },
      {
        id: 'commercial-credit',
        title: 'Condiciones Comerciales - Crédito',
        content: `- Moneda: Soles (PEN) / Dólares americanos (USD)
- Forma de pago: Crédito a 30 días de emitida la factura
- Los precios no incluyen IGV (18%)
- Validez de la oferta: 15 días calendario
- Facturación: Valorización mensual según avance
- Sujeto a aprobación crediticia`,
      },
      {
        id: 'commercial-valorizaciones',
        title: 'Condiciones Comerciales - Valorizaciones',
        content: `- Moneda: Soles (PEN) / Dólares americanos (USD)
- Forma de pago: Valorizaciones quincenales/mensuales según avance
- Adelanto: 30% del monto total (amortizable en las 3 primeras valorizaciones)
- Los precios no incluyen IGV (18%)
- Validez de la oferta: 30 días calendario
- Plazo de pago: 30 días de recibida la valorización aprobada
- Retención de fondo de garantía: 5% (liberado a los 30 días de la recepción final)`,
      },
    ],
  },

  // ── 4. OBLIGACIONES DEL CLIENTE ──
  {
    id: 'client-obligations',
    name: 'Obligaciones',
    description: 'Responsabilidades del cliente',
    icon: '🤝',
    blocks: [
      {
        id: 'obligations-basic',
        title: 'Obligaciones del Cliente - Básico',
        content: `El cliente se compromete a:
- Proporcionar libre acceso a las zonas de trabajo
- Suministrar energía eléctrica (220V) y agua en punto de trabajo
- Proveer planos de ubicación de perforaciones/trabajos
- Designar un responsable de coordinación
- Garantizar que las áreas de trabajo estén liberadas de obstrucciones`,
      },
      {
        id: 'obligations-provincial',
        title: 'Obligaciones del Cliente - Proyecto provincial',
        content: `El cliente se compromete a:
- Proporcionar libre acceso a las zonas de trabajo
- Suministrar energía eléctrica (220V/trifásico) y agua en punto de trabajo
- Proveer planos actualizados (estructurales, instalaciones)
- Designar un supervisor/coordinador permanente
- Facilitar áreas para almacenamiento temporal de equipos y materiales
- Gestionar permisos de ingreso del personal AMAROT a la obra
- Proporcionar facilidades de alojamiento y alimentación (si no está incluido)
- Coordinar con otros contratistas para evitar interferencias
- Realizar la señalización y bloqueo de áreas de trabajo (LOTO)`,
      },
    ],
  },

  // ── 5. EXCLUSIONES ──
  {
    id: 'exclusions',
    name: 'Exclusiones',
    description: 'Qué NO incluye',
    icon: '⛔',
    blocks: [
      {
        id: 'exclusions-basic',
        title: 'Exclusiones',
        content: `La presente cotización NO incluye:
- Trabajos de resane, acabado o pintura posterior a las perforaciones
- Suministro de agua y energía eléctrica
- Andamiaje o plataformas elevadoras (salvo indicación expresa)
- Demolición o remoción de concreto más allá de las perforaciones cotizadas
- Trabajos adicionales no contemplados en el alcance
- Gestión de residuos especiales o peligrosos`,
      },
      {
        id: 'exclusions-extended',
        title: 'Exclusiones - Extendido',
        content: `La presente cotización NO incluye:
- Trabajos de resane, acabado, pintura o restitución arquitectónica
- Suministro de agua, energía eléctrica o aire comprimido
- Andamiaje, plataformas elevadoras o grúas
- Demolición o remoción de concreto fuera del alcance cotizado
- Refuerzo estructural posterior a perforaciones
- Diseño estructural o cálculos de ingeniería
- Trabajos en horario nocturno o fines de semana (salvo indicación)
- Transporte de maquinaria pesada especial
- Movilización adicional por paralización no atribuible a AMAROT
- Gestión de residuos especiales, peligrosos o contaminados
- Costos por lucro cesante o penalidades del proyecto principal`,
      },
    ],
  },

  // ── 6. SEGURIDAD ──
  {
    id: 'safety',
    name: 'Seguridad',
    description: 'SST y normativa',
    icon: '🛡️',
    blocks: [
      {
        id: 'safety-basic',
        title: 'Seguridad - Básico',
        content: `AMAROT cumple con la normativa vigente en Seguridad y Salud en el Trabajo:
- Personal con EPP completo (casco, lentes, guantes, zapatos de seguridad)
- Charla de seguridad de 5 minutos antes de cada jornada
- Cumplimiento de la Ley 29783 y su reglamento
- SCTR vigente para todo el personal

Se solicitará inducción de seguridad del cliente antes del inicio de trabajos.`,
      },
      {
        id: 'safety-full',
        title: 'Seguridad - Proyecto con CSST',
        content: `AMAROT cumple con el Sistema de Gestión de Seguridad y Salud en el Trabajo:
- Personal con EPP completo y específico para cada actividad
- Charla de seguridad diaria (5 minutos) y charla semanal (30 minutos)
- Análisis de Trabajo Seguro (ATS) antes de cada actividad
- Permiso de Trabajo en Caliente / Altura / Espacios Confinados según aplique
- PETAR para trabajos de alto riesgo
- Cumplimiento de la Ley 29783, DS 005-2012-TR y normas sectoriales
- SCTR vigente (pensión y salud) para todo el personal
- Póliza de responsabilidad civil
- Supervisor de seguridad permanente en obra (proyectos >30 días)
- Plan de contingencias y respuesta a emergencias
- Registro de incidentes y accidentes

Se solicitará:
- Inducción de seguridad del cliente
- Reglamento interno de SST de la obra
- Plan de evacuación y puntos de reunión`,
      },
    ],
  },

  // ── 7. GARANTÍAS ──
  {
    id: 'warranty',
    name: 'Garantías',
    description: 'Garantía del servicio',
    icon: '✅',
    blocks: [
      {
        id: 'warranty-standard',
        title: 'Garantía',
        content: `AMAROT garantiza:
- Calidad de las perforaciones ejecutadas según especificaciones técnicas
- Correcta instalación de anclajes según ficha técnica del fabricante
- Certificación de sellados cortafuego según normativa aplicable
- Garantía de 1 año sobre trabajos ejecutados (en condiciones normales de uso)

La garantía no cubre daños por:
- Uso inadecuado o modificaciones posteriores por terceros
- Eventos de fuerza mayor (sismos, incendios, inundaciones)
- Sobrecargas que excedan las especificaciones de diseño`,
      },
      {
        id: 'warranty-extended',
        title: 'Garantía - Extendida',
        content: `AMAROT garantiza:
- Calidad de todos los trabajos ejecutados según especificaciones técnicas
- Correcta instalación de anclajes con protocolo de pruebas
- Certificación de sellados cortafuego (EI 60/90/120 según diseño)
- Garantía de 2 años sobre trabajos ejecutados
- Soporte técnico post-venta durante el período de garantía
- Reparación o reposición sin costo de trabajos defectuosos

Documentación entregable:
- Protocolos de instalación firmados
- Certificados de materiales y equipos utilizados
- Informe fotográfico del proceso
- Planos as-built de perforaciones ejecutadas`,
      },
    ],
  },
];

// Presets: combinaciones comunes de templates
export const CONDITION_PRESETS: ConditionPreset[] = [
  {
    id: 'quick-lima',
    name: 'Rápido Lima',
    description: 'Proyecto corto en Lima, contado',
    templateIds: ['scope', 'timeline', 'commercial', 'exclusions', 'safety', 'warranty'],
  },
  {
    id: 'provincial-large',
    name: 'Provincial grande',
    description: 'Proyecto largo provincial con valorizaciones',
    templateIds: ['scope', 'timeline', 'commercial', 'client-obligations', 'exclusions', 'safety', 'warranty'],
  },
];

// Helper: genera bloques de condiciones a partir de IDs de templates seleccionados
// Para cada template seleccionado, toma el primer bloque como default
export function generateDefaultConditions(templateIds: string[]): ConditionBlock[] {
  const blocks: ConditionBlock[] = [];
  for (const templateId of templateIds) {
    const template = CONDITION_TEMPLATES.find(t => t.id === templateId);
    if (template && template.blocks.length > 0) {
      blocks.push({ ...template.blocks[0] });
    }
  }
  return blocks;
}
