# 🚀 GUIA DE IMPLEMENTAÇÃO P0

**Data:** 05 de novembro de 2025  
**Objetivo:** Implementar gaps visuais críticos identificados na auditoria  
**Esforço total:** 67-90 horas  

---

## ⚡ INÍCIO RÁPIDO

### 1. Instalar Dependências (5-10 min)

```bash
# Já instalado ✅
# victory-native

# Instalar agora:
npm install @react-native-picker/picker
npm install @react-native-community/datetimepicker
npm install @react-native-community/slider
npm install expo-linear-gradient
npm install expo-haptics
npm install @expo/vector-icons

# iOS (se necessário):
cd ios && pod install && cd ..

# Verificar instalação:
npm list | grep -E "(picker|slider|datetimepicker|linear-gradient|haptics)"
```

### 2. Escolher Primeira Task

**Recomendação:** 🔴 **Education Graph Screen** (6-8h)

**Por quê:**
- ✅ Victory Native já instalado
- 🔴 Gap mais crítico (usuário não entende gráfico placeholder)
- 📚 Documentação completa disponível
- 🎯 Impacto imediato na credibilidade do app

---

## 📋 ROADMAP COMPLETO

### SPRINT 1: Gráficos Críticos (15-20h)

#### Task 1.1: Education Graph Screen ⭐ **COMEÇAR AQUI**
**Arquivo:** `components/onboarding/EducationGraphScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md` (linhas 126-298)  
**Esforço:** 6-8h  
**Prioridade:** 🔴 P0 CRÍTICO

**O que fazer:**
1. Remover placeholder (retângulo colorido)
2. Implementar curva farmacológica com `VictoryArea`
3. Adicionar eixos numéricos (0-1.5mg, dias 0-7)
4. Destacar ponto de pico (Tmax)
5. Ajustar padding do info card (16→20px)

**Dados farmacocinéticos:**
```typescript
const pharmacokineticData = [
  { day: 0, level: 0 },
  { day: 1, level: 0.3 },
  { day: 2, level: 0.7 },
  { day: 3, level: 1.1 },
  { day: 4, level: 1.2 }, // Pico (Tmax)
  { day: 5, level: 0.9 },
  { day: 6, level: 0.6 },
  { day: 7, level: 0.3 },
];
```

**Checklist:**
- [ ] Placeholder removido
- [ ] VictoryChart implementado
- [ ] Curva PK renderizando
- [ ] Eixos com labels numéricos
- [ ] Ponto de pico destacado
- [ ] Testado em light/dark mode
- [ ] Screenshot antes/depois

---

#### Task 1.2: Charts Intro Screen
**Arquivo:** `components/onboarding/ChartsIntroScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md` (linhas 28-125)  
**Esforço:** 4-6h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Remover emoji 📈
2. Remover 3 cards de features
3. Adicionar gráfico de área preview
4. Adicionar anotação "1.16mg"
5. Adicionar disclaimer FDA
6. Atualizar título e subtítulo

**Checklist:**
- [ ] Emoji removido
- [ ] Cards de features removidos
- [ ] Gráfico preview implementado
- [ ] Anotação visível
- [ ] Disclaimer FDA presente
- [ ] Título/subtítulo atualizados

---

#### Task 1.3: Fluctuations Education Screen
**Arquivo:** `components/onboarding/FluctuationsEducationScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md` (linhas 299-377)  
**Esforço:** 5-6h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Remover emoji 📊
2. Substituir placeholder por `VictoryLine`
3. Mostrar variações zig-zag (±1-2kg)
4. Adicionar área sombreada (zona normal)

**Checklist:**
- [ ] Emoji removido
- [ ] Placeholder removido
- [ ] Gráfico de linha implementado
- [ ] Área sombreada visível
- [ ] Variações realistas

---

### SPRINT 2: Inputs de Dados - Parte 1 (14-18h)

#### Task 2.1: Starting Weight Screen
**Arquivo:** `components/onboarding/StartingWeightScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA5-INPUTS-DE-DADOS.md` (linhas 413-563)  
**Esforço:** 4-6h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Refatorar cards para layout horizontal (ícone + conteúdo)
2. Substituir inputs de data por `DateTimePicker`
3. Atualizar título e subtítulo
4. Remover emoji decorativo

