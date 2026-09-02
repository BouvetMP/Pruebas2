"use strict";
// ¿Qué? Controlador HTTP del módulo de autenticación.
// ¿Para qué? Extraer datos del request, validarlos y delegar la lógica al service.
// ¿Impacto? Mantiene la capa HTTP delgada y tipada, sin lógica de negocio embebida.
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const auth_schemas_1 = require("./auth.schemas");
const handleError = (error, next) => {
    if (error instanceof auth_service_js_1.AuthError) {
        return next(Object.assign(error, { statusCode: error.statusCode }));
    }
    return next(error);
};
exports.authController = {
    async login(req, res, next) {
        try {
            const data = auth_schemas_1.loginSchema.parse(req.body);
            const result = await auth_service_js_1.authService.login(data.email, data.password);
            res.json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async register(req, res, next) {
        try {
            const data = auth_schemas_1.registerSchema.parse(req.body);
            const idGenerador = req.user.id_usuario;
            const result = await auth_service_js_1.authService.register(data, idGenerador);
            res.status(201).json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            const data = auth_schemas_1.forgotPasswordSchema.parse(req.body);
            const result = await auth_service_js_1.authService.forgotPassword(data.correo);
            res.json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async verifyResetToken(req, res, next) {
        try {
            const token = String(req.query.token || '');
            if (!token) {
                res.status(400).json({ valid: false, error: 'Token no proporcionado' });
                return;
            }
            const result = await auth_service_js_1.authService.verifyResetToken(token);
            const status = result.valid ? 200 : 401;
            res.status(status).json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const data = auth_schemas_1.resetPasswordSchema.parse(req.body);
            const result = await auth_service_js_1.authService.resetPassword(data.token, data.nuevaContrasena);
            res.json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async me(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.getMe(req.user.id_usuario);
            res.json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
    async listUsers(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.listSystemUsers();
            res.json(result);
        }
        catch (error) {
            handleError(error, next);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map