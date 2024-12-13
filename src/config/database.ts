// src/config/database.ts
import mongoose from 'mongoose';
import { AppError } from '../interfaces/index';
import logger from './logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || '';

    if (!mongoURI) {
      throw new Error('⚠️ MONGO_URI no está definida en el archivo .env');
    }

    // Conectar a MongoDB (sin opciones obsoletas)
    await mongoose.connect(mongoURI);

    logger.info('✔️ MongoDB conectado exitosamente');

    // Manejo de eventos de conexión
    mongoose.connection.on('connected', () => {
      logger.info('🔌 Conexión establecida con MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ Error en la conexión a MongoDB:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('🔌 Conexión a MongoDB terminada');
    });

  } catch (error) {
    const appError: AppError = {
      message: error instanceof Error ? error.message : 'Error desconocido',
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    };
    logger.error('❌ Error al conectar a MongoDB:', appError.message);
    process.exit(1);
  }
};

export default connectDB;
