# Usamos Python 3.11 versión ligera para un contenedor rápido
FROM python:3.11-slim

# Evitamos que Python genere basura (.pyc) y forzamos logs en tiempo real para Cloud Run
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio interno del contenedor
WORKDIR /app

# 1. Instalamos utilidades base del sistema operativo (previenen errores de compilación con librerías pesadas como Pandas o Docx)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 2. Copiamos los requerimientos primero para aprovechar el caché de Docker
COPY requirements.txt .

# 3. Instalamos dependencias oficiales de la V4 de ProfeIC
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. Copiamos todo el código fuente del backend
COPY . .

# Cloud Run lee la variable de entorno $PORT (por defecto 8080)
ENV PORT=8080
EXPOSE $PORT

# 5. Comando de arranque maestro
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]