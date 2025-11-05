# TEST CASE MATRIX - P0

**Data:** 2025-01-27  
**Versão:** 1.0

---

## Matriz de Testes por Funcionalidade

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Prioridade | Status |
|----|----------------|---------------|----------------|--------|-------------------|------------|--------|
| TC-001 | Onboarding | Persistência do passo | App instalado, usuário novo | 1. Iniciar onboarding<br>2. Avançar até step 10<br>3. Fechar app<br>4. Reabrir app | Retoma no step 10 | P0 | ⏳ |
| TC-002 | Onboarding | Consent obrigatório | Na tela HealthDisclaimerScreen | 1. Tentar avançar sem checkbox<br>2. Marcar checkbox<br>3. Tentar avançar | Botão desabilitado → habilitado | P0 | ⏳ |
| TC-003 | Onboarding | UPSERT idempotente | Usuário completo onboarding | 1. Completar onboarding<br>2. Tentar completar novamente | Sem duplicação em users/medications | P0 | ⏳ |
| TC-004 | Onboarding | Peso inicial único | Completar onboarding com peso | 1. Inserir current_weight<br>2. Inserir starting_weight | Apenas 1 registro por data em weight_logs | P0 | ⏳ |
| TC-005 | Onboarding | RLS ativo | Dois usuários criados | 1. Usuário A tenta SELECT dados B | RLS bloqueia | P0 | ⏳ |
| TC-006 | Onboarding | Eventos completos | Navegar onboarding | 1. Completar onboarding completo | Todos eventos trackados | P0 | ⏳ |
| TC-007 | FAQ | Offline-ready | Internet desabilitada | 1. Abrir FAQ | Carrega normalmente | P0 | ⏳ |
| TC-008 | FAQ | Busca client-side | FAQ aberto | 1. Digitar "premium"<br>2. Limpar busca | Filtra → mostra todas | P0 | ⏳ |
| TC-009 | FAQ | Tracking | Abrir FAQ | 1. Abrir tela<br>2. Buscar<br>3. Abrir pergunta | faq_viewed, faq_searched, faq_question_opened | P0 | ⏳ |
| TC-010 | Paywall | Gating correto | Usuário free | 1. Tentar acessar feature premium | PremiumGate bloqueia | P0 | ⏳ |
| TC-011 | Paywall | Trial 7 dias | Usuário novo | 1. Iniciar trial<br>2. Tentar segundo trial | Trial inicia → erro no segundo | P0 | ⏳ |
| TC-012 | Paywall | get_entitlement() | Usuário em trial | 1. Chamar RPC | has_plus = true | P0 | ⏳ |
| TC-013 | Paywall | Cache local | Trial ativo | 1. Fechar app<br>2. Reabrir | hasPremium ainda true | P0 | ⏳ |
| TC-014 | Paywall | Eventos | Abrir paywall | 1. Abrir<br>2. Iniciar trial | paywall_impression, trial_started | P0 | ⏳ |
| TC-015 | Flags | FF_ONBOARDING_23 | Flag configurável | 1. OFF → fluxo antigo<br>2. ON → fluxo novo | Respeita flag | P0 | ⏳ |
| TC-016 | Flags | FF_FAQ | Flag configurável | 1. OFF → bloqueado<br>2. ON → funciona | Respeita flag | P0 | ⏳ |
| TC-017 | Flags | FF_PAYWALL | Flag configurável | 1. OFF → todos premium<br>2. ON → gating real | Respeita flag | P0 | ⏳ |
| TC-018 | RLS | Políticas ativas | Banco configurado | 1. Verificar políticas | Todas criadas | P0 | ⏳ |
| TC-019 | RLS | Sem vazamento | Dois usuários | 1. A tenta acessar B | Bloqueado | P0 | ⏳ |
| TC-020 | Entitlement | VIEW current_entitlement | Usuário autenticado | 1. SELECT da view | Retorna entitlement correto | P0 | ⏳ |

---

## Cenários de Teste por Fluxo

### Fluxo 1: Novo Usuário Completo
1. Sign-up no Clerk
2. Iniciar onboarding (23 telas)
3. Completar onboarding
4. Verificar dados salvos no Supabase
5. Acessar FAQ
6. Tentar feature premium → ver paywall
7. Iniciar trial
8. Verificar entitlement

### Fluxo 2: Usuário Existente
1. Login
2. Verificar onboarding não aparece (já completo)
3. Acessar FAQ
4. Verificar status premium/trial

### Fluxo 3: Teste de Segurança
1. Criar usuário A
2. Criar usuário B
3. A tenta acessar dados de B via Supabase
4. Verificar RLS bloqueia

---

**Última Atualização:** 2025-01-27

