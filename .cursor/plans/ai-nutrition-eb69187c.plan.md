<!-- eb69187c-ebae-435c-bbb8-a09c3d3acd3a 7bbd19a2-5da0-49bb-8162-3c4eb9b33244 -->
# Plano de Paridade: Shotsy → Mounjaro Tracker (Atualizado)

## Contexto Expandido

Analisar 37 screenshots do Shotsy + insights de mercado (augustwanner.com, competidor DoseDiary) e o repositório Mounjaro Tracker para identificar gaps funcionais, de UX e de monetização.

**INSIGHT CRÍTICO**: Shotsy usa modelo Shotsy+ (premium) que gerou competidores oferecendo features core grátis. Mounjaro Tracker precisa de estratégia de monetização equilibrada.

## Fontes de Análise

### Screenshots & Docs

- **PNGs**: 37 arquivos `IMG_0613` a `IMG_0651` (prioridade máxima)
- **PDF**: `assets/shotsy-imagens/imagens_shotsy.pdf`
- **Repo**: `/Users/user/Desktop/mounjaro-tracker`
- **Status**: `STATUS-ATUAL-PROJETO.md`, `ONBOARDING-VIDEO-GUIDE.md`

### Insights de Mercado

- **August Wanner** (designer Shotsy): Won Shippie Award 2024, milestone celebrations, custom metrics
- **DoseDiary** (competidor): Criado porque Shotsy cobrava features, 560 users em 2 semanas, PWA grátis
- **FAQ Shotsy**: 12 perguntas críticas incluindo "O que inclui Shotsy+ premium?"

## Deliverables (8 documentos)

### 1. SHOTSY-MOUNJARO-PARITY-MATRIX.md

Matriz com colunas: Funcionalidade | Tela/Fluxo | Shotsy | Mounjaro | Gap | Prioridade | Aceite

Áreas cobertas:

- Onboarding (23 telas vs 4)
- Summary/Dashboard  
- Add Shot/Injection
- Shots List (swipe edit/delete)
- Results & Gráficos
- Calendar
- Settings/Ajustes & FAQ
- **Shotsy+ Features** (paywall)
- Widgets iOS
- Apple Health
- Milestone Celebrations
- Custom Metrics/Side Effects

### 2. SHOTSY-FLOWS-MAP.md

Mermaid diagram dos fluxos:

- Welcome → Onboarding (23 steps) → Dashboard
- Dashboard → Add Shot → Success → Milestone?
- Dashboard → Shots → Swipe Edit/Delete
- Dashboard → Results → Period Filters
- Dashboard → Calendar → Day View
- Dashboard → Settings → FAQ/Premium
- **Paywall triggers** (quando aparece Shotsy+)

### 3. PARITY-BACKLOG.md

Backlog P0/P1/P2 com Given/When/Then

Exemplo P0:

```
[P0-001] Onboarding - 19 telas faltantes
Descrição: Implementar telas 5-23 do Shotsy
Aceite: G/W/T completo
Dependências: Microcopy, Profile schema
Impacto: CRÍTICO
Risco: Médio
Estimativa: 40h
```

Exemplo P0 NOVO:

```
[P0-015] Shotsy+ Paywall - Trial 1 semana
Descrição: Implementar paywall com Clerk Payments
Aceite: 
- Given usuário free
- When usa >X features premium
- Then vê modal Shotsy+ com trial 1 semana
Dependências: Clerk Payments integration
Impacto: MONETIZAÇÃO
Risco: Alto (payment flow)
Estimativa: 20h
```

### 4. MICROCOPY-TABLE.md

Tabela: Tela | Elemento | Texto PT-BR | Limite | Observações

Incluir:

- Todos os 23 passos de onboarding
- Botões, labels, placeholders
- Mensagens de erro/sucesso
- **FAQ (12 perguntas do Shotsy)**
- **Shotsy+ copy** (modal, benefícios, CTA)

### 5. TRACKING-EVENTS-SPEC.md

Eventos analytics:

```
onboarding_started
onboarding_step_completed
shot_log_create
milestone_achieved (NOVO)
premium_modal_shown (NOVO)
premium_trial_started (NOVO)
premium_subscribed (NOVO)
results_period_changed
faq_viewed (NOVO)
```

### 6. MONETIZATION-STRATEGY.md (NOVO)

Documento sobre estratégia de monetização:

**Modelo Shotsy**:

- Shotsy+ premium (features pagas)
- Trial 1 semana
- (Investigar preço nos screenshots)

**Competidor DoseDiary**:

- Core features grátis
- Sem ads
- Payment único opcional
- 560 users em 2 semanas

**Recomendação Mounjaro Tracker**:

- Definir features free vs premium
- Trial period? (7 dias como Shotsy)
- Clerk Payments (já na stack)
- Pricing tier?

### 7. IMPLEMENTATION-PHASES.md

#### Fase 1 (P0): Paridade Core (3-4 semanas)

- Onboarding 23 telas
- Add Shot completo
- Dashboard layout Shotsy
- FAQ básico

#### Fase 2 (P1): Features + Monetização (2-3 semanas)

- Estados vazios/erro
- Swipe actions
- **Shotsy+ paywall**
- **Trial 1 semana**
- Custom metrics

#### Fase 3 (P2): Polimento (1-2 semanas)

- **Milestone celebrations**
- Animações
- Haptic feedback
- Acessibilidade

### 8. PARITY-RISKS.md

| Risco | Severidade | Mitigação |

|-------|------------|-----------|

| Paywall invasivo (como Shotsy) | Alta | Balancear free/premium features |

| Competidores grátis (DoseDiary) | Média | Diferenciar por UX superior |

| Clerk Payments complexo | Alta | Poc antes de full integration |

| Regressão funcionalidades | Alta | Feature flags |

## Processo de Execução

1. **Ler 37 PNGs** - extrair flows, microcopy, estados, paywall triggers
2. **Auditar Mounjaro** - comparar telas, componentes, hooks
3. **Analisar FAQ Shotsy** - 12 perguntas críticas
4. **Matriz de Paridade** - gaps P0/P1/P2
5. **Extrair Microcopy** - exato dos PNGs
6. **Definir Monetização** - Shotsy+ vs DoseDiary vs Mounjaro
7. **Tracking Events** - incluir premium/milestone events
8. **Documentar Riscos** - paywall, competição

## Assunções & Decisões

- Shotsy+ existe mas não sabemos features exatas → investigar screenshots
- Trial 1 semana confirmado (visível na FAQ anexada)
- Clerk Payments já na stack (confirmar capability paywall)
- Mounjaro deve ter paywall mas menos agressivo que Shotsy
- FAQ é P1 (não P0)
- Milestone celebrations são P2 (nice-to-have)

## Outputs Finais

8 arquivos Markdown:

1. `SHOTSY-MOUNJARO-PARITY-MATRIX.md`
2. `SHOTSY-FLOWS-MAP.md`
3. `PARITY-BACKLOG.md`
4. `MICROCOPY-TABLE.md`
5. `TRACKING-EVENTS-SPEC.md`
6. `MONETIZATION-STRATEGY.md` ⭐ NOVO
7. `IMPLEMENTATION-PHASES.md`
8. `PARITY-RISKS.md`

### To-dos

- [ ] Criar cliente Gemini com system prompt e guardrails