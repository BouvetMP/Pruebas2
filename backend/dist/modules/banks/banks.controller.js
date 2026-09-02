"use strict";
// ¿Qué? Controlador HTTP de bancos.
// ¿Para qué? Devolver el catálogo de bancos.
// ¿Impacto? Soporta selectores y filtros multi-banco.
Object.defineProperty(exports, "__esModule", { value: true });
exports.banksController = void 0;
const banks_service_1 = require("./banks.service");
exports.banksController = {
    async list(_req, res, next) {
        try {
            const data = await banks_service_1.banksService.list();
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=banks.controller.js.map