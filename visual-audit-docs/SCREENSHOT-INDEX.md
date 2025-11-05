# 📸 Índice de Screenshots - Shotsy

Este documento lista todos os 37 screenshots disponíveis do Shotsy para referência na auditoria visual.

**Fonte:** `/Users/user/Desktop/shotsy-imagens/imagens-screenshots/`

---

## 📋 LISTA COMPLETA DE SCREENSHOTS

| # | Arquivo | Descrição Visual | Tela Correspondente | Status |
|---|---------|------------------|---------------------|--------|
| 1 | IMG_0613.PNG | Dashboard com gráfico de níveis estimados + Next Shot widget | Dashboard (Main) | ✅ Piloto |
| 2 | IMG_0614.PNG | Widgets iOS (Home Screen) - "You did it!" + mini chart | iOS Widgets (Promo) | ⏸️ Pendente |
| 3 | IMG_0615.PNG | Results - Weight Change chart com doses marcadas | Results Screen | ⏸️ Pendente |
| 4 | IMG_0616.PNG | Settings - Customize themes (Sunset selected) | Settings > Customize | ⏸️ Pendente |
| 5 | IMG_0617.PNG | Onboarding - "Você já está tomando GLP-1?" (2 opções) | Onboarding Step 4 | ⏸️ Pendente |
| 6 | IMG_0618.PNG | Onboarding - Medication Selection (6 opções) | Onboarding Step 5 | ✅ Dia 1-2 |
| 7 | IMG_0619.PNG | Onboarding - Initial Dose (7 doses + "Outro") | Onboarding Step 6 | ✅ Piloto |
| 8 | IMG_0620.PNG | Onboarding - Device Type (4 opções) | Onboarding Step 7 | ⏸️ Pendente |
| 9 | IMG_0621.PNG | Onboarding - Injection Frequency (selected: 7 dias) | Onboarding Step 8 | ✅ Dia 1-2 |
| 10 | IMG_0622.PNG | Onboarding - Charts Intro (gráfico educacional) | Onboarding Step 2 | ✅ Dia 3-4 |
| 11 | IMG_0623.PNG | Onboarding - Health Disclaimer Modal | Onboarding Step 10 | ✅ Dia 3-4 |
| 12 | IMG_0624.PNG | Onboarding - Height Input | Onboarding Step 11 | ⏸️ Dia 5 |
| 13 | IMG_0625.PNG | Onboarding - Current Weight | Onboarding Step 12 | ⏸️ Dia 5 |
| 14 | IMG_0626.PNG | Onboarding - Starting Weight | Onboarding Step 13 | ⏸️ Dia 5 |
| 15 | IMG_0627.PNG | Onboarding - Target Weight | Onboarding Step 14 | ⏸️ Dia 5 |
| 16-37 | IMG_0628.PNG - IMG_0651.PNG | A examinar | A mapear | ⏸️ Pendente |

---

## 🔍 SCREENSHOTS EXAMINADOS

### FASE 0 - PILOTO

#### IMG_0613.PNG - Dashboard com Estimated Levels Chart
**Status:** ✅ Auditado no Piloto

**Elementos Identificados:**
- Header: "Summary" + "Add shot" button
- Título: "Estimated Medication Levels" + info icon
- Tabs: Week, Month, 90 days, All time
- "Jump to Today" button
- Valor atual: "1.17mg" + timestamp
- Gráfico: Area chart (azul preenchido)
  - Linha contínua + área preenchida
  - Projeção futura (tracejada)
  - Grid horizontal (sem vertical)
  - Eixo X: datas (6/22, 6/29, 7/6, 7/13)
  - Eixo Y: 0-4mg
- Widget: "Next Shot" (anel colorido + "It's shot day!")
- Bottom Navigation: Summary, Shots, Results, Calendar, Settings

**Arquivo Mounjaro:** `components/dashboard/EstimatedLevelsChart.tsx`

---

#### IMG_0619.PNG - Initial Dose Selection Screen
**Status:** ✅ Auditado no Piloto

**Elementos Identificados:**
- Progress bar: ~15% (step 6 de ~22)
- Back button (top left)
- Título: "Você sabe sua dose inicial recomendada?"
- Subtítulo: "Não tem problema se você não tiver certeza!"
- 7 opções em cards:
  - 2.5mg
  - 5mg
  - 7.5mg
  - 10mg
  - 12.5mg
  - 15mg
  - Outro
