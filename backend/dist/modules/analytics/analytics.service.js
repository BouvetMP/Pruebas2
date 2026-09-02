"use strict";
// ¿Qué? Servicio de métricas y agregaciones analíticas.
// ¿Para qué? Calcular KPIs y desgloses por tipo, ciudad, canal y banco.
// ¿Impacto? Soporta la página de Analítica del dashboard.
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const prisma_1 = require("../../db/prisma");
exports.analyticsService = {
    async getMetrics(bancoCodigo) {
        const rows = await prisma_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_analytics_metricas(${bancoCodigo ?? null})
    `;
        return rows[0] ?? null;
    },
    async getAggregations(bancoCodigo) {
        const banco = bancoCodigo ?? null;
        const [porTipo, porCiudad, porCanal, porBanco] = await Promise.all([
            prisma_1.prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_tipo(${banco})`,
            prisma_1.prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_ciudad(${banco})`,
            prisma_1.prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_canal(${banco})`,
            prisma_1.prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_banco_fraude(${banco})`,
        ]);
        return {
            porTipo,
            porCiudad,
            porCanal,
            porBanco,
        };
    },
};
//# sourceMappingURL=analytics.service.js.map