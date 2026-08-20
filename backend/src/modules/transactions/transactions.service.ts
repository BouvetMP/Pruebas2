// ¿Qué? Servicio de consulta de transacciones.
// ¿Para qué? Listar transacciones con filtro opcional por banco.
// ¿Impacto? Fuente de datos de la tabla de transacciones del frontend.

import { prisma } from '../../db/prisma.ts';

export const transactionsService = {
  async list(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_transacciones(${bancoCodigo ?? null})
    `;
  },
};