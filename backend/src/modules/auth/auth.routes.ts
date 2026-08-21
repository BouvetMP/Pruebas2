// ¿Qué? Definición de rutas del módulo de autenticación.
// ¿Para qué? Mapear endpoints HTTP a controladores con sus middlewares de seguridad.
// ¿Impacto? Expone de forma controlada login, registro, recuperación y gestión de usuarios.

// ¿Qué? Rutas del módulo de autenticación con soporte para alias de usuarios del sistema.
// ¿Para qué? Mapear login, registro y la lista de usuarios internos en español e inglés.
// ¿Impacto? Resuelve el error al cargar la tabla de Gestión de Usuarios en la interfaz.

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

// Lista de usuarios del sistema (Soporta inglés y español para el frontend)
router.get('/users', requireAuth, requireRoles(['ADMINISTRADOR']), authController.listUsers);
router.get('/usuarios-sistema', requireAuth, requireRoles(['ADMINISTRADOR']), authController.listUsers);

export default router;