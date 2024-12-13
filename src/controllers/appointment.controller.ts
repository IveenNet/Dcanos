import { Request, Response } from 'express';
import logger from '../config/logger';
import { transformAppointment } from '../helpers/transforms/appointmentTransformClient';
import Appointment from '../models/mongodb/appointment.model';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/appointment.schema';
import { WebSocketServer } from '../server/websocket';

enum WebSocketEvents {
  AppointmentCreate = 'emitAppointmentCreate',
  AppointmentUpdate = 'emitAppointmentUpdate',
  AppointmentDelete = 'emitAppointmentDelete',
}

const emitWebSocketEvent = (req: Request, event: keyof WebSocketServer, peluqueroId: string, data: unknown) => {
  const websocket = req.app.get('websocket') as WebSocketServer;
  websocket[event](peluqueroId, data);
};

export const getAppointments = async (req: Request, res: Response): Promise<void> => {

  try {

    if (!req.user) {
      logger.warn('Unauthorized access attempt');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id, role } = req.user;
    const roleKey = role === 'peluquero' ? 'peluquero_id' : 'cliente_id';

    const appointments = await Appointment.find({ [roleKey]: id })
      .populate('cliente_id')
      .populate('peluquero_id')
      .populate('servicios')
      .exec();

    const transformedAppointments = appointments.map((appointment) =>
      transformAppointment(
        appointment,
        req,
        role === 'peluquero' ? 'cliente_id' : 'peluquero_id'
      )
    );

    res.status(200).json(transformedAppointments);
  } catch (error) {
    logger.error('Error fetching appointments', error);
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  const validationResult = createAppointmentSchema.safeParse(req.body);

  if (!validationResult.success) {
    logger.warn('Invalid appointment data', validationResult.error.errors);
    res.status(422).json({ message: 'Datos inválidos', errors: validationResult.error.errors });
    return;
  }

  try {
    if (!req.user) {
      logger.warn('Unauthorized access attempt');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id, role } = req.user;
    const isHairdresser = role === 'peluquero';
    const appointmentData = {
      ...validationResult.data,
      [isHairdresser ? 'peluquero_id' : 'cliente_id']: id,
    };

    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save().then((doc) => doc.populate('cliente_id peluquero_id servicios'));
    logger.info(`Appointment created with ID: ${savedAppointment._id}`);

    if (savedAppointment) {

      emitWebSocketEvent(
        req,
        WebSocketEvents.AppointmentCreate,
        savedAppointment.peluquero_id.toString(),
        transformAppointment(savedAppointment, req, 'cliente_id')
      );

      res.status(201).json(
        transformAppointment(
          savedAppointment,
          req,
          isHairdresser ? 'cliente_id' : 'peluquero_id'
        )
      );
    } else {
      res.status(500).json({ message: 'Error populating appointment' });
    }
  } catch (error) {
    logger.error('Error creating appointment', error);
    res.status(500).json({ message: 'Error creating appointment', error });
  }
};

export const editAppointment = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body)
  console.log(req.params.id)
  const validationResult = updateAppointmentSchema.safeParse(req.body);

  if (!validationResult.success) {
    logger.warn('Invalid appointment data', validationResult.error.errors);
    res.status(422).json({ message: 'Datos inválidos', errors: validationResult.error.errors });
    return;
  }

  try {
    if (!req.user) {
      logger.warn('Unauthorized access attempt');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { role } = req.user;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      validationResult.data,
      { new: true }
    ).then((doc) => doc?.populate('cliente_id peluquero_id servicios'));

    if (!updatedAppointment) {
      logger.warn(`Appointment not found with ID: ${req.params.id}`);
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    logger.info(`Appointment updated with ID: ${updatedAppointment._id}`);

    emitWebSocketEvent(
      req,
      WebSocketEvents.AppointmentUpdate,
      updatedAppointment.peluquero_id.toString(),
      transformAppointment(updatedAppointment, req, 'cliente_id')
    );

    res.status(200).json(
      transformAppointment(
        updatedAppointment,
        req,
        role === 'peluquero' ? 'cliente_id' : 'peluquero_id'
      )
    );
  } catch (error) {
    logger.error('Error editing appointment', error);
    res.status(500).json({ message: 'Error editing appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      logger.warn('Unauthorized access attempt');
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) {
      logger.warn(`Appointment not found with ID: ${req.params.id}`);
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    logger.info(`Appointment deleted with ID: ${deletedAppointment._id}`);

    emitWebSocketEvent(
      req,
      WebSocketEvents.AppointmentDelete,
      deletedAppointment.peluquero_id.toString(),
      { appointment_id: req.params.id }
    );

    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting appointment', error);
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
};
