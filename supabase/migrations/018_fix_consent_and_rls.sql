-- Migration: 018_fix_consent_and_rls
-- Created: 2025-11-13
-- Description: Corrigir campo consent_accepted_at e RLS de consent_history para funcionar com Clerk

-- ============================================================================
-- FIX 1: Adicionar campo consent_accepted_at na tabela users
-- ============================================================================
-- Este campo é usado no onboarding para registrar quando o usuário aceitou os termos

alter table users add column if not exists consent_accepted_at timestamptz;

comment on column users.consent_accepted_at is 'Timestamp de quando o usuário aceitou os termos de consentimento no onboarding';

-- ============================================================================
-- FIX 2: Corrigir RLS policies de consent_history para funcionar com Clerk
-- ============================================================================
-- Problema: auth.uid() retorna NULL para usuários autenticados via Clerk
-- Solução TEMPORÁRIA: Desabilitar RLS e validar no app layer
-- TODO: Implementar Supabase Edge Function ou migrar para auth.users

-- Remover policies antigas que usam auth.uid()
drop policy if exists "own-select" on consent_history;
drop policy if exists "own-insert" on consent_history;

-- WORKAROUND: Desabilitar RLS para consent_history
-- IMPORTANTE: Isso significa que qualquer requisição com a service_role key 
-- pode acessar todos os dados. A validação deve ser feita no app layer.
alter table consent_history disable row level security;

comment on table consent_history is 'ATENÇÃO: RLS desabilitado temporariamente devido a incompatibilidade com Clerk Auth. Validação feita no app layer.';

-- ============================================================================
-- VERIFICAÇÕES
-- ============================================================================

-- Verificar que as colunas existem
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'consent_accepted_at'
  ) then
    raise exception 'Coluna consent_accepted_at não foi criada';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'analytics_opt_in'
  ) then
    raise exception 'Coluna analytics_opt_in não existe (execute migration 016 primeiro)';
  end if;

  raise notice 'Migration 018 concluída com sucesso';
end $$;

