import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import connectDB from './config/database';
import logger from './config/logger';
import app from './server/app';
import { WebSocketServer } from './server/websocket';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`) });

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos
connectDB();

// Crear servidor HTTP y WebSocket
const server = http.createServer(app);
const websocket = new WebSocketServer(server);

// Guardar el WebSocket en la aplicación
app.set('websocket', websocket);

// Iniciar el servidor
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
  });
}
