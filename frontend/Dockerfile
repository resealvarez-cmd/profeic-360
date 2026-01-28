# Usamos Node 20 (Compatible con Supabase)
FROM node:20-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json ./

# Instalamos todo (incluyendo desarrollo) para evitar errores de memoria
RUN npm install --legacy-peer-deps

# Copiamos el resto del código
COPY . .

# Desactivamos telemetría
ENV NEXT_TELEMETRY_DISABLED 1

# Construimos la aplicación
RUN npm run build

# Exponemos el puerto
EXPOSE 3000
ENV PORT 3000

# Arrancamos
CMD ["npm", "start"]
