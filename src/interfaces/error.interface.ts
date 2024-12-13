export interface AppError {
  message: string; // Mensaje de error
  name?: string; // Nombre del error (e.g., ValidationError, MongoError)
  statusCode?: number; // Código de estado HTTP (si aplica)
  stack?: string; // Stack trace para depuración
  details?: unknown; // Detalles adicionales del error (puedes personalizar esto)
}
