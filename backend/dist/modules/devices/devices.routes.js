"use strict";
// ¿Qué? Rutas del módulo de dispositivos.
// ¿Para qué? Exponer GET /api/devices.
// ¿Impacto? Cierra el stub de dispositivos.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const devices_controller_1 = require("./devices.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', devices_controller_1.devicesController.list);
exports.default = router;
//# sourceMappingURL=devices.routes.js.map