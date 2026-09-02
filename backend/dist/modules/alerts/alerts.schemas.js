"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlertStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateAlertStatusSchema = zod_1.z.object({
    estado_alerta: zod_1.z.enum(['ACTIVA', 'EN_REVISION', 'RESUELTA', 'DESCARTADA']),
    clasificacion: zod_1.z.enum(['FRAUDE_CONFIRMADO', 'FALSO_POSITIVO', 'PENDIENTE_INVESTIGACION', 'REQUIERE_CONTACTO_CLIENTE']).optional(),
    comentarios: zod_1.z.string().optional(),
});
//# sourceMappingURL=alerts.schemas.js.map