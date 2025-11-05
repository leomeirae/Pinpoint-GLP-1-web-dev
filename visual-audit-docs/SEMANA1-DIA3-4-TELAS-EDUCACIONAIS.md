# 📚 AUDITORIA VISUAL: Telas Educacionais (Onboarding)
## SEMANA 1 - DIA 3-4

**Data:** 05 de novembro de 2025  
**Escopo:** P0 - Onboarding Critical Screens  
**Categoria:** Telas educacionais informativas  

---

## 📋 SUMÁRIO EXECUTIVO

### Telas Auditadas
1. **Charts Intro Screen** (Step 2) - Introdução aos gráficos
2. **Education Graph Screen** (Step 9) - Explicação de níveis estimados  
3. **Fluctuations Education Screen** (Step 18) - Educação sobre flutuações de peso

### Status Geral
| Tela | Gap Visual | Impacto UX | Esforço | Prioridade |
|------|-----------|-----------|---------|------------|
| Charts Intro | 🟡 MODERADO | 🔴 ALTO | 4-6h | P0 |
| Education Graph | 🔴 CRÍTICO | 🔴 ALTO | 8-10h | P0 |
| Fluctuations | 🟡 MODERADO | 🟡 MÉDIO | 6-8h | P0 |

### Decisões Técnicas Confirmadas
- ✅ Usar `OnboardingScreenBase` (já implementado)
- ✅ Usar `ShotsyCard` (já implementado)
- ✅ Manter `useShotsyColors` para temas
- 🚨 **Education Graph:** Substituir placeholder por `victory-native` (decisão do piloto)

---

## 🎨 TELA 1: CHARTS INTRO SCREEN

### 📸 Referências Visuais
**Screenshot Shotsy:** `FIGMA-SCREENSHOTS/shotsy-onboarding-02-charts-intro.PNG`  
**Arquivo Mounjaro:** `components/onboarding/ChartsIntroScreen.tsx`

### 🔍 ANÁLISE VISUAL DETALHADA

#### 1. LAYOUT GERAL
**Shotsy (Referência):**
- Progress bar: ~10% (step 2/22)
- Título: "Shotsy pode ajudar você a entender sua jornada com Mounjaro® através de ferramentas educativas"
- Subtítulo: "Sinta-se mais confiante aprendendo mais sobre como esses medicamentos funcionam."
- Gráfico educacional: Chart preview com área preenchida (azul)
  - Mostra níveis estimados de medicação
  - Curva realista com projeção tracejada
  - Anotação: "1.16mg" + "28 de out. de 2025, 10"
- Disclaimer texto: "Shotsy usa resultados de ensaios clínicos publicados pela FDA para mapear os níveis estimados de medicação ao longo do tempo"
- Botão: "Continuar" (azul, full width, bottom)

**Mounjaro (Atual):**
```tsx:components/onboarding/ChartsIntroScreen.tsx
<OnboardingScreenBase
  title="Entenda seu progresso com gráficos bonitos"
  subtitle="Visualize seus dados de forma clara e obtenha insights baseados em estudos clínicos"
>
  <View style={styles.content}>
    <Text style={styles.emoji}>📈</Text>
    
    {/* 3 Cards com features */}
    <ShotsyCard variant="elevated">
      ⚖️ Gráfico de peso
      Acompanhe sua evolução ao longo do tempo com gráficos detalhados
    </ShotsyCard>
    
    <ShotsyCard variant="elevated">
      💉 Níveis de medicamento
      Veja estimativas dos níveis do medicamento no seu corpo
    </ShotsyCard>
    
    <ShotsyCard variant="elevated">
      🎯 Insights personalizados
      Receba dicas e análises baseadas no seu histórico
    </ShotsyCard>
  </View>
</OnboardingScreenBase>
```

### 🎯 GAPS VISUAIS IDENTIFICADOS

#### GAP 1: Falta de Gráfico Visual Real
**Impacto UX:** 🔴 CRÍTICO  
**Razão:** Usuário não consegue visualizar o que vai receber, apenas lê sobre isso.

**Shotsy:** Mostra um chart real e interativo como preview  
**Mounjaro:** Apenas emoji 📈 + 3 cards de texto  

**Mudança necessária:**
1. Remover emoji 📈
2. Adicionar preview visual do gráfico de níveis estimados
3. Usar componente `victory-native` para renderizar mini-chart
4. Incluir anotação com exemplo de valor (ex: "1.16mg")

