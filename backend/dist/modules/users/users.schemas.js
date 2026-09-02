"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleSchema = exports.updateUserStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateUserStatusSchema = zod_1.z.object({
    estado: zod_1.z.boolean(),
});
exports.updateUserRoleSchema = zod_1.z.object({
    rol: zod_1.z.enum(['ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR']),
});
//# sourceMappingURL=users.schemas.js.map