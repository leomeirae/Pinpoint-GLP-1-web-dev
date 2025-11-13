# C1 - Onboarding Core (5 telas) + Hooks

## Contexto

Refatorar o onboarding atual (23 telas) para um fluxo essencial de 5 telas core, com hooks opcionais entre passos que **não coletam dados** e **não alteram o progresso**.

**Estimativa:** 20 horas  
**Branch:** `refactor/onboarding-5-core`  
**Base:** `cleanup/remove-nutrition-ai`

---

## Fase 0: Pré-requisito - Gate de Design (Bloqueante)

**Saída obrigatória antes de iniciar C1:**
- [ ] Congelar design tokens no Stitch/Figma:
  - Cores (primárias, secundárias, feedback, dark mode)
  - Tipografia (famílias, tamanhos, pesos, line-heights)
  - Espaçamentos (4, 8, 12, 16, 24, 32, 48, 64)
  - Raios de borda (0, 4, 8, 12, 16, 999)
  - Sombras (elevação 1-5)
- [ ] Prancha de componentes base aprovados:
  - Botões (primary, secondary, tertiary, ghost)
  - Inputs (text, picker, checkbox)
  - Cards e containers
  - Ícones (Phosphor, set mínimo necessário)
- [ ] Documentação de tokens exportada (JSON ou constants file)
- [ ] Aprovação formal de design lead ou stakeholder

**Rationale:** Evitar retrabalho nas 5 telas do onboarding devido a mudanças de design durante implementação.

---

## Fase 1: Setup e Planejamento (2h)

### Criar feature flag e estrutura
- [ ] Adicionar `FF_ONBOARDING_5_CORE` em `lib/feature-flags.ts` (default: false)
- [ ] Criar branch `refactor/onboarding-5-core` a partir de `cleanup/remove-nutrition-ai`
- [ ] Criar estrutura de pastas `app/(onboarding)/`
- [ ] Criar `hooks/OnboardingContext.tsx` para gerenciar estado global

---

## Fase 2: Remote Config - Medicamentos (2h)

### Criar tabela medication_configs no Supabase
- [ ] Criar migration `create_medication_configs.sql`:
  ```sql
  create table medication_configs (
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
  
  alter table medication_configs enable row level security;
  create policy "public_read" on medication_configs for select using (true);
  
  -- Popular com dados iniciais
  insert into medication_configs (id, name, generic_name, available_doses, featured) values
  ('mounjaro', 'Mounjaro', 'Tirzepatida', ARRAY[2.5, 5, 7.5, 10, 12.5, 15], true),
  ('retatrutida', 'Retatrutida', 'Retatrutida', ARRAY[2, 4, 6, 8, 10, 12], true),
  ('ozempic', 'Ozempic', 'Semaglutida', ARRAY[0.25, 0.5, 1, 2], false),
  ('saxenda', 'Saxenda', 'Liraglutida', ARRAY[0.6, 1.2, 1.8, 2.4, 3.0], false),
  ('wegovy', 'Wegovy', 'Semaglutida', ARRAY[0.25, 0.5, 1, 1.7, 2.4], false),
  ('zepbound', 'Zepbound', 'Tirzepatida', ARRAY[2.5, 5, 7.5, 10, 12.5, 15], false);
  ```
- [ ] Criar `lib/medicationConfig.ts`:
  - Função `fetchMedicationConfigs()` para buscar do Supabase
  - Fallback local em `constants/medications.ts` com dados padrão
  - Cache em AsyncStorage com TTL de 24h
  - Sincronização silenciosa ao abrir app

---

## Fase 3: Componentes Reutilizáveis (3h)

### Criar componentes base em `components/onboarding/`
- [ ] **ProgressIndicator.tsx** (1h)
  - 5 dots indicando progresso (1-5)
  - Animação suave ao avançar
  - Acessibilidade: labels descritivos
- [ ] **OnboardingButton.tsx** (30min)
  - Variantes: primary, secondary, ghost
  - Estados: default, disabled, loading
  - Touch area ≥ 44×44px
- [ ] **DosageSelector.tsx** (1h)
  - Grid de doses condicionadas por medicamento
  - Validação visual (doses válidas destacadas)
  - Acessibilidade: labels claros
- [ ] **DayPicker.tsx** (30min)
  - Seletor de dia da semana (seg-dom)
  - Visual claro e intuitivo
  - Formato PT-BR

---

## Fase 4: OnboardingContext (2h)

### Criar Context para gerenciar estado
- [ ] Criar `hooks/OnboardingContext.tsx`:
  ```typescript
  interface OnboardingState {
    // Dados coletados
    medication?: string;
    dosage?: number;
    preferredDay?: number; // 0-6 (dom-sab)
    preferredTime?: string; // HH:mm
    consentVersion?: string;
    consentAcceptedAt?: string;
    analyticsOptIn?: boolean;
    
    // Estado do fluxo
    currentStep: number; // 1-5
    isGuestMode: boolean;
  }
  ```
