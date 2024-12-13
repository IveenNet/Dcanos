import express from 'express';
import {
  createAppointment,
  deleteAppointment,
  editAppointment,
  getAppointments
} from '../controllers/appointment.controller';

const router = express.Router();

// Rutas de citas
router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', editAppointment);
router.delete('/:id', deleteAppointment);

export default router;
