"use strict";
// ¿Qué? Rutas del módulo de alertas.
// ¿Para qué? Exponer GET /api/alerts.
// ¿Impacto? Cierra el stub de alertas con datos reales y autenticación.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerts_controller_js_1 = require("./alerts.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.requireAuth);
router.get('/', alerts_controller_js_1.alertsController.list);
router.patch('/:id/status', alerts_controller_js_1.alertsController.updateStatus);
exports.default = router;
//# sourceMappingURL=alerts.routes.js.map