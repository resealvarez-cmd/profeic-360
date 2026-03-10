import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client
import postgrest

load_dotenv("backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Uso service role para bypassear RLS e insertar la tabla
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def main():
    print("Conectado a Supabase.")
    sql = """
    CREATE TABLE IF NOT EXISTS cobertura_curricular (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users NOT NULL,
      nivel text NOT NULL,
      asignatura text NOT NULL,
      oa_id text NOT NULL,
      recurso_id bigint REFERENCES biblioteca_recursos(id) ON DELETE CASCADE,
      tipo_recurso text,
      fecha timestamptz DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_cobertura_user ON cobertura_curricular(user_id, asignatura, nivel);

    ALTER TABLE cobertura_curricular ENABLE ROW LEVEL SECURITY;

    DO $$ 
    BEGIN 
        -- Evitamos error si la política ya existe
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'cobertura_curricular' AND policyname = 'Users can view their own coverage'
        ) THEN
            CREATE POLICY "Users can view their own coverage"
            ON cobertura_curricular FOR SELECT
            USING (auth.uid() = user_id);
        END IF;
    END $$;

    DO $$ 
    BEGIN 
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'cobertura_curricular' AND policyname = 'Users can insert their own coverage'
        ) THEN
            CREATE POLICY "Users can insert their own coverage"
            ON cobertura_curricular FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        END IF;
    END $$;
    """
    
    # La API REST nativa de supabase-py no tiene forma de ejecutar DDL directo. 
    # El usuario tiene la herramienta de backend en FastAPI que expone routers...
    pass

if __name__ == "__main__":
    asyncio.run(main())
