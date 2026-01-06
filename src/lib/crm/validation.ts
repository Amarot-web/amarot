import { z } from 'zod';

// ==================== LEAD SCHEMA ====================

export const serviceTypeSchema = z.enum([
  'perforacion_diamantina',
  'anclajes_quimicos',
  'deteccion_metales',
  'pruebas_anclaje',
  'sellos_cortafuego',
  'alquiler_equipos_hilti',
  'otro',
]);

export const leadSourceSchema = z.enum([
  'contact_form',
  'whatsapp',
  'phone',
  'email',
  'referral',
  'other',
]);

export const prioritySchema = z.enum(['high', 'medium', 'low']);

export const leadFormSchema = z.object({
  company: z.string().min(2, 'La empresa debe tener al menos 2 caracteres'),
  contactName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  serviceType: serviceTypeSchema,
  description: z.string().optional(),
  stageId: z.string().uuid().optional(),
  expectedRevenue: z.number().min(0, 'El valor debe ser positivo').optional(),
  dateDeadline: z.date().optional(),
  priority: prioritySchema.optional().nullable(),
  userId: z.string().uuid().optional(),
  source: leadSourceSchema,
});

export type LeadFormSchema = z.infer<typeof leadFormSchema>;

// ==================== ACTIVITY SCHEMA ====================

export const activityTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'visit',
  'task',
  'note',
]);

export const activityFormSchema = z.object({
  activityType: activityTypeSchema,
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  userId: z.string().uuid().optional(),
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;

// ==================== NOTE SCHEMA ====================

export const noteFormSchema = z.object({
  content: z.string().min(1, 'La nota no puede estar vacía'),
});

export type NoteFormSchema = z.infer<typeof noteFormSchema>;

// ==================== MARK AS LOST SCHEMA ====================

export const markAsLostSchema = z.object({
  lostReasonId: z.string().uuid('Selecciona una razón de pérdida'),
  lostNotes: z.string().optional(),
});

export type MarkAsLostSchema = z.infer<typeof markAsLostSchema>;

// ==================== STAGE CHANGE SCHEMA ====================

export const stageChangeSchema = z.object({
  leadId: z.string().uuid(),
  stageId: z.string().uuid(),
});

export type StageChangeSchema = z.infer<typeof stageChangeSchema>;

// ==================== ASSIGN USER SCHEMA ====================

export const assignUserSchema = z.object({
  leadId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
});

export type AssignUserSchema = z.infer<typeof assignUserSchema>;
