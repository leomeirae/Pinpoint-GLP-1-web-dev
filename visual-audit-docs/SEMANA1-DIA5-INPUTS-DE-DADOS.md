# 📝 AUDITORIA VISUAL: Inputs de Dados Antropométricos
## SEMANA 1 - DIA 5

**Data:** 05 de novembro de 2025  
**Escopo:** P0 - Onboarding Critical Screens  
**Categoria:** Telas de input numérico (altura, peso)  

---

## 📋 SUMÁRIO EXECUTIVO

### Telas Auditadas
1. **Height Input Screen** (Step 11) - Entrada de altura
2. **Current Weight Screen** (Step 12) - Peso atual  
3. **Starting Weight Screen** (Step 13) - Peso inicial + data  
4. **Target Weight Screen** (Step 14) - Peso meta + IMC

### Status Geral
| Tela | Gap Visual | Impacto UX | Esforço | Prioridade |
|------|-----------|-----------|---------|------------|
| Height Input | 🔴 CRÍTICO | 🔴 ALTO | 10-12h | P0 |
| Current Weight | 🔴 CRÍTICO | 🔴 ALTO | 8-10h | P0 |
| Starting Weight | 🟡 MODERADO | 🟡 MÉDIO | 4-6h | P0 |
| Target Weight | 🔴 CRÍTICO | 🔴 ALTO | 10-14h | P0 |

### Gap Principal Identificado
🚨 **MOUNJARO USA TEXT INPUT vs SHOTSY USA PICKER NATIVO iOS**

**Impacto:**
- ❌ UX inferior (teclado numérico vs scroll nativo)
- ❌ Validação manual necessária
- ❌ Sem fade effect visual
- ❌ Não parece app iOS nativo

---

## 🎨 TELA 1: HEIGHT INPUT SCREEN

### 📸 Referências Visuais
**Screenshot Shotsy:** `FIGMA-SCREENSHOTS/shotsy-onboarding-11-height-input.PNG`  
**Arquivo Mounjaro:** `components/onboarding/HeightInputScreen.tsx`

### 🔍 ANÁLISE VISUAL DETALHADA

#### 1. COMPONENTE PRINCIPAL: PICKER vs TEXT INPUT

**Shotsy (Referência):**
- **iOS Native Picker** com scroll vertical
- Fade effect nas extremidades (gradient mask)
- Múltiplos valores visíveis simultaneamente:
  - 172cm
  - 173cm
  - 174cm
  - **175cm** ← selecionado (bold, maior, centralizado)
  - 176cm
  - 177cm
  - 178cm
- Scroll fluido e natural (física do iOS)
- Visual minimalista e limpo

**Mounjaro (Atual):**
```tsx:components/onboarding/HeightInputScreen.tsx
<TextInput
  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
  value={heightCm}
  onChangeText={setHeightCm}
  keyboardType="decimal-pad"
  placeholder="170"
  placeholderTextColor={colors.textMuted}
/>
```

**Problemas:**
- ❌ TextInput genérico com teclado numérico
- ❌ Sem contexto visual (não vê valores ao redor)
- ❌ Sem fade effect
- ❌ Usuário precisa digitar (mais lento)
- ❌ Sem feedback tátil (haptics)

### 🎯 GAPS VISUAIS IDENTIFICADOS

#### GAP 1: Picker Nativo iOS (CRÍTICO)
**Impacto UX:** 🔴 CRÍTICO  
**Razão:** UX nativa do iOS é superior; usuários esperam picker para seleção de valores fixos.

**Mudança necessária:**
1. Substituir `TextInput` por `@react-native-picker/picker`
2. Implementar fade effect visual
3. Configurar range de valores (100cm - 250cm)
4. Adicionar haptic feedback

