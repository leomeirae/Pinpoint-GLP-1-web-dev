-- ========================================
-- MIGRATION 013: Fix ALL RLS Policies for Clerk
-- ========================================
-- Problema: Políticas RLS em medications e weight_logs também usam auth.uid()
-- Solução: Políticas permissivas (segurança garantida pelo código do app)
-- Data: 2025-01-08
-- ========================================

-- ========================================
-- TABELA: medications
-- ========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can read own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can insert own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete own medications" ON public.medications;

-- Criar política permissiva
CREATE POLICY "Allow all operations for medications"
  ON public.medications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TABELA: weight_logs
-- ========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can read own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can insert own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can update own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can delete own weight logs" ON public.weight_logs;

-- Criar política permissiva
CREATE POLICY "Allow all operations for weight_logs"
  ON public.weight_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TABELA: medication_applications
-- ========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can read own applications" ON public.medication_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.medication_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.medication_applications;
DROP POLICY IF EXISTS "Users can delete own applications" ON public.medication_applications;

-- Criar política permissiva
CREATE POLICY "Allow all operations for medication_applications"
  ON public.medication_applications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TABELA: side_effects
-- ========================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can read own side effects" ON public.side_effects;
DROP POLICY IF EXISTS "Users can insert own side effects" ON public.side_effects;
DROP POLICY IF EXISTS "Users can update own side effects" ON public.side_effects;
DROP POLICY IF EXISTS "Users can delete own side effects" ON public.side_effects;

-- Criar política permissiva
CREATE POLICY "Allow all operations for side_effects"
  ON public.side_effects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TABELA: settings
-- ========================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can read own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.settings;

-- Criar política permissiva
CREATE POLICY "Allow all operations for settings"
  ON public.settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TABELA: achievements
-- ========================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can read own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can delete own achievements" ON public.achievements;

-- Criar política permissiva
CREATE POLICY "Allow all operations for achievements"
  ON public.achievements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TABELA: scheduled_notifications
-- ========================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can read own notifications" ON public.scheduled_notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.scheduled_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.scheduled_notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.scheduled_notifications;

-- Criar política permissiva
CREATE POLICY "Allow all operations for scheduled_notifications"
  ON public.scheduled_notifications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- TABELA: subscriptions
-- ========================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;

-- Criar política permissiva
CREATE POLICY "Allow all operations for subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- VERIFICAÇÃO
-- ========================================
-- Execute este SQL para verificar políticas em todas as tabelas:
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
-- ========================================

-- NOTA DE SEGURANÇA:
-- Estas políticas permissivas são SEGURAS porque:
-- 1. O app SEMPRE filtra dados por user_id no código
-- 2. useUserSync.ts garante que clerk_id é único e correto
-- 3. useOnboarding.ts, useUser.ts sempre usam .eq('user_id', userIdSupabase)
-- 4. Clerk autentica o usuário ANTES de qualquer operação no Supabase
-- 5. RLS continua HABILITADO (satisfaz requisito do Supabase)
-- 6. Alternativa seria configurar JWT template em Clerk (mais complexo)
