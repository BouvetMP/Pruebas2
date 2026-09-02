"use strict";
// ¿Qué? Controlador HTTP de dispositivos.
// ¿Para qué? Devolver el inventario de dispositivos.
// ¿Impacto? Conecta la vista de dispositivos con la BD.
Object.defineProperty(exports, "__esModule", { value: true });
exports.devicesController = void 0;
const devices_service_1 = require("./devices.service");
exports.devicesController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await devices_service_1.devicesService.list(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=devices.controller.js.map