**Código sugerido:**
```tsx
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';

const HEIGHT_RANGE_CM = Array.from({ length: 151 }, (_, i) => i + 100); // 100-250cm
const HEIGHT_RANGE_FT = Array.from({ length: 5 }, (_, i) => i + 4); // 4-8 ft
const HEIGHT_RANGE_IN = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches

export function HeightInputScreen({ onNext, onBack }: HeightInputScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);

  const handleNext = () => {
    if (unit === 'cm') {
      onNext({ height: heightCm, heightUnit: 'cm' });
    } else {
      const totalCm = (heightFt * 30.48) + (heightIn * 2.54);
      onNext({ height: totalCm, heightUnit: 'ft' });
    }
  };

  return (
    <OnboardingScreenBase
      title="Sua altura"
      subtitle="Sua altura nos ajuda a calcular seu IMC e personalizar seus objetivos."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Unit Toggle */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: unit === 'cm' ? currentAccent : 'transparent',
                borderColor: unit === 'cm' ? currentAccent : colors.border,
              },
            ]}
            onPress={() => {
              setUnit('cm');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[
                styles.unitButtonText,
                { color: unit === 'cm' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              centímetros
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: unit === 'ft' ? currentAccent : 'transparent',
                borderColor: unit === 'ft' ? currentAccent : colors.border,
              },
            ]}
            onPress={() => {
              setUnit('ft');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[
                styles.unitButtonText,
                { color: unit === 'ft' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              polegadas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Picker Container with Fade Effect */}
        <View style={styles.pickerContainer}>
          {/* Top Fade */}
          <LinearGradient
            colors={[colors.background, 'transparent']}
            style={styles.fadeTop}
            pointerEvents="none"
          />

          {unit === 'cm' ? (
            <Picker
              selectedValue={heightCm}
              onValueChange={(value) => {
                setHeightCm(value);
                Haptics.selectionAsync();
              }}
              style={styles.picker}
              itemStyle={[styles.pickerItem, { color: colors.text }]}
            >
              {HEIGHT_RANGE_CM.map((cm) => (
                <Picker.Item key={cm} label={`${cm}cm`} value={cm} />
              ))}
            </Picker>
          ) : (
            <View style={styles.dualPickerRow}>
              <Picker
                selectedValue={heightFt}
                onValueChange={(value) => {
                  setHeightFt(value);
                  Haptics.selectionAsync();
                }}
                style={styles.pickerHalf}
                itemStyle={[styles.pickerItem, { color: colors.text }]}
              >
                {HEIGHT_RANGE_FT.map((ft) => (
                  <Picker.Item key={ft} label={`${ft} ft`} value={ft} />
                ))}
              </Picker>
              <Picker
                selectedValue={heightIn}
                onValueChange={(value) => {
                  setHeightIn(value);
                  Haptics.selectionAsync();
                }}
                style={styles.pickerHalf}
                itemStyle={[styles.pickerItem, { color: colors.text }]}
              >
                {HEIGHT_RANGE_IN.map((inches) => (
                  <Picker.Item key={inches} label={`${inches} in`} value={inches} />
                ))}
              </Picker>
            </View>
          )}

          {/* Bottom Fade */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        </View>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 32,
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerContainer: {
    position: 'relative',
    height: 220,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  picker: {
    height: 220,
    width: '100%',
  },
  pickerItem: {
    fontSize: 22,
    height: 44,
  },
  dualPickerRow: {
    flexDirection: 'row',
    height: 220,
  },
  pickerHalf: {
    flex: 1,
  },
});
```

**Dependências:**
```bash
npm install @react-native-picker/picker
npm install expo-linear-gradient
npm install expo-haptics
```

**Esforço estimado:** 10-12 horas  
**Risco:** 🟡 Médio (componente iOS nativo, pode ter quirks)

---

#### GAP 2: Unit Toggle - Layout e Microcopy
**Impacto UX:** 🟢 BAIXO  
**Razão:** Labels atuais são curtos demais.

**Shotsy:** "centímetros" / "polegadas" (texto completo)  
**Mounjaro:** "cm" / "pés/pol" (abreviado)  

**Mudança necessária:**
```tsx
// Antes
<Text>cm</Text>
<Text>pés/pol</Text>

// Depois
<Text>centímetros</Text>
<Text>polegadas</Text>
```

**Esforço estimado:** 5 minutos  
**Risco:** 🟢 Baixo

---

#### GAP 3: Título e Subtítulo
**Impacto UX:** 🟢 BAIXO

**Shotsy:**  
- Título: "Sua altura"
- Subtítulo: "Sua altura nos ajuda a calcular seu IMC e personalizar seus objetivos."

**Mounjaro:**  
- Título: "Qual é a sua altura?"
- Subtítulo: "Essa informação nos ajuda a calcular seu IMC"

**Mudança necessária:**
```tsx
<OnboardingScreenBase
  title="Sua altura"
  subtitle="Sua altura nos ajuda a calcular seu IMC e personalizar seus objetivos."
  // ...
>
```

**Esforço estimado:** 2 minutos  
**Risco:** 🟢 Baixo

---

#### GAP 4: Emoji 📏 - Desnecessário
**Impacto UX:** 🟢 BAIXO

**Shotsy:** Sem emoji  
**Mounjaro:** Emoji 📏 no final  

**Mudança necessária:**
```tsx
// REMOVER
<Text style={styles.emoji}>📏</Text>
```

**Esforço estimado:** 1 minuto  
**Risco:** 🟢 Baixo

---

### 📊 RESUMO: HEIGHT INPUT SCREEN

| Elemento | Status | Ação Necessária |
|----------|--------|-----------------|
| Título | 🟡 Ajustar | "Qual é a sua altura?" → "Sua altura" |
| Subtítulo | 🟡 Ajustar | Expandir copy completo |
| Unit toggle | 🟡 Ajustar | "cm" → "centímetros", "pés/pol" → "polegadas" |
| TextInput | 🔴 Substituir | Por iOS Picker nativo |
| Fade effect | ❌ Faltando | Adicionar gradients top/bottom |
| Haptic feedback | ❌ Faltando | Adicionar ao selecionar |
| Emoji 📏 | 🔴 Remover | Não existe no Shotsy |

