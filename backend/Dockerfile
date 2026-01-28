# Usamos una imagen oficial de Python ligera
FROM python:3.9-slim

# Evita que Python genere archivos .pyc y fuerza la salida por consola (útil para logs)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los requerimientos primero (para aprovechar la caché de Docker)
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto 8080 (el estándar de Google Cloud Run)
ENV PORT 8080

# Comando para iniciar la aplicación
# Importante: "main:app" asume que tu archivo principal se llama main.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]