**Checklist:**
- [ ] Card layout horizontal
- [ ] Ícones visíveis (⚖️, 📅)
- [ ] DateTimePicker funcionando
- [ ] Formato de data correto
- [ ] Título/subtítulo atualizados

---

#### Task 2.2: Height Input Screen
**Arquivo:** `components/onboarding/HeightInputScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA5-INPUTS-DE-DADOS.md` (linhas 23-244)  
**Esforço:** 10-12h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Substituir `TextInput` por `@react-native-picker/picker`
2. Implementar fade effects (LinearGradient)
3. Dual picker para ft/in
4. Adicionar haptic feedback
5. Atualizar unit toggle labels
6. Remover emoji 📏

**Checklist:**
- [ ] Picker nativo implementado
- [ ] Fade effects visíveis
- [ ] Haptic feedback funciona
- [ ] Dual picker (ft/in) funciona
- [ ] Unit toggle atualizado
- [ ] Emoji removido

---

### SPRINT 3: Inputs de Dados - Parte 2 (18-24h)

#### Task 3.1: Current Weight Screen
**Arquivo:** `components/onboarding/CurrentWeightScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA5-INPUTS-DE-DADOS.md` (linhas 245-412)  
**Esforço:** 8-10h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Substituir TextInput por picker decimal 3 colunas
2. Implementar layout: integer . decimal kg
3. Adicionar fade effects
4. Atualizar unit toggle labels
5. Remover emoji ⚖️

**Checklist:**
- [ ] Picker decimal 3 colunas
- [ ] Layout correto (num . dec kg)
- [ ] Fade effects visíveis
- [ ] Unit toggle atualizado
- [ ] Emoji removido

---

#### Task 3.2: Target Weight Screen
**Arquivo:** `components/onboarding/TargetWeightScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA5-INPUTS-DE-DADOS.md` (linhas 564-772)  
**Esforço:** 10-14h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Substituir TextInput por `Slider`
2. Implementar régua com tick marks
3. IMC display grande + pill colorido
4. BMI bar com 4 categorias
5. Indicador de posição no bar
6. Remover progress card
7. Remover emoji 🎯

**Checklist:**
- [ ] Slider com régua implementado
- [ ] Tick marks visíveis
- [ ] IMC display correto
- [ ] BMI bar 4 cores
- [ ] Indicador de posição
- [ ] Progress card removido
- [ ] Emoji removido

---

### SPRINT 4: Seletores Arcaicos (8-12h)

#### Task 4.1: Medication Selection Screen
**Arquivo:** `components/onboarding/MedicationSelectionScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA1-2-SELETORES-ARCAICOS.md` (linhas 28-112)  
**Esforço:** 2h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Border-radius: 16px → 12px
2. MinHeight: adicionar 60px
3. Ajustar copy (título/subtítulo)

**Checklist:**
- [ ] Border-radius 12px
- [ ] MinHeight 60px
- [ ] Copy atualizado

---

#### Task 4.2: Injection Frequency Screen
**Arquivo:** `components/onboarding/InjectionFrequencyScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA1-2-SELETORES-ARCAICOS.md` (linhas 113-236)  
**Esforço:** 3-4h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Border-radius: 16px → 12px
2. MinHeight: 60px
3. Custom input: melhorar UX (feedback visual)
4. Ajustar copy

**Checklist:**
- [ ] Border-radius 12px
- [ ] MinHeight 60px
- [ ] Custom input melhorado
- [ ] Copy atualizado

---

#### Task 4.3: Side Effects Concerns Screen
**Arquivo:** `components/onboarding/SideEffectsConcernsScreen.tsx`  
**Documento:** `visual-audit-docs/SEMANA1-DIA1-2-SELETORES-ARCAICOS.md` (linhas 237-334)  
**Esforço:** 2-3h  
**Prioridade:** 🔴 P0

**O que fazer:**
1. Border-radius: 16px → 12px
2. MinHeight: 60px
3. Adicionar ícone de check quando selecionado
4. Ajustar copy

**Checklist:**
- [ ] Border-radius 12px
- [ ] MinHeight 60px
- [ ] Ícone de check
- [ ] Copy atualizado

---

## 📝 TEMPLATE DE COMMIT

