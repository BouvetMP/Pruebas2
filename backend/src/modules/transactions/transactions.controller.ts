// ¿Qué? Controlador HTTP de transacciones.
// ¿Para qué? Devolver el listado de transacciones al cliente.
// ¿Impacto? Conecta la página Transacciones con PostgreSQL.

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { transactionsService } from './transactions.service.js';
import { createTransactionSchema } from './transactions.schemas.js';

export const transactionsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
      res.json(await transactionsService.list(banco));
    } catch (error) { next(error); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      res.status(201).json(await transactionsService.create(validatedData));
    } catch (error) { next(error); }
  },
};