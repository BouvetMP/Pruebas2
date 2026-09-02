"use strict";
// ¿Qué? Esquemas de validación Zod para el módulo de autenticación.
// ¿Para qué? Garantizar que los datos de entrada cumplan las reglas de seguridad antes de procesarlos.
// ¿Impacto? Cumple RS-006 (validación de input) y eleva la contraseña mínima a 10 caracteres.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
// ¿Qué? Esquemas de validación Zod para el módulo de autenticación.
// ¿Para qué? Validar email, contraseña y roles antes de procesar la petición.
// ¿Impacto? Cumple RS-006 y exige contraseña mínima de 10 caracteres con complejidad.
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número');
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('El correo electrónico no es válido'),
    password: zod_1.z.string().min(1, 'La contraseña es obligatoria'),
});
exports.registerSchema = zod_1.z.object({
    nombre_completo: zod_1.z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: zod_1.z.string().email('El correo electrónico no es válido'),
    password: passwordSchema,
    rol: zod_1.z.enum(['ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR'], {
        errorMap: () => ({
            message: 'Rol inválido. Use: ADMINISTRADOR, ANALISTA, OPERADOR o AUDITOR',
        }),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    correo: zod_1.z.string().email('El correo electrónico no es válido'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'El token es obligatorio'),
    nuevaContrasena: passwordSchema,
});
//# sourceMappingURL=auth.schemas.js.map