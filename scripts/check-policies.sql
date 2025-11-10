-- Script para verificar TODAS as RLS policies nas tabelas
-- Execute no Supabase SQL Editor

SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'medications',
    'weight_logs',
    'medication_applications',
    'side_effects',
    'settings',
    'achievements',
    'scheduled_notifications',
    'subscriptions'
  )
ORDER BY tablename, policyname;
