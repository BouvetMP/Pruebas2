// ¿Qué? Controlador HTTP del módulo de autenticación.
// ¿Para qué? Extraer datos del request, validarlos y delegar la lógica al service.
// ¿Impacto? Mantiene la capa HTTP delgada y tipada, sin lógica de negocio embebida.

import { Request, Response, NextFunction } from 'express';
import { authService, AuthError } from './auth.service.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schemas';
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
      const result = await authService.login(data.email, data.password);
      res.json(result);
    } catch (error) {
      handleError(error, next);
    }
  },

  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const idGenerador = req.user!.id_usuario;
      const result = await authService.register(data, idGenerador);
      res.status(201).json(result);
    } catch (error) {
      handleError(error, next);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(data.correo);
      res.json(result);
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
      const status = result.valid ? 200 : 401;
      res.status(status).json(result);
    } catch (error) {
      handleError(error, next);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(data.token, data.nuevaContrasena);
      res.json(result);
    } catch (error) {
      handleError(error, next);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.getMe(req.user!.id_usuario);
      res.json(result);
    } catch (error) {
      handleError(error, next);
    }
  },

  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.listSystemUsers();
      res.json(result);
    } catch (error) {
      handleError(error, next);
    }
  },
};