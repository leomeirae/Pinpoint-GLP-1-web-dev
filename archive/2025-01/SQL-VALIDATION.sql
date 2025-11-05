-- SQL VALIDATION - P0
-- Scripts SQL para validar implementação P0

-- ============================================
-- 1. VALIDAÇÃO DE SUBSCRIPTIONS
-- ============================================

-- Verificar se tabela subscriptions existe e tem campos corretos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Verificar se VIEW current_entitlement existe
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'current_entitlement';

-- Verificar se RPC get_entitlement existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_entitlement';

-- Verificar índices em subscriptions
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'subscriptions';

-- Verificar políticas RLS em subscriptions
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'subscriptions';

-- ============================================
-- 2. VALIDAÇÃO DE WEIGHT_LOGS
-- ============================================

-- Verificar se coluna source existe
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'weight_logs'
  AND column_name = 'source';

-- Verificar índice único para onboarding
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'weight_logs'
  AND indexname LIKE '%onboarding%';

-- Teste: Verificar duplicação de peso inicial
-- Substituir <user_id> e <date> pelos valores de teste
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT date) as datas_distintas
FROM weight_logs
WHERE user_id = '<user_id>'::uuid
  AND source = 'onboarding';

-- Esperado: total_registros <= datas_distintas (sem duplicação por data)

-- ============================================
-- 3. VALIDAÇÃO DE ONBOARDING (USERS)
-- ============================================

-- Verificar campos de onboarding em users
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('height', 'start_weight', 'target_weight', 'onboarding_completed');

-- Teste: Verificar UPSERT idempotente
-- Substituir <clerk_id> pelo clerk_id de teste
SELECT 
  COUNT(*) as total_users
FROM users
WHERE clerk_id = '<clerk_id>';

-- Esperado: total_users = 1 (sem duplicação)

-- ============================================
-- 4. VALIDAÇÃO DE TRIAL ÚNICO
-- ============================================

-- Teste: Verificar trial único por usuário
-- Substituir <user_id> pelo user_id de teste
SELECT 
  COUNT(*) as trials_ativos
FROM subscriptions
WHERE user_id = '<user_id>'::uuid
  AND status = 'trial'
  AND trial_ends_at > NOW();

-- Esperado: trials_ativos <= 1

-- ============================================
-- 5. VALIDAÇÃO DE RLS
-- ============================================

-- Verificar se RLS está habilitado em subscriptions
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'subscriptions';

-- Esperado: rowsecurity = true

-- Verificar políticas RLS em todas as tabelas críticas
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('subscriptions', 'users', 'weight_logs', 'medications')
ORDER BY tablename, policyname;

-- ============================================
-- 6. TESTE DE RPC get_entitlement()
-- ============================================

-- IMPORTANTE: Executar autenticado como usuário de teste
-- Substituir <clerk_id> pelo clerk_id de teste

-- Primeiro, obter user_id do usuário de teste
SELECT id, clerk_id 
FROM users 
WHERE clerk_id = '<clerk_id>';

-- Criar trial de teste (se necessário)
-- INSERT INTO subscriptions (user_id, status, tier, trial_started_at, trial_ends_at, started_at)
-- VALUES (
--   '<user_id>'::uuid,
--   'trial',
--   'plus',
--   NOW(),
--   NOW() + INTERVAL '7 days',
--   NOW()
-- );

-- Testar RPC get_entitlement()
-- Deve retornar entitlement do usuário autenticado
SELECT * FROM get_entitlement();

-- Esperado: Retorna linha com has_plus baseado em trial ativo ou assinatura ativa

-- ============================================
-- 7. VALIDAÇÃO DE VIEW current_entitlement
-- ============================================

-- Testar VIEW diretamente (requer autenticação)
SELECT * FROM current_entitlement;

-- Esperado: Retorna entitlement do usuário autenticado

-- ============================================
-- 8. VALIDAÇÃO DE INTEGRIDADE
-- ============================================

-- Verificar foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('subscriptions', 'weight_logs', 'medications')
ORDER BY tc.table_name;

-- Verificar constraints de check
SELECT
  conname,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid IN (
  SELECT oid FROM pg_class WHERE relname IN ('subscriptions', 'weight_logs')
)
AND contype = 'c';

-- ============================================
-- 9. CLEANUP (OPCIONAL - PARA TESTES)
-- ============================================

-- ATENÇÃO: Usar apenas em ambiente de teste!

-- Limpar dados de teste de um usuário específico
-- DELETE FROM subscriptions WHERE user_id = '<user_id>'::uuid;
-- DELETE FROM weight_logs WHERE user_id = '<user_id>'::uuid AND source = 'onboarding';
-- DELETE FROM medications WHERE user_id = '<user_id>'::uuid;
-- UPDATE users SET onboarding_completed = false WHERE id = '<user_id>'::uuid;

---

-- INSTRUÇÕES DE USO:
-- 1. Executar cada seção conforme necessário
-- 2. Substituir placeholders <user_id>, <clerk_id>, <date> pelos valores reais
-- 3. Comparar resultados com "Esperado" em cada teste
-- 4. Documentar falhas em P0-IMPLEMENTATION-SUMMARY.md

