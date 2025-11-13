-- Migration: 015_create_pauses_alcohol
-- Created: 2025-11-13
-- Description: Criar tabelas para pausas no tratamento e logs de álcool (C5)

-- ============================================================================
-- TABELA: treatment_pauses
-- ============================================================================
-- Armazena pausas temporárias no tratamento do usuário
-- Uma pausa ativa tem end_date = NULL

create table if not exists treatment_pauses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  start_date date not null,
  end_date date,  -- NULL = pausa ainda ativa
  reason text,  -- 'efeitos_colaterais', 'viagem', 'orientacao_medica', 'outro'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Constraints
  constraint valid_date_range check (end_date is null or end_date >= start_date),
  constraint no_overlapping_pauses unique(user_id, start_date)
);

-- Índices para performance
create index if not exists idx_treatment_pauses_user_id 
  on treatment_pauses(user_id, start_date desc);
create index if not exists idx_treatment_pauses_active 
  on treatment_pauses(user_id, end_date) where end_date is null;

-- Row Level Security (RLS)
alter table treatment_pauses enable row level security;

create policy "Users can view own pauses"
  on treatment_pauses for select
  using (auth.uid() = user_id);

create policy "Users can insert own pauses"
  on treatment_pauses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pauses"
  on treatment_pauses for update
  using (auth.uid() = user_id);

create policy "Users can delete own pauses"
  on treatment_pauses for delete
  using (auth.uid() = user_id);

-- Trigger para atualizar updated_at
create or replace function update_treatment_pauses_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger treatment_pauses_updated_at
  before update on treatment_pauses
  for each row
  execute function update_treatment_pauses_updated_at();

-- ============================================================================
-- TABELA: alcohol_logs
-- ============================================================================
-- Registra consumo de álcool diário do usuário
-- Um registro por dia por usuário (unique constraint)

create table if not exists alcohol_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  consumed boolean not null default false,
  drinks_count int,  -- Número de doses (opcional)
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Constraints
  constraint valid_drinks_count check (drinks_count is null or drinks_count >= 0),
  constraint one_log_per_day unique(user_id, date)
);

-- Índices para performance
create index if not exists idx_alcohol_logs_user_id 
  on alcohol_logs(user_id, date desc);
create index if not exists idx_alcohol_logs_consumed 
  on alcohol_logs(user_id, date) where consumed = true;

-- Row Level Security (RLS)
alter table alcohol_logs enable row level security;

create policy "Users can view own alcohol logs"
  on alcohol_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own alcohol logs"
  on alcohol_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alcohol logs"
  on alcohol_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own alcohol logs"
  on alcohol_logs for delete
  using (auth.uid() = user_id);

-- Trigger para atualizar updated_at
create or replace function update_alcohol_logs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger alcohol_logs_updated_at
  before update on alcohol_logs
  for each row
  execute function update_alcohol_logs_updated_at();

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para verificar se usuário tem pausa ativa
create or replace function has_active_pause(p_user_id uuid)
returns boolean as $$
begin
  return exists(
    select 1 from treatment_pauses
    where user_id = p_user_id
      and end_date is null
  );
end;
$$ language plpgsql security definer;

-- Função para obter pausa ativa (se houver)
create or replace function get_active_pause(p_user_id uuid)
returns table(
  id uuid,
  start_date date,
  reason text,
  notes text,
  created_at timestamptz
) as $$
begin
  return query
  select 
    tp.id,
    tp.start_date,
    tp.reason,
    tp.notes,
    tp.created_at
  from treatment_pauses tp
  where tp.user_id = p_user_id
    and tp.end_date is null
  limit 1;
end;
$$ language plpgsql security definer;

-- Função para obter datas com consumo de álcool em um range
create or replace function get_alcohol_dates_in_range(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
returns table(log_date date) as $$
begin
  return query
  select al.date
  from alcohol_logs al
  where al.user_id = p_user_id
    and al.consumed = true
    and al.date between p_start_date and p_end_date
  order by al.date asc;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

comment on table treatment_pauses is 'Pausas temporárias no tratamento - quando end_date é NULL, pausa está ativa';
comment on table alcohol_logs is 'Registro diário de consumo de álcool - máximo um registro por dia por usuário';

comment on column treatment_pauses.reason is 'Motivo da pausa: efeitos_colaterais, viagem, orientacao_medica, outro';
comment on column treatment_pauses.end_date is 'NULL indica pausa ativa, data preenchida indica pausa encerrada';
comment on column alcohol_logs.drinks_count is 'Número de doses consumidas (opcional)';
comment on column alcohol_logs.consumed is 'Se false, registro indica dia sem álcool (para tracking)';