**Código sugerido:**
```typescript
import { VictoryArea, VictoryChart, VictoryAxis } from 'victory-native';

// Dentro do componente:
<ShotsyCard variant="elevated" style={styles.chartPreview}>
  <VictoryChart
    height={200}
    width={Dimensions.get('window').width - 64}
  >
    <VictoryArea
      data={sampleData} // dados de exemplo
      style={{
        data: {
          fill: currentAccent,
          opacity: 0.3,
          stroke: currentAccent,
          strokeWidth: 2,
        }
      }}
    />
  </VictoryChart>
  
  <Text style={styles.chartAnnotation}>
    1.16mg
  </Text>
  <Text style={styles.chartTimestamp}>
    28 de out. de 2025, 10
  </Text>
</ShotsyCard>

<Text style={styles.disclaimer}>
  Mounjaro Tracker usa resultados de ensaios clínicos publicados pela FDA 
  para mapear os níveis estimados de medicação ao longo do tempo
</Text>
```

**Esforço estimado:** 4-6 horas  
**Risco:** 🟡 Médio (depende de `victory-native` já instalado)

---

#### GAP 2: Cards de Features vs Visual Único
**Impacto UX:** 🟡 MÉDIO  
**Razão:** Informação fragmentada em 3 cards reduz o impacto visual único.

**Shotsy:** Uma única visualização com gráfico + disclaimer  
**Mounjaro:** 3 cards separados com emojis + texto  

**Mudança necessária:**
1. Consolidar os 3 cards em um único card de preview
2. Manter apenas o texto de disclaimer abaixo
3. Remover emojis ⚖️, 💉, 🎯 (redundantes com o gráfico)

**Esforço estimado:** 1-2 horas  
**Risco:** 🟢 Baixo

---

#### GAP 3: Títulos e Copy
**Impacto UX:** 🟡 MÉDIO  
**Razão:** Copy atual é genérico; Shotsy é mais específico.

**Shotsy:**  
- Título: "Shotsy pode ajudar você a entender sua jornada com Mounjaro® através de ferramentas educativas"
- Subtítulo: "Sinta-se mais confiante aprendendo mais sobre como esses medicamentos funcionam."

**Mounjaro:**  
- Título: "Entenda seu progresso com gráficos bonitos"
- Subtítulo: "Visualize seus dados de forma clara e obtenha insights baseados em estudos clínicos"

**Mudança necessária:**
```tsx
<OnboardingScreenBase
  title="Mounjaro Tracker pode ajudar você a entender sua jornada através de ferramentas educativas"
  subtitle="Sinta-se mais confiante aprendendo como o medicamento funciona no seu corpo."
  // ...
>
```

**Esforço estimado:** 15 minutos  
**Risco:** 🟢 Baixo

---

### 📐 ESPECIFICAÇÕES TÉCNICAS

#### Estilos Necessários
```typescript
const styles = StyleSheet.create({
  content: {
    gap: 20, // Mudança: 0 → 20px (espaçamento entre elementos)
  },
  chartPreview: {
    padding: 20,
    marginBottom: 16,
  },
  chartAnnotation: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: -30, // Sobrepor ao gráfico
  },
  chartTimestamp: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
```

#### Dados de Exemplo para Chart
```typescript
const sampleChartData = [
  { x: 0, y: 0.2 },
  { x: 1, y: 0.5 },
  { x: 2, y: 0.9 },
  { x: 3, y: 1.16 }, // Pico
  { x: 4, y: 0.8 },
  { x: 5, y: 0.6 },
  { x: 6, y: 0.4 },
  { x: 7, y: 0.2 },
];
```

---

### 📊 RESUMO: CHARTS INTRO SCREEN

| Elemento | Status | Ação Necessária |
|----------|--------|-----------------|
| Título | 🟡 Ajustar | Mudar copy para match Shotsy |
| Subtítulo | 🟡 Ajustar | Mudar copy para match Shotsy |
| Emoji 📈 | 🔴 Remover | Substituir por gráfico real |
| Cards de features | 🔴 Remover | Consolidar em um chart preview |
| Gráfico visual | ❌ Faltando | Adicionar com `victory-native` |
| Disclaimer | ❌ Faltando | Adicionar texto FDA |
| Botão "Continuar" | ✅ OK | Já implementado no base |

