"use strict";
// ¿Qué? Controlador HTTP de alertas.
// ¿Para qué? Exponer el listado de alertas al frontend.
// ¿Impacto? Permite revisar y filtrar alertas por banco.
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsController = void 0;
const alerts_service_js_1 = require("./alerts.service.js");
const alerts_schemas_js_1 = require("./alerts.schemas.js");
exports.alertsController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            res.json(await alerts_service_js_1.alertsService.list(banco));
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const idAlerta = Number(req.params.id);
            const validatedData = alerts_schemas_js_1.updateAlertStatusSchema.parse(req.body);
            res.json(await alerts_service_js_1.alertsService.updateStatus(idAlerta, req.user.id_usuario, validatedData));
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=alerts.controller.js.map