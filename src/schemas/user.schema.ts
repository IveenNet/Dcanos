import { z } from 'zod';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const createUserSchema = z.object({
  nombre: z.string({ invalid_type_error: 'Nombre must be a string' })
    .min(1, { message: 'El nombre es requerido' })
    .max(100, { message: 'El nombre no puede tener más de 255 caracteres' }),
  email: z.string()
    .email({ message: 'El correo electrónico no es válido' })
    .max(100, { message: 'El correo electrónico no puede tener más de 255 caracteres' }),
  password: z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(50, { message: 'La contraseña no puede tener más de 255 caracteres' }),
  telefono: z.string()
    .min(1, { message: 'El teléfono es requerido' })
    .max(20, { message: 'El teléfono no puede tener más de 20 caracteres' }),
  foto_url: z.custom<File>()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'El tamaño máximo de la imagen es 1MB'
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Solo se permiten archivos .jpg, .jpeg, .png y .webp'
    ),
});

export const updateUserSchema = createUserSchema.partial();
