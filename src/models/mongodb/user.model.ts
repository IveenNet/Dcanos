import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../interfaces/user.interface';

const userSchema = new Schema<IUser>({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String, required: true },
  foto_url: String,
  rol: { type: String, enum: ['peluquero', 'cliente', 'admin'], required: true },
  detalles: {
    especialidades: [{
      type: Schema.Types.ObjectId,
      ref: 'Specialty'
    }],
    horarios: [{
      dia: String,
      inicio: String,
      fin: String
    }]
  },
  activo: { type: Boolean, default: true },
  fecha_registro: { type: Date, default: Date.now }
});

// Middleware para hashear la contraseña antes de guardar el usuario
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

export default mongoose.model<IUser>('User', userSchema);
