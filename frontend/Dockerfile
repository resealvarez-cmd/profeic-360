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

# Copiamos archivos necesarios (Next.js Standalone mode recomendado)
# Si no usas "output: standalone" en next.config.js, necesitarías copiar más cosas.
# Por seguridad, copiamos lo estándar.

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
# NOTA: Si falla 'standalone', el usuario debe activar 'output: standalone' en next.config.js
# Si no está activo, copiamos .next completo y node_modules (menos eficiente pero seguro)
# Para este caso, asumiremos un setup estándar y modificaremos el next.config.js si es necesario después.
# PERO para ir a la segura sin modificar next.config.js ahora:

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
