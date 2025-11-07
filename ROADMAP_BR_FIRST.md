# 🚀 ROADMAP PINPOINT GLP-1 - BR-FIRST STRATEGY

**Objetivo**: Tornar o Pinpoint o app líder de tracking GLP-1 no Brasil, explorando vantagens competitivas e fechando gaps críticos identificados na análise Shotsy vs Pinpoint.

---

## 📊 SITUAÇÃO ATUAL

### ✅ Paridade de 90% com Shotsy
- Onboarding completo (22 steps)
- Dashboard com estimativa farmacológica
- Tracking de injeções com rotação interativa (SUPERIOR ao Shotsy)
- Resultados/peso com gráficos
- Calendário visual
- Settings completos
- Nutrição com IA Gemini (ÚNICO!)
- Efeitos colaterais
- Gamificação com achievements
- Paywall/premium

### ❌ Gaps Críticos (10% faltante)
1. **iOS Widgets** - Shotsy tem 3 tamanhos
2. **Apple Health** - Shotsy sincroniza peso/calorias
3. **Export PDF** - Shotsy tem relatório profissional
4. **Confetti animations** - Shotsy tem feedback visual rico

### 🏆 Vantagens Competitivas
1. **Preço**: R$ 99-149/ano vs R$ 249.90 do Shotsy (40% mais barato)
2. **Compatibilidade**: iOS 13+ vs iOS 18+ (mercado 5x maior)
3. **IA Gemini**: Nutrição por foto/voz/texto (ÚNICO!)
4. **Rotação Interativa**: SVG body diagram (SUPERIOR)
5. **BR-first**: PT-BR clínico desde o início

---

## 🎯 FASES DE DESENVOLVIMENTO

### **FASE 1: FECHAR GAPS CRÍTICOS** (4-6 semanas)
**Prioridade**: ALTA - Atingir paridade de 100% com Shotsy

#### 1.1 iOS Widgets (2 semanas)
**O que fazer**:
- [ ] Criar target WidgetKit no Xcode (`ios/PinpointWidget`)
- [ ] Implementar 3 tamanhos: Small, Medium, Large
- [ ] Widget Small: Dias até próxima dose + círculo progresso
- [ ] Widget Medium: + Nível estimado atual
- [ ] Widget Large: + Gráfico de 7 dias
- [ ] Shared UserDefaults para data sharing entre app e widget
- [ ] Atualização automática via TimelineProvider

**Ferramentas**:
- WidgetKit (nativo iOS)
- Swift para widget extension
- React Native widget data bridge

**Success Metrics**:
- [ ] 3 widgets funcionais em todas as versões iOS 14+
- [ ] Atualização em tempo real (<5min delay)
- [ ] Taxa de adição ao home screen >15%

#### 1.2 Integração Apple Health (1 semana)
**O que fazer**:
- [ ] Adicionar HealthKit entitlement no Xcode
- [ ] Instalar `react-native-health` ou `expo-health`
- [ ] Sincronização bidirecional:
  - **Leitura**: Peso, altura, calorias, proteínas
  - **Escrita**: Peso registrado no Pinpoint → Apple Health
- [ ] UI para autorização de permissões
- [ ] Sync automático ao abrir app

**Success Metrics**:
- [ ] Sync peso bidirecional funcionando
- [ ] <5% error rate na sincronização
- [ ] Taxa de autorização de permissões >40%

#### 1.3 Export PDF Profissional (1 semana)
**O que fazer**:
- [ ] Instalar `react-native-html-to-pdf` ou `react-native-pdf-lib`
- [ ] Criar template clínico profissional:
  - Logo Pinpoint
  - Dados do paciente (nome, idade, peso, altura, IMC)
  - Tabela de injeções (data, dose, local, hora)
  - Gráfico de peso/IMC (30 dias)
  - Gráfico de níveis estimados
  - Tabela de efeitos colaterais
  - Seção de nutrição (proteínas diárias)
- [ ] Botão de compartilhar (WhatsApp, Email, Files)
- [ ] Opção de gerar para período customizado (30/60/90 dias)

**Success Metrics**:
- [ ] PDF gerado em <3 segundos
- [ ] Formato aceito por médicos (feedback qualitativo)
- [ ] Taxa de compartilhamento >25%

