# ¿Qué? Dockerfile multi-etapa para el frontend TriDa en monorrepo
# ¿Para qué? Compilar la SPA React/Vite con Nginx usando pnpm 9 y shamefully-hoist
# ¿Impacto? Sirve el dashboard en el puerto 80 sin errores de tipos en Docker

FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copiar configuraciones del monorepo y TODOS los package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Instalar dependencias aplanadas para evitar problemas de tipos en Docker
RUN pnpm install --shamefully-hoist

# Copiar código fuente del frontend
COPY frontend ./frontend
WORKDIR /app/frontend

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm exec vite build
# Compilar con Vite directamente a HTML/JS estáticos en /dist

# ── ETAPA 2: Runner Nginx ──
FROM nginx:alpine AS runner

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