**Prioridade:** 🔴 P0 - Crítico  
**Esforço Total:** 4-6 horas  
**Risco:** 🟡 Médio

---

## 🎨 TELA 2: EDUCATION GRAPH SCREEN

### 📸 Referências Visuais
**Screenshot Shotsy:** `FIGMA-SCREENSHOTS/shotsy-onboarding-02-charts-intro.PNG` (gráfico visível)  
**Arquivo Mounjaro:** `components/onboarding/EducationGraphScreen.tsx`

### 🔍 ANÁLISE VISUAL DETALHADA

#### 1. LAYOUT GERAL
**Shotsy (Referência):**
- Título: "Entenda seus níveis estimados"
- Subtítulo: "Veja como o medicamento age no seu corpo ao longo do tempo"
- Card principal: Gráfico de área (área preenchida azul)
  - Eixo Y: 0-3mg (visível, com labels)
  - Eixo X: Datas (19/10, 26/10, 2/11, 9/11, etc)
  - Curva suave com área preenchida
  - Projeção futura (tracejada)
  - Ponto atual destacado com valor "1.16mg"
- Card secundário: "Como funciona?"
  - Texto explicativo sobre farmacocinética
- Card de aviso: 💡 "Essas estimativas são baseadas em dados clínicos..."

**Mounjaro (Atual):**
```tsx:components/onboarding/EducationGraphScreen.tsx
<OnboardingScreenBase
  title="Entenda seus níveis estimados"
  subtitle="Veja como o medicamento age no seu corpo ao longo do tempo"
>
  <View style={styles.content}>
    <ShotsyCard variant="elevated" style={styles.graphCard}>
      <View style={styles.graphPlaceholder}>
        {/* Placeholder com eixos simulados */}
        <View style={styles.yAxis}>
          <Text>Alto</Text>
          <Text>Médio</Text>
          <Text>Baixo</Text>
        </View>
        <View style={styles.graphArea}>
          <View style={[styles.curve, { backgroundColor: currentAccent }]} />
          {/* Apenas um retângulo colorido */}
          <View style={styles.xAxis}>
            <Text>Dia 1</Text>
            <Text>Dia 4</Text>
            <Text>Dia 7</Text>
          </View>
        </View>
      </View>
    </ShotsyCard>
    
    <ShotsyCard>
      <Text>Como funciona?</Text>
      <Text>Após cada aplicação, o nível do medicamento aumenta...</Text>
    </ShotsyCard>
    
    <ShotsyCard>
      <Text>💡</Text>
      <Text>Essas estimativas são baseadas em dados clínicos...</Text>
    </ShotsyCard>
  </View>
</OnboardingScreenBase>
```

### 🎯 GAPS VISUAIS IDENTIFICADOS

#### GAP 1: Gráfico Placeholder vs Gráfico Real
**Impacto UX:** 🔴 CRÍTICO  
**Razão:** Usuário vê apenas um retângulo colorido, não entende a curva farmacológica real.

**Shotsy:** Gráfico de área (`VictoryArea`) com curva realista  
**Mounjaro:** Placeholder com `backgroundColor` e eixos simulados  

**Mudança necessária:**
1. **REMOVER** todo o código de `graphPlaceholder`
2. **ADICIONAR** componente `victory-native` com dados farmacológicos reais
3. Implementar curva que mostra:
   - Crescimento pós-injeção (0-4 dias)
   - Pico (~dia 4)
   - Decaimento exponencial (dias 4-7)

