"use strict";
// ¿Qué? Controlador HTTP de clientes.
// ¿Para qué? Exponer listados de clientes al frontend.
// ¿Impacto? Página de clientes / usuarios del negocio con datos reales.
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersController = void 0;
const customers_service_1 = require("./customers.service");
exports.customersController = {
    async list(req, res, next) {
        try {
            const banco = typeof req.query.banco === 'string' ? req.query.banco : null;
            const data = await customers_service_1.customersService.list(banco);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=customers.controller.js.map