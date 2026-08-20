// ¿Qué? Configuración de la aplicación Express.
// ¿Para qué? Integrar middlewares de seguridad, parseo de JSON y registro de rutas globales.
// ¿Impacto? Centraliza la configuración de red y cabeceras seguras (Helmet, CORS) RS-006.

// ¿Qué? Configuración de la aplicación Express.
// ¿Para qué? Integrar middlewares de seguridad, parseo de JSON y registro de rutas de módulos.
// ¿Impacto? Centraliza la configuración de red y cabeceras seguras (Helmet, CORS) RS-006.

// ¿Qué? Configuración central de la aplicación Express.
// ¿Para qué? Registrar middlewares globales y montar todos los módulos de la API.
// ¿Impacto? Punto único de ensamblaje del backend TriDa.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import transactionsRoutes from './modules/transactions/transactions.routes.js';
import alertsRoutes from './modules/alerts/alerts.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import mapRoutes from './modules/map/map.routes.js';
import banksRoutes from './modules/banks/banks.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import devicesRoutes from './modules/devices/devices.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use('/api', apiRateLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Módulos ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/banks', banksRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/devices', devicesRoutes);

app.use(errorHandler);

export default app;