import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { AppError } from '../interfaces/error.interface';
import User from '../models/mongodb/user.model';
import { loginSchema } from '../schemas/auth.schema';
import { createUserSchema } from '../schemas/user.schema';
import { addToBlacklist } from '../utils/tokenBlacklist';

const generateToken = (userId: string, role: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const clearUploadedFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    logger.error(`Error deleting file: ${filePath}`, err);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const validationResult = createUserSchema.safeParse(req.body);

  if (!validationResult.success) {
    if (req.file) await clearUploadedFile(req.file.path);
    logger.warn('Invalid user data', validationResult.error.errors);
    res.status(422).json({ message: 'Datos inválidos', errors: validationResult.error.errors });
    return;
  }

  const { nombre, email, password, telefono } = validationResult.data;
  const photo = req.file;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (photo) await clearUploadedFile(photo.path);
      logger.warn(`Email already in use: ${email}`);
      res.status(400).json({ message: 'El correo electrónico ya está en uso' });
      return;
    }

    const newUser = new User({
      nombre,
      email,
      password,
      telefono,
      rol: 'cliente',
      foto_url: photo ? photo.filename : undefined,
    });

    await newUser.save();
    logger.info(`User created with ID: ${newUser._id}`);
    res.status(201).json({ message: 'Registro exitoso', user: { email: newUser.email } });
  } catch (error) {
    if (photo) await clearUploadedFile(photo.path);
    logger.error('Error creating user', error);
    res.status(500).json({ message: 'Error creando el usuario', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const validationResult = loginSchema.safeParse(req.body);

  if (!validationResult.success) {
    logger.warn('Invalid login data', validationResult.error.errors);
    res.status(422).json({ message: 'Datos inválidos', errors: validationResult.error.errors });
    return;
  }

  const { email, password } = validationResult.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`User not found with email: ${email}`);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid credentials for email: ${email}`);
      res.status(400).json({ message: 'Credenciales inválidas' });
      return;
    }

    const token = generateToken(user._id, user.rol);

    res.cookie('access-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hora
    });

    logger.info(`User logged in with email: ${email}`);
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        foto_url: user.foto_url,
        rol: user.rol,
        detalles: user.detalles,
        activo: user.activo,
        fecha_registro: user.fecha_registro,
      },
    });
  } catch (error) {
    logger.error('Error during login', error);
    res.status(500).json({ message: 'Error del servidor', error });
  }
};

export const logout = (req: Request, res: Response): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    logger.warn('No token provided for logout');
    res.status(401).json({ message: 'No se proporcionó un token' });
    return;
  }

  addToBlacklist(token);
  res.clearCookie('access-token');
  logger.info('User logged out');
  res.status(200).json({ message: 'Sesión cerrada exitosamente' });
};

export const checkAuth = (req: Request, res: Response): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.status(200).json({ message: 'Autenticado', user: decoded });
  } catch (error) {
    const appError: AppError = {
      message: error instanceof Error ? error.message : 'Error desconocido',
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    };
    logger.error('Token inválido: ', appError.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};
