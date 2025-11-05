# Plano de Implementação - Sprint 1: Onboarding Completo (P0-001, P0-002, P0-009)

**Data:** 2025-01-27  
**Branch:** feature/parity-p0  
**Duração Estimada:** 1-2 semanas

---

## Objetivos da Sprint

1. ✅ Integrar todas as 23 telas de onboarding ao fluxo principal
2. ✅ Corrigir progress bar para mostrar "Step X of 23"
3. ✅ Implementar persistência do passo do onboarding
4. ✅ Garantir Health Disclaimer com checkbox obrigatório
5. ✅ Implementar tracking de analytics para onboarding

---

## Status Atual

✅ **Concluído:**
- Sistema de feature flags criado (`lib/feature-flags.ts`)
- Sistema de analytics criado (`lib/analytics.ts`)
- Estrutura base do onboarding-flow.tsx refatorada
- Todos os 23 componentes de onboarding já existem

⚠️ **Em Progresso:**
- Ajustar assinaturas dos componentes para compatibilidade
- Implementar salvamento de dados no Supabase
- Adicionar tracking completo de eventos

---

## Tarefas Detalhadas

### Tarefa 1: Ajustar Assinaturas dos Componentes
**Prioridade:** Alta  
**Estimativa:** 4-6h

Alguns componentes têm assinaturas diferentes:
- `WelcomeScreen`: apenas `onNext`
- `WidgetsIntroScreen`: `onNext` e `onBack`
- `MotivationScreen`: `onNext(data)` com dados
- `HeightInputScreen`: provavelmente `onNext(data)` também

**Ação:** Verificar cada componente e ajustar o `onboarding-flow.tsx` para passar os callbacks corretos.

### Tarefa 2: Implementar Salvamento de Dados no Supabase
**Prioridade:** Alta  
**Estimativa:** 6-8h

Após completar onboarding, salvar dados no perfil do usuário:
- Dados de medicação (medication, dose, frequency, device)
- Dados físicos (height, currentWeight, startingWeight, targetWeight)
- Preferências (motivation, concerns, etc.)

**Ação:** Criar/atualizar hook `useOnboarding` que salva dados no Supabase.

### Tarefa 3: Implementar Tracking Completo
**Prioridade:** Média  
**Estimativa:** 3-4h

Adicionar todos os eventos de tracking conforme TRACKING-EVENTS-SPEC.md:
- `onboarding_started`
- `onboarding_step_viewed`
- `onboarding_step_completed`
- `onboarding_step_skipped`
- `onboarding_completed`
- `onboarding_abandoned`

**Ação:** Integrar chamadas de `trackEvent` em pontos estratégicos.

### Tarefa 4: Testar Fluxo Completo
**Prioridade:** Alta  
**Estimativa:** 4-6h

- Testar navegação entre todas as 23 telas
- Testar persistência (fechar app e retomar)
- Testar Health Disclaimer (checkbox obrigatório)
- Testar progress bar (mostra "Step X of 23")
- Testar tracking de eventos

---

## Componentes que Precisam Verificação

Lista de componentes a verificar assinatura:

1. ✅ WelcomeScreen - `onNext` apenas
2. ⚠️ WidgetsIntroScreen - `onNext`, `onBack`
3. ⚠️ ChartsIntroScreen - verificar assinatura
4. ⚠️ CustomizationIntroScreen - verificar assinatura
5. ⚠️ AlreadyUsingGLP1Screen - verificar se retorna dados
6. ⚠️ MedicationSelectionScreen - verificar se retorna dados
7. ⚠️ HeightInputScreen - verificar se retorna dados
8. ⚠️ CurrentWeightScreen - verificar se retorna dados
9. ⚠️ StartingWeightScreen - verificar se retorna dados
10. ⚠️ TargetWeightScreen - verificar se retorna dados
11. ✅ HealthDisclaimerScreen - `onNext`, `onBack`, checkbox obrigatório

---

## Próximos Passos

1. Verificar assinaturas de todos os componentes
2. Ajustar onboarding-flow.tsx para passar callbacks corretos
3. Implementar hook useOnboarding para salvar dados
4. Adicionar tracking completo
5. Testar fluxo completo
6. Ativar feature flag FF_ONBOARDING_23

---

## Checklist de QA

- [ ] Todas as 23 telas aparecem na ordem correta
- [ ] Progress bar mostra "Step X of 23"
- [ ] Navegação para frente funciona
- [ ] Navegação para trás funciona
- [ ] Health Disclaimer bloqueia avanço sem checkbox
- [ ] Dados são coletados corretamente
- [ ] Persistência funciona (fechar e retomar)
- [ ] Onboarding completo salva dados no Supabase
- [ ] Tracking de eventos funciona
- [ ] Não há regressões em funcionalidades existentes

---

**Próxima Sprint:** FAQ + Busca Remissiva (P0-003, P0-004)