**Prioridade:** 🔴 P0 - Crítico  
**Esforço Total:** 10-12 horas  
**Risco:** 🟡 Médio

---

## 🎨 TELA 2: CURRENT WEIGHT SCREEN

### 📸 Referências Visuais
**Screenshot Shotsy:** `IMG_0625.PNG` (Current Weight com picker decimal)  
**Arquivo Mounjaro:** `components/onboarding/CurrentWeightScreen.tsx`

### 🔍 ANÁLISE VISUAL DETALHADA

#### 1. COMPONENTE PRINCIPAL: PICKER DECIMAL

**Shotsy (Referência):**
- **Picker decimal de 3 colunas:**
  - Coluna 1: Parte inteira (101, 102, 103, **104**, 105, 106, 107)
  - Coluna 2: Separador **"."**
  - Coluna 3: Decimal (0, 1, 2, **3**, 4, 5, 6)
  - Sufixo: **"kg"** (fixo à direita)
- Fade effect nas extremidades
- Visual limpo e minimalista

**Mounjaro (Atual):**
```tsx:components/onboarding/CurrentWeightScreen.tsx
<TextInput
  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
  value={weight}
  onChangeText={setWeight}
  keyboardType="decimal-pad"
  placeholder={unit === 'kg' ? '75.0' : '165.0'}
  placeholderTextColor={colors.textMuted}
/>
```

**Problemas:**
- ❌ TextInput com teclado numérico
- ❌ Sem contexto visual
- ❌ Validação manual do decimal

### 🎯 GAPS VISUAIS IDENTIFICADOS

#### GAP 1: Picker Decimal de 3 Colunas (CRÍTICO)
**Impacto UX:** 🔴 CRÍTICO  
**Razão:** Peso precisa de precisão decimal; picker é mais intuitivo.

**Mudança necessária:**
```tsx
const WEIGHT_INTEGER_RANGE = Array.from({ length: 201 }, (_, i) => i + 30); // 30-230kg
const WEIGHT_DECIMAL_RANGE = Array.from({ length: 10 }, (_, i) => i); // 0-9

export function CurrentWeightScreen({ onNext, onBack }: CurrentWeightScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [weightInteger, setWeightInteger] = useState(75);
  const [weightDecimal, setWeightDecimal] = useState(0);

  const handleNext = () => {
    const weight = weightInteger + (weightDecimal / 10);
    onNext({ currentWeight: weight, weightUnit: unit });
  };

  return (
    <OnboardingScreenBase
      title="Seu peso atual"
      subtitle="Agora vamos registrar seu peso atual, para que possamos acompanhar seu progresso."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Unit Toggle */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: unit === 'kg' ? currentAccent : 'transparent',
                borderColor: unit === 'kg' ? currentAccent : colors.border,
              },
            ]}
            onPress={() => {
              setUnit('kg');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[
                styles.unitButtonText,
                { color: unit === 'kg' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              quilogramas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: unit === 'lb' ? currentAccent : 'transparent',
                borderColor: unit === 'lb' ? currentAccent : colors.border,
              },
            ]}
            onPress={() => {
              setUnit('lb');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[
                styles.unitButtonText,
                { color: unit === 'lb' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              libras
            </Text>
          </TouchableOpacity>
        </View>

        {/* Decimal Picker Container */}
        <View style={styles.pickerContainer}>
          {/* Top Fade */}
          <LinearGradient
            colors={[colors.background, 'transparent']}
            style={styles.fadeTop}
            pointerEvents="none"
          />

          {/* 3-Column Picker */}
          <View style={styles.decimalPickerRow}>
            {/* Integer Picker */}
            <Picker
              selectedValue={weightInteger}
              onValueChange={(value) => {
                setWeightInteger(value);
                Haptics.selectionAsync();
              }}
              style={styles.pickerInteger}
              itemStyle={[styles.pickerItem, { color: colors.text }]}
            >
              {WEIGHT_INTEGER_RANGE.map((num) => (
                <Picker.Item key={num} label={`${num}`} value={num} />
              ))}
            </Picker>

            {/* Decimal Separator */}
            <View style={styles.separatorContainer}>
              <Text style={[styles.separator, { color: colors.text }]}>.</Text>
            </View>

            {/* Decimal Picker */}
            <Picker
              selectedValue={weightDecimal}
              onValueChange={(value) => {
                setWeightDecimal(value);
                Haptics.selectionAsync();
              }}
              style={styles.pickerDecimal}
              itemStyle={[styles.pickerItem, { color: colors.text }]}
            >
              {WEIGHT_DECIMAL_RANGE.map((num) => (
                <Picker.Item key={num} label={`${num}`} value={num} />
              ))}
            </Picker>

            {/* Unit Suffix */}
            <View style={styles.suffixContainer}>
              <Text style={[styles.suffix, { color: colors.textSecondary }]}>
                {unit}
              </Text>
            </View>
          </View>

          {/* Bottom Fade */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        </View>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 32,
  },
  unitToggle: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerContainer: {
    position: 'relative',
    height: 220,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  decimalPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 220,
    justifyContent: 'center',
  },
  pickerInteger: {
    width: 100,
    height: 220,
  },
  separatorContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  pickerDecimal: {
    width: 60,
    height: 220,
  },
  suffixContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  suffix: {
    fontSize: 20,
    fontWeight: '600',
  },
  pickerItem: {
    fontSize: 22,
    height: 44,
  },
});
```

