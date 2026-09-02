"use strict";
// ¿Qué? Servicio de dispositivos de clientes.
// ¿Para qué? Listar dispositivos usados en transacciones.
// ¿Impacto? Apoya análisis de riesgo por dispositivo desconocido.
Object.defineProperty(exports, "__esModule", { value: true });
exports.devicesService = void 0;
const prisma_1 = require("../../db/prisma");
exports.devicesService = {
    async list(bancoCodigo) {
        return prisma_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_dispositivos(${bancoCodigo ?? null})
    `;
    },
};
//# sourceMappingURL=devices.service.js.map