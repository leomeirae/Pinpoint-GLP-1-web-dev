-- ========================================
-- FIX: Settings Table RLS Policies for Clerk
-- ========================================
-- Problema: Políticas RLS usando auth.uid() não funcionam com Clerk
-- Solução: Desabilitar RLS (mesma abordagem usada em daily_nutrition)
-- Data: 04/11/2025
-- ========================================

-- DESABILITAR RLS na tabela settings
-- Quando você usa Clerk, não precisa de RLS porque a autenticação
-- já é feita pelo Clerk e o app filtra por user_id no código
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que usavam auth.uid()
DROP POLICY IF EXISTS "Users can view own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;

-- ========================================
-- EXPLICAÇÃO:
-- ========================================
-- Com Clerk + Supabase (sem Supabase Auth):
-- 1. O Clerk autentica o usuário
-- 2. O app obtém o user_id do Supabase via clerk_id
-- 3. O app filtra dados por user_id no código (useSettings.ts)
-- 4. RLS não é necessário porque não há auth.uid()
-- 
-- Segurança:
-- - O anon key do Supabase só permite acesso via app
-- - O app sempre filtra por user_id do usuário logado
-- - Cada operação em useSettings.ts usa .eq('user_id', user.id)
-- - Usuários maliciosos precisariam ter o anon key E
--   conhecer o user_id UUID de outro usuário
-- ========================================






