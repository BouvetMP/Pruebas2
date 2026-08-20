# TriDa

> **Sistema de Monitoreo de Transacciones con Inteligencia Artificial para Detección de Fraude**

---

## ¿Qué es TriDa?

**TriDa** es un **sistema inteligente de prevención de fraude** diseñado para instituciones financieras. Analiza transacciones en tiempo real, detecta patrones anómalos mediante un motor de criticidad ponderado y **previene fraudes ANTES de que ocurran** — no después.

Bloquea automáticamente operaciones de alto riesgo mientras mantiene una experiencia fluida para clientes legítimos, reduciendo falsos positivos mediante aprendizaje continuo de validaciones manuales de analistas.

---

## Características Principales

| Característica | Descripción |
| --- | --- |
| **Análisis en Tiempo Real** | Procesamiento de transacciones con latencia < 500ms |
| **Motor de Criticidad** | 7 factores ponderados que calculan un score de riesgo 0–100 |
| **Alertas Inteligentes** | Tres niveles: baja (30–49), media (50–79), alta (80–95) |
| **Bloqueo Automático** | Detiene transacciones con score > 95 antes de completarse |
| **Dashboard Intuitivo** | Interfaz web para que analistas validen y clasifiquen alertas |
| **Seguridad Bancaria** | JWT + bcrypt, rutas protegidas, CORS restringido |
| **Auditoría de Acceso** | Registro de último acceso y operaciones de usuarios |
| **Reportes por Entidad** | Filtros por banco, tipo de transacción, ciudad y canal |

---

## Arquitectura

### Stack actual (MVP)

```
Backend (Node.js 22 + Express.js + TypeScript)
├── API REST con autenticación JWT
├── Prisma ORM
├── Motor de Criticidad (7 factores deterministas)
├── Generación automática de alertas
└── PostgreSQL 17

Frontend (React 18 + TypeScript)
├── Vite 5
├── Tailwind CSS 3
├── Leaflet (mapas)
└── Lucide React (iconos)
```

### Stack objetivo (v2.0 — fuera del alcance MVP)

```
Backend
├── Caché: Redis 7+
├── Auditoría inmutable: MongoDB 8 (append-only)
└── Validación: Zod

Servicio IA/ML (Python 3.12)
├── TensorFlow 2.18
├── Scikit-learn 1.6
└── Predicción de fraude

DevOps
├── Docker + Docker Compose (MVP)
├── Kubernetes (v2.0)
├── Prometheus + Grafana (v2.0)
└── CI/CD: GitHub Actions
```

---

## Tecnologías Utilizadas

### Backend (MVP)

| Tecnología | Versión | Función |
| --- | --- | --- |
| Node.js | 22 LTS | Runtime |
| Express.js | 4.x | Framework API REST |
| TypeScript | 5.x | Tipado estático |
| Prisma | 6.x | ORM |
| PostgreSQL | 17 | Base de datos principal |
| JWT | 9.x | Autenticación |
| bcrypt | 5.x | Hash de contraseñas (coste 12) |
| pnpm | 10+ | Gestor de paquetes |

### Frontend (MVP)

| Tecnología | Versión | Función |
| --- | --- | --- |
| React | 18.3 | UI |
| TypeScript | 5.5 | Tipado estático |
| Vite | 5.4 | Bundler |
| Tailwind CSS | 3.4 | Estilos |
| Leaflet | 1.9 | Mapas |
| Lucide React | 0.453 | Iconos |
| React Router | 6.28 | Navegación |

---

## Requisitos Previos

- **Node.js** 22 LTS
- **pnpm** 10+ (`npm install -g pnpm`)
- **PostgreSQL** 17
- **Docker** y **Docker Compose** (opcional, vía recomendada)

---

## Instalación

### Vía Docker (recomendada)

```bash
git clone https://github.com/isaias066/TriDa.git
cd TriDa

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Levantar todos los servicios
docker compose up --build

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

### Vía local (sin Docker)

```bash
git clone https://github.com/isaias066/TriDa.git
cd TriDa

# 1. Base de datos
createdb TriDa
psql -d TriDa -f database/schema.sql
psql -d TriDa -f database/seed.sql

# 2. Backend
cd backend
cp .env.example .env
pnpm install
pnpm prisma generate
pnpm dev
# API en http://localhost:3000

