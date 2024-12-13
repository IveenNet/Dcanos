// src/models/specialty.model.ts
import mongoose, { Schema } from 'mongoose';
import { ISpecialty } from '../../interfaces/specialty.interface';

const specialtySchema = new Schema<ISpecialty>({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  duracion_estimada: { type: Number, required: true },
  precio_base: { type: Number, required: true }
});

export default mongoose.model<ISpecialty>('Specialty', specialtySchema);


