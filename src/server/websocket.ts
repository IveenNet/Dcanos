/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import logger from '../config/logger';
import { authMiddleware } from '../middlewares/auth.middleware';
import { appointmentEventSchema } from '../schemas/websocket.schema';

export class WebSocketServer {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Adaptar el middleware HTTP para Socket.IO
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      const req: any = { cookies: { 'access-token': token }, header: () => `Bearer ${token}` };
      const res: any = {};
      authMiddleware(req, res, (err: any) => {
        if (err) return next(err);
        socket.data.user = req.user; // Adjuntar el usuario autenticado al socket
        next();
      });
    });

    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    this.io.on('connection', (socket) => {
      const userRole = socket.data.user?.role;
      const userId = socket.data.user?._id;

      logger.info(`Client connected: ${socket.id} - Role: ${userRole}`);

      if (userRole === 'peluquero') {
        socket.join(`peluquero:${userId}`);
      }

      socket.on('appointment-event', (data) => {
        const result = appointmentEventSchema.safeParse(data);
        if (!result.success) {
          logger.error(`Invalid data received: ${result.error}`);
          return;
        }

        const { peluquero_id, type } = result.data;

        if (type === 'update') {
          this.emitAppointmentUpdate(peluquero_id, result.data);
        } else if (type === 'create') {
          this.emitAppointmentCreate(peluquero_id, result.data);
        } else if (type === 'delete') {
          this.emitAppointmentDelete(peluquero_id, result.data);
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public emitAppointmentUpdate(peluqueroId: any, data: any): void {
    this.io.to(`peluquero:${peluqueroId._id}`).emit('appointment-updated', data);
  }

  public emitAppointmentCreate(peluqueroId: any, data: any): void {
    this.io.to(`peluquero:${peluqueroId._id}`).emit('appointment-created', data);
  }

  public emitAppointmentDelete(peluqueroId: any, data: any): void {
    this.io.to(`peluquero:${peluqueroId._id}`).emit('appointment-deleted', data);
  }
}
