// ¿Qué? Controlador HTTP de alertas.
// ¿Para qué? Exponer el listado de alertas al frontend.
// ¿Impacto? Permite revisar y filtrar alertas por banco.

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.ts';
import { alertsService } from './alerts.service.ts';

export const alertsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
      const data = await alertsService.list(banco);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};