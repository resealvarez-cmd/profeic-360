# Usamos Python 3.11 para mejor rendimiento
FROM python:3.11-slim

# Evita que Python genere archivos .pyc y fuerza la salida por consola
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo
WORKDIR /app

# Copiamos requerimientos
COPY requirements.txt .

# Instalamos dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código
COPY . .

# Puerto por defecto (Cloud Run inyecta esta variable)
ENV PORT 8080

# Comando de inicio optimizado
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]