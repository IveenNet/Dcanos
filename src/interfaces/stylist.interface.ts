// interfaces/stylist.interface.ts
import { Document } from 'mongoose';
import { ISpecialty } from './specialty.interface';

export interface IStylist extends Document {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  foto_url?: string;
  rol: 'peluquero';
  detalles: {
    especialidades: ISpecialty[];
    horarios: Array<{
      dia: string;
      inicio: string;
      fin: string;
    }>;
  };
  activo: boolean;
  fecha_registro: Date;
}
