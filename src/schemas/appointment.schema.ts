import { z } from 'zod';

export const createAppointmentSchema = z.object({
  peluquero_id: z.string().min(1, 'El ID del peluquero es requerido'),
  servicios: z.array(z.string().min(1, 'El ID del servicio es requerido')),
  fecha_hora: z.string()
    .min(1, 'La fecha y hora son requeridas')
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Formato de fecha y hora inválido. Debe ser YYYY-MM-DDTHH:mm'),
  estado: z.enum(['pendiente', 'completada']).default('pendiente'),
  notas: z.string().max(100, 'Las notas no pueden exceder los 100 caracteres').optional()
});

export const updateAppointmentSchema = createAppointmentSchema.partial();
