# C5 - Pausas e Álcool

## Contexto

Implementar funcionalidades para rastrear pausas no tratamento (com desligamento de lembretes) e consumo de álcool (com overlays discretos em gráficos).

**Estimativa:** 12 horas  
**Branch:** `feature/pauses-alcohol`  
**Base:** `feature/weekly-reminders` (após C2)

**Dependências:**
- C1 (Onboarding) - completo
- C2 (Notificações) - completo

---

## Feature Flag

**Flag:** `FF_PAUSES_ALCOHOL` (default: `false`)

**Comportamento:**
- Quando `FF_PAUSES_ALCOHOL === false`:
  - Rotas `/treatment/pause` e `/habits/alcohol` ocultas
  - Card de Quick Actions não mostra ações "Pausar" e "Álcool"
  - Nenhum overlay de álcool em gráficos
  - Schemas de DB criados mas features não expostas
- Quando `FF_PAUSES_ALCOHOL === true`:
  - Rotas acessíveis
  - Quick Actions exibem pausas e álcool
  - Overlays de álcool visíveis em gráficos

**Rollout:**
1. Testar internamente com flag ativada
2. Habilitar para 25% dos usuários
3. Monitorar por 1 semana
4. Expandir para 100%

**Critério de aceite:**
- Zero crashes
- Taxa de uso de pausas ≥ 15%
- Taxa de logging de álcool ≥ 20%

---

## Fase 1: Schema de Dados (1h)

### 1.1 Criar Tabelas (1h)
- [ ] Criar migration `supabase/migrations/XXX_create_pauses_alcohol.sql`:
  ```sql
  -- Pausas
  create table treatment_pauses (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null,
    start_date date not null,
    end_date date,
    reason text,
    notes text,
    created_at timestamptz default now()
  );
  
  alter table treatment_pauses enable row level security;
  create policy "own-access" on treatment_pauses for all using (auth.uid()=user_id);
  create index on treatment_pauses(user_id, start_date desc);
  
  -- Álcool
  create table alcohol_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null,
    date date not null unique,
    consumed boolean not null,
    drinks_count int,
    notes text,
    created_at timestamptz default now()
  );
  
  alter table alcohol_logs enable row level security;
  create policy "own-access" on alcohol_logs for all using (auth.uid()=user_id);
  create index on alcohol_logs(user_id, date desc);
  ```
- [ ] Executar migration em development
- [ ] Testar RLS

---

## Fase 2: Implementar Pausas (5h)

### 2.1 Criar Hook (2h)
- [ ] Criar `hooks/useTreatmentPauses.ts`:
  - `usePauses()`: retornar lista de pausas
  - `startPause(reason?, notes?)`: iniciar pausa
  - `endPause(pauseId, endDate)`: encerrar pausa
  - `isCurrentlyPaused()`: verificar se há pausa ativa
  - `getActivePause()`: retornar pausa ativa (se houver)
  - Gerenciar loading e error states

### 2.2 Criar Tela de Pausas (2h)
- [ ] Criar `app/(tabs)/treatment/pause.tsx`:
  - **Se tratamento ativo:**
    - Card: "Tratamento Ativo" (ícone: `PlayCircle`)
    - Botão: "Pausar Tratamento"
    - Ao clicar: Modal com campos:
      - Motivo (opcional): "Viagem", "Efeitos colaterais", "Orientação médica", "Outro"
      - Notas (textarea opcional)
      - Botões: "Confirmar Pausa" / "Cancelar"
  - **Se tratamento pausado:**
    - Card: "Tratamento Pausado desde [data]" (ícone: `PauseCircle`)
    - Mostrar motivo e notas (se houver)
    - Botão: "Retomar Tratamento"
    - Ao clicar: confirmar data de retomada (default: hoje)
  - **Timeline de pausas anteriores:**
    - Lista cronológica reversa
    - Cada item: período (data início - data fim), motivo, duração

### 2.3 Integrar com Notificações (1h)
- [ ] Editar `lib/notifications.ts`:
  - Adicionar `pauseReminders()`: cancelar lembretes semanais
  - Adicionar `resumeReminders(weekday, time)`: reagendar lembretes
- [ ] Ao iniciar pausa:
  - Chamar `pauseReminders()`
  - Mostrar toast: "Lembretes desativados durante a pausa"
- [ ] Ao retomar:
  - Chamar `resumeReminders()` com preferências do usuário
  - Mostrar toast: "Lembretes reativados"

---

## Fase 3: Implementar Álcool (4h)

### 3.1 Criar Hook (1h)
- [ ] Criar `hooks/useAlcoholLogs.ts`:
  - `useAlcoholLogs(startDate?, endDate?)`: retornar logs de álcool
  - `toggleAlcoholForDate(date, consumed, drinksCount?, notes?)`: marcar/desmarcar dia
  - `getLogForDate(date)`: retornar log de um dia específico
  - Gerenciar loading e error states

