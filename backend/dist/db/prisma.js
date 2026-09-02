"use strict";
// ¿Qué? Instancia Singleton del cliente Prisma ORM.
// ¿Para qué? Centralizar la conexión a PostgreSQL y evitar abrir múltiples conexiones en modo desarrollo.
// ¿Impacto? Previene la caída de la base de datos por el agotamiento del pool de conexiones.
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const config_js_1 = require("../config.js");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: config_js_1.config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
};
exports.prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (config_js_1.config.NODE_ENV !== 'production')
    globalThis.prismaGlobal = exports.prisma;
//# sourceMappingURL=prisma.js.map