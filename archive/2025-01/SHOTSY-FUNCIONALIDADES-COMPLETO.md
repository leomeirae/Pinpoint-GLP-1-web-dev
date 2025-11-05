# 📱 SHOTSY APP - RELATÓRIO COMPLETO DE FUNCIONALIDADES

**Data:** 31 de Outubro de 2025  
**Fonte:** https://shotsyapp.com/  
**Objetivo:** Base de referência para desenvolvimento do Mounjaro Tracker

---

## 🎯 VISÃO GERAL DO APLICATIVO

### Propósito
Shotsy é uma ferramenta abrangente de rastreamento personalizado para usuários de medicamentos GLP-1, incluindo:
- **Ozempic®**
- **Mounjaro®** 
- **Wegovy®**
- **Zepbound®**

### Números de Mercado
- ⭐ **4.8/5** de avaliação
- 📝 **2,800** reviews
- 👥 **200K+** downloads/usuários

### Proposta de Valor
Suporte completo na jornada de perda de peso desde o início, com acompanhamento de progresso e otimização de resultados.

---

## 🏗️ ARQUITETURA DE TELAS (5 TABS PRINCIPAIS)

### 1. 📊 SUMMARY (RESUMO)
**Tela inicial com dashboard completo**

#### Seções:
1. **Histórico de Injeções**
   - Total de injeções tomadas (número)
   - Última dose administrada
   - Nível estimado de medicação no corpo
   - Link "Ver tudo >"

2. **Gráfico de Níveis Estimados**
   - Visualização temporal (Semana | Mês | 90 dias | Tudo)
   - Gráfico de área com linha sólida + tracejada (projeção)
   - Valor atual destacado (ex: "1.17mg")
   - Labels de dosagem
   - Botão "Jump to Today"

3. **Widget Próxima Injeção**
   - Anel circular com gradiente colorido
   - Estados dinâmicos:
     - "It's shot day!" (quando é dia da dose)
     - "You did it!" (quando já aplicou)
     - "X days until next shot" (contagem regressiva)
   - Botão "Mark as taken" / "Editar aplicação"
   - Estado inicial: "Bem-vindo! Adicione sua primeira injeção"

4. **Seção "Hoje"**
   - **Cards rastreáveis:**
     - 💉 Peso
     - 🍖 Calorias
     - 🥩 Proteína
     - 😷 Efeitos colaterais
     - 📝 Notas do dia
   - Todos com "Toque para adicionar"

5. **Preview de Resultados**
   - 6 metric cards:
     - Mudança Total
     - IMC Atual
     - Peso
     - Por cento perdido
     - Média semanal
     - Para a meta
   - Link "Ver gráfico >"

---

### 2. 💉 SHOTS (INJEÇÕES)
**Gerenciamento de injeções**

#### Funcionalidades:

**Lista de Injeções:**
- Cards com informações completas:
  - Data e hora
  - Nome do medicamento
  - Dosagem (ex: "10mg")
  - Local da injeção
  - Efeitos colaterais (se houver)
- Ordenação cronológica (mais recente primeiro)
- Swipe actions:
  - Editar injeção
  - Deletar injeção

**Filtros:**
- Por medicamento
- Por período de tempo
- Por dosagem

**Adicionar Nova Injeção:**
- Botão "+" no header
- Modal/Tela com seções:
  
  1. **DATA & HORÁRIO**
     - Date picker com navegação
     - Time picker
  
  2. **DETALHES**
     - Seletor de medicamento (Mounjaro, Ozempic, Wegovy, Zepbound)
     - Seletor de dosagem
     - Diagrama do corpo para selecionar local
     - Slider de dor (0-10)
  
  3. **NOTAS**
     - Campo de texto livre
     - Adicionar efeitos colaterais

**Empty State:**
- "Nenhuma injeção registrada"
- CTA "Adicionar primeira injeção"

---

