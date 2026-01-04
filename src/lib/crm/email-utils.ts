// Utilidades para plantillas de email

import { SERVICE_TYPE_LABELS, type ServiceType } from './types';

export interface TemplateVariables {
  nombre: string;
  empresa: string;
  servicio: string;
  responsable?: string;
  email?: string;
  telefono?: string;
}

/**
 * Reemplaza variables en una plantilla de email
 * Variables soportadas: {{nombre}}, {{empresa}}, {{servicio}}, {{responsable}}, {{email}}, {{telefono}}
 */
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  // Reemplazar cada variable
  result = result.replace(/\{\{nombre\}\}/g, variables.nombre || '');
  result = result.replace(/\{\{empresa\}\}/g, variables.empresa || '');
  result = result.replace(/\{\{servicio\}\}/g, variables.servicio || '');
  result = result.replace(/\{\{responsable\}\}/g, variables.responsable || 'Equipo AMAROT');
  result = result.replace(/\{\{email\}\}/g, variables.email || '');
  result = result.replace(/\{\{telefono\}\}/g, variables.telefono || '');

  return result;
}

/**
 * Construye las variables desde un lead
 */
export function getVariablesFromLead(lead: {
  contactName: string;
  company: string;
  serviceType: ServiceType;
  email?: string | null;
  phone?: string | null;
  assignedTo?: { fullName: string } | null;
}): TemplateVariables {
  return {
    nombre: lead.contactName,
    empresa: lead.company,
    servicio: SERVICE_TYPE_LABELS[lead.serviceType] || lead.serviceType,
    responsable: lead.assignedTo?.fullName,
    email: lead.email || undefined,
    telefono: lead.phone || undefined,
  };
}

/**
 * Genera un mailto: link con el email prellenado
 */
export function generateMailtoLink(
  to: string,
  subject: string,
  body: string
): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
}
