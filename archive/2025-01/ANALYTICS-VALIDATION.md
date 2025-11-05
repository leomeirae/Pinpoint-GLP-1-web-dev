# ANALYTICS VALIDATION - P0

**Data:** 2025-01-27  
**Versão:** 1.0

---

## Eventos a Validar

### ONBOARDING

| Evento | Quando Dispara | Props Esperadas | Status |
|--------|---------------|-----------------|--------|
| `onboarding_started` | Primeira tela do onboarding | `{ user_id, timestamp }` | ⏳ |
| `onboarding_step_next` | Avançar para próximo step | `{ step_number, step_name, total_steps }` | ⏳ |
| `onboarding_step_back` | Voltar para step anterior | `{ step_number, step_name }` | ⏳ |
| `onboarding_step_skipped` | Pular step | `{ step_number, step_name }` | ⏳ |
| `onboarding_consent_accepted` | Marcar checkbox de consent | `{ timestamp }` | ⏳ |
| `onboarding_completed` | Finalizar onboarding | `{ total_time_seconds, skipped_steps, data_completed }` | ⏳ |

### FAQ

| Evento | Quando Dispara | Props Esperadas | Status |
|--------|---------------|-----------------|--------|
| `faq_viewed` | Abrir tela FAQ | `{ source: 'settings' | 'paywall' }` | ⏳ |
| `faq_searched` | Digitar na busca | `{ query, results_count }` | ⏳ |
| `faq_question_opened` | Expandir pergunta | `{ question_number, question_text }` | ⏳ |

### PAYWALL/TRIAL

| Evento | Quando Dispara | Props Esperadas | Status |
|--------|---------------|-----------------|--------|
| `paywall_impression` | Abrir tela de paywall | `{ source, user_status }` | ⏳ |
| `paywall_trial_start_attempt` | Tentar iniciar trial | `{ source }` | ⏳ |
| `trial_started` | Trial iniciado com sucesso | `{ trial_start_date, trial_end_date }` | ⏳ |
| `trial_start_failed` | Erro ao iniciar trial | `{ error_message }` | ⏳ |
| `paywall_purchase_attempt` | Tentar comprar assinatura | `{ plan_type, source }` | ⏳ |
| `premium_feature_blocked` | Tentar acessar feature premium | `{ feature_name, user_status }` | ⏳ |

---

## Checklist de Validação

### 1. Eventos Disparam Corretamente
- [ ] Todos os eventos acima são disparados nos momentos corretos
- [ ] Props estão completas e corretas
- [ ] Não há eventos duplicados

### 2. Props Consistentes
- [ ] `user_id` presente em todos os eventos
- [ ] `timestamp` presente quando relevante
- [ ] Tipos de dados corretos (string, number, boolean)

### 3. Integração com Sistema de Analytics
- [ ] Eventos chegam ao sistema de analytics
- [ ] Não há erros de tracking
- [ ] Performance não degrada com tracking

---

## Como Validar

### Método 1: Console Logs
```typescript
// No código, adicionar console.log antes de trackEvent
console.log('TRACKING:', eventName, props);
trackEvent(eventName, props);
```

### Método 2: Network Tab
- Abrir DevTools → Network
- Filtrar por requests de analytics
- Verificar payloads enviados

### Método 3: Analytics Dashboard
- Verificar dashboard do provider de analytics
- Confirmar eventos chegando

---

**Última Atualização:** 2025-01-27