**Esforço estimado:** 8-10 horas  
**Risco:** 🟡 Médio

---

#### GAP 2: Unit Toggle - Microcopy
**Shotsy:** "quilogramas" / "libras"  
**Mounjaro:** "kg" / "lb"  

**Mudança:** Usar texto completo  
**Esforço:** 2 minutos

---

#### GAP 3: Título e Subtítulo
**Shotsy:**  
- Título: "Seu peso atual"
- Subtítulo: "Agora vamos registrar seu peso atual, para que possamos acompanhar seu progresso."

**Mounjaro:**  
- Título: "Qual é o seu peso atual?"
- Subtítulo: "Essa será a base para acompanhar seu progresso"

**Mudança:** Match exato com Shotsy  
**Esforço:** 2 minutos

---

#### GAP 4: Emoji ⚖️ - Remover
**Shotsy:** Sem emoji  
**Mounjaro:** Emoji ⚖️  

**Mudança:** Remover  
**Esforço:** 1 minuto

---

#### GAP 5: Tip Card - Manter mas Ajustar
**Shotsy:** Não visível no screenshot, mas pode estar fora do viewport  
**Mounjaro:** Tem tip card com dica de pesagem  

**Ação:** Manter, mas verificar posicionamento  
**Esforço:** 30 minutos (verificação visual)

---

### 📊 RESUMO: CURRENT WEIGHT SCREEN

| Elemento | Status | Ação Necessária |
|----------|--------|-----------------|
| Título | 🟡 Ajustar | Match exato com Shotsy |
| Subtítulo | 🟡 Ajustar | Expandir copy completo |
| Unit toggle | 🟡 Ajustar | "kg/lb" → "quilogramas/libras" |
| TextInput | 🔴 Substituir | Por Picker decimal 3 colunas |
| Fade effect | ❌ Faltando | Adicionar gradients |
| Haptic feedback | ❌ Faltando | Adicionar |
| Emoji ⚖️ | 🔴 Remover | Não existe no Shotsy |
| Tip card | 🟡 Manter | Verificar posicionamento |

**Prioridade:** 🔴 P0 - Crítico  
**Esforço Total:** 8-10 horas  
**Risco:** 🟡 Médio

---

## 🎨 TELA 3: STARTING WEIGHT SCREEN

### 📸 Referências Visuais
**Screenshot Shotsy:** `IMG_0626.PNG` (Starting Weight com editable cards)  
**Arquivo Mounjaro:** `components/onboarding/StartingWeightScreen.tsx`

### 🔍 ANÁLISE VISUAL DETALHADA

#### 1. LAYOUT PRINCIPAL

**Shotsy (Referência):**
- **Card 1: Peso Inicial**
  - Ícone: ⚖️ (à esquerda)
  - Label: "Peso Inicial"
  - Valor: "104 kg" (bold, grande)
  - Botão edit: ✏️ (à direita, pequeno)
  - Background: card elevado
  
- **Card 2: Data de Início**
  - Ícone: 📅 (à esquerda)
  - Label: "Data de Início"
  - Valor: "28 de out. de 2025"
  - Botão edit: ✏️ (à direita, pequeno)
  - Background: card elevado

**Mounjaro (Atual):**
```tsx:components/onboarding/StartingWeightScreen.tsx
// 2 cards separados com TextInput
<ShotsyCard variant="elevated">
  <Text>Peso inicial</Text>
  <TextInput
    value={weight}
    onChangeText={setWeight}
    keyboardType="decimal-pad"
    placeholder={weightUnit === 'kg' ? '85.0' : '187.0'}
  />
</ShotsyCard>

<ShotsyCard variant="elevated">
  <Text>Data de início</Text>
  <View style={styles.dateInputRow}>
    {/* 3 TextInputs: DD / MM / AAAA */}
    <TextInput value={dateDay} onChangeText={setDateDay} placeholder="DD" maxLength={2} />
    <TextInput value={dateMonth} onChangeText={setDateMonth} placeholder="MM" maxLength={2} />
    <TextInput value={dateYear} onChangeText={setDateYear} placeholder="AAAA" maxLength={4} />
  </View>
</ShotsyCard>
```

### 🎯 GAPS VISUAIS IDENTIFICADOS

#### GAP 1: Cards Editáveis vs Inputs Diretos
**Impacto UX:** 🟡 MÉDIO  
**Razão:** Shotsy usa "apresentação + edição" (2 modos); Mounjaro sempre mostra input.

