"use strict";
// ¿Qué? Limitadores de peticiones HTTP por IP.
// ¿Para qué? Evitar ataques de fuerza bruta y denegación de servicio (DDoS).
// ¿Impacto? Cumple la restricción RS-006 de seguridad perimetral.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = exports.loginRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginRateLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Demasiados intentos.' } });
exports.apiRateLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, max: 150, message: { error: 'Límite superado.' } });
//# sourceMappingURL=rateLimit.middleware.js.map