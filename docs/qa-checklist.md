# Checklist de QA - Release 2.0.0

**Data:** 2025-11-13  
**Branch:** `release/qa-compliance`  
**Responsável:** QA Team

---

## 1. Funcionalidade (Smoke Tests)

### 1.1 Onboarding Core (C1)
- [ ] **Welcome Screen:** Exibe corretamente, CTA funciona
- [ ] **Compliance Screen:** 
  - [ ] Disclaimer clínico visível
  - [ ] Checkbox LGPD obrigatório (não avança sem aceitar)
  - [ ] Link para Política de Privacidade funcional
- [ ] **MedicationDose Screen:**
  - [ ] Grid de medicamentos exibe corretamente
  - [ ] Doses condicionadas por medicamento (Mounjaro: 2.5-15mg, Retatrutida: 2-12mg)
  - [ ] SEM opção "diária" (apenas semanal)
- [ ] **Schedule Screen:**
  - [ ] Day picker funciona (seg-dom)
  - [ ] Time picker funciona (formato 24h)
  - [ ] Preview da próxima aplicação correto
- [ ] **Permissions Screen:**
  - [ ] Solicita permissões graciosamente
  - [ ] Botão "Pular" visível e funcional
  - [ ] Agenda notificação ao permitir
- [ ] **Navegação:** Back/forward funciona entre todas as telas
- [ ] **Persistência:** Dados salvam corretamente (verificar Supabase)

### 1.2 Notificações Semanais (C2)
- [ ] **Agendamento:** Notificação agendada ao finalizar onboarding
- [ ] **Disparo:** Notificação dispara no dia/hora corretos (testar device físico)
- [ ] **Deep-link:** Ao tocar na notificação, navega para add-application
- [ ] **Edição:** Tela edit-reminder funciona (altera dia/hora)
- [ ] **Cancelamento:** Ao desativar, notificações são canceladas
- [ ] **Persistência:** Notificações sobrevivem a restart do app

### 1.3 Coachmarks + Quick Actions (C3)
- [ ] **Coachmarks:**
  - [ ] Exibem apenas 1x (verificar AsyncStorage: `@mounjaro:coachmarks_seen`)
  - [ ] Spotlight alinhado com elemento alvo
  - [ ] Botão "Pular" funcional
  - [ ] Transições suaves
- [ ] **Quick Actions Card:**
  - [ ] 5 ações exibidas (Dose, Peso, Compra, Pausar, Álcool)
  - [ ] Deep-links funcionais para todas as ações
  - [ ] Layout responsivo

### 1.4 Financeiro MVP (C4)
- [ ] **Adicionar Compra:**
  - [ ] Formulário valida campos obrigatórios
  - [ ] Salva corretamente no Supabase
  - [ ] Formatação BRL correta (R$ 1.234,56)
- [ ] **Editar Compra:** Atualiza dados corretamente
- [ ] **Deletar Compra:** Remove do banco e da UI
- [ ] **Resumo Financeiro:**
  - [ ] Total gasto calculado corretamente
  - [ ] R$/semana calculado corretamente
  - [ ] R$/kg exibe apenas com opt-in + 2+ pesagens
  - [ ] Próxima compra prevista correta
- [ ] **Estados Vazios:** Exibe ilustração + texto quando sem dados
- [ ] **Modal Opt-in R$/kg:** Exibe na primeira vez, salva preferência

### 1.5 Pausas e Álcool (C5)
- [ ] **Pausar Tratamento:**
  - [ ] Inicia pausa corretamente
  - [ ] Cancela notificações ao pausar
  - [ ] Timeline de pausas anteriores exibe corretamente
- [ ] **Retomar Tratamento:**
  - [ ] Encerra pausa corretamente
  - [ ] Reagenda notificações ao retomar
- [ ] **Álcool:**
  - [ ] Toggle diário funciona
  - [ ] Salva no banco corretamente
  - [ ] Calendário visual exibe dias marcados
  - [ ] Overlays em gráficos exibem corretamente

### 1.6 Analytics Opt-in (C6)
- [ ] **Onboarding:** Checkbox de analytics salva preferência
- [ ] **Settings:** Toggle de analytics altera preferência
- [ ] **Bloqueio:** Eventos NÃO disparam quando opt-in = false (verificar console)
- [ ] **Persistência:** Preferência sobrevive a restart

