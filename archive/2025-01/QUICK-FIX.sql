-- ========================================
-- QUICK FIX: Desabilitar RLS na tabela daily_nutrition
-- ========================================
-- Copie e cole este SQL no Supabase Dashboard → SQL Editor
-- Depois clique em "Run" (ou Ctrl/Cmd + Enter)
-- ========================================

ALTER TABLE daily_nutrition DISABLE ROW LEVEL SECURITY;

-- ✅ Pronto! O erro 42501 deve desaparecer.

