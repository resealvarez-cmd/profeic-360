-- Tabla de Noticias
CREATE TABLE IF NOT EXISTS noticias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    titulo TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    es_importante BOOLEAN DEFAULT FALSE,
    autor_id TEXT
);

-- Tabla de Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recurso_id UUID REFERENCES biblioteca_recursos(id) ON DELETE CASCADE,
    usuario_id TEXT NOT NULL,
    usuario_nombre TEXT,
    contenido TEXT CHECK (CHAR_LENGTH(contenido) <= 500)
);

-- Tabla de Reacciones (Likes)
CREATE TABLE IF NOT EXISTS reacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recurso_id UUID REFERENCES biblioteca_recursos(id) ON DELETE CASCADE,
    usuario_id TEXT NOT NULL,
    tipo TEXT DEFAULT 'like',
    UNIQUE(recurso_id, usuario_id) -- Un usuario solo puede dar 1 like por recurso
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_comentarios_recurso ON comentarios(recurso_id);
CREATE INDEX idx_reacciones_recurso ON reacciones(recurso_id);
