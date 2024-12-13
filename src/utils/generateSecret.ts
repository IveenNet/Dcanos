import crypto from 'crypto';

export const generateSecret = (length: number = 64): string => {
  return crypto.randomBytes(length).toString('hex');
};

