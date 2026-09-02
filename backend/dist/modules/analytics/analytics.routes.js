"use strict";
// ¿Qué? Rutas del módulo de analítica.
// ¿Para qué? Exponer métricas y agregaciones.
// ¿Impacto? Sustituye stubs de analytics por consultas reales.
Object.defineProperty(exports, "__esModule", { value: true });
// ¿Qué? Rutas del módulo analítico con alias en español.
// ¿Para qué? Exponer métricas globales y agregaciones por canal/ciudad/banco.
// ¿Impacto? Resuelve los errores 404 de /api/analytics/metricas y /agregaciones.
const express_1 = require("express");
const analytics_controller_js_1 = require("./analytics.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.requireAuth);
// Soporta sub-rutas en inglés y español
router.get('/metrics', analytics_controller_js_1.analyticsController.getMetrics);
router.get('/metricas', analytics_controller_js_1.analyticsController.getMetrics);
router.get('/aggregations', analytics_controller_js_1.analyticsController.getAggregations);
router.get('/agregaciones', analytics_controller_js_1.analyticsController.getAggregations);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map