#### 1.4 Confetti & Microinterações (3 dias)
**O que fazer**:
- [ ] Instalar `react-native-confetti-cannon` ou `lottie-react-native`
- [ ] Confetti ao completar injeção
- [ ] Animação de 5 estrelas ao bater meta de peso
- [ ] Animação de troféu ao desbloquear achievement
- [ ] Haptic feedback em todas as ações principais
- [ ] Smooth transitions com `react-native-reanimated`

**Success Metrics**:
- [ ] 60fps em animações
- [ ] Haptic feedback em 100% das ações
- [ ] NPS +5 pontos após implementação

**Estimativa Fase 1**: **4-6 semanas** | **Investment**: 1 dev full-time

---

### **FASE 2: EXPLORAR VANTAGENS BR-FIRST** (6-8 semanas)
**Prioridade**: ALTA - Criar diferenciais únicos no mercado BR

#### 2.1 Calendário de Titulação Inteligente (2 semanas)
**O que fazer**:
- [ ] Criar wizard de titulação no onboarding:
  - Medicamento (Ozempic, Mounjaro, Wegovy, etc)
  - Protocolo escolhido (padrão, acelerado, personalizado)
- [ ] Calendário visual mostrando:
  - Doses programadas para 12 semanas
  - Aumentos de dosagem automáticos
  - Alertas de revisão médica
- [ ] Notificação 2 dias antes de aumentar dose
- [ ] Ajuste manual pelo usuário (com validação)

**Protocolos Implementar**:
- **Ozempic**: 0.25mg (4sem) → 0.5mg (4sem) → 1mg (manutenção)
- **Mounjaro**: 2.5mg (4sem) → 5mg (4sem) → 7.5mg → 10mg → 12.5mg → 15mg
- **Wegovy**: 0.25mg (4sem) → 0.5mg (4sem) → 1mg (4sem) → 1.7mg (4sem) → 2.4mg

**Success Metrics**:
- [ ] 80% dos usuários completam wizard de titulação
- [ ] Redução de 30% em "doses incorretas"
- [ ] NPS +10 pontos nesta feature

#### 2.2 Estimador Farmacológico com Widget (2 semanas)
**O que fazer**:
- [ ] Algoritmo de half-life transparente:
  - Semaglutida: 168h (7 dias)
  - Tirzepatida: 120h (5 dias)
- [ ] Widget iOS/Android mostrando:
  - % do medicamento no corpo AGORA
  - Gráfico de 14 dias (passado + futuro)
  - Próxima injeção programada
- [ ] Explicação educacional (ícone "i"):
  - O que é half-life
  - Por que importa para efeitos colaterais
  - Relação com janela de aplicação

**Success Metrics**:
- [ ] 60% dos usuários ativam widget de nível
- [ ] Redução de 40% em "esqueci de aplicar"
- [ ] Engagement +20% (aberturas/semana)

#### 2.3 Relatório Clínico BR-Compliant (1 semana)
**O que fazer**:
- [ ] Expandir PDF export com seções BR-específicas:
  - Termo de consentimento LGPD
  - Alerta de uso off-label (se aplicável)
  - Referências ANVISA para medicamentos
  - QR code para médico validar autenticidade
- [ ] Seção "Perguntas para o Médico" (sugeridas pelo app)
- [ ] Campo "Próxima Consulta" no profile

**Success Metrics**:
- [ ] 50% dos PDFs gerados são compartilhados com médico
- [ ] Feedback positivo de 20 médicos (pesquisa qualitativa)

#### 2.4 Checklist de Dia de Injeção (1 semana)
**O que fazer**:
- [ ] Notificação no dia da injeção com checklist:
  - [ ] Caneta na temperatura certa? (2-8°C)
  - [ ] Álcool 70% pronto?
  - [ ] Algodão separado?
  - [ ] Rotação de sítio decidida?
  - [ ] Timer de 5-10 segundos após injeção?
- [ ] Gamificação: Badge "Preparado" ao completar 10x
- [ ] Opção de customizar checklist

**Success Metrics**:
- [ ] 70% dos usuários completam checklist antes de injetar
- [ ] Redução de 50% em "dor no local" (efeito colateral)

#### 2.5 Controle de Cadeia Fria (1 semana)
**O que fazer**:
- [ ] Adicionar campo "Estoque de Canetas":
  - Quantas canetas tenho?
  - Data de validade de cada
  - Local de armazenamento (geladeira, caixa térmica viagem)
