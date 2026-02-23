-- Migration: Community Features (Corrected)
-- Target: biblioteca_recursos (Unified Table)

-- 1. Add Community Columns
ALTER TABLE biblioteca_recursos 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Profe IC';

-- 2. Create Index for Feed Performance
CREATE INDEX IF NOT EXISTS idx_biblioteca_public ON biblioteca_recursos(is_public) WHERE is_public = TRUE;