**Código sugerido:**
```typescript
import { VictoryArea, VictoryChart, VictoryAxis, VictoryScatter } from 'victory-native';
import { Dimensions } from 'react-native';

// Dados farmacocinéticos realistas (simplificados)
const pharmacokineticData = [
  { day: 0, level: 0 },
  { day: 1, level: 0.3 },
  { day: 2, level: 0.7 },
  { day: 3, level: 1.1 },
  { day: 4, level: 1.2 }, // Pico (Tmax)
  { day: 5, level: 0.9 },
  { day: 6, level: 0.6 },
  { day: 7, level: 0.3 }, // Antes da próxima dose
];

<ShotsyCard variant="elevated" style={styles.graphCard}>
  <VictoryChart
    height={220}
    width={Dimensions.get('window').width - 64}
    padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
  >
    {/* Eixo Y */}
    <VictoryAxis
      dependentAxis
      label="Nível (mg)"
      style={{
        axisLabel: { fontSize: 12, padding: 35 },
        tickLabels: { fontSize: 10 },
        grid: { stroke: colors.border, strokeDasharray: '4,4' },
      }}
      tickValues={[0, 0.5, 1.0, 1.5]}
    />
    
    {/* Eixo X */}
    <VictoryAxis
      label="Dias"
      style={{
        axisLabel: { fontSize: 12, padding: 30 },
        tickLabels: { fontSize: 10 },
      }}
      tickValues={[0, 2, 4, 6, 7]}
    />
    
    {/* Área preenchida */}
    <VictoryArea
      data={pharmacokineticData}
      x="day"
      y="level"
      style={{
        data: {
          fill: currentAccent,
          fillOpacity: 0.3,
          stroke: currentAccent,
          strokeWidth: 2,
        }
      }}
      interpolation="natural" // Curva suave
    />
    
    {/* Ponto do pico */}
    <VictoryScatter
      data={[{ day: 4, level: 1.2 }]}
      x="day"
      y="level"
      size={6}
      style={{
        data: { fill: currentAccent }
      }}
    />
  </VictoryChart>
  
  <Text style={[styles.peakLabel, { color: currentAccent }]}>
    ← Pico: 1.2mg (dia 4)
  </Text>
</ShotsyCard>
```

**Esforço estimado:** 6-8 horas  
**Risco:** 🟡 Médio (requer dados PK corretos + ajustes finos de layout)

---

#### GAP 2: Eixos com Labels Genéricos
**Impacto UX:** 🟡 MÉDIO  
**Razão:** "Alto/Médio/Baixo" e "Dia 1/4/7" não transmitem informação científica real.

**Shotsy:** Valores numéricos reais (0-3mg) e datas  
**Mounjaro:** Labels genéricos ("Alto", "Médio", "Baixo")  

**Mudança necessária:**
- Eixo Y: Usar valores numéricos (0, 0.5, 1.0, 1.5mg)
- Eixo X: Usar dias numéricos (0, 2, 4, 6, 7)
- Adicionar label "Nível (mg)" no eixo Y
- Adicionar label "Dias" no eixo X

**Esforço estimado:** Incluído no GAP 1  
**Risco:** 🟢 Baixo

---

#### GAP 3: Card "Como funciona?" - Layout
**Impacto UX:** 🟢 BAIXO  
**Razão:** Layout atual está correto, mas pode melhorar espaçamentos.

**Shotsy:**
- Padding: 20px
- Título: fontSize 18px, fontWeight 600
- Corpo: fontSize 14px, lineHeight 22px

**Mounjaro:**
```typescript
infoCard: {
  padding: 16, // Mudança: 16 → 20px
},
infoTitle: {
  fontSize: 18, // ✅ Correto
  fontWeight: '600', // ✅ Correto
  marginBottom: 8, // ✅ Correto
},
infoText: {
  fontSize: 14, // ✅ Correto
  lineHeight: 22, // ✅ Correto
},
```

**Mudança necessária:**
```typescript
infoCard: {
  padding: 20, // Mudança: 16 → 20px
},
```

**Esforço estimado:** 5 minutos  
**Risco:** 🟢 Baixo

---

### 📐 ESPECIFICAÇÕES TÉCNICAS

#### Estilos Necessários
```typescript
const styles = StyleSheet.create({
  content: {
    gap: 16, // ✅ Já correto
  },
  graphCard: {
    padding: 20, // ✅ Já correto
  },
  peakLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -40, // Sobrepor ao gráfico
    marginRight: 20,
  },
  infoCard: {
    padding: 20, // Mudança: 16 → 20px
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  warningCard: {
    padding: 16, // ✅ Já correto
    flexDirection: 'row',
    gap: 12,
  },
  warningEmoji: {
    fontSize: 24, // ✅ Já correto
  },
  warningText: {
    flex: 1,
    fontSize: 13, // ✅ Já correto
    lineHeight: 20, // ✅ Já correto
  },
});
```

---

### 📊 RESUMO: EDUCATION GRAPH SCREEN

