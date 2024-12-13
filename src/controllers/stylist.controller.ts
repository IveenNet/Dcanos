import { Request, Response } from 'express';
import logger from '../config/logger';
import User from '../models/mongodb/user.model';

export const getStylists = async (req: Request, res: Response): Promise<void> => {
  try {
    const stylists = await User.find(
      { rol: 'peluquero' },
      {
        _id: 1,
        nombre: 1,
        email: 1,
        telefono: 1,
        foto_url: 1,
        'detalles.activo': 1,
        'detalles.fecha_registro': 1,
        'detalles.especialidades': 1,
      }
    ).populate('detalles.especialidades')
      .lean();

    if (!stylists.length) {
      logger.info('No stylists found');
      res.status(200).json([]);
      return;
    }

    logger.info('Fetched all stylists');
    res.status(200).json(stylists);
  } catch (error) {
    logger.error('Error fetching stylists', error);
    res.status(500).json({ message: 'Error obteniendo los estilistas', error });
  }
};
