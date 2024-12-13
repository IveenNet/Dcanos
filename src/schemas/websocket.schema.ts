import { z } from 'zod';

export const peluqueroSchema = z.object({
  detalles: z.object({
    especialidades: z.array(z.string()),
    horarios: z.array(
      z.object({
        dia: z.string(),
        inicio: z.string(),
        fin: z.string(),
      })
    ).optional(),
  }),
  _id: z.string(),
  nombre: z.string(),
  email: z.string().email(),
  password: z.string(),
  telefono: z.string(),
  foto_url: z.string().optional(),
  rol: z.literal('peluquero'),
  activo: z.boolean(),
  fecha_registro: z.string(),
  __v: z.number(),
});

export const appointmentEventSchema = z.object({
  peluquero_id: peluqueroSchema, // Validar usando el esquema de peluquero
  type: z.enum(['create', 'update', 'delete']),
  appointment_id: z.string().uuid(),
  data: z.record(z.any()), // Cambiar según la estructura exacta de `data` si es necesario
});
