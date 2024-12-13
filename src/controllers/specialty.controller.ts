import { Request, Response } from 'express';
import logger from '../config/logger';
import Specialty from '../models/mongodb/specialty.model';
import User from '../models/mongodb/user.model';

export const createSpecialty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, duracion_estimada, precio_base } = req.body;

    if (!nombre || !descripcion || !duracion_estimada || !precio_base) {
      logger.warn('Invalid specialty data provided');
      res.status(400).json({ message: 'Datos inválidos para crear una especialidad' });
      return;
    }

    const specialty = new Specialty({ nombre, descripcion, duracion_estimada, precio_base });
    await specialty.save();

    logger.info(`Specialty created with ID: ${specialty._id}`);
    res.status(201).json(specialty);
  } catch (error) {
    logger.error('Error creating specialty', error);
    res.status(500).json({ message: 'Error creando la especialidad', error });
  }
};

export const getSpecialties = async (req: Request, res: Response): Promise<void> => {
  try {
    const specialties = await Specialty.find();

    if (!specialties.length) {
      logger.info('No specialties found');
      res.status(200).json([]);
      return;
    }

    logger.info('Fetched all specialties');
    res.status(200).json(specialties);
  } catch (error) {
    logger.error('Error fetching specialties', error);
    res.status(500).json({ message: 'Error obteniendo las especialidades', error });
  }
};

export const getSpecialtiesById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      logger.warn('No ID provided for fetching specialties');
      res.status(400).json({ message: 'ID no proporcionado' });
      return;
    }

    const hairdresser = await User.findById(id).select('detalles.especialidades');

    if (!hairdresser) {
      logger.warn(`Hairdresser not found with ID: ${id}`);
      res.status(404).json({ message: 'Peluquero no encontrado' });
      return;
    }

    const specialtyIds = hairdresser.detalles?.especialidades || [];

    if (!specialtyIds.length) {
      logger.info(`No specialties found for hairdresser with ID: ${id}`);
      res.status(200).json([]);
      return;
    }

    const specialties = await Specialty.find({ _id: { $in: specialtyIds } });

    if (!specialties.length) {
      logger.info(`No specialties found in database for hairdresser with ID: ${id}`);
      res.status(404).json({ message: 'Especialidades no encontradas' });
      return;
    }

    logger.info(`Fetched specialties for hairdresser with ID: ${id}`);
    res.status(200).json(specialties);
  } catch (error) {
    logger.error('Error fetching specialties for hairdresser', error);
    res.status(500).json({ message: 'Error obteniendo las especialidades del peluquero', error });
  }
};
