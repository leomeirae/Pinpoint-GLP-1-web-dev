# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.0.1] - 2025-11-13

### Fixed

- **Onboarding:** Corrigido erro de contagem (agora tem exatamente 5 telas, não 6)
  - Removido `FeatureHook` do navigation stack (estava causando 6ª tela indevida)
  - `FeatureHook.tsx` deletado completamente (não usado)
- **Feature Flags:** Resolvido conflito entre `FF_ONBOARDING_23` e `FF_ONBOARDING_5_CORE`
  - `FF_ONBOARDING_23` desativado e removido da interface
  - `FF_ONBOARDING_CORE8` removido (não utilizado)
- **Dashboard:** Adicionados cards principais conforme planejamento C2
  - Card "Evolução do Peso" (gráfico simples de progresso)
  - Card "Investimento" (resumo financeiro com opt-in para R$/kg)

### Removed

- **Código Legado:** Limpeza completa do onboarding antigo
  - Deletado `app/(auth)/onboarding-flow.tsx` (618 linhas)
  - Deletados 27 componentes legados do diretório `components/onboarding/`
  - Mantidos apenas 4 componentes necessários para novo onboarding
  - Arquivo `components/onboarding/index.ts` limpo de exports obsoletos

### Changed

- **Progress Indicator:** Mantido em 5 passos (já estava correto)
- **Estrutura:** ~4.735 linhas de código legado removidas

---

## [2.0.0] - 2025-11-15

### Added

- **Onboarding Core (C1):** 5 telas essenciais focadas no que importa
  - Welcome: Boas-vindas e introdução ao app
  - Compliance: Disclaimer clínico + consentimento LGPD obrigatório
  - MedicationDose: Seleção de medicamento e dose condicionada
  - Schedule: Configuração de dia e horário preferido para aplicação
  - Permissions: Solicitação graciosa de permissões de notificação
- **Notificações Semanais (C2):** Sistema confiável de lembretes
  - Janela de aplicação configurável (ex: 19:00-23:00)
  - Notificações inicial e catch-up
  - Suporte a timezone/DST
  - Deep-links para tela de aplicação
  - Tela de edição de horário em configurações
- **Coachmarks + Quick Actions (C3):**
  - Sistema de tooltips/spotlights para guiar usuários (exibição única)
  - Card de Quick Actions no dashboard (5 ações principais)
  - Deep-links funcionais para todas as ações
  - Acessibilidade completa (botão "Pular", foco automático)
- **Módulo Financeiro MVP (C4):**
  - CRUD completo de compras de medicação
  - Métricas financeiras: Total gasto, R$/semana, Próxima compra prevista
  - R$/kg condicionado a opt-in + 2+ pesagens (com tooltip explicativo)
  - Formatação BRL correta (R$ 1.234,56)
  - Estados vazios claros
  - Modal de opt-in para métrica R$/kg
- **Pausas de Tratamento (C5):**
  - Controle de pausas com start/end dates
  - Desligamento automático de lembretes ao pausar
  - Reagendamento automático ao retomar
  - Timeline de pausas anteriores
  - Integração com Quick Actions
- **Logging de Álcool (C5):**
  - Toggle diário de consumo
  - Campos opcionais: quantidade de drinks, notas
  - Calendário visual com dias marcados
  - Overlays discretos em gráficos de peso e medicação
  - Integração com Quick Actions
- **Analytics Opt-in (C6):** Compliance LGPD/GDPR
  - Checkbox obrigatório no onboarding (opcional para o usuário)
  - Bloqueio absoluto de eventos sem opt-in (estado padrão: false)
  - Tela de privacidade em configurações
  - Histórico de consentimentos (tabela `consent_history`)
  - Cache em memória para performance
- **QA & Compliance (C7):**
  - Checklist completo de QA em `docs/qa-checklist.md`
  - ESLint Acessibilidade configurado (jsx-a11y)
  - Testes unitários críticos (finance, analytics)
  - Screenshot tests para C1-C6 (light + dark mode)

### Changed

- **Doses condicionadas por medicamento:**
  - Mounjaro: apenas [2.5, 5, 7.5, 10, 12.5, 15] mg
  - Retatrutida: apenas [2, 4, 6, 8, 10, 12] mg
  - Validação impeditiva para doses inválidas
- **Frequência de medicação:**
  - Removida opção "diária" (apenas semanal para GLP-1)
  - Validação em todo o código (grep completo)
- **Copy clínica:**
  - Prioridade a nomes genéricos (Tirzepatida, Semaglutida) sobre marcas
  - Tom neutro e profissional (sem emojis, sem gírias)
  - Formato 24h para horários
  - Moeda BRL (R$) com formatação correta
- **Onboarding:**
  - Reduzido de 23 para 5 telas core (foco no essencial)
  - Navegação simplificada (back/forward funcional)
  - Persistência local (AsyncStorage) + Supabase

### Removed

- **IA de Nutrição (Gemini):** Feature descontinuada
  - Arquivos deletados: `lib/gemini.ts`, `hooks/useGeminiChat.ts`, `hooks/useNutrition.ts`
  - Componentes deletados: `components/nutrition/` (diretório completo)
  - Tela deletada: `app/(tabs)/add-nutrition.tsx`
  - Aba "AI" removida da navegação
- **Dependência @google/generative-ai** removida do `package.json`
- **Variável de ambiente EXPO_PUBLIC_GEMINI_API_KEY** removida

### Fixed

- **Notificações:**
  - Agora disparam corretamente em iOS e Android
  - Timezone/DST tratados adequadamente
  - Persistência após restart do app
- **SafeArea:**
  - Todas as telas novas (C1-C6) usam `SafeAreaView`
  - Compatível com notch/dynamic island (iPhone 14+)
  - Compatível com gesture navigation (Android)
- **Dark Mode:**
  - Funcional em todas as telas novas
  - Cores adaptam-se automaticamente via `useColors` hook
- **Acessibilidade:**
  - Contraste ≥ 4.5:1 (AA level) validado
  - Touch areas ≥ 44×44 pixels
  - Labels descritivas para VoiceOver/TalkBack
- **Navegação:**
  - Back button nativo funciona corretamente (Android)
  - Deep-links funcionais para Quick Actions
  - Timeout adicionado antes de `router.replace()` para evitar erros de montagem

### Security

- **RLS (Row Level Security)** habilitado em todas as tabelas novas:
  - `purchases` (C4)
  - `treatment_pauses` (C5)
  - `alcohol_logs` (C5)
  - `consent_history` (C6)
- **Criptografia de recibos:** Supabase Storage com AES-256 em repouso
- **Bloqueio absoluto de analytics sem opt-in:**
  - Estado padrão: `analyticsOptIn = false` (fail-safe)
  - Verificação obrigatória em `trackEvent()` antes de enviar para rede
  - Modo convidado: eventos ficam apenas locais (não enviados para servidor)
- **Auditoria de consentimentos:**
  - Tabela `consent_history` com timestamps e versões
  - Histórico acessível ao usuário em tela de privacidade

---

## [1.0.0] - 2025-01-01

### Added

- Primeira versão do aplicativo Pinpoint GLP-1
- Onboarding com 23 telas
- Dashboard com progresso de peso
- Registro de aplicações
- Gráficos de progresso
- Calendário de aplicações
- 8 temas personalizados
- Autenticação com Clerk
- Banco de dados Supabase

---

[2.0.0]: https://github.com/leomeirae/Pinpoint-GLP-1/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/leomeirae/Pinpoint-GLP-1/releases/tag/v1.0.0

