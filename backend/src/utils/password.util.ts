// ¿Qué? Funciones para el manejo seguro de contraseñas.
// ¿Para qué? Centralizar el hashing y la verificación usando bcrypt.
// ¿Impacto? Garantiza el cumplimiento de RS-003 (algoritmo bcrypt con coste 12).

import bcrypt from 'bcrypt';
export const hashPassword = async (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = async (password: string, hash: string) => bcrypt.compare(password, hash);