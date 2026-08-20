// ¿Qué? Definición de rutas del módulo de autenticación.
// ¿Para qué? Mapear endpoints HTTP a controladores con sus middlewares de seguridad.
// ¿Impacto? Expone de forma controlada login, registro, recuperación y gestión de usuarios.

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.middleware.js';
import { loginRateLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Públicas
router.post('/login', loginRateLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// Protegidas
router.get('/me', requireAuth, authController.me);
router.post('/register', requireAuth, requireRoles(['ADMINISTRADOR']), authController.register);
router.get('/users', requireAuth, requireRoles(['ADMINISTRADOR']), authController.listUsers);

export default router;