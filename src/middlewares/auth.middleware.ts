/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { DecodedToken } from '../interfaces/decodedToken.interface';
import { isBlacklisted } from '../utils/tokenBlacklist';

export const authMiddleware = (req: Request | any, res: Response | null, next: NextFunction | Function): void => {
  try {
    // Obtener el token de cookies, headers (HTTP) o handshake headers (WebSocket)
    const token =
      req.cookies?.['access-token'] ||
      req.header?.('Authorization')?.replace('Bearer ', '') ||
      req.handshake?.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      const errorMessage = 'No token provided';
      logger.warn(errorMessage);

      if (res && typeof res.status === 'function') {
        res.status(401).json({ message: errorMessage });
      } else if (req.emit) {
        req.emit('authError', { message: errorMessage });
      }
      return;
    }

    if (isBlacklisted(token)) {
      const errorMessage = 'Token is blacklisted';
      logger.warn(errorMessage);

      if (res && typeof res.status === 'function') {
        res.status(401).json({ message: errorMessage });
      } else if (req.emit) {
        req.emit('authError', { message: errorMessage });
      }
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const errorMessage = 'JWT secret is not defined';
      logger.error(errorMessage);

      if (res && typeof res.status === 'function') {
        res.status(500).json({ message: errorMessage });
      } else if (req.emit) {
        req.emit('authError', { message: errorMessage });
      }
      return;
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    req.user = decoded; // Adjuntar el usuario decodificado al objeto Request
    logger.info(`Token verified for user ID: ${decoded.id}`);

    if (next) next();
  } catch (error: any) {
    const errorMessage = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    logger.error(errorMessage, error);

    if (res && typeof res.status === 'function') {
      res.status(401).json({ message: errorMessage });
    } else if (req.emit) {
      req.emit('authError', { message: errorMessage });
    }
  }
};
