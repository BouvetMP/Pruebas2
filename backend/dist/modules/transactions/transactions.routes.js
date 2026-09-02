"use strict";
// ¿Qué? Rutas del módulo de transacciones.
// ¿Para qué? Exponer GET /api/transactions.
// ¿Impacto? Sustituye el endpoint stub por datos reales.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactions_controller_js_1 = require("./transactions.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.requireAuth);
router.get('/', transactions_controller_js_1.transactionsController.list);
router.post('/', transactions_controller_js_1.transactionsController.create);
exports.default = router;
//# sourceMappingURL=transactions.routes.js.map