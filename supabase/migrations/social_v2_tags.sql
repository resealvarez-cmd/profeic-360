-- Agregamos columna 'etiqueta' a la tabla noticias
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS etiqueta TEXT DEFAULT 'Información';

-- Actualizamos el comentario para documentación
COMMENT ON COLUMN noticias.etiqueta IS 'Categoría de la noticia: Aviso, Información, Tarea, Recordatorio, etc.';
