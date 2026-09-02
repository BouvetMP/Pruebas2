"use strict";
// ¿Qué? Controlador HTTP de transacciones.
// ¿Para qué? Devolver el listado de transacciones al cliente.
// ¿Impacto? Conecta la página Transacciones con PostgreSQL.
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsController = void 0;
const transactions_service_js_1 = require("./transactions.service.js");
const transactions_schemas_js_1 = require("./transactions.schemas.js");
exports.transactionsController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            res.json(await transactions_service_js_1.transactionsService.list(banco));
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const validatedData = transactions_schemas_js_1.createTransactionSchema.parse(req.body);
            res.status(201).json(await transactions_service_js_1.transactionsService.create(validatedData));
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=transactions.controller.js.map