**Shotsy:** Valor exibido + botão edit → abre modal/picker  
**Mounjaro:** Input sempre visível  

**Opções:**
1. **OPÇÃO A (Fidelidade Total):** Implementar estado de apresentação + modal de edição
2. **OPÇÃO B (Pragmática):** Manter inputs mas estilizar como Shotsy (ícones + layout)

**Recomendação:** OPÇÃO B (pragmática) - menor esforço, UX similar

**Mudança necessária (OPÇÃO B):**
```tsx
export function StartingWeightScreen({ 
  onNext, 
  onBack, 
  weightUnit = 'kg' 
}: StartingWeightScreenProps) {
  const colors = useShotsyColors();
  const [weight, setWeight] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace('.', ' de');
  };

  return (
    <OnboardingScreenBase
      title="Conte-nos como você estava quando começou."
      subtitle="Adicione o peso que você tinha quando começou sua jornada, junto com a data de início."
      onNext={handleNext}
      onBack={onBack}
      disableNext={!isValid}
    >
      <View style={styles.content}>
        {/* Weight Card */}
        <ShotsyCard variant="elevated" style={styles.editableCard}>
          <View style={styles.cardIcon}>
            <Text style={styles.icon}>⚖️</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              Peso Inicial
            </Text>
            <TextInput
              style={[styles.cardValue, { color: colors.text }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder={weightUnit === 'kg' ? '104' : '229'}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.cardAction}>
            <Text style={[styles.unitSuffix, { color: colors.textSecondary }]}>
              {weightUnit}
            </Text>
          </View>
        </ShotsyCard>

        {/* Date Card */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
        >
          <ShotsyCard variant="elevated" style={styles.editableCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.icon}>📅</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                Data de Início
              </Text>
              <Text style={[styles.cardValue, { color: colors.text }]}>
                {formatDate(startDate)}
              </Text>
            </View>
            <View style={styles.cardAction}>
              <Ionicons name="pencil" size={20} color={colors.textMuted} />
            </View>
          </ShotsyCard>
        </TouchableOpacity>

        {/* iOS Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  editableCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitSuffix: {
    fontSize: 16,
    fontWeight: '500',
  },
});
```

**Dependências:**
```bash
npm install @react-native-community/datetimepicker
npm install @expo/vector-icons
```

**Esforço estimado:** 4-6 horas  
**Risco:** 🟢 Baixo

---

#### GAP 2: Título e Subtítulo
**Shotsy:**  
- Título: "Conte-nos como você estava quando começou."
- Subtítulo: "Adicione o peso que você tinha quando começou sua jornada, junto com a data de início."

**Mounjaro:**  
- Título: "Qual era seu peso quando começou (ou vai começar) o GLP-1?"
- Subtítulo: "Isso nos ajuda a calcular seu progresso total"

**Mudança:** Match exato com Shotsy  
**Esforço:** 2 minutos

---

#### GAP 3: Emoji 📅 - Remover (já está no card)
**Shotsy:** Emoji dentro do card (ícone funcional)  
**Mounjaro:** Emoji decorativo no final + ícone no card  

**Mudança:** Remover emoji decorativo  
**Esforço:** 1 minuto

---

### 📊 RESUMO: STARTING WEIGHT SCREEN

| Elemento | Status | Ação Necessária |
|----------|--------|-----------------|
| Título | 🟡 Ajustar | Match exato com Shotsy |
| Subtítulo | 🟡 Ajustar | Expandir copy completo |
| Weight card layout | 🟡 Ajustar | Adicionar ícone + layout horizontal |
| Date inputs | 🔴 Substituir | Por DateTimePicker nativo |
| Emoji 📅 decorativo | 🔴 Remover | Já existe no card |

**Prioridade:** 🔴 P0 - Crítico  
**Esforço Total:** 4-6 horas  
**Risco:** 🟢 Baixo

---

## 🎨 TELA 4: TARGET WEIGHT SCREEN

### 📸 Referências Visuais
**Screenshot Shotsy:** `IMG_0627.PNG` (Target Weight com IMC slider visual)  
**Arquivo Mounjaro:** `components/onboarding/TargetWeightScreen.tsx`

### 🔍 ANÁLISE VISUAL DETALHADA

#### 1. COMPONENTE PRINCIPAL: IMC SLIDER

**Shotsy (Referência):**
- Card principal com:
  - **Valor grande centralizado:** "75kg" (fontSize ~48px)
  - **Slider visual:** Régua horizontal com marcações
    - Range visível: 70kg - 80kg
    - Tick marks a cada 1kg
    - Indicador azul (handle) na posição 75kg
  - **IMC calculado:** "24.5" (grande, verde)
  - **Label IMC:** "Peso Normal" (pill verde)
  - **Barra de categorias IMC:**
    - 🟣 Baixo (<18.5)
    - 🟢 Saudável (18.5-25) ← posição atual
    - 🟠 Alto (25-30)
    - 🔴 Muito Alto (30+)
    - Indicador visual na posição do IMC atual

