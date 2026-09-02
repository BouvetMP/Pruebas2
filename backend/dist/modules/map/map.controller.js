"use strict";
// ¿Qué? Controlador HTTP del mapa.
// ¿Para qué? Exponer stats y ubicaciones geolocalizadas.
// ¿Impacto? Conecta la página Mapa con PostgreSQL.
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapController = void 0;
const map_service_1 = require("./map.service");
exports.mapController = {
    async getStats(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await map_service_1.mapService.getStats(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
    async getLocations(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await map_service_1.mapService.getLocations(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=map.controller.js.map