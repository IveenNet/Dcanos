export interface IUser {
  _id: string;
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  foto_url: string;
  rol: 'peluquero' | 'cliente' | 'admin';
  detalles?: {
    especialidades: string[];
    horarios: {
      dia: string;
      inicio: string;
      fin: string;
    }[];
  };
  fecha_registro: Date;
  activo: boolean;
}
