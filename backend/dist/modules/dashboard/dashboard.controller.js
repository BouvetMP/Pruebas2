"use strict";
// ¿Qué? Controlador HTTP del dashboard.
// ¿Para qué? Exponer estadísticas y alertas recientes al frontend.
// ¿Impacto? Permite al dashboard consumir métricas sin lógica de negocio en la capa HTTP.
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_js_1 = require("./dashboard.service.js");
exports.dashboardController = {
    async getStats(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await dashboard_service_js_1.dashboardService.getStats(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
    async getRecentAlerts(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await dashboard_service_js_1.dashboardService.getRecentAlerts(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=dashboard.controller.js.map