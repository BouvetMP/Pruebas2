"use strict";
// ¿Qué? Manejador global de errores.
// ¿Para qué? Capturar excepciones del sistema y de validación (Zod) antes de enviarlas al cliente.
// ¿Impacto? Cumple RS-007 impidiendo que se filtren detalles técnicos o stack traces.
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({ error: 'Error de validación', details: err.errors.map(e => e.message) });
        return;
    }
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    const status = err.statusCode || 500;
    res.status(status).json({ error: status === 500 ? 'Error interno del servidor.' : err.message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map