import { Document } from 'mongoose';
import { ISpecialty } from './specialty.interface';
import { IUser } from './user.interface';
export interface IAppointment extends Document {
  peluquero_id: IUser;
  cliente_id: IUser;
  servicios: ISpecialty[];
  fecha_hora: Date;
  estado: 'pendiente' | 'completado';
  notas?: string;
}
