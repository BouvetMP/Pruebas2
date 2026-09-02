"use strict";
// ¿Qué? Funciones para el manejo seguro de contraseñas usando bcryptjs.
// ¿Para qué? Centralizar el hashing y la verificación sin dependencias nativas de C++.
// ¿Impacto? Evita fallos de compilación en Windows y garantiza el cumplimiento de RS-003.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
//# sourceMappingURL=password.util.js.map