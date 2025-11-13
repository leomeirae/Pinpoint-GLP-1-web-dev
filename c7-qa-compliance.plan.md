# C7 - QA & Compliance

## Contexto

Garantir que todas as implementações atendam aos requisitos de qualidade, acessibilidade, compliance (LGPD) e UX antes do release.

**Estimativa:** 8 horas  
**Branch:** `release/qa-compliance`  
**Base:** Merge de todas as branches anteriores (C0-C6)

**Dependências:**
- C0 (Remoção IA Nutrição) - completo
- C1 (Onboarding) - completo
- C2 (Notificações) - completo
- C3 (Coachmarks) - completo
- C4 (Financeiro) - completo
- C5 (Pausas e Álcool) - completo
- C6 (Analytics Opt-in) - completo

---

## Fase 1: Criar Checklist de QA (2h)

### 1.1 Criar Documento de QA (1h)
- [ ] Criar `docs/qa-checklist.md` com seções:

**Funcionalidade:**
- [ ] Onboarding 5 telas funcional (Welcome → Compliance → MedicationDose → Schedule → Permissions)
- [ ] Notificações semanais disparam corretamente
- [ ] Coachmarks exibem 1x (não repetem)
- [ ] Quick Actions com deep-links funcionais (5 ações)
- [ ] CRUD de compras funcional
- [ ] Pausas e álcool funcionais

**Compliance:**
- [ ] **Sem frequência "diária" para GLP-1** (checagem explícita em todo código)
- [ ] Doses condicionadas por medicamento (validação impeditiva)
- [ ] Disclaimer clínico visível em `Compliance.tsx`
- [ ] Consentimento LGPD com checkbox obrigatório
- [ ] Analytics **NUNCA** dispara sem opt-in (teste: desligar opt-in e verificar console)
- [ ] **Marca/Copy clínica:** Priorizar nome genérico; marcas apenas como referência
- [ ] Sem "review" pedido no onboarding (App Store guidelines)
- [ ] Sem emojis em TODO o app (código, UI, notificações)

**Acessibilidade:**
- [ ] Contraste ≥ 4.5:1 (AA) - validar com ferramenta (WebAIM, Stark)
- [ ] Touch areas ≥ 44×44 pixels (iOS HIG / Material Design)
- [ ] SafeArea em **todas** as telas novas (C1-C6)
- [ ] Dark mode funcional em **todas** as telas novas
- [ ] Foco/labels corretos (VoiceOver/TalkBack)
- [ ] Tour de coachmarks acessível (botão "Pular" funcional)

**UX:**
- [ ] Sem "review" pedido no onboarding
- [ ] Estados vazios claros
- [ ] Feedback visual em ações (loading, success, error)
- [ ] Transições suaves (60fps)

### 1.2 Criar Checklist de Feature Flags (1h)
- [ ] Documentar todas as feature flags:
  - `FF_ONBOARDING_5_CORE` (C1)
  - `FF_FINANCE_MVP` (C4)
  - `FF_PAUSES_ALCOHOL` (C5)
- [ ] Para cada flag, testar:
  - [ ] Estado `false`: feature oculta (sem erros)
  - [ ] Estado `true`: feature visível e funcional
  - [ ] Transição `false → true`: não quebra app
  - [ ] Transição `true → false`: não quebra app (graceful degradation)

---

## Fase 2: Testes Automatizados (3h)

### 2.1 Testes de Acessibilidade (1h)
- [ ] Configurar `eslint-plugin-jsx-a11y`:
  - Adicionar ao `.eslintrc.js`
  - Habilitar regras: `aria-props`, `aria-proptypes`, `aria-role`, `role-has-required-aria-props`
- [ ] Executar lint de acessibilidade:
  ```bash
  npx eslint "**/*.{ts,tsx}" --fix
  ```
- [ ] Validar contraste de cores:
  - Usar ferramenta: WebAIM Contrast Checker ou Stark plugin (Figma)
  - Testar todas as combinações de cores críticas (texto/fundo)
- [ ] Verificar `accessibilityLabel` em elementos interativos:
  - Botões sem texto visível
  - Ícones clicáveis
  - Inputs de formulário
- [ ] CI/CD: configurar para falhar build se violações de a11y

### 2.2 Testes E2E Críticos (1h)
- [ ] Configurar Detox ou Maestro para E2E
- [ ] Criar testes críticos:
  - **Fluxo 1: Onboarding completo (5 telas)**
    - Welcome → Compliance → MedicationDose → Schedule → Permissions
    - Validar: dados salvos corretamente
  - **Fluxo 2: Registrar dose semanal**
    - Navegar para "Adicionar Aplicação"
    - Preencher formulário
    - Validar: dose registrada no dashboard
  - **Fluxo 3: Configurar lembrete**
    - Navegar para "Editar Lembrete"
    - Alterar dia e horário
    - Validar: lembrete agendado corretamente
  - **Fluxo 4: Adicionar compra (modo autenticado)**
    - Navegar para "Adicionar Compra"
    - Preencher formulário
    - Validar: compra salva no Supabase
  - **Fluxo 5: Modo convidado → criar conta → migração de dados**
    - Completar onboarding sem login
    - Registrar dose e peso
    - Criar conta
    - Validar: dados migrados para Supabase