**Mounjaro (Atual):**
```tsx:components/onboarding/TargetWeightScreen.tsx
// Input simples + 2 cards informativos
<ShotsyCard variant="elevated">
  <Text>Peso meta</Text>
  <TextInput
    value={weight}
    onChangeText={setWeight}
    keyboardType="decimal-pad"
    placeholder="70.0"
  />
</ShotsyCard>

{showProgress && (
  <>
    <ShotsyCard>
      {/* Progress bar simples */}
      <Text>Sua jornada</Text>
      <View style={styles.progressBar}>
        {/* Labels: Início, Atual, Meta */}
      </View>
    </ShotsyCard>
    
    <ShotsyCard>
      {/* IMC simples: Atual → Meta */}
      <Text>IMC</Text>
      <View>
        <Text>{currentBMI}</Text>
        <Text>→</Text>
        <Text>{targetBMI}</Text>
      </View>
    </ShotsyCard>
  </>
)}
```

**Problemas:**
- ❌ Sem slider visual (apenas TextInput)
- ❌ Sem régua de peso com tick marks
- ❌ Barra IMC simplificada demais
- ❌ Sem categorias coloridas
- ❌ Sem pill "Peso Normal/Saudável/etc"

### 🎯 GAPS VISUAIS IDENTIFICADOS

#### GAP 1: Slider Visual com Régua (CRÍTICO)
**Impacto UX:** 🔴 CRÍTICO  
**Razão:** Usuário precisa feedback visual em tempo real do IMC ao ajustar peso.

**Mudança necessária:**
```tsx
import Slider from '@react-native-community/slider';

export function TargetWeightScreen({
  onNext,
  onBack,
  weightUnit = 'kg',
  currentWeight = 0,
  startingWeight = 0,
  height = 170,
}: TargetWeightScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  
  // Calcular range inteligente baseado no peso atual
  const minWeight = Math.max(40, Math.floor(currentWeight * 0.7)); // -30% do atual
  const maxWeight = Math.ceil(currentWeight * 0.95); // -5% do atual (mínimo saudável)
  
  const [targetWeight, setTargetWeight] = useState(
    Math.round((minWeight + maxWeight) / 2)
  );

  const calculateBMI = (weightKg: number, heightCm: number) => {
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Baixo Peso', color: '#A855F7' };
    if (bmi < 25) return { label: 'Peso Normal', color: '#10B981' };
    if (bmi < 30) return { label: 'Sobrepeso', color: '#F59E0B' };
    return { label: 'Obesidade', color: '#EF4444' };
  };

  const targetBMI = calculateBMI(targetWeight, height);
  const bmiCategory = getBMICategory(targetBMI);
  const weightToLose = currentWeight - targetWeight;

  return (
    <OnboardingScreenBase
      title="Peso meta"
      subtitle="Agora vamos definir seu peso-alvo. Isso nos ajudará a personalizar suas metas."
      onNext={() => onNext({ targetWeight })}
      onBack={onBack}
      disableNext={targetWeight >= currentWeight}
    >
      <View style={styles.content}>
        {/* Main Slider Card */}
        <ShotsyCard variant="elevated" style={styles.sliderCard}>
          {/* Big Weight Display */}
          <Text style={[styles.weightValue, { color: colors.text }]}>
            {targetWeight}kg
          </Text>

          {/* Ruler Slider */}
          <View style={styles.rulerContainer}>
            {/* Tick marks */}
            <View style={styles.tickMarks}>
              {Array.from({ length: maxWeight - minWeight + 1 }, (_, i) => {
                const weight = minWeight + i;
                const isMultipleOf5 = weight % 5 === 0;
                return (
                  <View key={weight} style={styles.tickContainer}>
                    <View
                      style={[
                        styles.tick,
                        {
                          height: isMultipleOf5 ? 12 : 6,
                          backgroundColor: colors.border,
                        },
                      ]}
                    />
                    {isMultipleOf5 && (
                      <Text style={[styles.tickLabel, { color: colors.textMuted }]}>
                        {weight}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Slider */}
            <Slider
              style={styles.slider}
              minimumValue={minWeight}
              maximumValue={maxWeight}
              step={0.5}
              value={targetWeight}
              onValueChange={(value) => {
                setTargetWeight(Math.round(value * 2) / 2); // Round to 0.5
                Haptics.selectionAsync();
              }}
              minimumTrackTintColor={currentAccent}
              maximumTrackTintColor={colors.border}
              thumbTintColor={currentAccent}
            />
          </View>

          {/* BMI Display */}
          <View style={styles.bmiDisplay}>
            <Text style={[styles.bmiValue, { color: bmiCategory.color }]}>
              {targetBMI.toFixed(1)}
            </Text>
            <View
              style={[
                styles.bmiPill,
                { backgroundColor: bmiCategory.color + '20' },
              ]}
            >
              <Text style={[styles.bmiLabel, { color: bmiCategory.color }]}>
                {bmiCategory.label}
              </Text>
            </View>
          </View>

          {/* BMI Category Bar */}
          <View style={styles.bmiBar}>
            {/* Underweight */}
            <View style={[styles.bmiSegment, { flex: 1.85, backgroundColor: '#A855F7' }]} />
            {/* Normal */}
            <View style={[styles.bmiSegment, { flex: 0.65, backgroundColor: '#10B981' }]} />
            {/* Overweight */}
            <View style={[styles.bmiSegment, { flex: 0.5, backgroundColor: '#F59E0B' }]} />
            {/* Obese */}
            <View style={[styles.bmiSegment, { flex: 1, backgroundColor: '#EF4444' }]} />
            
            {/* Current BMI Indicator */}
            <View
              style={[
                styles.bmiIndicator,
                {
                  left: `${Math.min(Math.max((targetBMI / 40) * 100, 0), 100)}%`,
                  backgroundColor: currentAccent,
                },
              ]}
            />
          </View>

          {/* Labels */}
          <View style={styles.bmiLabels}>
            <View style={styles.bmiLabelItem}>
              <Text style={[styles.bmiLabelText, { color: '#A855F7' }]}>Baixo</Text>
              <Text style={[styles.bmiLabelRange, { color: colors.textMuted }]}>&lt;18.5</Text>
            </View>
            <View style={styles.bmiLabelItem}>
              <Text style={[styles.bmiLabelText, { color: '#10B981' }]}>Saudável</Text>
              <Text style={[styles.bmiLabelRange, { color: colors.textMuted }]}>18.5-25</Text>
            </View>
            <View style={styles.bmiLabelItem}>
              <Text style={[styles.bmiLabelText, { color: '#F59E0B' }]}>Alto</Text>
              <Text style={[styles.bmiLabelRange, { color: colors.textMuted }]}>25-30</Text>
            </View>
            <View style={styles.bmiLabelItem}>
              <Text style={[styles.bmiLabelText, { color: '#EF4444' }]}>Muito Alto</Text>
              <Text style={[styles.bmiLabelRange, { color: colors.textMuted }]}>30+</Text>
            </View>
          </View>
        </ShotsyCard>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  sliderCard: {
    padding: 24,
    alignItems: 'center',
  },
  weightValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  rulerContainer: {
    width: '100%',
    marginBottom: 32,
  },
  tickMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  tickContainer: {
    alignItems: 'center',
    flex: 1,
  },
  tick: {
    width: 1,
  },
  tickLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  bmiDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bmiPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bmiLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  bmiBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
    width: '100%',
    position: 'relative',
  },
  bmiSegment: {
    height: '100%',
  },
  bmiIndicator: {
    position: 'absolute',
    top: -4,
    width: 6,
    height: 20,
    borderRadius: 3,
    marginLeft: -3,
  },
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  bmiLabelItem: {
    alignItems: 'center',
  },
  bmiLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bmiLabelRange: {
    fontSize: 10,
    marginTop: 2,
  },
});
```