- [ ] Implementar funções:
  - `nextStep()`: avançar para próxima tela
  - `prevStep()`: voltar para tela anterior
  - `saveData()`: persistir em AsyncStorage
  - `loadData()`: carregar dados salvos
  - `reset()`: limpar dados (para modo convidado)
- [ ] Provider wrapper: `<OnboardingProvider>`

---

## Fase 5: Implementar Telas Core (8h)

### Tela 1: Welcome.tsx (1h)
- [ ] Layout: Ilustração + texto + botão "Começar"
- [ ] Copy: "Acompanhe seu tratamento com Mounjaro/Retatrutida"
- [ ] Ícones: Phosphor
- [ ] Dark mode support
- [ ] SafeArea implementado

### Tela 2: Compliance.tsx (2h)
- [ ] Disclaimer clínico (texto revisado por advogado/médico)
- [ ] Checkbox LGPD obrigatório: "Li e aceito os termos"
- [ ] Link para Política de Privacidade (abre em modal ou webview)
- [ ] Checkbox opt-in analytics: "Compartilhar dados anônimos de uso"
- [ ] Validação: só avança se aceitar termos
- [ ] Persistir: `consentVersion`, `consentAcceptedAt`, `analyticsOptIn`

### Tela 3: MedicationDose.tsx (3h)
- [ ] **Passo 1:** Selecionar medicamento
  - Grid de cards com medicamentos (buscar de `medication_configs`)
  - Destacar Mounjaro e Retatrutida (badges "Popular" ou "Novo")
  - Ícones Phosphor por medicamento
- [ ] **Passo 2:** Selecionar dose condicionada
  - Lista de doses muda dinamicamente conforme medicamento
  - Usar componente `DosageSelector`
  - Validação: impedir doses inválidas
- [ ] **Regra crítica:** Sem opção "diária" (apenas semanal para GLP-1)
- [ ] Persistir: `medication`, `dosage`, `frequency: 'weekly'`

### Tela 4: Schedule.tsx (1h)
- [ ] Day picker: "Qual dia da semana você aplica?"
  - Usar componente `DayPicker`
  - Formato: Segunda, Terça, Quarta, etc.
- [ ] Time picker: "Que horas prefere ser lembrado?"
  - Formato 24h (ex: 18:00)
  - Usar `@react-native-community/datetimepicker`
- [ ] Preview: "Próxima aplicação: Sexta, 18:00"
  - Calcular próxima ocorrência baseado em `preferredDay` e `preferredTime`
- [ ] Persistir: `preferredDay` (0-6), `preferredTime` (HH:mm)

### Tela 5: Permissions.tsx (1h)
- [ ] UI graciosa (não assustadora)
- [ ] Explicação clara: "Nunca esqueça sua dose semanal"
- [ ] Botão "Permitir Notificações" (primary)
- [ ] Botão "Pular" (secondary, visível)
- [ ] Se permitir: agendar primeira notificação semanal (integração com C2)
- [ ] Finalizar onboarding: redirecionar para dashboard

---

## Fase 6: Hook FeatureHook (2h)

### Implementar FeatureHook.tsx
- [ ] **Quando:** Entre Schedule (Tela 4) e Permissions (Tela 5)
- [ ] **Propósito:** Apresentar features opcionais (Custos, Álcool, Pausas)
- [ ] Cards informativos (não formulários):
  - Card "Custos": "Acompanhe seus gastos com medicamentos"
  - Card "Álcool": "Registre consumo para análise de padrões"
  - Card "Pausas": "Pause o tratamento quando necessário"
- [ ] Botão: "Ver Depois" (continua sem coletar dados)
- [ ] Não altera o progresso do onboarding
- [ ] Apenas informa que as features existem

---

## Fase 7: Integração com Backend (2h)

### Atualizar schema e hooks
- [ ] Criar migration para adicionar campos em `users`:
  ```sql
  alter table users add column if not exists consent_version text;
  alter table users add column if not exists consent_accepted_at timestamptz;
  alter table users add column if not exists analytics_opt_in boolean default false;
  alter table users add column if not exists preferred_day int check (preferred_day >= 0 and preferred_day <= 6);
  alter table users add column if not exists preferred_time text;
  ```
- [ ] Atualizar `hooks/useOnboarding.ts`:
  - Ajustar `saveOnboardingData()` para novos campos
  - Suportar modo convidado (`isGuestMode: true`)
  - Se modo convidado: salvar apenas em AsyncStorage
  - Se autenticado: salvar em Supabase

---

## Fase 8: Modo Convidado (Deferred Sign-Up) (2h)