### 3. 📈 RESULTS (RESULTADOS)
**Gráficos e estatísticas de progresso**

#### Funcionalidades:

**Filtros de Período:**
- Tabs: 1 mês | 3 meses | 6 meses | Tudo

**Seção 1: Mudança de Peso**
- 6 metric cards (idênticos ao Summary):
  - Mudança Total
  - IMC Atual
  - Peso Atual
  - Porcentagem Perdida
  - Média Semanal
  - Distância para Meta

- **Gráfico Principal:**
  - Linha de peso ao longo do tempo
  - Grid no fundo
  - Marcadores de mudança de dosagem (cores diferentes)
  - Labels de data no eixo X
  - Valores de peso no eixo Y
  - Interativo (toque para ver valores exatos)

**Seção 2: Calorias**
- Card com média diária
- Gráfico de barras ou linha
- Tendência ao longo do período

**Seção 3: Proteína**
- Card com média diária
- Gráfico de consumo
- Meta diária vs real

**Integração com Apple Health:**
- Sincronização automática de:
  - Peso
  - Calorias
  - Proteína
  - Água

**Empty States:**
- "Importe dados do Apple Health"
- "Adicione peso no calendário"
- CTAs para cada tipo de dado

---

### 4. 📅 CALENDAR (CALENDÁRIO)
**Visualização temporal de eventos**

#### Funcionalidades:

**Mini Calendário (Header):**
- Visualização de 7 dias (semana atual)
- Dias com eventos destacados
- Indicadores visuais:
  - 💉 Injeção (bolinha colorida)
  - ⚖️ Peso registrado
- Botão "Hoje" (volta para hoje)

**Visualização do Dia Selecionado:**
Cards detalhados por tipo de evento:

1. **Card de Injeção**
   - Hora (ex: "19:30")
   - Dosagem (ex: "10mg")
   - Local aplicado
   - Tap para editar

2. **Card de Peso**
   - Hora (ex: "08:00")
   - Valor (ex: "87.5 kg")
   - Diferença (ex: "↓ 0.5kg" em verde/vermelho)
   - Tap para editar

3. **Card de Nível Estimado**
   - Valor calculado (ex: "2.3mg")
   - Trend (subindo/descendo)

4. **Card de Calorias**
   - Valor do dia
   - Meta vs real

5. **Card de Proteína**
   - Gramas consumidas
   - Porcentagem da meta

6. **Card de Efeitos Colaterais**
   - Lista de sintomas reportados
   - Severidade

7. **Card de Notas do Dia**
   - Anotações livres
   - Tap para adicionar/editar

**Calendário Mensal Completo:**
- Grid 7x6 (42 dias)
- Dias da semana no topo
- Marcadores nos dias com eventos:
  - 💉 Injeção
  - ⚖️ Peso
  - 📝 Notas
- Navegação entre meses (< Anterior | Outubro 2025 | Próximo >)
- Dia atual com borda destacada
- Dias de outros meses em cinza claro

**Adicionar Dados:**
- Toque em qualquer card → Modal para adicionar/editar
- Modals específicos para cada tipo:
  - Injeção
  - Peso
  - Calorias
  - Proteína
  - Efeitos colaterais
  - Notas

**Empty State (dia sem eventos):**
- "Nenhum evento registrado neste dia"
- Botões:
  - "Adicionar Injeção"
  - "Adicionar Peso"

---

### 5. ⚙️ SETTINGS (AJUSTES)
**Configurações e personalização**

#### Seções:

**1. PERFIL DO USUÁRIO**
- Avatar (iniciais ou foto)
- Nome
- Email
- Botão "Editar Perfil"

**2. MEDICAÇÃO E METAS**
- Medicação Atual: "Mounjaro 10mg"
- Frequência: "Semanal" | "Quinzenal"
- Peso Inicial: "92 kg"
- Peso Meta: "75 kg"
- Altura: "175 cm"
- Botão "Editar Informações"

