# --- 1. DEPS: Instalación de dependencias ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- 2. BUILDER: Construcción del proyecto ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivamos telemetría durante el build
ENV NEXT_TELEMETRY_DISABLED 1

# Construimos la aplicación
RUN npm run build

# --- 3. RUNNER: Imagen de producción ligera ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copiamos archivos necesarios (Next.js Standalone)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]

