// ¿Qué? Utilidad para firmar y verificar tokens JWT.
// ¿Para qué? Aislar la lógica de jsonwebtoken y manejar tipos de manera segura.
// ¿Impacto? Mantiene la autorización stateless y previene el uso de tokens alterados (RS-003).

import jwt from 'jsonwebtoken';
import { config } from '../config.js';
export const signToken = (payload: object, expiresIn = config.JWT_EXPIRES_IN) => jwt.sign(payload, config.JWT_SECRET, { expiresIn });
export const verifyTokenSignature = <T>(token: string) => jwt.verify(token, config.JWT_SECRET) as T;