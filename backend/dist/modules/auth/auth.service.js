"use strict";
// ¿Qué? Servicio de autenticación: login, registro, recuperación y reseteo de contraseña.
// ¿Para qué? Centralizar la lógica de negocio de auth y aislarla de la capa HTTP.
// ¿Impacto? Usa las funciones SQL existentes (fn_login, fn_register, fn_cambiar_contrasena) y cumple RS-003/RS-004.
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthError = void 0;
const prisma_js_1 = require("../../db/prisma.js");
const password_util_js_1 = require("../../utils/password.util.js");
const jwt_util_js_1 = require("../../utils/jwt.util.js");
const mailer_util_js_1 = require("../../utils/mailer.util.js");
const config_js_1 = require("../../config.js");
// ── Errores de dominio ───────────────────────────────────────
class AuthError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
// ── Servicio ─────────────────────────────────────────────────
exports.authService = {
    // ── LOGIN ──────────────────────────────────────────────────
    async login(email, password) {
        const rows = await prisma_js_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_login(${email}::text)
    `;
        if (rows.length === 0) {
            throw new AuthError('Credenciales inválidas', 401);
        }
        const user = rows[0];
        if (!user.estado) {
            throw new AuthError('Tu cuenta está desactivada. Contacta al administrador.', 403);
        }
        const passwordOK = await (0, password_util_js_1.verifyPassword)(password, user.password_hash);
        if (!passwordOK) {
            throw new AuthError('Credenciales inválidas', 401);
        }
        const payload = {
            id_usuario: user.id_usuario,
            email: user.email,
            rol: user.rol,
            nombre: user.nombre_completo,
        };
        const token = (0, jwt_util_js_1.signToken)(payload);
        // Actualizar último acceso con cast explícito a integer
        await prisma_js_1.prisma.$queryRaw `SELECT trida.fn_actualizar_ultimo_acceso(${Number(user.id_usuario)}::integer)`.catch(() => null);
        return {
            token,
            user: {
                id: user.id_usuario,
                nombre: user.nombre_completo,
                email: user.email,
                rol: user.rol,
            },
        };
    },
    // ── REGISTER (solo admin) ──────────────────────────────────
    async register(data, idGenerador) {
        const hash = await (0, password_util_js_1.hashPassword)(data.password);
        try {
            const rows = await prisma_js_1.prisma.$queryRaw `
        SELECT * FROM trida.fn_register(
          ${data.nombre_completo},
          ${data.email},
          ${hash},
          ${data.rol},
          ${idGenerador}
        )
      `;
            const nuevo = rows[0];
            return {
                message: 'Usuario creado exitosamente',
                user: {
                    id: nuevo.id_usuario,
                    nombre: nuevo.nombre_completo,
                    email: nuevo.email,
                    rol: nuevo.rol,
                    estado: nuevo.estado,
                },
            };
        }
        catch (error) {
            if (error.code === '23505') {
                throw new AuthError('Ya existe un usuario con ese email', 409);
            }
            if (error.code === '23514') {
                throw new AuthError('El formato del email no es válido', 400);
            }
            throw error;
        }
    },
    // ── FORGOT PASSWORD ────────────────────────────────────────
    async forgotPassword(correo) {
        // Respuesta genérica siempre (evita enumeración de usuarios — RS-003)
        const genericMessage = 'Si el correo existe, recibirás un enlace de recuperación en breve.';
        const users = await prisma_js_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_login(${correo.trim()}::text)
    `;
        if (users.length === 0 || !users[0].estado) {
            return { message: genericMessage };
        }
        const user = users[0];
        const resetToken = (0, jwt_util_js_1.signToken)({
            id_usuario: user.id_usuario,
            email: user.email,
            purpose: 'reset_password',
        }, '15m');
        const resetLink = `${config_js_1.config.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f7; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366F1; margin: 0; font-size: 28px; font-weight: 800;">TriDa</h1>
            <p style="color: #6B7280; margin: 4px 0 0; font-size: 13px;">Monitor de Transacciones con IA</p>
          </div>
          <h2 style="color: #1c1c1e; font-size: 20px; margin: 0 0 12px;">Hola, ${user.nombre_completo}</h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 24px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>TriDa</strong>.
          </p>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 24px;">
            Haz clic en el botón de abajo. <strong>Este enlace expirará en 15 minutos.</strong>
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="background: #6366F1; color: white; padding: 14px 32px; text-decoration: none;
                      border-radius: 12px; display: inline-block; font-weight: 700; font-size: 14px;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #6B7280; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
            Si el botón no funciona, copia este enlace:<br/>
            <a href="${resetLink}" style="color: #6366F1; word-break: break-all;">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px;"/>
          <p style="color: #9CA3AF; font-size: 11px; line-height: 1.5; margin: 0;">
            Si tú NO solicitaste este cambio, ignora este correo. Tu contraseña permanecerá segura.
          </p>
        </div>
        <p style="text-align: center; color: #9CA3AF; font-size: 11px; margin: 16px 0 0;">
          © ${new Date().getFullYear()} TriDa - Sistema Antifraude Bancario
        </p>
      </div>
    `;
        await (0, mailer_util_js_1.sendEmail)(user.email, 'Recuperación de contraseña - TriDa', html);
        return { message: genericMessage };
    },
    // ── VERIFY RESET TOKEN ─────────────────────────────────────
    async verifyResetToken(token) {
        try {
            const decoded = (0, jwt_util_js_1.verifyTokenSignature)(token);
            if (decoded.purpose !== 'reset_password') {
                return { valid: false, error: 'Token inválido' };
            }
            return { valid: true, email: decoded.email };
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                return { valid: false, error: 'El enlace ha expirado' };
            }
            return { valid: false, error: 'Token inválido' };
        }
    },
    // ── RESET PASSWORD ─────────────────────────────────────────
    async resetPassword(token, nuevaContrasena) {
        let decoded;
        try {
            decoded = (0, jwt_util_js_1.verifyTokenSignature)(token);
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new AuthError('El enlace ha expirado. Solicita uno nuevo.', 401);
            }
            throw new AuthError('Enlace inválido o manipulado', 401);
        }
        if (decoded.purpose !== 'reset_password') {
            throw new AuthError('Token inválido', 401);
        }
        const hash = await (0, password_util_js_1.hashPassword)(nuevaContrasena);
        const rows = await prisma_js_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_cambiar_contrasena(${decoded.email}, ${hash})
    `;
        if (rows.length === 0 || rows[0].actualizado === false) {
            throw new AuthError('No se pudo actualizar la contraseña', 404);
        }
        return {
            message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.',
            email: decoded.email,
        };
    },
    // ── ME (usuario actual) ────────────────────────────────────
    async getMe(idUsuario) {
        const rows = await prisma_js_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_usuario_actual(${idUsuario})
    `;
        if (rows.length === 0) {
            throw new AuthError('Usuario no encontrado', 404);
        }
        const u = rows[0];
        return {
            id: u.id_usuario,
            nombre: u.nombre_completo,
            email: u.email,
            rol: u.rol,
            estado: u.estado,
            fecha_creacion: u.fecha_creacion,
            ultimo_acceso: u.ultimo_acceso,
        };
    },
    // ── LISTAR USUARIOS SISTEMA (solo admin) ───────────────────
    async listSystemUsers() {
        const rows = await prisma_js_1.prisma.$queryRaw `
      SELECT * FROM trida.fn_listar_usuarios_sistema()
    `;
        return rows.map((u) => {
            const idNum = Number(u.id_usuario);
            return {
                id: String(idNum),
                id_usuario: idNum,
                nombre_completo: u.nombre_completo,
                nombre: u.nombre_completo,
                email: u.email,
                rol: u.rol,
                estado: Boolean(u.estado),
                fecha_creacion: u.fecha_creacion,
                ultimo_acceso: u.ultimo_acceso,
                id_usuario_generador: u.id_usuario_generador ? Number(u.id_usuario_generador) : null,
            };
        });
    },
};
//# sourceMappingURL=auth.service.js.map