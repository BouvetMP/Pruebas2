"use strict";
// ¿Qué? Servicio para envío de correos transaccionales a prueba de fallos.
// ¿Para qué? Enviar correos de recuperación sin tumbar el servidor si falla la conexión SMTP.
// ¿Impacto? Permite probar el flujo de olvido de contraseña en entorno local sin credenciales reales.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_js_1 = require("../config.js");
exports.mailer = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_js_1.config.EMAIL_USER,
        pass: config_js_1.config.EMAIL_PASS,
    },
});
const sendEmail = async (to, subject, html) => {
    // Si no hay correo o son los valores de ejemplo, omitir el envío real
    if (!config_js_1.config.EMAIL_USER || config_js_1.config.EMAIL_USER.includes('tu_correo')) {
        console.warn(`⚠️ [DEV] Correo omitido a <${to}> (EMAIL_USER no configurado). Asunto: ${subject}`);
        return;
    }
    try {
        await exports.mailer.sendMail({
            from: config_js_1.config.EMAIL_FROM,
            to,
            subject,
            html,
        });
        console.log(`✅ Correo enviado con éxito a <${to}>`);
    }
    catch (error) {
        console.error(`❌ Error de conexión al enviar correo a <${to}>:`, error);
        // No lanzamos la excepción para evitar que el servidor devuelva un error 500 al cliente
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.util.js.map