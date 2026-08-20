// ¿Qué? Configuración de Nodemailer para envío de correos.
// ¿Para qué? Enviar correos transaccionales (ej. recuperación de contraseña).
// ¿Impacto? Abstrae el proveedor de correo del resto de la lógica de negocio.

import nodemailer from 'nodemailer';
import { config } from '../config.js';

export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASS },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!config.EMAIL_USER) return console.warn(`⚠️ Correo omitido (no hay EMAIL_USER): ${subject}`);
  await mailer.sendMail({ from: config.EMAIL_FROM, to, subject, html });
};