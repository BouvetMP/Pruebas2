// ¿Qué? Rutas del módulo de transacciones.
// ¿Para qué? Exponer GET /api/transactions.
// ¿Impacto? Sustituye el endpoint stub por datos reales.

import { Router } from 'express';
import { transactionsController } from './transactions.controller.ts';
import { requireAuth } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/', transactionsController.list);

export default router;