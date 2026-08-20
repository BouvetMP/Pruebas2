// ¿Qué? Rutas del módulo de bancos.
// ¿Para qué? Exponer GET /api/banks.
// ¿Impacto? Catálogo real de entidades financieras.

import { Router } from 'express';
import { banksController } from './banks.controller.ts';
import { requireAuth } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/', banksController.list);

export default router;