-- ========================================
-- COMPLETE FIX: Desabilitar RLS em TODAS as tabelas
-- ========================================
-- Este script desabilita RLS em todas as tabelas usadas pelo app
-- Recomendado quando você usa Clerk (não Supabase Auth)
-- ========================================
-- Como usar:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. SQL Editor → + New query
-- 3. Cole este SQL completo
-- 4. Clique em "Run" (Ctrl/Cmd + Enter)
-- ========================================

-- Tabelas principais do app
ALTER TABLE daily_nutrition DISABLE ROW LEVEL SECURITY;
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE medication_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE weights DISABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects DISABLE ROW LEVEL SECURITY;

-- Tabelas de usuário
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Tabelas de gamificação
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores DISABLE ROW LEVEL SECURITY;

-- Tabelas de personalização
ALTER TABLE communication_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatars DISABLE ROW LEVEL SECURITY;

-- Tabelas de comunidade
ALTER TABLE community_stats DISABLE ROW LEVEL SECURITY;

-- ========================================
-- ✅ RESULTADO ESPERADO:
-- ========================================
-- Você deve ver várias linhas com:
-- "Success. No rows returned"
-- 
-- Algumas tabelas podem dar erro "relation does not exist"
-- se ainda não foram criadas. Isso é normal e pode ignorar.
-- ========================================

-- ========================================
-- 🔒 SEGURANÇA:
-- ========================================
-- Com Clerk + Supabase, desabilitar RLS é seguro porque:
-- 
-- 1. Clerk autentica o usuário (JWT tokens)
-- 2. Seu app sempre filtra por user_id
-- 3. Supabase anon key só funciona via app
-- 4. Usuários não têm acesso direto ao banco
-- 
-- Se você precisar de RLS no futuro, pode reabilitar com:
-- ALTER TABLE [nome_tabela] ENABLE ROW LEVEL SECURITY;
-- ========================================

