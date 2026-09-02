"use strict";
// ¿Qué? Controlador HTTP de analítica.
// ¿Para qué? Devolver métricas y agregaciones al frontend.
// ¿Impacto? Conecta la vista de Analítica con las funciones SQL de agregación.
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
exports.analyticsController = {
    async getMetrics(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await analytics_service_1.analyticsService.getMetrics(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
    async getAggregations(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await analytics_service_1.analyticsService.getAggregations(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=analytics.controller.js.map