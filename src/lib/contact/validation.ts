import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  company: z.string().min(2, 'La empresa debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  serviceType: z.enum([
    'perforaciones',
    'anclajes',
    'deteccion',
    'pullout',
    'sellos',
    'alquiler',
    'otro',
  ]),
  location: z.string().min(2, 'Indica la ubicación del proyecto'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  // Honeypot - debe estar vacío
  website: z.string().max(0, 'Bot detectado').optional(),
  // Turnstile token
  turnstileToken: z.string().min(1, 'Verificación requerida'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const serviceTypeLabels: Record<string, string> = {
  perforaciones: 'Perforaciones Diamantinas',
  anclajes: 'Anclajes Químicos',
  deteccion: 'Detección de Metales / Escaneo',
  pullout: 'Pruebas de Anclaje (Pull Out Test)',
  sellos: 'Sellos Cortafuego',
  alquiler: 'Alquiler de Equipos',
  otro: 'Otro',
};
