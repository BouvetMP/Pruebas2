"use strict";
// ¿Qué? Utilidad para firmar y verificar tokens JWT.
// ¿Para qué? Aislar la lógica de jsonwebtoken y manejar tipos de manera segura.
// ¿Impacto? Mantiene la autorización stateless y previene el uso de tokens alterados (RS-003).
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenSignature = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
const signToken = (payload, expiresIn = config_js_1.config.JWT_EXPIRES_IN) => jsonwebtoken_1.default.sign(payload, config_js_1.config.JWT_SECRET, { expiresIn });
exports.signToken = signToken;
const verifyTokenSignature = (token) => jsonwebtoken_1.default.verify(token, config_js_1.config.JWT_SECRET);
exports.verifyTokenSignature = verifyTokenSignature;
//# sourceMappingURL=jwt.util.js.map