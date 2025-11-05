# Dark Mode Color Guide

## Overview
This guide provides best practices for using colors in the Mounjaro Tracker app to ensure proper dark mode support.

## Quick Start

### 1. Always Use the Theme Hook
```typescript
import { useShotsyColors } from '@/hooks/useShotsyColors';

function MyComponent() {
  const colors = useShotsyColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

### 2. Never Use Hardcoded Colors
❌ **DON'T DO THIS:**
```typescript
<View style={{ backgroundColor: '#FFFFFF' }}>
  <Text style={{ color: '#000000' }}>Text</Text>
</View>
```

✅ **DO THIS:**
```typescript
<View style={{ backgroundColor: colors.card }}>
  <Text style={{ color: colors.text }}>Text</Text>
</View>
```

## Available Colors

### Background Colors
```typescript
colors.background       // Main screen background
colors.card            // Card backgrounds
colors.cardSecondary   // Secondary card sections (with transparency)
```

### Text Colors
```typescript
colors.text            // Primary text (headings, important content)
colors.textSecondary   // Secondary text (labels, metadata)
colors.textMuted       // Muted text (placeholders, disabled)
```

### Border Colors
```typescript
colors.border          // All borders and dividers
```

### Status Colors
```typescript
colors.success         // Success states, positive trends (#10B981)
colors.warning         // Warning states, caution (#F59E0B)
colors.error           // Error states, negative trends (#EF4444)
colors.info            // Info states, neutral highlights (#0891B2)
```

### Primary Colors
```typescript
colors.primary         // Primary accent color
colors.primaryDark     // Darker variant of primary
colors.primaryLight    // Lighter variant of primary
```

### Theme State
```typescript
colors.isDark          // Boolean: true if dark mode is active
```

## Common Patterns

### 1. Cards with Shadows
```typescript
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',      // Shadow is always black
    shadowOpacity: 0.1,       // Lower opacity for subtle effect
    shadowRadius: 4,
    elevation: 3,
  },
});

<View style={[styles.card, { backgroundColor: colors.card }]}>
  {/* Content */}
</View>
```

### 2. Borders and Dividers
```typescript
// Solid border
<View style={[styles.divider, { borderColor: colors.border }]} />

// Semi-transparent border (20% opacity)
<View style={[styles.divider, { borderColor: `${colors.border}33` }]} />
```

### 3. Chart Colors
```typescript
const chartConfig = {
  backgroundColor: colors.card,
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  color: (opacity = 1) => {
    // Convert hex to rgba for opacity support
    const hex = colors.primary.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  labelColor: (opacity = 1) => colors.textSecondary,
  propsForBackgroundLines: {
    stroke: colors.border,
  },
};
```

### 4. Tab Bar / Navigation
```typescript
<Tabs
  screenOptions={{
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.card,
      borderTopColor: colors.border,
    },
  }}
/>
```

### 5. Modal Overlays
```typescript
const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
  },
  modalContent: {
    // Use colors.card for the modal background
  },
});

<View style={styles.modalOverlay}>
  <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
    {/* Modal content */}
  </View>
</View>
```

### 6. Button States
```typescript
// Active button
<Pressable
  style={[
    styles.button,
    {
      backgroundColor: isActive ? colors.primary : colors.cardSecondary,
    },
  ]}
>
  <Text
    style={{
      color: isActive ? '#FFFFFF' : colors.textSecondary,
    }}
  >
    Button Text
  </Text>
</Pressable>
```

## Exceptions: When Hardcoded Colors Are OK

### 1. White Text on Colored Backgrounds
When text sits on a colored background (like buttons), white is always acceptable:
```typescript
<View style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: '#FFFFFF' }}>Always White</Text>
</View>
```

### 2. Semantic Color Coding
For dosage badges or other semantic color coding that should remain consistent:
```typescript
const DOSAGES = [
  { value: 2.5, color: '#6B7280' },  // Gray - Intentional
  { value: 5, color: '#8B5CF6' },    // Purple - Intentional
  { value: 10, color: '#EC4899' },   // Pink - Intentional
];
```

### 3. Shadow Colors
Shadows are always black, just adjust opacity:
```typescript
shadowColor: '#000',
shadowOpacity: 0.1,
```

### 4. Modal Overlays
Semi-transparent black overlays work in both modes:
```typescript
backgroundColor: 'rgba(0, 0, 0, 0.5)',
```

## Testing Checklist

When implementing or reviewing components, verify:

- [ ] All text is readable in both light and dark modes
- [ ] Borders and dividers are visible in both modes
- [ ] Cards have proper contrast with backgrounds
- [ ] Charts use theme colors
- [ ] No hardcoded colors except approved exceptions
- [ ] StatusBar adapts to theme (handled in app/_layout.tsx)
- [ ] Tab bar colors adapt to theme
- [ ] Smooth transitions when toggling theme

## Theme Structure

The app uses two theme systems working together:

1. **ThemeContext** (`lib/theme-context.tsx`)
   - Manages theme mode (light/dark/system)
   - Provides Shotsy theme gradients and accent colors

2. **useShotsyColors** (`hooks/useShotsyColors.ts`)
   - Returns theme-aware colors based on current mode
   - Primary hook for accessing colors in components

## Accessing Theme Information

```typescript
import { useTheme } from '@/lib/theme-context';
import { useShotsyColors } from '@/hooks/useShotsyColors';

function MyComponent() {
  const { effectiveMode, themeGradient, currentAccent } = useTheme();
  const colors = useShotsyColors();

  console.log('Current mode:', effectiveMode); // 'light' | 'dark'
  console.log('Is dark:', colors.isDark);      // boolean
}
```

## WCAG Contrast Guidelines

Ensure proper contrast ratios:
- **Normal text (< 18pt):** 4.5:1 minimum
- **Large text (≥ 18pt):** 3:1 minimum
- **UI components:** 3:1 minimum

The theme colors are designed to meet these requirements. When creating custom color combinations, verify contrast using tools like WebAIM Contrast Checker.

## Migration Guide

If you find hardcoded colors in existing code:

1. Import `useShotsyColors`:
   ```typescript
   import { useShotsyColors } from '@/hooks/useShotsyColors';
   ```

2. Add hook to component:
   ```typescript
   const colors = useShotsyColors();
   ```

3. Replace hardcoded colors:
   - `#FFFFFF` → `colors.background` or `colors.card`
   - `#000000` → `colors.text`
   - `#64748B` → `colors.textSecondary`
   - `#10B981` → `colors.success`
   - `#EF4444` → `colors.error`
   - `#F59E0B` → `colors.warning`
   - `#E5E7EB` → `colors.border`

4. Apply inline styles:
   ```typescript
   style={[styles.container, { backgroundColor: colors.card }]}
   ```

## Additional Resources

- Theme implementation: `/lib/theme-context.tsx`
- Color hook: `/hooks/useShotsyColors.ts`
- Theme constants: `/constants/ShotsyThemes.ts`
- Example components:
  - `/components/dashboard/EstimatedLevelsChart.tsx`
  - `/components/results/BMIChart.tsx`
  - `/components/results/WeightChart.tsx`