**Dependências:**
```bash
npm install @react-native-community/slider
```

**Esforço estimado:** 10-14 horas  
**Risco:** 🟡 Médio (componente complexo, muitos cálculos visuais)

---

### 📊 RESUMO: TARGET WEIGHT SCREEN

| Elemento | Status | Ação Necessária |
|----------|--------|-----------------|
| Título | 🟡 Ajustar | "Qual é o seu peso meta?" → "Peso meta" |
| Subtítulo | 🟡 Ajustar | Match com Shotsy |
| TextInput | 🔴 Substituir | Por Slider com régua visual |
| Tick marks | ❌ Faltando | Adicionar régua com marcações |
| IMC display | 🔴 Melhorar | Valor grande + pill colorido |
| BMI category bar | 🔴 Implementar | Barra 4 cores + indicador posição |
| Labels BMI | 🔴 Implementar | 4 categorias com ranges |
| Progress card | 🔴 Remover | Não existe no Shotsy |
| Emoji 🎯 | 🔴 Remover | Não existe no Shotsy |

**Prioridade:** 🔴 P0 - Crítico  
**Esforço Total:** 10-14 horas  
**Risco:** 🟡 Médio

---

## 📦 DEPENDÊNCIAS TÉCNICAS

### Instalação Necessária
```bash
# Pickers nativos
npm install @react-native-picker/picker

# Date picker
npm install @react-native-community/datetimepicker

# Slider
npm install @react-native-community/slider

# Gradients (fade effect)
npm install expo-linear-gradient

# Haptics (feedback tátil)
npm install expo-haptics

# Ícones
npm install @expo/vector-icons
```

### Configuração iOS (react-native-picker)
```bash
cd ios && pod install && cd ..
```

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### Ordem Sugerida (por complexidade)
1. **Starting Weight Screen** (4-6h) - Mais simples
   - Layout de cards + DatePicker nativo
   - Baixo risco
   
2. **Height Input Screen** (10-12h) - Complexo
   - Picker nativo + fade effects
   - Dual picker (ft/in)
   
