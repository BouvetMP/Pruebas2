// ¿Qué? Controlador HTTP de transacciones.
// ¿Para qué? Devolver el listado de transacciones al cliente.
// ¿Impacto? Conecta la página Transacciones con PostgreSQL.

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.ts';
import { transactionsService } from './transactions.service.ts';

export const transactionsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
      const data = await transactionsService.list(banco);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};