---

## 2. Compliance (CRÍTICO)

### 2.1 Frequência de Medicação
- [ ] **VALIDAÇÃO OBRIGATÓRIA:** Executar grep e confirmar ZERO resultados para "daily" ou "diária" em contexto de medicação GLP-1
  ```bash
  grep -r "daily\|diária" --exclude-dir=node_modules app/ lib/ hooks/ components/
  ```
- [ ] Verificar manualmente que APENAS "semanal"/"weekly" está disponível no onboarding

### 2.2 Doses Condicionadas
- [ ] **Mounjaro:** Apenas doses [2.5, 5, 7.5, 10, 12.5, 15] mg disponíveis
- [ ] **Retatrutida:** Apenas doses [2, 4, 6, 8, 10, 12] mg disponíveis
- [ ] **Validação impeditiva:** Não permite selecionar dose inválida para medicamento

### 2.3 Disclaimer Clínico e LGPD
- [ ] **Screenshot obrigatório:** Capturar tela Compliance.tsx com disclaimer visível
- [ ] **Checkbox obrigatório:** Não avança sem aceitar termos
- [ ] **Analytics opt-in:** Estado padrão = false (fail-safe)
- [ ] **Bloqueio absoluto:** Verificar que NENHUM evento de rede é enviado sem opt-in = true

### 2.4 Copy Clínica
- [ ] **Nomes genéricos priorizados:** Tirzepatida, Semaglutida (marcas entre parênteses ou como referência)
- [ ] **Tom neutro:** Sem linguagem informal, sem emojis
- [ ] **Sem "review":** Não pede review no onboarding (App Store guidelines)

---

## 3. Acessibilidade (AA Level)

### 3.1 Contraste de Cores
- [ ] **Validação WebAIM:** Todas as combinações texto/fundo ≥ 4.5:1
  - [ ] Compliance.tsx
  - [ ] MedicationDose.tsx
  - [ ] Schedule.tsx
  - [ ] Permissions.tsx
  - [ ] privacy.tsx
  - [ ] finance/index.tsx
  - [ ] treatment/pause.tsx
  - [ ] habits/alcohol.tsx
- [ ] **Dark mode:** Contraste também válido em modo escuro

### 3.2 Touch Areas
- [ ] **iOS HIG / Material Design:** Botões e elementos interativos ≥ 44x44 pixels
  - [ ] Botões de navegação (próximo, voltar)
  - [ ] Checkboxes (LGPD, analytics)
  - [ ] Day picker (seg-dom)
  - [ ] Quick Actions (5 ações)

### 3.3 SafeArea
- [ ] **TODAS as telas novas usam SafeAreaView:**
  - [ ] app/(onboarding)/Welcome.tsx
  - [ ] app/(onboarding)/Compliance.tsx
  - [ ] app/(onboarding)/MedicationDose.tsx
  - [ ] app/(onboarding)/Schedule.tsx
  - [ ] app/(onboarding)/Permissions.tsx
  - [ ] app/(tabs)/settings/privacy.tsx
  - [ ] app/(tabs)/finance/index.tsx
  - [ ] app/(tabs)/finance/add-purchase.tsx
  - [ ] app/(tabs)/treatment/pause.tsx
  - [ ] app/(tabs)/habits/alcohol.tsx

### 3.4 Dark Mode
- [ ] **Todas as telas novas renderizam corretamente em dark mode**
- [ ] Cores adaptam-se automaticamente (useColors hook)
- [ ] Sem áreas "quebradas" ou ilegíveis

### 3.5 Screen Readers
- [ ] **VoiceOver (iOS):**
  - [ ] Labels descritivas em todos os botões
  - [ ] Ordem de foco lógica
  - [ ] Coachmarks anunciam título e descrição
- [ ] **TalkBack (Android):**
  - [ ] Idem iOS
  - [ ] Gestos de navegação funcionam

### 3.6 Coachmarks Acessíveis
- [ ] Botão "Pular tour" visível e acessível
- [ ] Foco automático no botão principal
- [ ] accessibilityLabel e accessibilityHint presentes

---

## 4. UX

