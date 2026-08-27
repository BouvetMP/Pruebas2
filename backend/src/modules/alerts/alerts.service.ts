// ¿Qué? Servicio de consulta y actualización de alertas de fraude.
// ¿Para qué? Listar alertas con contexto de cliente/banco/dispositivo y
//            registrar cambios de estado + validaciones del analista.
// ¿Impacto? Alimenta la bandeja de alertas; listado con total real (Día 4).

import { prisma } from '../../db/prisma.js';

export const alertsService = {
  async list(bancoCodigo?: string | null, limit = 500, offset = 0) {
    const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 2000);
    const safeOffset = Math.max(Number(offset) || 0, 0);
    const codigo = bancoCodigo ?? null;

    const [items, totalRaw] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT * FROM trida.fn_alertas(
          ${codigo}::varchar,
          ${safeLimit}::int,
          ${safeOffset}::int
        )
      `,
      prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT trida.fn_alertas_count(${codigo}::varchar) AS count
      `,
    ]);

    const total = Number(totalRaw?.[0]?.count ?? 0);

    return {
      items,
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: safeOffset + items.length < total,
    };
  },

  async updateStatus(idAlerta: number, idUsuario: number, data: any) {
    const alertaActualizada = await prisma.alerta.update({
      where: { id_alerta: idAlerta },
      data: { estado_alerta: data.estado_alerta },
    });

    let validacion = null;
    if (data.clasificacion) {
      validacion = await prisma.validacion.create({
        data: {
          id_alerta: idAlerta,
          id_usuario: idUsuario,
          clasificacion: data.clasificacion,
          comentarios: data.comentarios ?? 'Sin comentarios adicionales',
          accion_tomada: `Cambiado a ${data.estado_alerta}`,
        },
      });
    }
    return { alerta: alertaActualizada, validacion };
  },
};