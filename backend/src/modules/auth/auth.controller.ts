// ¿Qué? Controlador HTTP del módulo de autenticación.
// ¿Para qué? Extraer datos del request, validarlos y delegar la lógica al service.
// ¿Impacto? Capa HTTP delgada; incluye perfil y cambio de contraseña (Día 3).

import { Request, Response, NextFunction } from 'express';
import { authService, AuthError } from './auth.service.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.schemas.js';
import { AuthenticatedRequest } from '../../types/index.js';

const handleError = (error: unknown, next: NextFunction) => {
  if (error instanceof AuthError) {
    return next(Object.assign(error, { statusCode: error.statusCode }));
  }
  return next(error);
};

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      res.json(await authService.login(data.email, data.password));
    } catch (error) {
      handleError(error, next);
    }
  },

  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      res.status(201).json(await authService.register(data, req.user!.id_usuario));
    } catch (error) {
      handleError(error, next);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      res.json(await authService.forgotPassword(data.correo));
    } catch (error) {
      handleError(error, next);
    }
  },

  async verifyResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = String(req.query.token || '');
      if (!token) {
        res.status(400).json({ valid: false, error: 'Token no proporcionado' });
        return;
      }
      const result = await authService.verifyResetToken(token);
      res.status(result.valid ? 200 : 401).json(result);
    } catch (error) {
      handleError(error, next);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      res.json(await authService.resetPassword(data.token, data.nuevaContrasena));
    } catch (error) {
      handleError(error, next);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json(await authService.getMe(req.user!.id_usuario));
    } catch (error) {
      handleError(error, next);
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      res.json(await authService.updateProfile(req.user!.id_usuario, data));
    } catch (error) {
      handleError(error, next);
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = changePasswordSchema.parse(req.body);
      res.json(await authService.changePassword(req.user!.id_usuario, data));
    } catch (error) {
      handleError(error, next);
    }
  },

  async listUsers(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json(await authService.listSystemUsers());
    } catch (error) {
      handleError(error, next);
    }
  },
};