### Implementar modo convidado
- [ ] Permitir completar onboarding sem login
- [ ] Dados armazenados localmente em AsyncStorage com flag `isGuestMode: true`
- [ ] **SEM LIMITES RÍGIDOS:** Não impor "7 dias" ou "5 registros"
- [ ] Modal ao final do onboarding: "Criar conta para backup automático" (pode pular)
- [ ] Migração de dados ao criar conta:
  - Migrar medicação e doses
  - Migrar lembretes configurados
  - Migrar aplicações registradas (se houver)
  - Migrar pesos registrados (se houver)
- [ ] UX de migração:
  - Loading: "Sincronizando seus dados..."
  - Sucesso: "Tudo pronto! Seus dados estão seguros."
  - Erro: Retry com opção de contatar suporte

---

## Fase 9: Layout e Navegação (1h)

### Criar layout do grupo onboarding
- [ ] Criar `app/(onboarding)/_layout.tsx`:
  - Stack navigator para as 5 telas
  - Header com `ProgressIndicator`
  - Botão "Voltar" (exceto na primeira tela)
- [ ] Integrar com roteamento existente:
  - Se `FF_ONBOARDING_5_CORE === true`: usar novo fluxo
  - Se `false`: manter fluxo antigo (23 telas)

---

## Fase 10: Testes e Validação (2h)

### Testes funcionais
- [ ] Testar fluxo completo 1→5
- [ ] Testar navegação back/forward
- [ ] Testar validações (não avançar sem dados obrigatórios)
- [ ] Testar persistência (fechar app e reabrir)
- [ ] Testar modo convidado (completar sem login)
- [ ] Testar migração de dados (convidado → autenticado)
- [ ] Testar dark mode em todas as telas
- [ ] Testar acessibilidade:
  - Contraste ≥ 4.5:1 (AA)
  - Touch areas ≥ 44×44px
  - Labels descritivos (VoiceOver/TalkBack)
- [ ] Testar iOS e Android

---

## Definition of Done

- [ ] 5 telas core implementadas e funcionais
- [ ] Hook entre passos (FeatureHook) implementado (sem coleta de dados)
- [ ] Sem frequência "diária" (apenas semanal)
- [ ] Doses condicionadas por medicamento (Mounjaro/Retatrutida em destaque)
- [ ] Remote Config para medicamentos funcionando (Supabase + fallback local)
- [ ] Persistência de dados: `preferredDay`, `preferredTime`, `consentVersion`, `consentAcceptedAt`, `analyticsOptIn`
- [ ] Modo convidado funcionando (deferred sign-up)
- [ ] Migração de dados convidado → autenticado implementada
- [ ] Confirmação de "Próxima aplicação" ao final
- [ ] Onboarding finaliza na Home (dashboard)
- [ ] PT-BR clínico e claro (sem emojis)
- [ ] Ícones Phosphor exclusivamente
- [ ] Contraste AA (4.5:1)
- [ ] Dark mode funcional
- [ ] SafeArea em todas as telas
- [ ] Builds iOS/Android sem erros
- [ ] Feature flag `FF_ONBOARDING_5_CORE` implementada

---

## Riscos Identificados

**Médio:** Mudança significativa na UX (usuários podem estranhar fluxo mais curto)  
**Mitigação:** Feature flag permite rollback

**Médio:** Migração de dados de onboarding antigo  
**Mitigação:** Manter compatibilidade com dados existentes

**Baixo:** Remote Config pode falhar (sem internet)  
**Mitigação:** Fallback local sempre disponível

---

## To-dos

- [ ] Verificar pré-requisito de Design Gate (tokens congelados)
- [ ] Criar feature flag `FF_ONBOARDING_5_CORE`
- [ ] Criar branch `refactor/onboarding-5-core`
- [ ] Criar estrutura de pastas `app/(onboarding)/`
- [ ] Criar migration para tabela `medication_configs`
- [ ] Criar `lib/medicationConfig.ts` com fallback local
- [ ] Criar componentes reutilizáveis (ProgressIndicator, OnboardingButton, DosageSelector, DayPicker)
- [ ] Criar `OnboardingContext.tsx` para gerenciar estado
- [ ] Implementar Welcome.tsx
- [ ] Implementar Compliance.tsx
- [ ] Implementar MedicationDose.tsx
- [ ] Implementar Schedule.tsx
- [ ] Implementar Permissions.tsx
- [ ] Implementar FeatureHook.tsx
- [ ] Criar migration para novos campos em `users`
- [ ] Atualizar `useOnboarding.ts` para novos campos e modo convidado
- [ ] Implementar modo convidado (deferred sign-up)
- [ ] Criar `app/(onboarding)/_layout.tsx`
- [ ] Integrar com roteamento existente (feature flag)
- [ ] Testar fluxo completo e validações
- [ ] Testar modo convidado e migração de dados
- [ ] Testar acessibilidade e dark mode
- [ ] Testar iOS e Android

