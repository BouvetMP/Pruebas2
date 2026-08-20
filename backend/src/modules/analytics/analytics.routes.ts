// ¿Qué? Rutas del módulo de analítica.
// ¿Para qué? Exponer métricas y agregaciones.
// ¿Impacto? Sustituye stubs de analytics por consultas reales.

import { Router } from 'express';
import { analyticsController } from './analytics.controller.ts';
import { requireAuth } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/metrics', analyticsController.getMetrics);
router.get('/aggregations', analyticsController.getAggregations);

export default router;