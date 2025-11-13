-- Migration: 017_create_medication_configs
-- Created: 2025-11-13
-- Description: Criar tabela de configurações de medicamentos (Remote Config)
-- Parte de C1 - Onboarding 5 Core (migration esquecida)

-- ============================================================================
-- TABELA: medication_configs
-- ============================================================================
-- Armazena configurações de medicamentos disponíveis no app
-- Permite adicionar novos medicamentos e doses sem atualizar o app

create table if not exists medication_configs (
  id text primary key,
  name text not null,
  generic_name text not null,
  available_doses numeric[] not null,
  unit text not null default 'mg',
  frequency text not null default 'weekly',
  featured boolean default false,
  enabled boolean default true,
  updated_at timestamptz default now()
);

-- Popular com dados iniciais
insert into medication_configs (id, name, generic_name, available_doses, featured, enabled) values
('mounjaro', 'Mounjaro', 'Tirzepatida', ARRAY[2.5, 5, 7.5, 10, 12.5, 15], true, true),
('retatrutida', 'Retatrutida', 'Retatrutida', ARRAY[2, 4, 6, 8, 10, 12], true, true),
('ozempic', 'Ozempic', 'Semaglutida', ARRAY[0.25, 0.5, 1, 2], false, true)
on conflict (id) do nothing; -- Evitar erro se dados já existirem

-- Row Level Security (RLS)
alter table medication_configs enable row level security;

-- Política: leitura pública (qualquer usuário autenticado pode ler)
create policy "public_read" on medication_configs 
  for select 
  using (true);

-- Política: escrita apenas para service_role (admin via Supabase Dashboard)
-- Não cria política de insert/update para usuários comuns

-- Índice para busca por featured
create index if not exists idx_medication_configs_featured 
  on medication_configs(featured, enabled);

-- Comentários para documentação
comment on table medication_configs is 'Configurações de medicamentos - Remote Config para atualizar doses e medicamentos sem app update';
comment on column medication_configs.available_doses is 'Array de doses disponíveis em mg';
comment on column medication_configs.featured is 'Se true, aparece em destaque no onboarding';
comment on column medication_configs.enabled is 'Se false, medicamento não aparece no app';