- Botão: "Continuar" (disabled - cinza)
- Layout: Cards com border-radius generoso, padding espaçoso
- Radio buttons: círculos à esquerda

**Arquivo Mounjaro:** `components/onboarding/InitialDoseScreen.tsx`

---

### SEMANA 1 - DIA 1-2: Seletores Arcaicos

#### IMG_0618.PNG - Medication Selection Screen
**Status:** ✅ Auditado Dia 1-2  
**Arquivo Mounjaro:** `components/onboarding/MedicationSelectionScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA1-2-SELETORES-ARCAICOS.md`

#### IMG_0621.PNG - Injection Frequency Screen
**Status:** ✅ Auditado Dia 1-2  
**Arquivo Mounjaro:** `components/onboarding/InjectionFrequencyScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA1-2-SELETORES-ARCAICOS.md`

#### IMG_0632.PNG - Side Effects Concerns Screen
**Status:** ✅ Auditado Dia 1-2  
**Arquivo Mounjaro:** `components/onboarding/SideEffectsConcernsScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA1-2-SELETORES-ARCAICOS.md`

---

### SEMANA 1 - DIA 3-4: Telas Educacionais

#### IMG_0622.PNG - Charts Intro Screen
**Status:** ✅ Auditado Dia 3-4

**Elementos Identificados:**
- Progress bar: ~10% (step 2/22)
- Título principal: "Shotsy pode ajudar você a entender sua jornada com Mounjaro® através de ferramentas educativas"
- Subtítulo: "Sinta-se mais confiante aprendendo mais sobre como esses medicamentos funcionam."
- Gráfico educacional: Chart preview com área preenchida (azul)
  - Curva realista com projeção tracejada
  - Anotação: "1.16mg" + "28 de out. de 2025, 10"
  - Grid horizontal visível
  - Eixo X: datas
  - Eixo Y: níveis (mg)
- Disclaimer: "Shotsy usa resultados de ensaios clínicos publicados pela FDA para mapear os níveis estimados de medicação ao longo do tempo"
- Botão: "Continuar" (full width, bottom)

**Gap Principal:** Falta gráfico real (atual tem apenas emoji 📈 + 3 cards de texto)

**Arquivo Mounjaro:** `components/onboarding/ChartsIntroScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md`

#### IMG_0623.PNG - Health Disclaimer Modal (Education Graph Context)
**Status:** ✅ Auditado Dia 3-4

**Elementos Identificados:**
- Modal overlay sobre tela de gráfico
- Título: "Aviso de Saúde"
- Texto de disclaimer médico completo
- Toggle: "Aceitar aviso de saúde"
- Botão "Continuar" (desabilitado até aceitar)

**Arquivo Mounjaro:** `components/onboarding/HealthDisclaimerScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md`

#### Education Graph Screen (inferência)
**Status:** ✅ Auditado Dia 3-4

**Gap Principal:** Gráfico placeholder (retângulo colorido) deve ser substituído por curva farmacológica real com `victory-native`

**Arquivo Mounjaro:** `components/onboarding/EducationGraphScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md`

#### Fluctuations Education Screen (inferência)
**Status:** ✅ Auditado Dia 3-4

**Gap Principal:** Gráfico placeholder deve mostrar linha com variações de peso (zig-zag) + área sombreada indicando zona normal

**Arquivo Mounjaro:** `components/onboarding/FluctuationsEducationScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md`

---

### SEMANA 1 - DIA 5: Inputs de Dados

#### IMG_0624.PNG - Height Input Screen
**Status:** ⏸️ Próximo (Dia 5)

**Elementos Identificados:**
- Título: "Sua altura"
- Subtítulo: "Sua altura nos ajuda a calcular seu IMC e personalizar seus objetivos."
- Picker de altura: Estilo iOS nativo
  - Valores visíveis: 172cm, 173cm, 174cm, **175cm** (selected), 176cm, 177cm, 178cm
  - Fade effect nas extremidades
