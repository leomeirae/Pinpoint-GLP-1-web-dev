-- 016_consent_history.sql
-- Migration para criar tabela de histórico de consentimentos
-- Parte de C6 - Analytics (Opt-in) - compliance LGPD/GDPR

-- Criar tabela consent_history se não existir
create table if not exists consent_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  consent_type text not null,  -- 'analytics', 'finance_r_per_kg', 'notifications'
  action text not null,          -- 'granted', 'revoked'
  consent_version text not null, -- '1.0.0'
  metadata jsonb,                -- dados adicionais (timestamp, source, etc.)
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table consent_history enable row level security;

-- Políticas de acesso (somente próprio usuário)
create policy "own-select" on consent_history 
  for select 
  using (auth.uid() = user_id);

create policy "own-insert" on consent_history 
  for insert 
  with check (auth.uid() = user_id);

-- Índice para performance (buscar histórico do usuário)
create index if not exists idx_consent_history_user_created 
  on consent_history(user_id, created_at desc);

-- Adicionar campo analytics_opt_in na tabela users (se não existir)
alter table users add column if not exists analytics_opt_in boolean default false;

-- Comentários para documentação
comment on table consent_history is 'Histórico de consentimentos do usuário (LGPD/GDPR compliance)';
comment on column consent_history.consent_type is 'Tipo de consentimento: analytics, finance_r_per_kg, notifications';
comment on column consent_history.action is 'Ação: granted (concedido) ou revoked (revogado)';
comment on column consent_history.consent_version is 'Versão do termo de consentimento aceito';
comment on column consent_history.metadata is 'Dados adicionais em JSON (timestamp, source, device, etc.)';