### 2.3 Testes Unitários (1h)
- [ ] `lib/streaks.ts`: validar lógica de janela de aplicação
- [ ] `lib/notifications.ts`: validar timezone/DST (6 cenários da matriz)
- [ ] `lib/finance.ts`: validar cálculos (R$/sem, R$/kg com opt-in)
- [ ] `lib/analytics.ts`: validar bloqueio sem opt-in (já feito em C6)
- [ ] Executar todos os testes:
  ```bash
  npm run test
  ```

---

## Fase 3: Testes Manuais (4h)

### 3.1 Fluxo Completo iOS (2h)
- [ ] **Onboarding:**
  - [ ] Testar 5 telas (navegação forward/backward)
  - [ ] Testar validações (não avançar sem dados obrigatórios)
  - [ ] Testar persistência (fechar app e reabrir)
  - [ ] Testar modo convidado (completar sem login)
- [ ] **Dashboard:**
  - [ ] Testar Quick Actions (5 deep-links)
  - [ ] Testar coachmarks (exibir 1x)
- [ ] **Aplicações:**
  - [ ] Adicionar aplicação
  - [ ] Editar aplicação
  - [ ] Deletar aplicação
- [ ] **Peso:**
  - [ ] Adicionar peso
  - [ ] Visualizar gráfico de evolução
- [ ] **Compras (C4):**
  - [ ] Adicionar compra
  - [ ] Visualizar resumo financeiro (total, R$/sem, R$/kg)
  - [ ] Testar opt-in de R$/kg
- [ ] **Pausas (C5):**
  - [ ] Pausar tratamento
  - [ ] Verificar lembretes cancelados
  - [ ] Retomar tratamento
  - [ ] Verificar lembretes reagendados
- [ ] **Álcool (C5):**
  - [ ] Marcar álcool (toggle diário)
  - [ ] Visualizar calendário (30 dias)
  - [ ] Verificar overlays em gráficos
- [ ] **Notificações (C2):**
  - [ ] Editar horário de notificação
  - [ ] Verificar notificação dispara no horário correto

### 3.2 Fluxo Completo Android (2h)
- [ ] Repetir todos os testes acima no Android
- [ ] Testar gesture navigation (barra inferior)
- [ ] Testar diferentes tamanhos de tela (small, medium, large)

---

## Fase 4: Testes de Dark Mode e SafeArea (1h)

### 4.1 Dark Mode (30min)
- [ ] Ativar dark mode no dispositivo
- [ ] Testar todas as telas novas (C1-C6):
  - [ ] Onboarding (5 telas)
  - [ ] Quick Actions
  - [ ] Financeiro (resumo, adicionar compra)
  - [ ] Pausas
  - [ ] Álcool
  - [ ] Settings (privacidade, consent-preferences)
- [ ] Validar:
  - [ ] Cores invertidas corretamente
  - [ ] Contraste mantido (≥ 4.5:1)
  - [ ] Nenhum texto ilegível
  - [ ] Ícones visíveis

### 4.2 SafeArea (30min)
- [ ] Testar em dispositivos com notch/dynamic island:
  - iPhone 14 Pro, iPhone 15 Pro
- [ ] Verificar todas as telas novas:
  - [ ] Nenhum conteúdo cortado pelo notch
  - [ ] Header e footer respeitam safe area
  - [ ] Botões acessíveis (não sobrepostos por barra de gestos)
- [ ] Screenshot tests (iOS/Android):
  - Capturar screenshots de todas as telas novas
  - Comparar com design Figma
  - Validar alinhamento e espaçamento

---

## Fase 5: Testes de Acessibilidade Manual (1h)

### 5.1 VoiceOver (iOS) (30min)
- [ ] Ativar VoiceOver (Settings → Accessibility → VoiceOver)
- [ ] Navegar por todas as telas novas:
  - [ ] Onboarding (5 telas)
  - [ ] Dashboard (Quick Actions, coachmarks)
  - [ ] Financeiro
  - [ ] Pausas
  - [ ] Álcool
- [ ] Validar:
  - [ ] Todos os elementos interativos são anunciados
  - [ ] Labels descritivas e claras
  - [ ] Ordem de navegação lógica
  - [ ] Botões de ação claramente identificados

### 5.2 TalkBack (Android) (30min)
- [ ] Ativar TalkBack (Settings → Accessibility → TalkBack)
- [ ] Repetir todos os testes acima no Android
- [ ] Validar mesmo nível de acessibilidade

