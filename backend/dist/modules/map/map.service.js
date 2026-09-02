"use strict";
// ¿Qué? Servicio de datos geográficos para el mapa.
// ¿Para qué? Obtener estadísticas y ubicaciones de transacciones.
// ¿Impacto? Alimenta el mapa de calor / marcadores del frontend.
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapService = void 0;
const prisma_1 = require("../../db/prisma");
exports.mapService = {
    async getStats(bancoCodigo) {
        const rows = await prisma_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_mapa_stats(${bancoCodigo ?? null})
    `;
        return rows[0] ?? null;
    },
    async getLocations(bancoCodigo) {
        return prisma_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_mapa_ubicaciones(${bancoCodigo ?? null})
    `;
    },
};
//# sourceMappingURL=map.service.js.map