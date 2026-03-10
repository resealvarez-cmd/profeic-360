-- Migration: Create "cobertura_curricular" table and policies
-- Allows tracking of which curriculum objectives each teacher has covered.

CREATE TABLE IF NOT EXISTS cobertura_curricular (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  nivel text NOT NULL,
  asignatura text NOT NULL,
  oa_id text NOT NULL,
  recurso_id uuid REFERENCES biblioteca_recursos(id) ON DELETE CASCADE,
  tipo_recurso text,
  fecha timestamptz DEFAULT now()
);

-- Indexes for performance on filtering by user, subject, and level
CREATE INDEX IF NOT EXISTS idx_cobertura_user ON cobertura_curricular(user_id, asignatura, nivel);

-- Enable RLS
ALTER TABLE cobertura_curricular ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own coverage records
CREATE POLICY "Users can view their own coverage"
ON cobertura_curricular FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own coverage records
CREATE POLICY "Users can insert their own coverage"
ON cobertura_curricular FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Note: backend service role key will bypass RLS for inserts/selects if needed.
