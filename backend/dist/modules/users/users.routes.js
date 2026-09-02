"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_js_1 = require("./users.controller.js");
const auth_middleware_js_1 = require("../../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.requireAuth);
router.use((0, auth_middleware_js_1.requireRoles)(['ADMINISTRADOR']));
router.get('/', users_controller_js_1.usersController.listAll);
router.patch('/:id/status', users_controller_js_1.usersController.updateStatus);
router.patch('/:id/role', users_controller_js_1.usersController.updateRole);
exports.default = router;
//# sourceMappingURL=users.routes.js.map