| Elemento | Status | Ação Necessária |
|----------|--------|-----------------|
| Título | ✅ OK | Match perfeito com Shotsy |
| Subtítulo | ✅ OK | Match perfeito com Shotsy |
| Gráfico placeholder | 🔴 Substituir | Implementar `victory-native` |
| Eixos com labels | 🔴 Ajustar | Usar valores numéricos reais |
| Curva farmacológica | ❌ Faltando | Adicionar dados PK |
| Card "Como funciona?" | 🟡 Ajustar | Padding 16 → 20px |
| Card aviso | ✅ OK | Já correto |
| Botão "Entendi" | ✅ OK | Já implementado no base |

**Prioridade:** 🔴 P0 - Crítico  
**Esforço Total:** 6-8 horas  
**Risco:** 🟡 Médio

---

## 🎨 TELA 3: FLUCTUATIONS EDUCATION SCREEN

### 📸 Referências Visuais
**Screenshot Shotsy:** (Não disponível nos screenshots atuais - inferência necessária)  
**Arquivo Mounjaro:** `components/onboarding/FluctuationsEducationScreen.tsx`

### 🔍 ANÁLISE VISUAL DETALHADA

#### 1. LAYOUT GERAL
**Mounjaro (Atual):**
```tsx:components/onboarding/FluctuationsEducationScreen.tsx
<OnboardingScreenBase
  title="É normal ter flutuações"
  subtitle="Seu peso pode variar de um dia para o outro, e está tudo bem"
>
  <View style={styles.content}>
    <Text style={styles.emoji}>📊</Text>
    
    <ShotsyCard variant="elevated">
      <Text>Flutuações típicas de peso</Text>
      <View style={styles.graphPlaceholder}>
        <View style={[styles.graphLine, { backgroundColor: currentAccent }]} />
        {/* Apenas um retângulo */}
      </View>
      <Text>Variações de até 2kg são completamente normais</Text>
    </ShotsyCard>
    
    <ShotsyCard>
      <Text>Fatores que afetam o peso diário:</Text>
      <View>
        💧 Retenção de líquidos
        🍽️ Última refeição
        😴 Qualidade do sono
        🏃 Exercícios recentes
        🧂 Consumo de sódio
      </View>
    </ShotsyCard>
    
    <ShotsyCard style={[styles.tipCard, { borderLeftColor: currentAccent }]}>
      <Text>💡</Text>
      <Text>Foque na tendência geral, não nos números diários...</Text>
    </ShotsyCard>
  </View>
</OnboardingScreenBase>
```

### 🎯 GAPS VISUAIS IDENTIFICADOS

#### GAP 1: Gráfico de Flutuações - Placeholder vs Real
**Impacto UX:** 🔴 ALTO  
**Razão:** Usuário não vê as flutuações reais, apenas um retângulo colorido.

**Shotsy (Inferência):** Gráfico de linha mostrando variações diárias (zig-zag)  
**Mounjaro:** Retângulo colorido com `backgroundColor`  

**Mudança necessária:**
1. Substituir placeholder por gráfico de linha (`VictoryLine`)
2. Mostrar dados que variam ±1-2kg ao longo de 7-10 dias
3. Adicionar área sombreada (±2kg) para "zona normal"
4. Destacar visualmente que flutuações são esperadas

**Código sugerido:**
```typescript
import { VictoryLine, VictoryChart, VictoryAxis, VictoryArea } from 'victory-native';

// Dados de exemplo mostrando flutuações típicas
const fluctuationData = [
  { day: 1, weight: 80.0 },
  { day: 2, weight: 81.2 }, // +1.2kg (retenção líquidos)
  { day: 3, weight: 80.5 }, // -0.7kg
  { day: 4, weight: 80.8 }, // +0.3kg
  { day: 5, weight: 79.6 }, // -1.2kg (grande variação)
  { day: 6, weight: 80.2 }, // +0.6kg
  { day: 7, weight: 79.8 }, // -0.4kg (tendência geral: ↓)
];

<ShotsyCard variant="elevated" style={styles.graphCard}>
  <Text style={[styles.graphTitle, { color: colors.text }]}>
    Flutuações típicas de peso
  </Text>
  
  <VictoryChart
    height={180}
    width={Dimensions.get('window').width - 80}
    padding={{ top: 20, bottom: 30, left: 50, right: 20 }}
  >
    {/* Área sombreada (±2kg zona normal) */}
    <VictoryArea
      data={[
        { day: 1, y0: 78, y: 82 },
        { day: 7, y0: 78, y: 82 },
      ]}
      style={{
        data: { fill: colors.textMuted, opacity: 0.1 }
      }}
    />
    
    {/* Linha de peso */}
    <VictoryLine
      data={fluctuationData}
      x="day"
      y="weight"
      style={{
        data: {
          stroke: currentAccent,
          strokeWidth: 3,
        }
      }}
      interpolation="natural"
    />
    
    {/* Eixos */}
    <VictoryAxis
      dependentAxis
      tickFormat={(t) => `${t}kg`}
      style={{
        tickLabels: { fontSize: 10 },
        grid: { stroke: colors.border, strokeDasharray: '2,2' },
      }}
    />
    <VictoryAxis
      label="Dias"
      style={{
        axisLabel: { fontSize: 12, padding: 25 },
        tickLabels: { fontSize: 10 },
      }}
    />
  </VictoryChart>
  
  <Text style={[styles.graphCaption, { color: colors.textMuted }]}>
    Variações de até 2kg são completamente normais
  </Text>
</ShotsyCard>
```