---

## Fase 6: Vídeos/GIFs para Documentação (1h)

### 6.1 Gravar Vídeos (1h)
- [ ] Vídeo 1: Onboarding completo (5 telas) - 30-45 segundos
- [ ] Vídeo 2: Coachmarks no dashboard - 20-30 segundos
- [ ] Vídeo 3: Quick Actions (todas as 5 ações) - 30 segundos
- [ ] Vídeo 4: Adicionar compra + visualizar resumo financeiro - 40 segundos
- [ ] Vídeo 5: Pausar/retomar tratamento - 30 segundos
- [ ] GIF: Toggle de álcool - 10 segundos
- [ ] Adicionar ao README.md:
  - Seção "Features" com vídeos/GIFs
  - Descrição de cada feature

---

## Fase 7: Atualizar Documentação (2h)

### 7.1 Atualizar README.md (1h)
- [ ] Remover seção de IA de Nutrição
- [ ] Adicionar seção de Onboarding (5 telas)
- [ ] Adicionar seção de Notificações Semanais
- [ ] Adicionar seção de Coachmarks
- [ ] Adicionar seção de Financeiro
- [ ] Adicionar seção de Pausas e Álcool
- [ ] Adicionar seção de Analytics Opt-in
- [ ] Atualizar screenshots
- [ ] Adicionar vídeos/GIFs
- [ ] Atualizar lista de feature flags

### 7.2 Atualizar CHANGELOG.md (1h)
- [ ] Criar entrada para versão nova (ex: `v2.0.0`)
- [ ] Listar features adicionadas:
  - Onboarding refatorado (5 telas)
  - Notificações semanais com janela de aplicação
  - Coachmarks e Quick Actions
  - Módulo financeiro MVP
  - Pausas e registro de álcool
  - Analytics opt-in (LGPD compliance)
- [ ] Listar breaking changes:
  - Onboarding antigo (23 telas) removido
  - IA de Nutrição removida
- [ ] Listar bugs corrigidos:
  - PostgREST cache bug (workaround implementado)
  - Notificações não disparavam (C2 resolve)
- [ ] Listar melhorias:
  - Dark mode em todas as telas novas
  - Acessibilidade melhorada
  - Cópia clínica e sem emojis

---

## Fase 8: Criar PR Final (1h)

### 8.1 Preparar PR (1h)
- [ ] Criar PR: `release/qa-compliance` → `main`
- [ ] Título: "Release: Refatoração Completa (C0-C6)"
- [ ] Descrição detalhada:
  - Resumo das mudanças
  - Links para vídeos/GIFs
  - Checklist de QA preenchido
  - Menção às feature flags e rollout
- [ ] Solicitar review de stakeholders
- [ ] Aguardar aprovação

---

## Definition of Done

- [ ] Checklist de QA 100% verde
- [ ] Testes automatizados passando (lint, E2E, unit)
- [ ] Testes manuais iOS/Android completos
- [ ] Dark mode testado em todas as telas novas
- [ ] SafeArea testado em dispositivos com notch
- [ ] Acessibilidade testada (VoiceOver/TalkBack)
- [ ] Vídeos/GIFs gravados e documentados
- [ ] README e CHANGELOG atualizados
- [ ] PR final criado com aprovação
- [ ] Release notes publicadas

---

## Riscos Identificados

**Médio:** Bugs não detectados em testes manuais  
**Mitigação:** Testar em múltiplos dispositivos, considerar beta testing

**Baixo:** Feature flags podem não funcionar corretamente  
**Mitigação:** Testar todas as combinações (true/false)

---

## Arquivos a Criar/Editar

**Criar:**
- `docs/qa-checklist.md`
- `lib/__tests__/streaks.test.ts`
- `lib/__tests__/notifications.test.ts`
- `lib/__tests__/finance.test.ts`

**Editar:**
- `README.md`
- `CHANGELOG.md`
- `.eslintrc.js` (adicionar `eslint-plugin-jsx-a11y`)

---

## Critérios de Release

**Bloqueantes (não podemos lançar sem isso):**
- Zero crashes em testes manuais
- Testes unitários de analytics opt-in passando (C6)
- Disclaimer clínico e consentimento LGPD visíveis
- Sem frequência "diária" no onboarding
- Feature flags funcionando corretamente

**Desejáveis (não bloqueiam release, mas são importantes):**
- Testes E2E passando
- Cobertura de testes ≥ 70%
- Vídeos/GIFs documentados
- Beta testing com 10+ usuários

**Rollout Gradual:**
1. Release interno (equipe + beta testers)
2. Habilitar feature flags para 10% dos usuários
3. Monitorar por 3-5 dias (crashes, adoção, feedback)
4. Expandir para 50%, depois 100%
5. Remover flags após estabilização (converter para features permanentes)

