-- TASK-09: Sistema de Streaks + Gamificação (VERSÃO CORRIGIDA)
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- Adicionar campos de streaks na tabela users (um por vez para evitar erros)
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_weight_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_weight_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_weight_log_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_application_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_application_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_experience_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Criar tabela de streaks diários
CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight_logged BOOLEAN DEFAULT FALSE,
  application_logged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user ON daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_date ON daily_streaks(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_date ON daily_streaks(user_id, date DESC);

-- Habilitar RLS
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own streaks" ON daily_streaks;
DROP POLICY IF EXISTS "Users can manage own streaks" ON daily_streaks;

-- Política para visualização (método simplificado e compatível)
CREATE POLICY "Users can view own streaks"
  ON daily_streaks FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Política para inserção
CREATE POLICY "Users can insert own streaks"
  ON daily_streaks FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Política para atualização
CREATE POLICY "Users can update own streaks"
  ON daily_streaks FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Política para deleção
CREATE POLICY "Users can delete own streaks"
  ON daily_streaks FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );
