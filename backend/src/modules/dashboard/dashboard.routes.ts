// ¿Qué? Rutas del módulo dashboard.
// ¿Para qué? Mapear endpoints de estadísticas y alertas recientes.
// ¿Impacto? Expone métricas solo a usuarios autenticados.

import { Router } from 'express';
import { dashboardController } from './dashboard.controller.ts';
import { requireAuth } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/stats', dashboardController.getStats);
router.get('/recent-alerts', dashboardController.getRecentAlerts);

export default router;