import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import logger from '../config/logger';
import morganMiddleware from '../config/morgan';
import { authMiddleware } from '../middlewares/auth.middleware';
import { registerRoutes } from '../routes';
import authRoutes from '../routes/auth.routes';

const app: Application = express();

// Middlewares de seguridad y optimización
app.use(helmet());
app.use(compression());
app.use(morganMiddleware);
app.use(cookieParser());

// Configuración CORS
/* const corsOptions = {
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
*/
const corsOptions = {
  origin: '*', // Permitir cualquier origen
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: false,
};
app.use(cors(corsOptions));


// Configuraciones Express
app.use(express.json({ limit: '10mb' }));
app.disable('x-powered-by');
app.set('json spaces', 2);

app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cache-Control', 'no-store');
    logger.info(`Served file: ${req.url}`);
    next();
  },
  express.static(path.join(__dirname, '../../uploads'))
);

app.use('/api/auth', authRoutes);

app.use(authMiddleware);

registerRoutes(app);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);

  res.status(500).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'Ha ocurrido un error en el servidor'
        : err.message,
  });

  next();
});

export default app;