**Esforço estimado:** 5-6 horas  
**Risco:** 🟡 Médio

---

#### GAP 2: Emoji 📊 - Desnecessário
**Impacto UX:** 🟢 BAIXO  
**Razão:** Redundante se já temos um gráfico visual real.

**Shotsy (Inferência):** Sem emoji (gráfico fala por si)  
**Mounjaro:** Emoji 📊 no topo  

**Mudança necessária:**
```typescript
// REMOVER
<Text style={styles.emoji}>📊</Text>
```

**Esforço estimado:** 1 minuto  
**Risco:** 🟢 Baixo

---

#### GAP 3: Espaçamento e Padding
**Impacto UX:** 🟢 BAIXO  
**Razão:** Pequenos ajustes de consistência.

**Mudança necessária:**
```typescript
const styles = StyleSheet.create({
  content: {
    gap: 20, // ✅ Já correto
  },
  graphCard: {
    padding: 20, // ✅ Já correto
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center', // ✅ Já correto
  },
  graphPlaceholder: {
    height: 120, // ❌ REMOVER (será substituído por VictoryChart)
    // ...
  },
  graphLine: {
    // ❌ REMOVER (será substituído por VictoryLine)
  },
  graphCaption: {
    fontSize: 13, // ✅ Já correto
    textAlign: 'center',
  },
  factorsCard: {
    padding: 20, // ✅ Já correto
  },
  factorsTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16, // ✅ Já correto
  },
  factorsList: {
    gap: 12, // ✅ Já correto
  },
  factor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // ✅ Já correto
  },
  factorEmoji: {
    fontSize: 24, // ✅ Já correto
  },
  factorText: {
    fontSize: 15, // ✅ Já correto
    flex: 1,
  },
  tipCard: {
    padding: 16, // ✅ Já correto
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 4, // ✅ Já correto
  },
  tipEmoji: {
    fontSize: 24, // ✅ Já correto
  },
  tipText: {
    flex: 1,
    fontSize: 14, // ✅ Já correto
    lineHeight: 22, // ✅ Já correto
  },
});
```

**Esforço estimado:** Incluído no GAP 1  
**Risco:** 🟢 Baixo

---

### 📊 RESUMO: FLUCTUATIONS EDUCATION SCREEN

| Elemento | Status | Ação Necessária |
|----------|--------|-----------------|
| Título | ✅ OK | Match com Shotsy |
| Subtítulo | ✅ OK | Match com Shotsy |
| Emoji 📊 | 🟡 Remover | Redundante com gráfico |
| Gráfico placeholder | 🔴 Substituir | Implementar `victory-native` |
| Lista de fatores | ✅ OK | Já correto |
| Card de dica | ✅ OK | Já correto |
| Botão "Entendi" | ✅ OK | Já implementado no base |

**Prioridade:** 🔴 P0 - Crítico  
**Esforço Total:** 5-6 horas  
**Risco:** 🟡 Médio

---

## 📦 DEPENDÊNCIAS E INSTALAÇÃO

### 1. Victory Native
Todas as 3 telas precisam da biblioteca `victory-native`:

```bash
npm install victory-native
# ou
yarn add victory-native
```

**Componentes necessários:**
- `VictoryChart` - Container do gráfico
- `VictoryArea` - Gráfico de área (Charts Intro, Education Graph)
- `VictoryLine` - Gráfico de linha (Fluctuations)
- `VictoryAxis` - Eixos X e Y
- `VictoryScatter` - Pontos destacados

