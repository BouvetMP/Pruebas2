// ¿Qué? Extensión global de los tipos de Express.
// ¿Para qué? Inyectar la propiedad opcional 'user' directamente en el objeto Request nativo de Express.
// ¿Impacto? Permite acceder a req.user en cualquier controlador o middleware sin castings ni errores de TS.

import { UserPayload } from './index.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}