### 4.1 Estados Vazios
- [ ] **finance/index.tsx:** Ilustração + "Nenhuma compra registrada"
- [ ] **treatment/pause.tsx:** Estado "Tratamento Ativo" claro
- [ ] **habits/alcohol.tsx:** Calendário vazio com instrução

### 4.2 Feedback Visual
- [ ] **Loading:** Spinners durante operações assíncronas (salvar, deletar)
- [ ] **Success:** Toasts/alerts de sucesso visíveis
- [ ] **Error:** Mensagens de erro claras e acionáveis

### 4.3 Transições Suaves
- [ ] **Navegação:** Transições entre telas fluidas (60fps)
- [ ] **Modals:** Animações de entrada/saída suaves
- [ ] **Coachmarks:** Fade in/out suave

---

## 5. Testes Automatizados

### 5.1 ESLint Acessibilidade
- [ ] `eslint-plugin-jsx-a11y` configurado
- [ ] `npx eslint . --ext .tsx,.ts` passa sem erros de a11y

### 5.2 Testes Unitários
- [ ] **lib/streaks.test.ts:** isWithinWindow funciona corretamente
- [ ] **lib/notifications.test.ts:** Timezone/DST (6 cenários)
- [ ] **lib/finance.test.ts:** Cálculos corretos (total, R$/sem, R$/kg)
- [ ] **lib/analytics.test.ts:** Bloqueio sem opt-in, estado padrão = false

### 5.3 Screenshot Tests
- [ ] Todas as telas novas (C1-C6) em light + dark mode
- [ ] SafeArea validado em iPhone 14+ (notch/dynamic island)
- [ ] Barra de navegação validada em Android (gesture navigation)

---

## 6. Testes Manuais

### 6.1 iOS (iPhone 14 Pro + iPhone SE 3rd Gen)
- [ ] Onboarding 1→5 completo
- [ ] Adicionar aplicação
- [ ] Adicionar peso (2+ pesagens)
- [ ] Adicionar compra
- [ ] Pausar e retomar tratamento
- [ ] Marcar álcool
- [ ] Editar horário de notificação
- [ ] Alterar opt-in de analytics
- [ ] Dark mode funcional
- [ ] VoiceOver funcional

### 6.2 Android (Pixel 7 + Galaxy A52)
- [ ] Idem iOS
- [ ] Back button nativo funciona
- [ ] Gesture navigation funciona
- [ ] TalkBack funcional

---

## 7. Documentação

### 7.1 Vídeos/GIFs
- [ ] 6 vídeos criados (30s cada)
- [ ] 3 GIFs criados (10-15s cada)
- [ ] Arquivos salvos em `docs/media/`

### 7.2 README.md
- [ ] Seção IA de Nutrição removida
- [ ] Seção Módulo Financeiro adicionada
- [ ] Seção Pausas e Álcool adicionada
- [ ] Screenshots atualizados
- [ ] Badge LGPD adicionado

### 7.3 CHANGELOG.md
- [ ] Formato semântico (Added, Changed, Removed, Fixed, Security)
- [ ] Todas as features C0-C6 listadas
- [ ] Breaking changes documentados

### 7.4 Release Notes
- [ ] `docs/release-notes-2.0.0.md` criado
- [ ] Versão simplificada para usuários finais

---

## 8. PR Final

- [ ] Branch `release/qa-compliance` → `main` criado
- [ ] Título: "Release 2.0.0: Refatoração Completa (C0-C6)"
- [ ] Descrição detalhada com checklist preenchido
- [ ] Links para vídeos/GIFs incluídos
- [ ] Aprovação de stakeholders obtida

---

## Definition of Done

- [ ] **100% das validações acima passaram**
- [ ] **0 erros de linting**
- [ ] **0 crashes em testes manuais**
- [ ] **Documentação completa e atualizada**
- [ ] **Aprovação formal de PM, Design Lead e Tech Lead**

---

## Notas

- **Prioridade Crítica:** Compliance (seção 2) - qualquer falha é bloqueante para release
- **Testes em Devices Físicos:** Notificações DEVEM ser testadas em devices reais (não simulador)
- **Screenshots Obrigatórios:** Compliance.tsx com disclaimer visível é MANDATÓRIO para auditoria legal

---

**Última Atualização:** 2025-11-13  
**Status:** ⏳ Em Progresso

