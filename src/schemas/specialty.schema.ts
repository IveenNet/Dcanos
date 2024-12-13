import { Schema, model } from 'mongoose';

const SpecialtySchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  duracion_estimada: { type: Number, required: true },
  precio_base: { type: Number, required: true },
});

export default model('Specialty', SpecialtySchema);
