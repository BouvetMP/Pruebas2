// ¿Qué? Rutas del módulo de mapa.
// ¿Para qué? Exponer estadísticas y ubicaciones.
// ¿Impacto? Cierra los endpoints de mapa con autenticación y datos reales.

import { Router } from 'express';
import { mapController } from './map.controller.ts';
import { requireAuth } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/stats', mapController.getStats);
router.get('/locations', mapController.getLocations);

export default router;