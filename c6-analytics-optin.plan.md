# C6 - Analytics (Opt-in)

## Contexto

Garantir que **nenhum evento de analytics** seja disparado sem consentimento explícito do usuário (opt-in obrigatório), em conformidade com LGPD/GDPR.

**Estimativa:** 6 horas  
**Branch:** `feature/analytics-optin`  
**Base:** `refactor/onboarding-5-core` (após C1)

**Dependências:**
- C1 (Onboarding) - completo

---

## Requisitos CRÍTICOS

**NUNCA enviar eventos de rede sem `analyticsOptIn === true`** (bloqueio absoluto)

**Estado padrão:** `analyticsOptIn = false` para qualquer usuário novo ou convidado (fail-safe)

**Modo convidado:**
- Eventos marcados com `isGuest: true` **APENAS em logs locais** (console, AsyncStorage)
- **NÃO enviar eventos de rede** mesmo com flag `isGuest`
- Ao criar conta e aceitar opt-in: enviar eventos históricos acumulados (opcional)

**Política de retenção:**
- Dados de analytics retidos por **13 meses** (conformidade LGPD/GDPR)
- Após 13 meses: deletar automaticamente eventos antigos
- Ao apagar conta: **deleção total e imediata** de todos os eventos do usuário

---

## Fase 1: Atualizar lib/analytics.ts (2h)

### 1.1 Adicionar Verificação de Opt-in (1h)
- [ ] Editar `lib/analytics.ts`:
  - Adicionar verificação em `trackEvent()`:
    ```typescript
    export async function trackEvent(eventName: string, properties?: any) {
      const optIn = await getAnalyticsOptIn();
      if (!optIn) {
        logger.debug('Analytics opt-in disabled, skipping event', { eventName });
        return;
      }
      // ... código existente
    }
    ```
  - Criar `getAnalyticsOptIn()`:
    - Ler de AsyncStorage: `@mounjaro:analytics_opt_in`
    - Cache em memória para performance
  - Criar `setAnalyticsOptIn(value: boolean)`:
    - Salvar em AsyncStorage
    - Salvar no Supabase (`users.analytics_opt_in`)
    - Limpar cache em memória

### 1.2 Implementar Modo Convidado (1h)
- [ ] Adicionar lógica de logs locais:
  - Se `analyticsOptIn === false` E `isGuest === true`:
    - Armazenar eventos em AsyncStorage: `@mounjaro:guest_analytics_queue`
    - **NÃO enviar para rede**
  - Se `analyticsOptIn === false` E `isGuest === false`:
    - **NÃO armazenar nem enviar** (descarta evento)
- [ ] Criar `flushGuestEvents()`:
  - Ao criar conta e aceitar opt-in: enviar eventos acumulados
  - Limpar fila após envio bem-sucedido

---

## Fase 2: Integrar com Onboarding (1h)

### 2.1 Persistir Opt-in no Onboarding (1h)
- [ ] Verificar `app/(onboarding)/Compliance.tsx`:
  - Checkbox já implementado: "Compartilhar dados anônimos de uso"
  - Verificar se `analyticsOptIn` está sendo persistido corretamente
- [ ] Verificar `hooks/useOnboarding.ts`:
  - Confirmar que `analyticsOptIn` é salvo no Supabase ao finalizar onboarding
  - Adicionar fallback para AsyncStorage (modo convidado)

---

## Fase 3: Criar Tela de Configurações (2h)

### 3.1 Criar Tela de Privacidade (1h)
- [ ] Criar `app/(tabs)/settings/privacy.tsx`:
  - Título: "Privacidade e Dados"
  - **Seção 1: Analytics**
    - Toggle: "Compartilhar dados de uso"
    - Descrição: "Dados anônimos ajudam a melhorar o app. Você pode desativar a qualquer momento."
    - Status atual: "Ativado desde [data]" ou "Desativado"
  - **Seção 2: Histórico de Consentimentos**
    - Link: "Ver histórico completo" (deep-link para `consent-preferences`)
  - Ao mudar toggle:
    - Chamar `setAnalyticsOptIn()`
    - Mostrar toast de confirmação
    - Registrar em `consent_history` (se tabela existir)

### 3.2 Adicionar Link em Settings (1h)
- [ ] Editar `app/(tabs)/settings/index.tsx`:
  - Adicionar item de menu: "Privacidade e Dados"
  - Ícone: `ShieldCheck` (Phosphor)
  - Deep-link: `/(tabs)/settings/privacy`

---

## Fase 4: Testes Unitários Obrigatórios (1h)

**Requisito crítico:** Estes testes DEVEM passar antes de merge. Bloqueiam CI/CD se falharem.

