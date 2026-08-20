// ¿Qué? Servicio de métricas del dashboard.
// ¿Para qué? Obtener estadísticas globales y alertas recientes filtradas por banco.
// ¿Impacto? Alimenta la pantalla principal del analista con datos reales de PostgreSQL.

import { prisma } from '../../db/prisma.js';

export const dashboardService = {
  async getStats(bancoCodigo?: string | null) {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_dashboard_stats(${bancoCodigo ?? null})
    `;
    return rows[0] ?? null;
  },

  async getRecentAlerts(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_alertas_recientes(${bancoCodigo ?? null})
    `;
  },
};