3. **Current Weight Screen** (8-10h) - Complexo
   - Picker decimal 3 colunas
   - Layout específico
   
4. **Target Weight Screen** (10-14h) - Mais complexo
   - Slider com régua visual
   - BMI bar com 4 categorias
   - Cálculos dinâmicos

**Total estimado:** 32-42 horas

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Performance dos Pickers
**Probabilidade:** 🟡 Média  
**Impacto:** 🟡 Médio  
**Mitigação:** Limitar range de valores (não renderizar 1-1000)

### Risco 2: Picker quirks no iOS/Android
**Probabilidade:** 🟡 Média  
**Impacto:** 🟡 Médio  
**Mitigação:** Testar em ambas plataformas; usar bibliotecas mantidas

### Risco 3: Fade effects com LinearGradient
**Probabilidade:** 🟢 Baixa  
**Impacto:** 🟢 Baixo  
**Mitigação:** `expo-linear-gradient` é estável; bem documentado

### Risco 4: Cálculo de IMC e posicionamento visual
**Probabilidade:** 🟢 Baixa  
**Impacto:** 🟡 Médio (se incorreto, desacredita o app)  
**Mitigação:** Validar fórmula BMI com literatura médica; testar edge cases

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Height Input Screen
- [ ] Picker nativo renderiza corretamente (cm e ft/in)
- [ ] Fade effect visível (top e bottom)
- [ ] Haptic feedback funciona ao selecionar
- [ ] Unit toggle: "centímetros" / "polegadas"
- [ ] Título e subtítulo match Shotsy
- [ ] Emoji 📏 removido
- [ ] Conversão ft/in → cm correta

### Current Weight Screen
- [ ] Picker decimal 3 colunas (integer . decimal kg)
- [ ] Fade effect visível
- [ ] Haptic feedback funciona
- [ ] Unit toggle: "quilogramas" / "libras"
- [ ] Título e subtítulo match Shotsy
- [ ] Emoji ⚖️ removido
- [ ] Tip card posicionado corretamente

### Starting Weight Screen
- [ ] Card layout horizontal (ícone + conteúdo + ação)
- [ ] Ícone ⚖️ visível no weight card
- [ ] Ícone 📅 visível no date card
- [ ] DateTimePicker nativo funciona
- [ ] Formato de data: "28 de out. de 2025"
- [ ] Título e subtítulo match Shotsy
- [ ] Emoji 📅 decorativo removido

### Target Weight Screen
- [ ] Slider com régua funciona
- [ ] Tick marks visíveis a cada 1kg (5kg bold)
- [ ] Valor peso grande e centralizado (48px)
- [ ] IMC calculado corretamente
- [ ] BMI pill colorido (verde/amarelo/laranja/vermelho)
- [ ] BMI bar com 4 segmentos coloridos
- [ ] Indicador de posição no BMI bar
- [ ] Labels das 4 categorias + ranges
- [ ] Título e subtítulo match Shotsy
- [ ] Progress card removido
- [ ] Emoji 🎯 removido

### Geral
- [ ] Todas dependências instaladas
- [ ] Funciona em iOS e Android
- [ ] Performance aceitável (sem lag)
- [ ] Temas (light/dark) funcionam
- [ ] Screenshots antes/depois documentados

---

## ✅ CONCLUSÃO DIA 5

### Resumo de Esforço
| Tela | Esforço | Prioridade | Status |
|------|---------|------------|--------|
| Height Input | 10-12h | P0 | 📋 Documentado |
| Current Weight | 8-10h | P0 | 📋 Documentado |
| Starting Weight | 4-6h | P0 | 📋 Documentado |
| Target Weight | 10-14h | P0 | 📋 Documentado |
| **TOTAL** | **32-42h** | **P0** | **✅ Auditoria Completa** |

### Gap Crítico Universal
🚨 **TODAS as 4 telas usam TextInput ao invés de componentes nativos iOS**

**Impacto:**
- Experiência inferior vs Shotsy
- Não parece app nativo
- Validação manual necessária
- Sem feedback tátil

**Solução:** Migrar para pickers/sliders nativos (decisão arquitetural)

### Próximos Passos
1. ✅ Semana 1 completa (Dia 1-5)
2. 📊 **Checkpoint:** Revisar P0 completo
3. 🚀 Iniciar **implementação** dos componentes auditados

### Impacto Esperado
- 🎯 **UX:** Inputs nativos = experiência iOS premium
- 📱 **Consistência:** Match 100% com Shotsy
- ⚡ **Performance:** Pickers nativos são otimizados
- 🎨 **Visual:** Fade effects + animações nativas

**Data de conclusão:** 05 de novembro de 2025  
**Auditado por:** AI Assistant  
**Metodologia:** Fase 0 Piloto (validada)  

---

**📌 NOTA IMPORTANTE:** Esta auditoria documenta APENAS os gaps visuais. A implementação será feita após aprovação do plano completo de P0.