### 3.2 Criar Tela de Álcool (2h)
- [ ] Criar `app/(tabs)/habits/alcohol.tsx`:
  - Header: "Consumo de Álcool"
  - Disclaimer: "Álcool pode afetar eficácia do tratamento. Consulte seu médico."
  - **Toggle diário:**
    - Pergunta: "Você bebeu álcool hoje?"
    - Botões: SIM / NÃO (toggle visual)
    - Se SIM: mostrar campos opcionais:
      - Quantidade de doses (number input)
      - Notas (textarea: tipo de bebida, contexto, etc.)
  - **Calendário visual:**
    - Mostrar últimos 30 dias
    - Dias com álcool marcados (ícone: `Wine` ou cor diferente)
    - Ao tocar em dia: editar registro daquele dia
  - **Estatísticas simples:**
    - "X dias com álcool nos últimos 30 dias"
    - "Última vez: [data]"

### 3.3 Integrar com Gráficos (1h)
- [ ] Editar `components/results/WeightChart.tsx`:
  - Buscar logs de álcool para datas visíveis no gráfico
  - Adicionar overlays discretos (ícone `Wine` ou linha pontilhada vertical) nos dias com álcool
  - Tooltip ao tocar: "Álcool consumido neste dia"
- [ ] Editar `components/dashboard/MedicationLevelsChart.tsx`:
  - Adicionar overlays nos dias com álcool (mesmo padrão)

---

## Fase 4: Adicionar aos Quick Actions (1h)

### 4.1 Integração (1h)
- [ ] Editar `components/dashboard/QuickActionsCard.tsx`:
  - Adicionar ação: "Pausar Tratamento" (ícone: `Pause`)
    - Deep-link: `/(tabs)/treatment/pause`
    - Condicionada por `FF_PAUSES_ALCOHOL`
  - Adicionar ação: "Marcar Álcool" (ícone: `Wine`)
    - Deep-link: `/(tabs)/habits/alcohol`
    - Condicionada por `FF_PAUSES_ALCOHOL`
- [ ] Testar deep-links

---

## Fase 5: Notificação de Pausa Prolongada (1h)

### 5.1 Implementar Alerta (1h)
- [ ] Criar lógica em `lib/notifications.ts`:
  - Agendar notificação 7 dias após iniciar pausa
  - Título: "Tratamento pausado há 7 dias"
  - Corpo: "Deseja retomar o tratamento?"
  - Deep-link: `/(tabs)/treatment/pause`
- [ ] Cancelar notificação se usuário retomar antes de 7 dias

---

## Fase 6: Testes e Validação (2h)

### 6.1 Testes de Pausas (1h)
- [ ] Testar iniciar pausa (com e sem motivo/notas)
- [ ] Testar retomar tratamento
- [ ] Testar cancelamento de lembretes ao pausar
- [ ] Testar reagendamento de lembretes ao retomar
- [ ] Testar notificação após 7 dias de pausa
- [ ] Testar timeline de pausas anteriores
- [ ] Testar feature flag (ocultar/exibir rotas e ações)

### 6.2 Testes de Álcool (1h)
- [ ] Testar toggle diário (marcar/desmarcar)
- [ ] Testar campos opcionais (quantidade, notas)
- [ ] Testar calendário visual (30 dias)
- [ ] Testar edição de dia anterior
- [ ] Testar overlays em gráficos
- [ ] Testar estatísticas
- [ ] Testar feature flag
- [ ] Testar dark mode
- [ ] Testar acessibilidade
- [ ] Testar iOS e Android

---

## Definition of Done

- [ ] Tabelas `treatment_pauses` e `alcohol_logs` criadas
- [ ] Hook `useTreatmentPauses()` implementado
- [ ] Hook `useAlcoholLogs()` implementado
- [ ] Tela de pausas com timeline
- [ ] Pausar desliga lembretes, retomar religa
- [ ] Notificação após 7 dias de pausa
- [ ] Tela de álcool com toggle diário
- [ ] Calendário visual de 30 dias
- [ ] Overlays discretos em gráficos
- [ ] Quick Actions integradas (condicionadas por flag)
- [ ] Estados persistentes
- [ ] UX simples e rápida (toggle em <2 toques)
- [ ] Feature flag `FF_PAUSES_ALCOHOL` implementada
- [ ] Dark mode funcional
- [ ] Testes iOS/Android passando

---

## Riscos Identificados

**Baixo:** Pausar pode confundir usuários (esquecer de retomar)  
**Mitigação:** Notificação após 7 dias de pausa

**Baixo:** Dados de álcool sensíveis  
**Mitigação:** Disclaimer de privacidade, dados criptografados (Supabase)

**Baixo:** Overlays em gráficos podem poluir visualmente  
**Mitigação:** Ícones discretos, tooltips apenas ao tocar

---

## Arquivos a Criar/Editar

**Criar:**
- `supabase/migrations/XXX_create_pauses_alcohol.sql`
- `hooks/useTreatmentPauses.ts`
- `hooks/useAlcoholLogs.ts`
- `app/(tabs)/treatment/pause.tsx`
- `app/(tabs)/treatment/_layout.tsx`
- `app/(tabs)/habits/alcohol.tsx`
- `app/(tabs)/habits/_layout.tsx`

**Editar:**
- `lib/feature-flags.ts` (adicionar `FF_PAUSES_ALCOHOL`)
- `lib/notifications.ts` (adicionar `pauseReminders()`, `resumeReminders()`)
- `components/results/WeightChart.tsx` (adicionar overlays)
- `components/dashboard/MedicationLevelsChart.tsx` (adicionar overlays)
- `components/dashboard/QuickActionsCard.tsx` (adicionar ações condicionadas)