- [ ] Alertas:
  - "Caneta na temperatura ambiente >30min" (timer manual)
  - "Caneta vencendo em 7 dias"
  - "Estoque baixo - 1 caneta restante"
- [ ] Log de temperatura (manual ou integração futura com sensor)

**Success Metrics**:
- [ ] 40% dos usuários ativam controle de estoque
- [ ] Redução de 80% em "caneta vencida" (auto-reporte)

#### 2.6 Suporte Multi-Medicamentos Real (1 semana)
**O que fazer**:
- [ ] Permitir múltiplos medicamentos ativos:
  - Ozempic + Metformina
  - Mounjaro + Liraglutida (transição)
- [ ] Dashboard mostra ambos separadamente
- [ ] Calendário com cores diferentes por medicamento
- [ ] Alertas de interação (database de interações)

**Success Metrics**:
- [ ] 15% dos usuários registram 2+ medicamentos
- [ ] 0 bugs relacionados a multi-tracking

**Estimativa Fase 2**: **6-8 semanas** | **Investment**: 1 dev full-time

---

### **FASE 3: NUTRIÇÃO IA - VANTAGEM ÚNICA** (4 semanas)
**Prioridade**: MÉDIA-ALTA - Explorar diferencial Gemini AI

#### 3.1 Melhorias Gemini AI Nutrition (2 semanas)
**O que fazer**:
- [ ] Adicionar suporte a código de barras (EAN-13, EAN-8, UPC):
  - Instalar `react-native-camera` ou `expo-barcode-scanner`
  - Integração com OpenFoodFacts API (database BR completo)
  - Fallback para Gemini Vision se produto não encontrado
- [ ] Histórico de refeições com fotos
- [ ] Sugestões de refeições alto-proteína (>30g)
- [ ] Meta diária de proteínas baseada em peso/altura
- [ ] Gráfico semanal de proteínas vs meta

**Success Metrics**:
- [ ] 50% dos usuários registram ao menos 1 refeição/dia
- [ ] Accuracy de 85% no reconhecimento de proteínas (vs manual)
- [ ] Tempo médio de registro <30 segundos

#### 3.2 Integração Nutrição → Estimador (1 semana)
**O que fazer**:
- [ ] Correlacionar nutrição com nível de medicamento:
  - "Seu nível está baixo hoje - evite refeições pesadas"
  - "Pico do medicamento - boa hora para refeição proteica"
- [ ] Insights semanais:
  - "Você comeu mais proteína nos dias pós-injeção"
  - "Correlação: menos proteína = mais fome reportada"

**Success Metrics**:
- [ ] 30% dos usuários ativam insights de correlação
- [ ] NPS +8 pontos nesta feature

#### 3.3 Receitas e Comunidade (1 semana)
**O que fazer**:
- [ ] Biblioteca de receitas alto-proteína:
  - 50 receitas BR (moqueca, feijoada light, etc)
  - Filtros: tempo preparo, calorias, proteínas
  - Fotos profissionais
- [ ] Comunidade (feed simples):
  - Usuários compartilham receitas (moderado)
  - Curtir/salvar receitas
  - Gamificação: Badge "Chef" aos 10 receitas compartilhadas

**Success Metrics**:
- [ ] 20% dos usuários acessam receitas semanalmente
- [ ] 5% dos usuários compartilham receita
- [ ] Retention +10% (D7, D30)

**Estimativa Fase 3**: **4 semanas** | **Investment**: 1 dev full-time + 1 designer part-time

---

### **FASE 4: POLIMENTO & CRESCIMENTO** (Ongoing)
**Prioridade**: MÉDIA - Otimização e marketing

#### 4.1 Acessibilidade (2 semanas)
- [ ] VoiceOver/TalkBack completo
- [ ] Dynamic Type (iOS) e Font Scaling (Android)
- [ ] Contraste mínimo WCAG AA
- [ ] Closed captions em vídeos de onboarding
- [ ] Modo daltônico (opção de cores)

#### 4.2 Performance (1 semana)
- [ ] Bundle size <20MB
- [ ] Startup time <2s
- [ ] Crash rate <0.1%
- [ ] ANR rate <0.05%
- [ ] Hermes engine otimizado