**3. APARÊNCIA**
- **Tema:** Seletor com 8 opções
  - Classic
  - Ocean
  - Drizzle
  - Galaxy
  - Petal
  - Sunset
  - Monster
  - Phantom
  
- **Cor de Destaque:** Seletor com 5 cores
  - Amarelo
  - Laranja
  - Rosa
  - Roxo
  - Azul

- **Dark Mode:** Toggle switch

**4. NOTIFICAÇÕES**
- Lembrete de Injeção: Toggle + seletor de horário
- Lembrete de Peso: Toggle + seletor de horário
- Conquistas: Toggle
- Status de Notificações Push

**5. DADOS E PRIVACIDADE**
- Exportar Dados:
  - CSV
  - PDF
- Sincronizar com Apple Health: Toggle
- Backup Automático: Toggle
- **Deletar Todos os Dados:** Botão vermelho (ação destrutiva)

**6. SOBRE O APP**
- Versão: "1.0.0"
- Política de Privacidade (link)
- Termos de Uso (link)
- Suporte (link)
- Avaliar App (link App Store)

**7. CONTA**
- Sair (botão)
- Deletar Conta (botão vermelho, ação destrutiva)

**Confirmações:**
- Todas as ações destrutivas pedem confirmação
- Feedback visual ao salvar alterações

---

## 🎨 DESIGN SYSTEM

### Temas (8 opções)
Cada tema tem sua própria paleta de cores:
1. **Classic** - Azul tradicional
2. **Ocean** - Tons de água
3. **Drizzle** - Cinza/azul claro
4. **Galaxy** - Roxo espacial
5. **Petal** - Rosa suave
6. **Sunset** - Laranja/vermelho
7. **Monster** - Verde vibrante
8. **Phantom** - Dark com acentos

