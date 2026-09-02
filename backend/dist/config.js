"use strict";
// ¿Qué? Archivo de validación centralizada de variables de entorno usando Zod.
// ¿Para qué? Asegurar que el sistema no arranque si faltan secretos como la clave JWT o la base de datos.
// ¿Impacto? Previene vulnerabilidades (RS-004) y caídas silenciosas en producción por configuración incompleta.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('24h'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:5173'),
    IA_URL: zod_1.z.string().url().default('http://localhost:5000'),
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
    EMAIL_USER: zod_1.z.string().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default('TriDa <noreply@trida.com>'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Faltan variables de entorno:');
    console.error(_env.error.format());
    process.exit(1);
}
exports.config = _env.data;
//# sourceMappingURL=config.js.map