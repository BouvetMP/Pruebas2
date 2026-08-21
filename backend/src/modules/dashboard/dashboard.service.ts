// ¿Qué? Servicio del dashboard con parseo inteligente del filtro de banco.
// ¿Para qué? Convertir 'all' o cadenas vacías a NULL para que PostgreSQL devuelva los datos globales.
// ¿Impacto? Permite que el dashboard muestre datos tanto para un banco específico como para 'Todos los Bancos'.

import { prisma } from '../../db/prisma.js';

function parseBancoCode(banco?: string | null): string | null {
  if (!banco) return null;
  const clean = banco.trim().toLowerCase();
  if (clean === 'all' || clean === 'todos' || clean === 'sin_asignar_todos' || clean === '') {
    return null;
  }
  return banco;
}

export const dashboardService = {
  async getStats(bancoCodigo?: string | null) {
    const code = parseBancoCode(bancoCodigo);
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_dashboard_stats(${code})
    `;
    return rows[0] ?? null;
  },

  async getRecentAlerts(bancoCodigo?: string | null) {
    const code = parseBancoCode(bancoCodigo);
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_alertas_recientes(${code})
    `;
  },
};