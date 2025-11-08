# Design Tokens - Guia de Uso

Este guia mostra como usar os novos Design Tokens do Shotsy no Pinpoint.

## 📦 Arquivos Criados

### 1. `constants/shotsyDesignTokens.ts`
Sistema completo de design tokens incluindo:
- Spacing
- Border Radius
- Shadows
- Typography
- Opacity
- Animation Durations
- Z-Index
- Icon Sizes

### 2. `lib/dosageColors.ts`
Sistema de cores específicas para dosagens de GLP-1:
- Cores únicas por dosagem (2.5mg, 5mg, 7.5mg, etc.)
- Helpers para obter cores com opacidade
- Gradientes para gráficos
- Labels amigáveis

## 🎨 Como Usar

### Spacing

```typescript
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

// Em um componente
<View style={{
  padding: ShotsyDesignTokens.spacing.lg,      // 16px
  marginBottom: ShotsyDesignTokens.spacing.xl  // 24px
}} />
```

### Border Radius

```typescript
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

<View style={{
  borderRadius: ShotsyDesignTokens.borderRadius.lg  // 16px (padrão cards)
}} />
```

### Shadows

```typescript
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

// Sombra estilo iOS para cards
<View style={{
  ...ShotsyDesignTokens.shadows.card
}} />

// Sombra para elementos elevados
<View style={{
  ...ShotsyDesignTokens.shadows.elevated
}} />
```

### Typography

```typescript
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

<Text style={ShotsyDesignTokens.typography.h1}>
  Título Principal
</Text>

<Text style={ShotsyDesignTokens.typography.body}>
  Texto do corpo
</Text>
```

### Cores de Dosagem

```typescript
import {
  getDosageColor,
  getDosageColorWithOpacity,
  getProgressRingGradient,
  DOSAGE_COLORS
} from '@/lib/dosageColors';

// Cor sólida para uma dosagem
const color = getDosageColor(2.5);  // Retorna '#A855F7' (roxo)

// Cor com opacidade
const colorWithOpacity = getDosageColorWithOpacity(5, 0.5);  // 50% de opacidade

// Usar em componente
<View style={{
  backgroundColor: getDosageColor(7.5)  // Ciano para 7.5mg
}} />

// Gradiente para Progress Ring
const gradient = getProgressRingGradient();
// Retorna: ['#F97316', '#FBBF24', '#10B981', '#3B82F6', '#06B6D4']
```

### Icon Sizes

```typescript
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { Heart } from 'phosphor-react-native';

<Heart
  size={ShotsyDesignTokens.iconSize.lg}  // 24px
  weight="thin"
/>
```

## 📊 Exemplo Completo: Card com Design Tokens

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { getDosageColor } from '@/lib/dosageColors';
import { useColors } from '@/hooks/useShotsyColors';

export function InjectionCard({ dosage }: { dosage: number }) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[
        styles.dosageBadge,
        { backgroundColor: getDosageColor(dosage) }
      ]}>
        <Text style={styles.dosageText}>{dosage}mg</Text>
      </View>

      <Text style={[
        ShotsyDesignTokens.typography.h3,
        { color: colors.text }
      ]}>
        Injeção Concluída
      </Text>

      <Text style={[
        ShotsyDesignTokens.typography.body,
        { color: colors.textSecondary }
      ]}>
        Dosagem registrada com sucesso
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: ShotsyDesignTokens.spacing.lg,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    ...ShotsyDesignTokens.shadows.card,
    gap: ShotsyDesignTokens.spacing.sm,
  },
  dosageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: ShotsyDesignTokens.spacing.md,
    paddingVertical: ShotsyDesignTokens.spacing.xs,
    borderRadius: ShotsyDesignTokens.borderRadius.full,
  },
  dosageText: {
    ...ShotsyDesignTokens.typography.caption,
    color: '#FFFFFF',
  },
});
```

## 🎯 Próximos Passos

Na **Fase 2**, iremos:
1. Migrar para Victory Native para gráficos avançados
2. Criar componentes de gráficos usando estas cores
3. Implementar Progress Ring com gradiente
4. Refatorar telas existentes para usar estes tokens

## ✅ Validação

Os Design Tokens foram criados seguindo:
- ✅ Padrões do Shotsy
- ✅ TypeScript com tipos seguros
- ✅ Compatibilidade com sistema de temas existente
- ✅ Estrutura escalável e manutenível

---

**Criado em:** Fase 1 - Sistema de Design
**Versão:** 1.0.0
