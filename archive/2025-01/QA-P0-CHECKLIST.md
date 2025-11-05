# QA P0 - Checklist de Validação

**Data:** 2025-01-27  
**Versão:** 1.0  
**Status:** ⏳ EM EXECUÇÃO

---

## 1. ONBOARDING (23 telas)

### 1.1 Persistência do Passo
- [ ] **Teste:** Iniciar onboarding, avançar até step 10, fechar app, reabrir app
- [ ] **Esperado:** Retoma no step 10 (não volta para step 1)
- [ ] **Verificação:** AsyncStorage salva `currentStep` corretamente
- [ ] **Status:** ⏳ PENDENTE TESTE

### 1.2 Consent Obrigatório
- [ ] **Teste:** Na tela HealthDisclaimerScreen, tentar avançar sem marcar checkbox
- [ ] **Esperado:** Botão "Continuar" desabilitado
- [ ] **Esperado:** Ao marcar checkbox, botão habilita
- [ ] **Status:** ⏳ PENDENTE TESTE

### 1.3 UPSERT Idempotente no Supabase
- [ ] **Teste:** Completar onboarding duas vezes com mesmos dados
- [ ] **Esperado:** Não cria registros duplicados em `users`
- [ ] **Esperado:** Não cria registros duplicados em `medications`
- [ ] **Verificação SQL:** `SELECT COUNT(*) FROM users WHERE clerk_id = '<test_user>'` deve retornar 1
- [ ] **Status:** ⏳ PENDENTE TESTE

### 1.4 Peso Inicial Sem Duplicar
- [ ] **Teste:** Completar onboarding com `current_weight` e `starting_weight`
- [ ] **Esperado:** Cria apenas 1 registro em `weight_logs` com `source='onboarding'` por data
- [ ] **Verificação SQL:** `SELECT COUNT(*) FROM weight_logs WHERE user_id = '<test_user>' AND source = 'onboarding' AND date = '<onboarding_date>'` deve retornar ≤ 1
- [ ] **Status:** ⏳ PENDENTE TESTE

### 1.5 RLS OK
- [ ] **Teste:** Usuário A tenta acessar dados do usuário B via Supabase
- [ ] **Esperado:** Políticas RLS bloqueiam acesso
- [ ] **Verificação SQL:** Testar SELECT com JWT diferente
- [ ] **Status:** ⏳ PENDENTE TESTE

### 1.6 Eventos Completos
- [ ] **Teste:** Navegar pelo onboarding completo
- [ ] **Esperado:** Eventos trackados:
  - `onboarding_started`
  - `onboarding_step_next` (para cada step)
  - `onboarding_step_back` (quando voltar)
  - `onboarding_step_skipped` (quando pular)
  - `onboarding_consent_accepted`
  - `onboarding_completed`
- [ ] **Verificação:** Checar logs de analytics
- [ ] **Status:** ⏳ PENDENTE TESTE

---

## 2. FAQ

### 2.1 Offline-Ready
- [ ] **Teste:** Desabilitar internet, abrir tela FAQ
- [ ] **Esperado:** FAQ carrega normalmente (dados embarcados)
- [ ] **Esperado:** Busca funciona offline
- [ ] **Status:** ⏳ PENDENTE TESTE

### 2.2 Busca Client-Side
- [ ] **Teste:** Digitar "premium" na busca
- [ ] **Esperado:** Filtra perguntas que contêm "premium" no título ou resposta
- [ ] **Esperado:** Resultado atualiza em tempo real
- [ ] **Esperado:** Ao limpar busca, mostra todas as perguntas
- [ ] **Status:** ⏳ PENDENTE TESTE

### 2.3 Tracking
- [ ] **Teste:** Abrir FAQ, buscar, abrir pergunta
- [ ] **Esperado:** Eventos trackados:
  - `faq_viewed` (ao abrir tela)
  - `faq_searched` (ao buscar com query)
  - `faq_question_opened` (ao expandir pergunta)
- [ ] **Verificação:** Checar logs de analytics
- [ ] **Status:** ⏳ PENDENTE TESTE

---

## 3. PAYWALL/TRIAL

### 3.1 Gating Correto
- [ ] **Teste:** Usuário free tenta acessar feature premium (ex: Export PDF)
- [ ] **Esperado:** `PremiumGate` mostra bloqueio e botão "Assinar Mounjaro+"
- [ ] **Esperado:** Ao tocar, abre tela de paywall
- [ ] **Status:** ⏳ PENDENTE TESTE

