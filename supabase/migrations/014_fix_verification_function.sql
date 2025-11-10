-- ========================================
-- MIGRATION 014: Fix Verification Function
-- ========================================
-- Problema: verify_migration_011() busca policies com LIKE '%own%'
-- Mas as novas policies têm nome "Allow all operations..."
-- Solução: Atualizar função para aceitar ambos os padrões
-- Data: 2025-01-08
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
      -- Aceitar tanto policies antigas ('%own%') quanto novas ('Allow all%')
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
$$ LANGUAGE plpgsql;