- Toggle: "polegadas" / "centímetros" (centímetros selected)
- Botão: "Continuar" (full width, bottom)

**Arquivo Mounjaro:** `components/onboarding/HeightInputScreen.tsx`

#### IMG_0625.PNG - Current Weight Screen
**Status:** ⏸️ Próximo (Dia 5)

**Elementos Identificados:**
- Título: "Seu peso atual"
- Subtítulo: "Agora vamos registrar seu peso atual, para que possamos acompanhar seu progresso."
- Picker de peso: Estilo iOS nativo
  - Parte inteira: 101, 102, 103, **104** (selected), 105, 106, 107
  - Separador: "."
  - Decimal: 0, 1, 2, **3** (selected), 4, 5, 6
  - Sufixo: "kg"
  - Fade effect nas extremidades
- Toggle: "libras" / "quilogramas" (quilogramas selected)
- Botão: "Continuar" (full width, bottom)

**Arquivo Mounjaro:** `components/onboarding/CurrentWeightScreen.tsx`

#### IMG_0626.PNG - Starting Weight Screen
**Status:** ⏸️ Próximo (Dia 5)

**Elementos Identificados:**
- Título: "Conte-nos como você estava quando começou."
- Subtítulo: "Adicione o peso que você tinha quando começou sua jornada, junto com a data de início."
- Card 1: "Peso Inicial"
  - Valor: 104 kg
  - Ícone: ⚖️ (escala)
  - Botão edit (lápis) no canto direito
- Card 2: "Data de Início"
  - Valor: 28 de out. de 2025
  - Ícone: 📅 (calendário)
  - Botão edit (lápis) no canto direito
- Botão: "Continuar" (full width, bottom)

**Arquivo Mounjaro:** `components/onboarding/StartingWeightScreen.tsx`

#### IMG_0627.PNG - Target Weight Screen
**Status:** ⏸️ Próximo (Dia 5)

**Elementos Identificados:**
- Título: "Peso meta"
- Subtítulo: "Agora vamos definir seu peso-alvo. Isso nos ajudará a personalizar suas metas."
- Card principal com:
  - Valor grande: **75kg**
  - Slider visual: Régua horizontal com marcações
    - Range visível: 70kg - 80kg
    - Indicador azul na posição 75kg
  - IMC calculado: **24.5**
  - Label IMC: "Peso Normal" (verde)
  - Barra de categorias IMC:
    - 🟣 Baixo (<18.5)
    - 🟢 Saudável (18.5-25) ← posição atual
    - 🟠 Alto (25-30)
    - 🔴 Muito Alto (30+)
- Botão: "Continuar" (full width, bottom)

**Arquivo Mounjaro:** `components/onboarding/TargetWeightScreen.tsx`

---

## 📸 SCREENSHOTS A EXAMINAR (Próximas Etapas)

### Onboarding Screens (Prioridade P0)

| Screenshot | Descrição Provável | Tela Mounjaro | Status |
|------------|-------------------|---------------|--------|
| IMG_0617.PNG | Already using GLP-1? | AlreadyUsingGLP1Screen.tsx | ⏸️ Pendente |
| IMG_0618.PNG | Medication Selection | MedicationSelectionScreen.tsx | ✅ Auditado (Dia 1-2) |
| IMG_0620.PNG | Device Type | DeviceTypeScreen.tsx | ⏸️ Pendente |
| IMG_0621.PNG | Injection Frequency | InjectionFrequencyScreen.tsx | ✅ Auditado (Dia 1-2) |
| IMG_0622.PNG | Education Graph | EducationGraphScreen.tsx | ⏸️ Pendente (Dia 3-4) |
| IMG_062X.PNG | Health Disclaimer? | HealthDisclaimerScreen.tsx |
| IMG_062X.PNG | Height Input? | HeightInputScreen.tsx |
| IMG_062X.PNG | Current Weight? | CurrentWeightScreen.tsx |
| IMG_062X.PNG | Starting Weight? | StartingWeightScreen.tsx |
| IMG_062X.PNG | Target Weight? | TargetWeightScreen.tsx |
| IMG_062X.PNG | Weight Loss Rate? | WeightLossRateScreen.tsx |
| IMG_062X.PNG | Side Effects? | SideEffectsConcernsScreen.tsx | ✅ Auditado (Dia 1-2) |

