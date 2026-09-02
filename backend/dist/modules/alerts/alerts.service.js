"use strict";
// ¿Qué? Servicio de consulta de alertas de fraude.
// ¿Para qué? Listar alertas con contexto de cliente, banco y dispositivo.
// ¿Impacto? Alimenta la bandeja de alertas del analista.
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsService = void 0;
const prisma_1 = require("../../db/prisma");
exports.alertsService = {
    async list(bancoCodigo) {
        return prisma_1.prisma.$queryRaw `SELECT * FROM trida.fn_alertas(${bancoCodigo ?? null})`;
    },
    async updateStatus(idAlerta, idUsuario, data) {
        const alertaActualizada = await prisma_1.prisma.alerta.update({
            where: { id_alerta: idAlerta },
            data: { estado_alerta: data.estado_alerta },
        });
        let validacion = null;
        if (data.clasificacion) {
            validacion = await prisma_1.prisma.validacion.create({
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
//# sourceMappingURL=alerts.service.js.map