### Cores de Destaque (5 opções)
Aplicadas em botões, links, gráficos:
- 🟡 Amarelo (#FBBF24)
- 🟠 Laranja (#F97316)
- 🌸 Rosa (#EC4899)
- 🟣 Roxo (#A855F7)
- 🔵 Azul (#0891B2)

### Componentes UI
- **Cards:** Arredondados (16px radius), sombra suave
- **Botões:** Rounded full (pill shape)
- **Inputs:** Bordas arredondadas, placeholder claro
- **Gráficos:** Gradientes, animações suaves
- **Ícones:** Emojis + ícones de linha

### Tipografia
- **Títulos:** Bold, tamanhos grandes (20-28px)
- **Subtítulos:** Semibold (16-18px)
- **Corpo:** Regular (14-16px)
- **Labels:** Uppercase, smaller (10-12px)

### Espaçamento
- Padding consistente (12-16px)
- Gaps entre elementos (8-12px)
- Margens generosas para respirar

---

## 🔄 FUNCIONALIDADES AVANÇADAS

### 1. CÁLCULO DE NÍVEIS ESTIMADOS
**Farmacocinética Automatizada:**
- Baseado em estudos FDA
- Leva em conta:
  - Meia-vida do medicamento
  - Dosagem
  - Frequência de aplicação
  - Peso do usuário
- Projeção futura (linha tracejada)
- Atualização em tempo real

### 2. ROTAÇÃO DE LOCAIS DE INJEÇÃO
**Diagrama do Corpo Interativo:**
- 8 locais disponíveis:
  - Barriga (4 quadrantes)
  - Coxas (direita/esquerda)
  - Braços (direito/esquerdo)
- Histórico de locais usados
- Sugestão de próximo local (rotação)
- Visual feedback ao selecionar

### 3. RASTREAMENTO DE EFEITOS COLATERAIS
**Biblioteca de Sintomas:**
- Náusea
- Vômito
- Diarreia
- Constipação
- Fadiga
- Tontura
- Dor de cabeça
- Perda de apetite
- Dor abdominal
- Reações no local da injeção

**Calendário Visual:**
- Ver padrões ao longo do tempo
- Correlação com dosagem
- Exportar relatório para médico

### 4. INTEGRAÇÃO COM APPLE HEALTH
**Dados Sincronizados:**
- ✅ Peso
- ✅ Calorias consumidas
- ✅ Proteína
- ✅ Água
- ✅ Passos
- ✅ Exercícios

**Sincronização Bidirecional:**
- Importa dados do Health
- Exporta dados do Shotsy

### 5. ESTATÍSTICAS E INSIGHTS
**Métricas Calculadas:**
- IMC (Índice de Massa Corporal)
- Taxa de perda semanal
- Progresso em relação à meta (%)
- Mudança total desde o início
- Previsão de quando atingirá a meta
- Média móvel de peso

**Insights Automatizados:**
- "Você está 5% mais próximo da meta!"
- "Padrão: você perde mais peso nas semanas após aumentar a dose"
- "Efeitos colaterais diminuíram 40% neste mês"

### 6. EXPORTAÇÃO DE DADOS
**Formatos Disponíveis:**
- **CSV:** Para análise em Excel/Sheets
- **PDF:** Relatório visual formatado

**Conteúdo do Relatório:**
- Todas as injeções registradas
- Histórico de peso
- Gráficos
- Estatísticas
- Efeitos colaterais
- Notas

### 7. NOTIFICAÇÕES INTELIGENTES
**Tipos:**
- Lembrete de Injeção (customizável)
- Lembrete de Pesagem (customizável)
- Conquistas desbloqueadas
- Marcos atingidos (ex: "10kg perdidos!")

**Smart Timing:**
- Baseado no histórico do usuário
- Ajuste automático de horário sugerido

### 8. SISTEMA DE CONQUISTAS (GAMIFICAÇÃO)
**Badges/Troféus:**
- 🎯 Primeira injeção
- 🔥 Sequência de 7 dias pesando
- 💪 10 injeções completadas
- 🏆 Meta de peso atingida
- 📊 30 dias de tracking consistente
- ⭐ Super responder (perda acelerada)

---

## 📱 EXPERIÊNCIA DO USUÁRIO (UX)

### Onboarding
**Telas Iniciais:**
1. Welcome screen
2. Seleção de medicamento
3. Configuração de dosagem inicial
4. Peso inicial e meta
5. Frequência de injeção
6. Permissões (notificações, Apple Health)

### Interações Principais
- **Pull to refresh** em todas as listas
- **Swipe actions** para editar/deletar
- **Tap to edit** em todos os cards
- **Long press** para opções adicionais
- **Animações suaves** em transições

### Empty States
Todos com:
- Ilustração ou emoji
- Mensagem explicativa
- CTA claro para ação

### Feedback Visual
- Loading states durante fetches
- Success animations (confete, estrelas)
- Error states com mensagens claras
- Toast notifications para confirmações

### Acessibilidade
- Contraste adequado (WCAG AA)
- Textos legíveis (tamanhos mínimos)
- Áreas de toque generosas (44px+)
- Suporte a VoiceOver

---

## 🔐 SEGURANÇA E PRIVACIDADE

### Autenticação
- Sign in via email
- Verificação de email obrigatória
- Logout seguro

### Proteção de Dados
- Dados criptografados em trânsito
- Backup automático opcional
- Export/delete de todos os dados
- Conformidade com HIPAA (saúde)

### Privacidade
- Dados isolados por usuário (RLS)
- Sem compartilhamento sem permissão
- Política de privacidade transparente

---

## 🎯 DIFERENCIAIS DO SHOTSY

### 1. **Cálculo de Níveis Estimados**
Único app que mostra níveis de medicação no corpo baseado em farmacocinética real.

### 2. **Rotação Inteligente de Locais**
Sugere próximo local de injeção baseado em histórico.

### 3. **Visualização Temporal Completa**
Calendário com todos os eventos médicos em um lugar.

### 4. **Insights Automatizados**
IA identifica padrões e fornece insights acionáveis.

### 5. **Temas Personalizáveis**
8 temas + 5 accent colors = 40 combinações visuais.

### 6. **Integração Health Completa**
Sincronização bidirecional com Apple Health.

### 7. **Exportação Profissional**
Relatórios prontos para compartilhar com médicos.

### 8. **Comunidade Ativa**
200K+ usuários, 4.8/5 estrelas.

---

## 📊 COMPARATIVO: SHOTSY vs MOUNJARO TRACKER

### ✅ O QUE JÁ TEMOS
- [x] Sistema de autenticação (Clerk)
- [x] Banco de dados (Supabase)
- [x] Design system com temas
- [x] Tela de onboarding
- [x] Navegação com 5 tabs
- [x] Adicionar/editar injeções
- [x] Lista de injeções

### 🚧 EM DESENVOLVIMENTO (FASE 7)
- [ ] Tela de Resultados completa
- [ ] Gráficos interativos

### 📋 AINDA FALTA (FASES 8-15)
- [ ] Tela de Calendário (FASE 8)
- [ ] Tela de Ajustes completa (FASE 9)
- [ ] Integração Supabase total (FASE 10)
- [ ] Adicionar/editar Peso (FASE 11)
- [ ] Sistema de Conquistas (FASE 12)
- [ ] Notificações Push (FASE 13)
- [ ] Integração Apple Health (FASE 14)
- [ ] Polimento final (FASE 15)

### ❌ FUNCIONALIDADES FALTANTES CRÍTICAS
- [ ] Cálculo de níveis estimados de medicação
- [ ] Diagrama do corpo para locais de injeção
- [ ] Rastreamento de efeitos colaterais
- [ ] Gráficos de peso com marcadores de dosagem
- [ ] Widget de próxima injeção
- [ ] Calendário mensal completo
- [ ] Exportação de dados (CSV/PDF)
- [ ] Sistema de conquistas
- [ ] Notificações inteligentes

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### PRIORIDADE ALTA (CORE FEATURES)
1. **Completar FASE 7** - Gráficos de Resultados
2. **FASE 8** - Calendário completo
3. **FASE 10** - Integração Supabase (dados reais)
4. **Diagrama do Corpo** - Seleção de locais de injeção
5. **Cálculo de Níveis** - Farmacocinética

### PRIORIDADE MÉDIA (UX ENHANCEMENTS)
1. **FASE 9** - Settings completo
2. **Efeitos Colaterais** - Rastreamento detalhado
3. **Widget Next Shot** - Com estados dinâmicos
4. **Swipe Actions** - Refinamento
5. **Empty States** - Todas as telas

### PRIORIDADE BAIXA (NICE TO HAVE)
1. **FASE 12** - Sistema de conquistas
2. **FASE 13** - Notificações Push
3. **FASE 14** - Apple Health
4. **Exportação** - PDF profissional
5. **Insights** - Automatizados

---

## 📝 CONCLUSÃO

O **Shotsy** é um aplicativo maduro, com foco em:
- ✅ Tracking preciso de medicação GLP-1
- ✅ Visualização clara de progresso
- ✅ Insights baseados em dados
- ✅ UX excelente e design moderno
- ✅ Funcionalidades médicas relevantes

Para o **Mounjaro Tracker** se tornar um clone completo, precisamos:
1. Completar as 15 fases planejadas
2. Implementar funcionalidades médicas críticas (níveis, locais, efeitos)
3. Refinar UX/UI em cada tela
4. Adicionar integrações (Health, notificações)
5. Polir animações e transições

**Status Atual:** ~40% completo (6 de 15 fases)  
**Tempo Estimado para Conclusão:** 60-80 horas de desenvolvimento com Claude Code

---

**Documento criado em:** 31/10/2025  
**Última atualização:** 31/10/2025  
**Próxima revisão:** Após FASE 10
