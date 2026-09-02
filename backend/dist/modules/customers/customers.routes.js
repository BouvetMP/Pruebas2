"use strict";
// ¿Qué? Rutas del módulo de clientes.
// ¿Para qué? Exponer GET /api/customers.
// ¿Impacto? Nomenclatura en inglés según RL-001.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("./customers.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', customers_controller_1.customersController.list);
exports.default = router;
//# sourceMappingURL=customers.routes.js.map