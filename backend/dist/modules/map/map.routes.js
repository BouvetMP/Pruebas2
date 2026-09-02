"use strict";
// ¿Qué? Rutas del módulo de mapa.
// ¿Para qué? Exponer estadísticas y ubicaciones.
// ¿Impacto? Cierra los endpoints de mapa con autenticación y datos reales.
Object.defineProperty(exports, "__esModule", { value: true });
// ¿Qué? Rutas del módulo del mapa geográfico con alias en español.
// ¿Para qué? Servir estadísticas y puntos del mapa a la vista interactiva.
// ¿Impacto? Resuelve el error 404 de /api/mapa/ubicaciones.
const express_1 = require("express");
const map_controller_js_1 = require("./map.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.requireAuth);
router.get('/stats', map_controller_js_1.mapController.getStats);
// Soporta sub-rutas en inglés y español
router.get('/locations', map_controller_js_1.mapController.getLocations);
router.get('/ubicaciones', map_controller_js_1.mapController.getLocations);
exports.default = router;
//# sourceMappingURL=map.routes.js.map