"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    id_cliente: zod_1.z.number().int().positive(),
    id_dispositivo: zod_1.z.number().int().positive(),
    id_ubicacion: zod_1.z.number().int().positive(),
    id_banco: zod_1.z.number().int().positive().default(1),
    tipo_transaccion: zod_1.z.string().min(2),
    monto: zod_1.z.number().positive(),
    cuenta_origen: zod_1.z.string().min(5),
    cuenta_destino: zod_1.z.string().min(5),
    canal: zod_1.z.enum(['mobile', 'web', 'pos', 'atm', 'branch']).default('web'),
    moneda: zod_1.z.string().length(3).default('COP'),
});
//# sourceMappingURL=transactions.schemas.js.map