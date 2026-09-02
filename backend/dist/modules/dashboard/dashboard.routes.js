"use strict";
// ¿Qué? Rutas del módulo dashboard.
// ¿Para qué? Mapear endpoints de estadísticas y alertas recientes.
// ¿Impacto? Expone métricas solo a usuarios autenticados.
Object.defineProperty(exports, "__esModule", { value: true });
// ¿Qué? Rutas del módulo dashboard con soporte para alias en español e inglés.
// ¿Para qué? Mapear estadísticas y alertas recientes sin romper peticiones del frontend.
// ¿Impacto? Evita errores 404 en la carga inicial del panel principal.
const express_1 = require("express");
const dashboard_controller_js_1 = require("./dashboard.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.requireAuth);
router.get('/stats', dashboard_controller_js_1.dashboardController.getStats);
// Soporta sub-rutas en inglés y español
router.get('/recent-alerts', dashboard_controller_js_1.dashboardController.getRecentAlerts);
router.get('/alertas-recientes', dashboard_controller_js_1.dashboardController.getRecentAlerts);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map