"use strict";
// ¿Qué? Rutas del catálogo de bancos.
// ¿Para qué? Permitir la consulta pública del listado de bancos para los filtros del sistema.
// ¿Impacto? Permite que el selector de bancos de la interfaz cargue siempre sin bloquearse por autenticación.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banks_controller_js_1 = require("./banks.controller.js");
const router = (0, express_1.Router)();
// El catálogo de bancos es de libre acceso para llenar los selectores
router.get('/', banks_controller_js_1.banksController.list);
exports.default = router;
//# sourceMappingURL=banks.routes.js.map