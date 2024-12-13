import { Request } from "express";
import { IAppointment, ISpecialty, IUser } from "../../interfaces/index";

export const transformAppointment = (
  appointment: IAppointment,
  req: Request,
  entityKey: 'cliente_id' | 'peluquero_id'
) => {
  // Aseguramos que entity es un objeto o null
  const entity = appointment[entityKey] as IUser | null;

  return {
    _id: appointment._id,
    fecha_hora: appointment.fecha_hora,
    estado: appointment.estado,
    notas: appointment.notas,
    entity: entity && typeof entity === 'object'
      ? {
        _id: entity._id,
        nombre: entity.nombre,
        telefono: entity.telefono,
        foto_url: entity.foto_url
          ? `${req.protocol}://${req.get('host')}/uploads/users/${entity.foto_url}`
          : null,
        especialidades: ((entity.detalles?.especialidades || []) as unknown as ISpecialty[]).map((especialidad) => ({
          _id: especialidad._id,
          nombre: especialidad.nombre,
          descripcion: especialidad.descripcion,
          duracion_estimada: especialidad.duracion_estimada,
          precio_base: especialidad.precio_base,
        })),
      }
      : null,
    servicios: appointment.servicios?.map((servicio: ISpecialty) => ({
      _id: servicio._id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion_estimada: servicio.duracion_estimada,
      precio_base: servicio.precio_base,
    })) || [],
  };
};
