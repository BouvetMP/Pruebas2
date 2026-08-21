// ¿Qué? Controlador HTTP de alertas.
// ¿Para qué? Exponer el listado de alertas al frontend.
// ¿Impacto? Permite revisar y filtrar alertas por banco.

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { alertsService } from './alerts.service.js';
import { updateAlertStatusSchema } from './alerts.schemas.js';

export const alertsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
      res.json(await alertsService.list(banco));
    } catch (error) { next(error); }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const idAlerta = Number(req.params.id);
      const validatedData = updateAlertStatusSchema.parse(req.body);
      res.json(await alertsService.updateStatus(idAlerta, req.user!.id_usuario, validatedData));
    } catch (error) { next(error); }
  },
};