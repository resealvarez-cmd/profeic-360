-- ============================================
-- SISTEMA DE LOGROS Y ONBOARDING TOUR
-- Migration: 20260310_logros_onboarding.sql
-- ============================================

-- 1. TABLA DE LOGROS
CREATE TABLE IF NOT EXISTS logros_usuario (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  tipo_logro text NOT NULL,  -- PRIMER_RECURSO | COBERTURA_20 | COBERTURA_50 | COBERTURA_100
  asignatura text,
  nivel text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tipo_logro, asignatura, nivel)
);

ALTER TABLE logros_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_logros_select" ON logros_usuario
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_own_logros_insert" ON logros_usuario
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. FLAG ONBOARDING TOUR EN PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_completed_tour boolean DEFAULT false;