### 4.1 Criar Suite de Testes (1h)
- [ ] Criar `lib/__tests__/analytics.test.ts`:
  
  **Teste 1: Estado padrão é false**
  - Nome: `analyticsOptIn defaults to false for new users`
  - Cenário: Criar usuário novo ou modo convidado
  - Expectativa: `getAnalyticsOptIn()` retorna `false`
  
  **Teste 2: trackEvent bloqueia quando opt-in = false**
  - Nome: `trackEvent blocks network calls when analyticsOptIn is false`
  - Cenário: Chamar `trackEvent()` com `analyticsOptIn = false`
  - Expectativa:
    - Nenhuma chamada de rede é feita (spy no network client)
    - Log local é criado apenas (console/AsyncStorage)
  
  **Teste 3: trackEvent permite quando opt-in = true**
  - Nome: `trackEvent sends to network when analyticsOptIn is true`
  - Cenário: Chamar `trackEvent()` com `analyticsOptIn = true`
  - Expectativa: Evento enviado para analytics provider (spy confirma chamada)
  
  **Teste 4: Modo convidado não envia para rede**
  - Nome: `guest mode events stay local even with analyticsOptIn flag`
  - Cenário: `isGuest = true`, chamar `trackEvent()`
  - Expectativa: Evento marcado com `isGuest: true` fica apenas local (não envia para rede)

- [ ] Configurar CI/CD para falhar build se qualquer teste falhar

---

## Fase 5: Tipar Eventos (Opcional) (1h)

### 5.1 Criar Interface de Eventos (1h)
- [ ] Criar `lib/analytics.types.ts`:
  ```typescript
  type AnalyticsEvent =
    | { name: 'onboarding_started'; properties: { source: string } }
    | { name: 'onboarding_completed'; properties: { duration_seconds: number } }
    | { name: 'purchase_added'; properties: { medication: string; price_cents: number } }
    | { name: 'dose_recorded'; properties: { medication: string; dosage: number } }
    | { name: 'weight_recorded'; properties: { weight_kg: number } }
    | { name: 'pause_started'; properties: { reason?: string } }
    | { name: 'pause_ended'; properties: { duration_days: number } }
    | { name: 'alcohol_logged'; properties: { consumed: boolean } }
    // ... adicionar todos os eventos existentes
  ```
- [ ] Atualizar `trackEvent()` para aceitar tipo genérico:
  ```typescript
  export function trackEvent<T extends AnalyticsEvent>(
    eventName: T['name'],
    properties?: T['properties']
  ): void
  ```

---

## Fase 6: Testes e Validação Manual (1h)

### 6.1 Testes Manuais (1h)
- [ ] Testar opt-in = false: nenhum evento disparado
  - Abrir network inspector
  - Navegar pelo app (registrar dose, peso, etc.)
  - Confirmar: zero chamadas de analytics
- [ ] Testar opt-in = true: eventos normais
  - Ativar opt-in em Settings
  - Navegar pelo app
  - Confirmar: eventos aparecem nos logs e são enviados
- [ ] Testar mudança em configurações
  - Alternar toggle ON/OFF
  - Verificar persistência após restart
- [ ] Testar modo convidado
  - Completar onboarding sem login
  - Verificar eventos ficam em AsyncStorage (não enviados)
  - Criar conta e aceitar opt-in
  - Verificar eventos acumulados são enviados

---

## Definition of Done

- [ ] `trackEvent()` verifica opt-in antes de disparar
- [ ] Estado padrão é `false` (fail-safe)
- [ ] Modo convidado armazena eventos localmente (não envia)
- [ ] Opt-in solicitado no onboarding (C1)
- [ ] Opt-out disponível em configurações
- [ ] Persistência em AsyncStorage e Supabase
- [ ] Testes unitários obrigatórios passando
- [ ] CI/CD configurado para bloquear merge se testes falharem
- [ ] Payloads de eventos tipados (opcional)
- [ ] Testes manuais passando

---

## Riscos Identificados

**Crítico:** Eventos podem vazar sem opt-in (violação LGPD)  
**Mitigação:** Testes unitários obrigatórios, CI/CD bloqueia merge se falharem

**Baixo:** Performance (verificar opt-in em cada evento)  
**Mitigação:** Cache em memória

---

## Arquivos a Criar/Editar

**Criar:**
- `app/(tabs)/settings/privacy.tsx`
- `lib/analytics.types.ts` (opcional)
- `lib/__tests__/analytics.test.ts`

**Editar:**
- `lib/analytics.ts` (adicionar verificação de opt-in)
- `app/(tabs)/settings/index.tsx` (adicionar link para privacidade)
- `hooks/useOnboarding.ts` (verificar persistência de `analyticsOptIn`)

