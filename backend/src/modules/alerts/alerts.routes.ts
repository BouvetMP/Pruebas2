// ¿Qué? Rutas del módulo de alertas.
// ¿Para qué? Exponer GET /api/alerts.
// ¿Impacto? Cierra el stub de alertas con datos reales y autenticación.

import { Router } from 'express';
import { alertsController } from './alerts.controller.ts';
import { requireAuth } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/', alertsController.list);

export default router;