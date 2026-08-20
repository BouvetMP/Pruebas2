// ¿Qué? Servicio de consulta de alertas de fraude.
// ¿Para qué? Listar alertas con contexto de cliente, banco y dispositivo.
// ¿Impacto? Alimenta la bandeja de alertas del analista.

import { prisma } from '../../db/prisma.ts';

export const alertsService = {
  async list(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_alertas(${bancoCodigo ?? null})
    `;
  },
};