### 3.2 Trial 7 Dias (Uma Vez Só)
- [ ] **Teste:** Usuário novo inicia trial
- [ ] **Esperado:** Trial inicia com `trial_started_at` = hoje
- [ ] **Esperado:** `trial_ends_at` = hoje + 7 dias
- [ ] **Esperado:** Status = 'trial', tier = 'plus'
- [ ] **Teste:** Tentar iniciar segundo trial
- [ ] **Esperado:** Erro ou mensagem "Trial já ativo"
- [ ] **Verificação SQL:** `SELECT COUNT(*) FROM subscriptions WHERE user_id = '<test_user>' AND status = 'trial' AND trial_ends_at > NOW()` deve retornar ≤ 1
- [ ] **Status:** ⏳ PENDENTE TESTE

### 3.3 get_entitlement() Funcionando
- [ ] **Teste:** Usuário em trial chama RPC `get_entitlement()`
- [ ] **Esperado:** Retorna `has_plus = true`, `status = 'trial'`
- [ ] **Teste:** Usuário free chama RPC
- [ ] **Esperado:** Retorna `has_plus = false` ou null
- [ ] **Verificação SQL:** Testar RPC diretamente no Supabase
- [ ] **Status:** ⏳ PENDENTE TESTE

### 3.4 Cache Local com Refresh
- [ ] **Teste:** Iniciar trial, fechar app, reabrir app
- [ ] **Esperado:** `hasPremium` ainda é `true` (cache)
- [ ] **Esperado:** Após 24h, refresh automático busca do servidor
- [ ] **Status:** ⏳ PENDENTE TESTE

### 3.5 Eventos de Paywall/Trial
- [ ] **Teste:** Abrir paywall, iniciar trial
- [ ] **Esperado:** Eventos trackados:
  - `paywall_impression` (ao abrir paywall)
  - `paywall_trial_start_attempt` (ao tentar iniciar trial)
  - `trial_started` (trial iniciado com sucesso)
  - `trial_start_failed` (se falhar)
- [ ] **Verificação:** Checar logs de analytics
- [ ] **Status:** ⏳ PENDENTE TESTE

---

## 4. FEATURE FLAGS

### 4.1 FF_ONBOARDING_23
- [ ] **Teste:** Com flag OFF, iniciar onboarding
- [ ] **Esperado:** Usa fluxo antigo (4 telas)
- [ ] **Teste:** Com flag ON, iniciar onboarding
- [ ] **Esperado:** Usa fluxo novo (23 telas)
- [ ] **Status:** ⏳ PENDENTE TESTE

### 4.2 FF_FAQ
- [ ] **Teste:** Com flag OFF, tentar acessar FAQ
- [ ] **Esperado:** Tela não existe ou mostra "em breve"
- [ ] **Teste:** Com flag ON, acessar FAQ
- [ ] **Esperado:** FAQ funciona normalmente
- [ ] **Status:** ⏳ PENDENTE TESTE

### 4.3 FF_PAYWALL
- [ ] **Teste:** Com flag OFF, verificar `hasPremium`
- [ ] **Esperado:** Sempre retorna `true` (todos têm acesso)
- [ ] **Teste:** Com flag ON, verificar `hasPremium`
- [ ] **Esperado:** Retorna baseado em entitlement real
- [ ] **Status:** ⏳ PENDENTE TESTE

---

## 5. RLS/SECURITY

### 5.1 Políticas Ativas
- [ ] **Teste:** Verificar políticas RLS em `subscriptions`
- [ ] **Esperado:** Políticas criadas e ativas
- [ ] **Verificação SQL:** `SELECT * FROM pg_policies WHERE tablename = 'subscriptions'`
- [ ] **Status:** ⏳ PENDENTE TESTE

### 5.2 Sem Vazamento Entre Usuários
- [ ] **Teste:** Usuário A logado tenta acessar dados do usuário B
- [ ] **Esperado:** RLS bloqueia todas as queries
- [ ] **Verificação SQL:** Testar SELECT com JWT de usuário diferente
- [ ] **Status:** ⏳ PENDENTE TESTE

---

## 📊 Resumo

- **Total de Testes:** 20
- **Passou:** 0
- **Falhou:** 0
- **Pendente:** 20
- **Taxa de Sucesso:** N/A

---

**Última Atualização:** 2025-01-27