#### 4.3 Marketing BR-First (Ongoing)
- [ ] Landing page PT-BR otimizada SEO
- [ ] Blog com conteúdo educacional:
  - "Como funciona o GLP-1"
  - "Titulação segura de Ozempic"
  - "Rotação de sítios: por que importa"
- [ ] Parcerias com influencers saúde BR
- [ ] Testemunhos de médicos BR (vídeo)
- [ ] App Store Optimization (ASO):
  - Keywords: "ozempic", "mounjaro", "wegovy", "semaglutida", "tirzepatida"
  - Screenshots PT-BR
  - Preview video mostrando features únicos

#### 4.4 Pricing Strategy
**Sugestão**:
- **Freemium**: Tracking básico grátis (injeções + peso)
- **Premium Mensal**: R$ 19.90/mês
- **Premium Anual**: R$ 149/ano (R$ 12.42/mês) - **40% mais barato que Shotsy**
- **Premium Lifetime**: R$ 399 (one-time)

**Features Premium**:
- ✅ Widgets iOS/Android
- ✅ Apple Health sync
- ✅ Export PDF ilimitado
- ✅ Nutrição IA ilimitada (freemium: 10/mês)
- ✅ Calendário de titulação
- ✅ Controle de cadeia fria
- ✅ Sem anúncios
- ✅ Suporte prioritário

**Success Metrics**:
- Conversion rate: 8-12% (vs média 3-5%)
- LTV: R$ 200+ (12 meses retenção)
- CAC: <R$ 50 (organic + paid)

---

## 📈 MÉTRICAS DE SUCESSO GLOBAIS

### KPIs Principais (6 meses)
- [ ] **Downloads**: 10.000+ (iOS + Android)
- [ ] **DAU/MAU**: >30% (engagement diário)
- [ ] **Retention D30**: >40%
- [ ] **Conversion Free→Premium**: >10%
- [ ] **MRR**: R$ 20.000+ (1.000 assinantes)
- [ ] **NPS**: >60 (promoters)
- [ ] **Crash Rate**: <0.1%
- [ ] **App Store Rating**: >4.7★

### Métricas Secundárias
- Tempo médio sessão: >3min
- Injeções registradas/usuário: >10
- PDFs gerados/mês: >500
- Widgets adicionados: >2.000
- Receitas compartilhadas: >100

---

## 🛠️ STACK TECNOLÓGICO

### Atual (Mantido)
- **Framework**: React Native + Expo
- **Linguagem**: TypeScript
- **Autenticação**: Clerk
- **Backend**: Supabase (PostgreSQL + RLS)
- **Storage**: AsyncStorage (local) + Supabase (cloud)
- **Analytics**: Expo Analytics / PostHog
- **AI**: Google Gemini API
- **Gráficos**: react-native-svg + react-native-chart-kit
- **Notificações**: Expo Notifications

### Adições Necessárias
- **Widgets**: WidgetKit (iOS) + Glance Widget (Android)
- **Health**: react-native-health / expo-health
- **PDF**: react-native-html-to-pdf / react-native-pdf-lib
- **Animations**: lottie-react-native + react-native-reanimated
- **Barcode**: expo-barcode-scanner
- **Camera**: react-native-camera / expo-camera
- **Food Database**: OpenFoodFacts API

---

## 💰 INVESTIMENTO ESTIMADO

### Desenvolvimento (6 meses)
- **Dev Full-time** (1): R$ 12.000/mês × 6 = **R$ 72.000**
- **Designer Part-time** (0.5): R$ 5.000/mês × 3 = **R$ 15.000**
- **Total Dev**: **R$ 87.000**

### Infraestrutura (6 meses)
- Supabase Pro: $25/mês × 6 = **R$ 900**
- Clerk Pro: $25/mês × 6 = **R$ 900**
- Gemini API: ~$50/mês × 6 = **R$ 1.800**
- Apple Developer: $99/ano = **R$ 500**
- Google Play: $25 one-time = **R$ 150**
- Domain + Hosting: R$ 50/mês × 6 = **R$ 300**
- **Total Infra**: **R$ 4.550**

### Marketing (6 meses)
- Ads (Google + Meta): R$ 3.000/mês × 6 = **R$ 18.000**
- Influencers: R$ 5.000 (3 campanhas)
- Content (blog): R$ 2.000
- **Total Marketing**: **R$ 25.000**

