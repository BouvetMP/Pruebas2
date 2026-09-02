"use strict";
// ¿Qué? Servicio del catálogo de bancos.
// ¿Para qué? Listar bancos activos para filtros del frontend.
// ¿Impacto? Permite filtrar todo el sistema por entidad financiera.
Object.defineProperty(exports, "__esModule", { value: true });
exports.banksService = void 0;
const prisma_1 = require("../../db/prisma");
exports.banksService = {
    async list() {
        return prisma_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_bancos()
    `;
    },
};
//# sourceMappingURL=banks.service.js.map