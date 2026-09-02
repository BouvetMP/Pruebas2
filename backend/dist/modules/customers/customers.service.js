"use strict";
// ¿Qué? Servicio de clientes bancarios.
// ¿Para qué? Listar clientes (con o sin detalle de banco).
// ¿Impacto? Reemplaza la ruta mal nombrada /tareas por /customers.
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersService = void 0;
const prisma_1 = require("../../db/prisma");
exports.customersService = {
    async list(bancoCodigo) {
        // fn_usuarios ya trae cliente + banco; si no hay filtro usa todos
        return prisma_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_usuarios(${bancoCodigo ?? null})
    `;
    },
    async listRaw() {
        return prisma_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_clientes()
    `;
    },
};
//# sourceMappingURL=customers.service.js.map