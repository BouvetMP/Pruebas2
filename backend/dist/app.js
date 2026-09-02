"use strict";
// ¿Qué? Configuración central de la aplicación Express.
// ¿Para qué? Registrar middlewares globales y montar todos los módulos de la API.
// ¿Impacto? Punto único de ensamblaje del backend TriDa.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ¿Qué? Configuración central de Express con compatibilidad de BigInt y alias de rutas.
// ¿Para qué? Servir endpoints en inglés técnico (RL-001) y en español (compatibilidad con frontend).
// ¿Impacto? Resuelve los errores 500 por BigInt y los errores 404 por rutas en español.
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_js_1 = require("./config.js");
const rateLimit_middleware_js_1 = require("./middlewares/rateLimit.middleware.js");
const error_middleware_js_1 = require("./middlewares/error.middleware.js");
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./modules/dashboard/dashboard.routes.js"));
const transactions_routes_js_1 = __importDefault(require("./modules/transactions/transactions.routes.js"));
const alerts_routes_js_1 = __importDefault(require("./modules/alerts/alerts.routes.js"));
const analytics_routes_js_1 = __importDefault(require("./modules/analytics/analytics.routes.js"));
const map_routes_js_1 = __importDefault(require("./modules/map/map.routes.js"));
const banks_routes_js_1 = __importDefault(require("./modules/banks/banks.routes.js"));
const customers_routes_js_1 = __importDefault(require("./modules/customers/customers.routes.js"));
const devices_routes_js_1 = __importDefault(require("./modules/devices/devices.routes.js"));
const users_routes_js_1 = __importDefault(require("./modules/users/users.routes.js"));
// ── FIX BIGINT: Permitir que JSON.stringify convierta BigInt de PostgreSQL a Number ──
BigInt.prototype.toJSON = function () {
    return Number(this);
};
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_js_1.config.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/api', rateLimit_middleware_js_1.apiRateLimiter);
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ── RUTAS PRINCIPALES (Inglés Técnico - RL-001) ───────────────
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/dashboard', dashboard_routes_js_1.default);
app.use('/api/transactions', transactions_routes_js_1.default);
app.use('/api/alerts', alerts_routes_js_1.default);
app.use('/api/analytics', analytics_routes_js_1.default);
app.use('/api/map', map_routes_js_1.default);
app.use('/api/banks', banks_routes_js_1.default);
app.use('/api/customers', customers_routes_js_1.default);
app.use('/api/devices', devices_routes_js_1.default);
app.use('/api/users', users_routes_js_1.default);
// ── COMPATIBILIDAD FRONTEND (Alias en Español para evitar 404) ─
app.use('/api/transacciones', transactions_routes_js_1.default);
app.use('/api/alertas', alerts_routes_js_1.default);
app.use('/api/bancos', banks_routes_js_1.default);
app.use('/api/dispositivos', devices_routes_js_1.default);
app.use('/api/tareas', customers_routes_js_1.default);
app.use('/api/usuarios', customers_routes_js_1.default);
app.use('/api/mapa', map_routes_js_1.default);
app.use(error_middleware_js_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map