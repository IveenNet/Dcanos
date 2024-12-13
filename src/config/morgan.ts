import morgan, { StreamOptions } from 'morgan';
import logger from './logger';

// Configura el stream de Morgan para usar Winston
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim())
};

// Configura Morgan para usar el nivel de log adecuado
const morganMiddleware = morgan('combined', { stream });

export default morganMiddleware;