### Dashboard / Main Screens (Prioridade P0/P1)

| Screenshot | Descrição Provável | Tela Mounjaro |
|------------|-------------------|---------------|
| IMG_0613.PNG | Dashboard ✅ | app/(tabs)/dashboard.tsx |
| IMG_0615.PNG | Results | app/(tabs)/results.tsx |

### Settings / Secondary (Prioridade P1/P2)

| Screenshot | Descrição Provável | Tela Mounjaro |
|------------|-------------------|---------------|
| IMG_0616.PNG | Customize Themes | app/(tabs)/settings.tsx > Customize |

### Promo / Features (Prioridade P2)

| Screenshot | Descrição Provável | Relevância |
|------------|-------------------|------------|
| IMG_0614.PNG | iOS Widgets | Marketing/Promo (não implementar) |

---

## 📋 PRÓXIMA TAREFA: MAPEAR SCREENSHOTS 11-37

### Ações Necessárias:

1. **Examinar cada screenshot** (IMG_0623 até IMG_0651)
2. **Identificar a tela** correspondente no Mounjaro Tracker
3. **Categorizar por prioridade** (P0, P1, P2)
4. **Anotar elementos chave** (títulos, botões, layout)
5. **Atualizar esta tabela** com as informações

### Template para Análise:

```markdown
### IMG_XXXX.PNG - [Nome da Tela]
**Status:** ⏸️ Pendente

**Elementos Identificados:**
- Progress bar: XX%
- Título: "..."
- Subtítulo: "..."
- Elementos principais: [lista]
- Botões: [lista]
- Layout especial: [descrição]

**Arquivo Mounjaro:** `path/to/component.tsx`
**Prioridade:** P0 / P1 / P2
```

---

## 🎯 OBJETIVOS DO MAPEAMENTO

### Fase 1: Identificação (Esta Etapa)
- [ ] Examinar 37 screenshots
- [ ] Identificar tela correspondente
- [ ] Categorizar por prioridade
- [ ] Criar tabela completa

### Fase 2: Auditoria (Próxima Etapa)
- [ ] Auditar 22 telas de onboarding (P0)
- [ ] Auditar 4 gráficos (P0)
- [ ] Auditar Dashboard e Results (P1)
- [ ] Auditar telas secundárias (P2)

### Fase 3: Implementação (Final)
- [ ] Implementar mudanças P0
- [ ] Checkpoint estratégico
- [ ] Implementar P1/P2 (condicional)

---

## 📊 PROGRESSO

### Screenshots Mapeados: 9 / 37 (24%)
- ✅ IMG_0613 - Dashboard ✅ Auditado (Piloto)
- ✅ IMG_0614 - iOS Widgets (promo)
- ✅ IMG_0615 - Results
- ✅ IMG_0616 - Settings/Customize
- ✅ IMG_0617 - Onboarding Step 4
- ✅ IMG_0618 - Onboarding Step 5 ✅ Auditado (Dia 1-2)
- ✅ IMG_0619 - Onboarding Step 6 ✅ Auditado (Piloto)
- ✅ IMG_0620 - Onboarding Step 7
- ✅ IMG_0621 - Onboarding Step 8 ✅ Auditado (Dia 1-2)
- ⏸️ IMG_0622 - IMG_0651 (28 screenshots pendentes)

### Screenshots Auditados: 5 / 37 (14%)
- ✅ IMG_0613 - Estimated Levels Chart (Piloto)
- ✅ IMG_0618 - Medication Selection (Dia 1-2)
- ✅ IMG_0619 - Initial Dose Screen (Piloto)
- ✅ IMG_0621 - Injection Frequency (Dia 1-2)
- ✅ Side Effects Concerns (Dia 1-2 - screenshot a identificar)

---

## 🔄 ATUALIZAR ESTE DOCUMENTO

Este índice será atualizado conforme os screenshots forem examinados e mapeados.

**Próxima atualização:** Após examinar screenshots 11-37 e criar tabela completa de correspondências.

---

**Última atualização:** 5 de novembro de 2025  
**Status:** 🟡 24% mapeado (9/37)  
**Próxima ação:** Examinar IMG_0622 - IMG_0651

