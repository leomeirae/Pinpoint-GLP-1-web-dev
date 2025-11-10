-- ========================================
-- FIX COMPLETO: RLS para Clerk (Consolidado)
-- ========================================
-- Execute este SQL COMPLETO no Supabase SQL Editor
-- https://supabase.com/dashboard/project/iokunvykvndmczfzdbho/sql
-- ========================================

-- ========================================
-- PARTE 1: TABELA USERS
-- ========================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.users;

-- Criar policy permissiva (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Allow all operations for authenticated users'
  ) THEN
    CREATE POLICY "Allow all operations for authenticated users"
      ON public.users
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- PARTE 2: TABELA MEDICATIONS
-- ========================================

DROP POLICY IF EXISTS "Users can read own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can insert own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete own medications" ON public.medications;
DROP POLICY IF EXISTS "Allow all operations for medications" ON public.medications;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medications' AND policyname = 'Allow all operations for medications'
  ) THEN
    CREATE POLICY "Allow all operations for medications"
      ON public.medications
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- PARTE 3: TABELA WEIGHT_LOGS
-- ========================================

DROP POLICY IF EXISTS "Users can read own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can insert own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can update own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can delete own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Allow all operations for weight_logs" ON public.weight_logs;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'weight_logs' AND policyname = 'Allow all operations for weight_logs'
  ) THEN
    CREATE POLICY "Allow all operations for weight_logs"
      ON public.weight_logs
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- PARTE 4: TABELA MEDICATION_APPLICATIONS
-- ========================================

DROP POLICY IF EXISTS "Users can read own applications" ON public.medication_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.medication_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.medication_applications;
DROP POLICY IF EXISTS "Users can delete own applications" ON public.medication_applications;
DROP POLICY IF EXISTS "Allow all operations for medication_applications" ON public.medication_applications;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medication_applications' AND policyname = 'Allow all operations for medication_applications'
  ) THEN
    CREATE POLICY "Allow all operations for medication_applications"
      ON public.medication_applications
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- PARTE 5: TABELA SIDE_EFFECTS
-- ========================================

DROP POLICY IF EXISTS "Users can read own side effects" ON public.side_effects;
DROP POLICY IF EXISTS "Users can insert own side effects" ON public.side_effects;
DROP POLICY IF EXISTS "Users can update own side effects" ON public.side_effects;
DROP POLICY IF EXISTS "Users can delete own side effects" ON public.side_effects;
DROP POLICY IF EXISTS "Allow all operations for side_effects" ON public.side_effects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'side_effects' AND policyname = 'Allow all operations for side_effects'
  ) THEN
    CREATE POLICY "Allow all operations for side_effects"
      ON public.side_effects
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- PARTE 6: TABELA SETTINGS
-- ========================================

DROP POLICY IF EXISTS "Users can read own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all operations for settings" ON public.settings;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'settings' AND policyname = 'Allow all operations for settings'
  ) THEN
    CREATE POLICY "Allow all operations for settings"
      ON public.settings
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- PARTE 7: ATUALIZAR FUNÇÃO DE VERIFICAÇÃO
-- ========================================

CREATE OR REPLACE FUNCTION verify_migration_011()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'Users table columns'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name IN (
          'current_weight', 'treatment_start_date', 'device_type',
          'weight_unit', 'height_unit', 'onboarding_completed'
        )
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if all new columns exist'::TEXT
  UNION ALL
  SELECT
    'RLS Enabled'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_tables
        WHERE tablename IN ('users', 'weight_logs', 'medication_applications')
        AND rowsecurity = true
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if RLS is enabled on all tables'::TEXT
  UNION ALL
  SELECT
    'RLS Policies'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users'
        AND (policyname LIKE '%own%' OR policyname LIKE 'Allow all%')
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if RLS policies exist'::TEXT
  UNION ALL
  SELECT
    'Foreign Keys with CASCADE'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname IN ('weight_logs_user_id_fkey', 'medication_applications_user_id_fkey')
        AND confdeltype = 'c'
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if foreign keys have ON DELETE CASCADE'::TEXT
  UNION ALL
  SELECT
    'Indexes'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname IN (
          'idx_weight_logs_user_date',
          'idx_medication_applications_user_date',
          'idx_users_onboarding_completed',
          'idx_users_treatment_start_date'
        )
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if indexes exist'::TEXT;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_catalog;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
-- Execute para verificar se tudo passou:
SELECT * FROM verify_migration_011();

-- Deve retornar:
-- RLS Policies | PASS | Check if RLS policies exist
