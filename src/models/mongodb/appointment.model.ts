// src/models/appointment.model.ts
import mongoose, { Schema } from 'mongoose';
import { IAppointment } from '../../interfaces/appointment.interface';

const appointmentSchema = new Schema<IAppointment>({
  peluquero_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cliente_id: { type: Schema.Types.String, ref: 'User', required: true },
  servicios: [{ type: Schema.Types.ObjectId, ref: 'Specialty', required: true }],
  fecha_hora: { type: Date, required: true },
  estado: { type: String, enum: ['pendiente', 'completado'], default: 'pendiente' },
  notas: { type: String },
});


export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
