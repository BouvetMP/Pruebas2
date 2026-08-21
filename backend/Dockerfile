# ¿Qué? Dockerfile multi-etapa definitivo para el backend TriDa
# ¿Para qué? Compilar TypeScript indicando explícitamente el tsconfig y la carpeta dist
# ¿Impacto? Genera dist/index.js de forma garantizada y sirve la API en el puerto 3000

FROM node:22-alpine AS builder

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copiar todo el proyecto monorepo
COPY . .

RUN pnpm install --shamefully-hoist

WORKDIR /app/backend
RUN pnpm exec prisma generate
# Compilamos indicando explícitamente la ruta del tsconfig
RUN npx tsc -p tsconfig.json --outDir dist || npx tsc -p ../tsconfig.json --outDir dist

# ── ETAPA RUNNER ──
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

WORKDIR /app/backend

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]