# 3. Frontend (otra terminal)
cd frontend
pnpm install
pnpm dev
# Dashboard en http://localhost:5173
```

---

## Variables de Entorno

| Variable | Obligatoria | Ejemplo | Descripción |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ Sí | `postgresql://user:pass@localhost:5432/TriDa` | Conexión a PostgreSQL |
| `JWT_SECRET` | ✅ Sí | `tu_clave_secreta_min_32_chars` | Firma de tokens JWT |
| `JWT_EXPIRES_IN` | No | `24h` | Expiración del token |
| `PORT` | No | `3000` | Puerto del backend |
| `FRONTEND_URL` | No | `http://localhost:5173` | Origen permitido (CORS) |
| `EMAIL_USER` | No | `tu@gmail.com` | Correo para recuperación |
| `EMAIL_PASS` | No | `app_password` | Contraseña de aplicación |
| `EMAIL_FROM` | No | `TriDa <noreply@trida.com>` | Remitente de correos |

> ⚠️ El servidor **NO** arranca si faltan `DATABASE_URL` o `JWT_SECRET`.

---

## Estructura del Proyecto

```
TriDa/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelo de datos
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts             # Validación de variables de entorno
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── transactionsController.ts
│   │   │   ├── alertsController.ts
│   │   │   └── analyticsController.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts            # verifyToken, requireAdmin
│   │   │   └── errorHandler.ts    # Manejador global de errores
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   ├── transactionRoutes.ts
│   │   │   ├── alertRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── services/
│   │   │   └── riskScoring.ts     # Motor de criticidad
│   │   └── app.ts                 # Configuración de Express
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                   # Cliente HTTP y módulos por dominio
│   │   ├── components/            # UI, shared, por dominio
│   │   ├── hooks/                 # useTransactions, useAlerts, etc.
│   │   ├── pages/                 # Dashboard, Transactions, Alerts, Map
│   │   ├── constants/             # HTTP_STATUS, ERROR_MESSAGES
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/
│   ├── schema.sql                 # Esquema versionado (respaldo)
│   └── seed.sql                   # Datos de prueba
├── documentacion/
│   ├── requisitos/
│   ├── referencia-tecnica/
│   ├── configuracion/
│   └── proceso/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

## Primer Acceso

```bash
# Sembrar usuario administrador
cd backend
pnpm seed:admin

# Credenciales por defecto (cambiar en producción):
# Email: admin@trida.com
# Contraseña: (la que definas en .env)
```

---

## Seguridad

| Práctica | Estado |
| --- | --- |
| JWT con expiración | ✅ Implementado |
| bcrypt coste 12 | ✅ Implementado |
| Rutas protegidas con `verifyToken` | ✅ Implementado |
| CORS restringido por entorno | ✅ Implementado |
| Helmet (cabeceras de seguridad) | ✅ Implementado |
| Rate limiting en login | ✅ Implementado |
| Contraseña mínima 10 caracteres | ✅ Implementado |
| Recuperación sin enumeración | ✅ Implementado |
| Token de reset con propósito y caducidad | ✅ Implementado |
| SQL parametrizado (Prisma) | ✅ Implementado |

**Objetivo v2.0:** PCI-DSS 4.0, ISO 27001, AES-256 en reposo, TLS 1.3, mTLS.

---

## Flujo de Contribución

1. Crear rama desde `develop`: `git checkout -b feature/mi-cambio develop`
2. Commits convencionales: `feat:`, `fix:`, `docs:`
3. Abrir PR hacia `develop` con `Closes #n`
4. Revisión + CI en verde → merge
5. `develop` → `main` solo en releases

---

## Estado del Proyecto

| Módulo | Estado |
| --- | --- |
| Autenticación (login, registro, reset) | ✅ Funcional |
| Dashboard | ✅ Funcional |
| Transacciones | ✅ Funcional |
| Alertas | ✅ Funcional |
| Mapa | ✅ Funcional |
| Analítica | ✅ Funcional |
| Motor de criticidad | ✅ Funcional |
| Usuarios | ✅ Funcional |
| Docker | ✅ Funcional |
| Redis (caché) | 🔜 Planificado |
| Python/ML | 🔜 Planificado |
| MongoDB (auditoría) | 🔜 Planificado |

---

## Licencia

MIT. Ver [LICENSE](LICENSE).

---

<div align="center">

**Protegiendo el futuro financiero con Inteligencia Artificial**

*MVP 2026 · Revisión 1.0*

</div>
**Protegiendo el futuro financiero con Inteligencia Artificial** 

*MVP 2026 · Revisión 0.6

</div>
