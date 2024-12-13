// utils/token.ts
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { DecodedToken } from '../interfaces/decodedToken.interface';
import { isBlacklisted } from './tokenBlacklist';

export const verifyToken = async (token: string): Promise<DecodedToken> => {
  if (isBlacklisted(token)) {
    throw new Error('Token is blacklisted');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    logger.error('Invalid token', error);
    throw new Error('Invalid token');
  }
};