### 2. Importações Comuns
```typescript
import { VictoryChart, VictoryArea, VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { Dimensions } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
```

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### Ordem Sugerida
1. **Education Graph Screen** (mais crítico) - 6-8h
   - Usuário aprende conceito de níveis farmacológicos
   - Gráfico placeholder atual "não faz sentido" (palavras do usuário)
   
2. **Charts Intro Screen** (introdução) - 4-6h
   - Primeira impressão sobre gráficos
   - Define expectativas do usuário
   
3. **Fluctuations Education Screen** (refinamento) - 5-6h
   - Educação importante mas menos crítica
   - Impacto menor na experiência imediata

**Total estimado:** 15-20 horas

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Victory Native não instalado
**Probabilidade:** 🟡 Média  
**Impacto:** 🔴 Alto (bloqueia toda implementação)  
**Mitigação:** Instalar logo no início, testar renderização básica.

### Risco 2: Performance em gráficos
**Probabilidade:** 🟢 Baixa  
**Impacto:** 🟡 Médio  
**Mitigação:** Usar dados estáticos (não animados) no onboarding.

### Risco 3: Dados farmacológicos incorretos
**Probabilidade:** 🟡 Média  
**Impacto:** 🟡 Médio (credibilidade científica)  
**Mitigação:** Validar curva PK com literatura médica (FDA, bula).

---

## 📋 CHECKLIST DE VALIDAÇÃO

Antes de marcar como completo, verificar:

### Charts Intro Screen
- [ ] Gráfico de área renderiza corretamente
- [ ] Anotação "1.16mg" visível sobre o gráfico
- [ ] Disclaimer FDA presente abaixo
- [ ] 3 cards de features removidos
- [ ] Emoji 📈 removido
- [ ] Copy do título/subtítulo atualizado

### Education Graph Screen
- [ ] Curva farmacológica realista (crescimento → pico → decaimento)
- [ ] Eixos com valores numéricos (0-1.5mg, dias 0-7)
- [ ] Ponto de pico destacado com label
- [ ] Placeholder removido completamente
- [ ] Card "Como funciona?" com padding 20px
- [ ] Card de aviso 💡 intacto

### Fluctuations Education Screen
- [ ] Gráfico de linha mostrando variações (zig-zag)
- [ ] Área sombreada indicando "zona normal" (±2kg)
- [ ] Emoji 📊 removido
- [ ] Lista de fatores intacta
- [ ] Card de dica com borda lateral colorida

### Geral
- [ ] `victory-native` instalado e funcionando
- [ ] Temas (light/dark) funcionam corretamente
- [ ] Performance aceitável (sem lag)
- [ ] Screenshots antes/depois documentados

---

## 📸 SCREENSHOTS NECESSÁRIOS

Para documentação final:
1. **Charts Intro** - Antes (3 cards) vs Depois (gráfico)
2. **Education Graph** - Antes (placeholder) vs Depois (curva PK)
3. **Fluctuations** - Antes (retângulo) vs Depois (linha flutuante)

---

## ✅ CONCLUSÃO

### Resumo de Esforço
| Tela | Esforço | Prioridade | Status |
|------|---------|------------|--------|
| Charts Intro | 4-6h | P0 | 📋 Documentado |
| Education Graph | 6-8h | P0 | 📋 Documentado |
| Fluctuations | 5-6h | P0 | 📋 Documentado |
| **TOTAL** | **15-20h** | **P0** | **✅ Auditoria Completa** |

### Próximos Passos
1. ✅ Auditoria Dia 3-4 completa
2. ⏭️ Próximo: **Dia 5** - Inputs de dados (Height, Current Weight, Starting Weight, Target Weight)
3. 📦 Checkpoint Semana 1: Fim do Dia 5

### Impacto Esperado
- 🎯 **UX:** Usuários verão gráficos reais, não placeholders
- 🧠 **Educação:** Compreensão clara de farmacocinética
- 📈 **Credibilidade:** Dados científicos visuais aumentam confiança
- ⏱️ **Engajamento:** Onboarding mais visual = menor abandono

**Data de conclusão da auditoria:** 05 de novembro de 2025  
**Auditado por:** AI Assistant  
**Metodologia:** Fase 0 Piloto (validada)

---

**📌 NOTA IMPORTANTE:** Esta auditoria documenta APENAS os gaps visuais. A implementação será feita após aprovação do plano completo de P0.