### **INVESTIMENTO TOTAL 6 MESES**: **R$ 116.550**

### **Break-even**:
- Com 1.000 assinantes anuais (R$ 149/ano) = **R$ 149.000 ARR**
- Break-even em ~7-8 meses
- Com 2.000 assinantes = **R$ 298.000 ARR** (lucro R$ 181.450 no primeiro ano)

---

## 🎯 ROADMAP VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│  MÊS 1-2     │  MÊS 3-4     │  MÊS 5-6     │  MÊS 7-12          │
├─────────────────────────────────────────────────────────────────┤
│  FASE 1      │  FASE 2      │  FASE 3      │  FASE 4            │
│  Paridade    │  BR-First    │  IA Vantage  │  Crescimento       │
│  100%        │  Features    │  Nutrition   │  & Scale           │
│              │              │              │                    │
│  ✓ Widgets   │  ✓ Titulação │  ✓ Barcode   │  ✓ Acessibilidade  │
│  ✓ Health    │  ✓ Estimador │  ✓ Receitas  │  ✓ Performance     │
│  ✓ PDF       │  ✓ Checklist │  ✓ Insights  │  ✓ Marketing       │
│  ✓ Confetti  │  ✓ Multi-med │  ✓ Comunidade│  ✓ Partnerships    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Competição aumenta (Shotsy baixa preço)
**Mitigação**:
- Nossos diferenciais são features, não só preço (IA, iOS 13+, BR-first)
- Lançar rápido (6 meses) antes de competição se adaptar

### Risco 2: Mudanças regulatórias ANVISA
**Mitigação**:
- Disclaimer claro: "não substitui consulta médica"
- Compliance LGPD desde dia 1
- Termo de uso robusto

### Risco 3: Apple rejeita app (guidelines)
**Mitigação**:
- Review cuidadoso das guidelines 4.5 (Health apps)
- Não fazer claims médicos
- Privacy policy clara

### Risco 4: Custo Gemini API alto
**Mitigação**:
- Cache agressivo de respostas similares
- Fallback para OpenFoodFacts (grátis)
- Limitar free tier (10/mês)

### Risco 5: Baixa conversão Free→Premium
**Mitigação**:
- A/B test de paywalls
- Trial grátis de 7 dias
- Oferecer valor claro (PDF, widgets, IA ilimitada)

---

## ✅ CHECKLIST DE LANÇAMENTO

### Pre-Launch (Fase 1 completa)
- [ ] Todas as features Fase 1 implementadas
- [ ] Testado em 5+ dispositivos iOS (13-18)
- [ ] Testado em 5+ dispositivos Android (8-14)
- [ ] Crash rate <0.1% em beta
- [ ] 20+ beta testers deram feedback
- [ ] Privacy policy publicada
- [ ] Terms of service publicados
- [ ] App Store screenshots/preview prontos
- [ ] Google Play screenshots/preview prontos

### Launch Day
- [ ] Submetido à Apple App Store
- [ ] Submetido ao Google Play Store
- [ ] Landing page no ar (pinpointglp1.app)
- [ ] Blog com 3 posts iniciais
- [ ] Social media criadas (Instagram, YouTube)
- [ ] Press kit preparado

### Post-Launch (Primeiras 4 semanas)
- [ ] Monitorar reviews diariamente
- [ ] Responder todos os feedbacks
- [ ] Hotfixes para bugs críticos <24h
- [ ] A/B test paywall (2 variantes)
- [ ] 1 post blog/semana
- [ ] 3 posts Instagram/semana
- [ ] Primeira campanha de influencers

---

## 📞 PRÓXIMOS PASSOS IMEDIATOS

1. **Aprovar roadmap** com stakeholders
2. **Contratar dev full-time** (ou alocar time)
3. **Setup infra** (Supabase Pro, Clerk Pro, Gemini API)
4. **Kickoff Fase 1** - começar por Widgets iOS (maior impacto)
5. **Recrutar beta testers** (target: 50 usuários BR de GLP-1)

---

**Última atualização**: 2025-01-XX
**Versão**: 1.0
**Autor**: Roadmap gerado via análise competitiva Shotsy vs Pinpoint
