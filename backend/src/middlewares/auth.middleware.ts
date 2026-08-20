// ¿Qué? Middleware de autenticación y autorización por roles (RBAC).
// ¿Para qué? Interceptar peticiones en rutas protegidas, verificar el JWT y validar permisos de acceso.
// ¿Impacto? Garantiza la seguridad de las rutas restringiendo el acceso según el rol del usuario (RS-003).

import { Response, NextFunction } from 'express';
import { verifyTokenSignature } from '../utils/jwt.util.js';
import { UserPayload, AuthenticatedRequest } from '../types/index.js';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) { res.status(401).json({ error: 'Token no proporcionado.' }); return; }
    req.user = verifyTokenSignature<UserPayload>(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

export const requireRoles = (rolesPermitidos: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ error: 'Permisos insuficientes.' }); return;
    }
    next();
  };
};