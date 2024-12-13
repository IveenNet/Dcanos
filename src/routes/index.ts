import { Application } from 'express';
import appointmentRoutes from './appointments.routes';
import specialtyRoutes from './specialties.routes';
import stylistRoutes from './stylists.routes';
import userRoutes from './users.routes';

export const registerRoutes = (app: Application): void => {
  app.use('/api/users', userRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/specialties', specialtyRoutes);
  app.use('/api/stylist', stylistRoutes);
};
