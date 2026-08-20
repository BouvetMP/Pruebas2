// ¿Qué? Definición de tipos e interfaces globales del sistema.
// ¿Para qué? Compartir los contratos de datos (UserPayload y AuthenticatedRequest) en todo el backend.
// ¿Impacto? Proporciona tipado estricto en controladores y middlewares sin depender de parches globales.

import { Request } from 'express';

export interface UserPayload {
  id_usuario: number;
  email: string;
  rol: string;
  nombre: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}