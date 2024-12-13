/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import logger from '../config/logger';
import User from '../models/mongodb/user.model';
import { updateUserSchema } from '../schemas/user.schema';

const transformUserResponse = (user: any, req: Request) => {
  const userObj = user.toObject();
  return {
    ...userObj,
    foto_url: userObj.foto_url
      ? `${req.protocol}://${req.get('host')}/uploads/users/${userObj.foto_url}`
      : null
  };
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    const transformedUsers = users.map(user => transformUserResponse(user, req));
    logger.info('Fetched all users');
    res.status(200).json(transformedUsers);
  } catch (error) {
    logger.error('Error fetching users', error);
    res.status(500).json({ message: 'Error obteniendo los usuarios', error });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found with ID: ${userId}`);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    logger.info(`Fetched user with ID: ${userId}`);
    res.status(200).json(transformUserResponse(user, req));
  } catch (error) {
    logger.error(`Error fetching user with ID: ${req.params.id}`, error);
    res.status(500).json({ message: 'Error obteniendo el usuario', error });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const validationResult = updateUserSchema.safeParse(req.body);

  if (!validationResult.success) {
    logger.warn('Invalid user data for update', validationResult.error.errors);
    res.status(422).json({ message: 'Datos inválidos', errors: validationResult.error.errors });
    return;
  }

  try {
    const userId = req.params.id;
    const updateData = req.body; // Solo se envían los campos que se quieren actualizar

    console.log(req.body)
    console.log(userId)
    // Realiza la actualización parcial con `$set`
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData }, // Actualiza solo los campos enviados
      { new: true, runValidators: true } // Retorna el documento actualizado y valida los datos
    )

    if (!updatedUser) {
      logger.warn(`User not found with ID: ${userId}`);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    logger.info(`Updated user with ID: ${userId}`);
    res.status(200).json(transformUserResponse(updatedUser, req));
  } catch (error) {
    logger.error(`Error updating user with ID: ${req.params.id}`, error);
    res.status(500).json({ message: 'Error actualizando el usuario', error });
  }
};

import Appointment from '../models/mongodb/appointment.model'; // Importa el modelo de citas

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Eliminar el usuario
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      logger.warn(`Usuario no encontrado con ID: ${req.params.id}`);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Determinar el campo de citas basado en el rol
    const roleKey = user.rol === 'peluquero' ? 'peluquero_id' : 'cliente_id';

    // Eliminar citas pendientes asociadas al usuario
    const deletedAppointments = await Appointment.deleteMany({ [roleKey]: user._id, });

    logger.info(
      `Usuario eliminado con ID: ${req.params.id}. Citas pendientes eliminadas: ${deletedAppointments.deletedCount}`
    );

    res.status(200).json({
      message: 'Usuario y sus citas pendientes eliminados correctamente',
    });
  } catch (error) {
    logger.error(`Error eliminando usuario con ID: ${req.params.id}`, error);
    res.status(500).json({ message: 'Error eliminando el usuario', error });
  }
};

