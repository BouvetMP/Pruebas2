// ¿Qué? Rutas del módulo de clientes.
// ¿Para qué? Exponer GET /api/customers.
// ¿Impacto? Nomenclatura en inglés según RL-001.

import { Router } from 'express';
import { customersController } from './customers.controller.ts';
import { requireAuth } from '../../middlewares/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/', customersController.list);

export default router;