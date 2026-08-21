// ¿Qué? Servicio de consulta de alertas de fraude.
// ¿Para qué? Listar alertas con contexto de cliente, banco y dispositivo.
// ¿Impacto? Alimenta la bandeja de alertas del analista.

import { prisma } from '../../db/prisma.ts';

export const alertsService = {
  async list(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_alertas(${bancoCodigo ?? null})`;
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