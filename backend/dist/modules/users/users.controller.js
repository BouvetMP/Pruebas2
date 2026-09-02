"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_js_1 = require("./users.service.js");
const users_schemas_1 = require("./users.schemas");
exports.usersController = {
    async listAll(_req, res, next) {
        try {
            res.json(await users_service_js_1.usersService.listAll());
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const { estado } = users_schemas_1.updateUserStatusSchema.parse(req.body);
            res.json(await users_service_js_1.usersService.updateStatus(Number(req.params.id), estado));
        }
        catch (error) {
            next(error);
        }
    },
    async updateRole(req, res, next) {
        try {
            const { rol } = users_schemas_1.updateUserRoleSchema.parse(req.body);
            res.json(await users_service_js_1.usersService.updateRole(Number(req.params.id), rol));
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=users.controller.js.map