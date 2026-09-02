"use strict";
// ¿Qué? Definición de rutas del módulo de autenticación.
// ¿Para qué? Mapear endpoints HTTP a controladores con sus middlewares de seguridad.
// ¿Impacto? Expone de forma controlada login, registro, recuperación y gestión de usuarios.
Object.defineProperty(exports, "__esModule", { value: true });
// ¿Qué? Rutas del módulo de autenticación con soporte para alias de usuarios del sistema.
// ¿Para qué? Mapear login, registro y la lista de usuarios internos en español e inglés.
// ¿Impacto? Resuelve el error al cargar la tabla de Gestión de Usuarios en la interfaz.
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../../middlewares/rateLimit.middleware.js");
const router = (0, express_1.Router)();
// Públicas
router.post('/login', rateLimit_middleware_js_1.loginRateLimiter, auth_controller_js_1.authController.login);
router.post('/forgot-password', auth_controller_js_1.authController.forgotPassword);
router.get('/verify-reset-token', auth_controller_js_1.authController.verifyResetToken);
router.post('/reset-password', auth_controller_js_1.authController.resetPassword);
// Protegidas
router.get('/me', auth_middleware_js_1.requireAuth, auth_controller_js_1.authController.me);
router.post('/register', auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRoles)(['ADMINISTRADOR']), auth_controller_js_1.authController.register);
// Lista de usuarios del sistema (Soporta inglés y español para el frontend)
router.get('/users', auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRoles)(['ADMINISTRADOR']), auth_controller_js_1.authController.listUsers);
router.get('/usuarios-sistema', auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRoles)(['ADMINISTRADOR']), auth_controller_js_1.authController.listUsers);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map