-- TASK-09: Sistema de Streaks + Gamificação
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- Adicionar campos de streaks na tabela users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_weight_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_weight_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_weight_log_date DATE,
  ADD COLUMN IF NOT EXISTS current_application_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_application_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_experience_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Criar tabela de streaks diários
CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_logged BOOLEAN DEFAULT FALSE,
  application_logged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user ON daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_date ON daily_streaks(date DESC);

-- Habilitar RLS
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- Política para visualização
DROP POLICY IF EXISTS "Users can view own streaks" ON daily_streaks;
CREATE POLICY "Users can view own streaks"
  ON daily_streaks FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Política para gerenciamento
DROP POLICY IF EXISTS "Users can manage own streaks" ON daily_streaks;
CREATE POLICY "Users can manage own streaks"
  ON daily_streaks FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));