```
feat(onboarding): implement victory-native chart for [SCREEN_NAME]

- Remove placeholder visual element
- Add VictoryArea/VictoryLine chart with real data
- Implement fade effects (top/bottom)
- Add axis labels with numeric values
- Match Shotsy visual design 100%

Technical details:
- Uses victory-native for iOS-native feel
- Smooth interpolation for curve
- Grid with dashed lines
- Colors from useShotsyColors hook

Closes: #[ISSUE_NUMBER]
```

---

## 🧪 CHECKLIST DE TESTE

Para cada tela implementada:

### Visual
- [ ] Screenshot lado a lado (Shotsy vs Mounjaro)
- [ ] Espaçamentos corretos (medidos com régua)
- [ ] Cores match com Shotsy
- [ ] Fontes (size, weight) corretas
- [ ] Border-radius consistente

### Funcional
- [ ] Funciona em light mode
- [ ] Funciona em dark mode
- [ ] Funciona em iOS
- [ ] Funciona em Android (se aplicável)
- [ ] Sem warnings no console
- [ ] Performance aceitável (sem lag)

### UX
- [ ] Transições suaves
- [ ] Feedback tátil (haptics) funciona
- [ ] Acessibilidade (VoiceOver compatível)
- [ ] Keyboard dismiss funciona
- [ ] Validação de dados funciona

### Edge Cases
- [ ] Valores extremos (min/max)
- [ ] Tela pequena (iPhone SE)
- [ ] Tela grande (iPad)
- [ ] Mudança de orientação
- [ ] Temas personalizados (accent colors)

---

## 🚨 TROUBLESHOOTING

### Erro: "Cannot find module '@react-native-picker/picker'"
**Solução:**
```bash
npm install @react-native-picker/picker
cd ios && pod install && cd ..
```

### Erro: "VictoryChart não renderiza"
**Solução:**
- Verificar que `victory-native` está instalado
- Verificar que `react-native-svg` está instalado (dependência)
- Limpar cache: `npm start -- --reset-cache`

### Erro: "LinearGradient não funciona"
**Solução:**
```bash
npm install expo-linear-gradient
```

### Performance: Picker lento
**Solução:**
- Limitar range de valores (não renderizar 1-1000)
- Usar `itemStyle` ao invés de estilos inline
- Evitar re-renders desnecessários (usar `React.memo`)

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

### Por Task
- **Education Graph:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md`
- **Charts Intro:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md`
- **Fluctuations:** `visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md`
- **Inputs (4 telas):** `visual-audit-docs/SEMANA1-DIA5-INPUTS-DE-DADOS.md`
- **Seletores (3 telas):** `visual-audit-docs/SEMANA1-DIA1-2-SELETORES-ARCAICOS.md`

### Screenshots de Referência
- **Pasta:** `FIGMA-SCREENSHOTS/`
- **Index:** `visual-audit-docs/SCREENSHOT-INDEX.md`

### Código Sugerido
Cada documento de auditoria contém:
- Análise visual detalhada
- Código sugerido completo
- Estilos necessários
- Dados de exemplo
- Checklist de validação

---

## ⏱️ ESTIMATIVA DE TEMPO

### Por Sprint
- **Sprint 1:** 15-20h (Gráficos)
- **Sprint 2:** 14-18h (Inputs Parte 1)
- **Sprint 3:** 18-24h (Inputs Parte 2)
- **Sprint 4:** 8-12h (Seletores)

**TOTAL:** 55-74h (média: 64h)

### Por Semana (40h/semana, 1 dev)
- **Semana 2:** Sprint 1 completo + metade Sprint 2
- **Semana 3:** Sprint 2 completo + metade Sprint 3
- **Semana 4:** Sprint 3 completo + Sprint 4 completo

**TOTAL:** 3-4 semanas

---

## 🎯 PRÓXIMO PASSO

### Agora mesmo:
```bash
# 1. Instalar dependências (se ainda não fez)
npm install @react-native-picker/picker @react-native-community/datetimepicker @react-native-community/slider expo-linear-gradient expo-haptics @expo/vector-icons

# 2. Abrir primeira task
code components/onboarding/EducationGraphScreen.tsx

# 3. Abrir documentação de referência
code visual-audit-docs/SEMANA1-DIA3-4-TELAS-EDUCACIONAIS.md

# 4. Começar a implementar! 🚀
```

---

**Boa sorte! Você tem tudo documentado e pronto para começar! 💪**

