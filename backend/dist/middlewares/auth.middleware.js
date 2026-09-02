"use strict";
// ¿Qué? Middleware de autenticación y autorización por roles (RBAC).
// ¿Para qué? Interceptar peticiones en rutas protegidas, verificar el JWT y validar permisos de acceso.
// ¿Impacto? Garantiza la seguridad de las rutas restringiendo el acceso según el rol del usuario (RS-003).
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.requireAuth = void 0;
const jwt_util_js_1 = require("../utils/jwt.util.js");
const requireAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Token no proporcionado.' });
            return;
        }
        req.user = (0, jwt_util_js_1.verifyTokenSignature)(token);
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};
exports.requireAuth = requireAuth;
const requireRoles = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            res.status(403).json({ error: 'Permisos insuficientes.' });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
//# sourceMappingURL=auth.middleware.js.map