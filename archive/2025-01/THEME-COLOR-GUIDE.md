# Theme Color Guide - Mounjaro Tracker

This guide explains how to properly use the theme system to ensure perfect dark mode support across all components.

## Table of Contents
1. [Theme System Overview](#theme-system-overview)
2. [Available Colors](#available-colors)
3. [Usage Examples](#usage-examples)
4. [Common Mistakes](#common-mistakes)
5. [Opacity Handling](#opacity-handling)
6. [Chart Configuration](#chart-configuration)
7. [Testing Guidelines](#testing-guidelines)

---

## Theme System Overview

The app uses a comprehensive theme system with three main components:

- **ThemeContext** (`/lib/theme-context.tsx`) - Manages theme mode (light/dark/system)
- **useShotsyColors** (`/hooks/useShotsyColors.ts`) - Hook that returns theme-aware colors
- **ShotsyThemes** (`/constants/ShotsyThemes.ts`) - Color definitions and theme presets

### Basic Usage

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

---

## Available Colors

### Background Colors
```typescript
colors.background      // Main background (white in light, #1F1F1F in dark)
colors.card            // Card background (slightly lighter/darker than background)
colors.cardSecondary   // Secondary card background with subtle opacity
```

### Text Colors
```typescript
colors.text            // Primary text (#0F0F1E in light, #FFFFFF in dark)
colors.textSecondary   // Secondary text with reduced emphasis
colors.textMuted       // Muted text for hints and less important content
```

### Border Colors
```typescript
colors.border          // Standard border color (#E5E7EB in light, #374151 in dark)
```

### Status Colors (consistent across themes)
```typescript
colors.success         // #10B981 - Success states
colors.warning         // #F59E0B - Warning states
colors.error           // #EF4444 - Error states
colors.info            // #0891B2 - Info states
```

### Primary Colors (consistent across themes)
```typescript
colors.primary         // #0891B2 - Primary brand color
colors.primaryDark     // #0E7490 - Darker variant
colors.primaryLight    // #06B6D4 - Lighter variant
```

### Theme Detection
```typescript
colors.isDark          // boolean - true if dark mode is active
```

---

## Usage Examples

### ✅ CORRECT: Using Theme Colors

```typescript
// Text components
<Text style={{ color: colors.text }}>Primary Text</Text>
<Text style={{ color: colors.textSecondary }}>Secondary Text</Text>
<Text style={{ color: colors.textMuted }}>Muted Text</Text>

// Backgrounds
<View style={{ backgroundColor: colors.background }}>
  <View style={{ backgroundColor: colors.card }}>
    {/* Card content */}
  </View>
</View>

// Borders
<View style={{ borderColor: colors.border, borderWidth: 1 }}>
  {/* Content */}
</View>

// Conditional styling based on theme
<Text style={{
  color: isSelected
    ? (colors.isDark ? colors.text : '#FFFFFF')  // White in light mode, theme text in dark
    : colors.textSecondary
}}>
  Selected Text
</Text>

// Status colors (work in both themes)
<Text style={{ color: colors.success }}>Success!</Text>
<Text style={{ color: colors.error }}>Error!</Text>
```

### ❌ WRONG: Hardcoded Colors

```typescript
// DON'T: Hardcoded colors that don't adapt to theme
<Text style={{ color: '#000000' }}>This won't work in dark mode</Text>
<View style={{ backgroundColor: '#FFFFFF' }}>This will be white in dark mode</View>
<View style={{ borderColor: '#E5E5E5' }}>Border won't adapt</View>

// DON'T: Always white text (won't work with dark primary in dark mode)
<Text style={{ color: '#FFFFFF' }}>Always white - bad for dark mode</Text>
```

---

## Common Mistakes

### 1. Hardcoded White Text on Primary Background

**Problem:**
```typescript
<View style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: '#FFFFFF' }}>Text</Text>  // ❌ Won't work in dark mode
</View>
```

**Solution:**
```typescript
<View style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: colors.isDark ? colors.text : '#FFFFFF' }}>Text</Text>  // ✅
</View>
```

### 2. Hardcoded Border Colors

**Problem:**
```typescript
<View style={{ borderColor: '#E5E5E5' }}>  // ❌ Won't adapt to dark mode
```

**Solution:**
```typescript
<View style={{ borderColor: colors.border }}>  // ✅
```

### 3. Hardcoded Shadow Colors

**Problem:**
```typescript
shadowColor: '#000000',  // ❌ Shadows should be subtle in both modes
shadowOpacity: 0.5,      // Too strong
```

**Solution:**
```typescript
shadowColor: '#000',     // ✅ Black shadow is okay
shadowOpacity: 0.1,      // Lower opacity works for both themes
```

### 4. Wrong Header Background

**Problem:**
```typescript
headerStyle: {
  backgroundColor: colors.backgroundLight,  // ❌ Always light
}
```

**Solution:**
```typescript
headerStyle: {
  backgroundColor: colors.card,  // ✅ Adapts to theme
}
```

---

## Opacity Handling

### Adding Opacity to Theme Colors

Theme colors are hex values. To add opacity:

#### Method 1: Hex Alpha Channel
```typescript
// Add alpha to hex color (00 = 0%, FF = 100%)
backgroundColor: colors.primary + '20'  // 20% opacity
backgroundColor: colors.primary + '80'  // 50% opacity
backgroundColor: colors.primary + 'CC'  // 80% opacity
```

#### Method 2: Convert to RGBA (for charts)
```typescript
const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Usage
color: (opacity = 1) => hexToRgba(colors.primary, opacity)
```

### Predefined Opacity Colors
```typescript
colors.cardSecondary  // Pre-defined with subtle opacity
```

---

## Chart Configuration

Charts need special color handling. Here's the correct pattern:

### ✅ CORRECT Chart Config

```typescript
import { LineChart } from 'react-native-chart-kit';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';

function MyChart() {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const { width } = useWindowDimensions();

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 1,

    // Line color with opacity support
    color: (opacity = 1) => {
      const hex = currentAccent.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },

    // Label color
    labelColor: (opacity = 1) => colors.textSecondary,

    // Dot styling
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: currentAccent,
    },

    // Grid lines
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  return (
    <LineChart
      data={data}
      width={width - 64}
      height={220}
      chartConfig={chartConfig}
      bezier
      withInnerLines
      withShadow={false}
    />
  );
}
```

### Multiple Datasets with Different Colors

```typescript
const datasets = [
  {
    data: actualWeights,
    color: () => currentAccent,  // Primary line
    strokeWidth: 3,
  },
  {
    data: trendLine,
    color: () => colors.textSecondary + '40',  // Subtle trend line
    strokeWidth: 2,
    withDots: false,
  },
  {
    data: goalLine,
    color: () => colors.success,  // Goal line
    strokeWidth: 2,
    strokeDasharray: [5, 5],
  },
];
```

---

## Testing Guidelines

### Manual Testing Checklist

Test every screen in BOTH light and dark modes:

1. **Toggle Theme**
   - Go to Settings
   - Try all three options: Light, Dark, System

2. **Check Critical Elements**
   - [ ] All text is readable (good contrast)
   - [ ] Backgrounds adapt correctly
   - [ ] Borders are visible but subtle
   - [ ] Charts use theme colors
   - [ ] Icons use correct colors
   - [ ] Buttons have readable text
   - [ ] Modal backgrounds are appropriate
   - [ ] Cards stand out from backgrounds
   - [ ] Shadows are subtle in dark mode
   - [ ] Status bar adapts to theme

3. **Screen-Specific Checks**

   **Dashboard:**
   - [ ] Chart colors adapt
   - [ ] Cards are distinguishable
   - [ ] Next shot widget readable

   **Results:**
   - [ ] Weight chart readable
   - [ ] BMI chart colors work
   - [ ] Export button text visible
   - [ ] Metrics cards clear

   **Calendar:**
   - [ ] Event cards visible
   - [ ] Date text readable
   - [ ] Selected dates clear

   **Settings:**
   - [ ] All rows readable
   - [ ] Theme selector shows current mode
   - [ ] Accent color selector works
   - [ ] Profile avatar contrasts

4. **Component States**
   - [ ] Hover states (if applicable)
   - [ ] Pressed states
   - [ ] Disabled states
   - [ ] Selected states
   - [ ] Error states
   - [ ] Loading states

### Automated Validation

Search for hardcoded colors:
```bash
# Find hardcoded hex colors
grep -r "#[0-9A-Fa-f]\{6\}" --include="*.tsx" --include="*.ts" ./components ./app

# Find hardcoded rgba
grep -r "rgba(" --include="*.tsx" --include="*.ts" ./components ./app
```

---

## Quick Reference Card

```typescript
// ALWAYS USE:
colors.background       // Main backgrounds
colors.card             // Card backgrounds
colors.text             // Primary text
colors.textSecondary    // Secondary text
colors.border           // Borders
colors.primary          // Primary actions
colors.success/error    // Status colors

// CONDITIONAL USE (for selected/highlighted states):
colors.isDark ? colors.text : '#FFFFFF'  // Text on primary bg

// NEVER USE:
'#FFFFFF'              // Unless conditional on isDark
'#000000'              // Unless for shadows
'#RGB codes'           // Use theme colors instead
```

---

## StatusBar Configuration

Always sync StatusBar with theme:

```typescript
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/lib/theme-context';

function RootLayout() {
  const { effectiveMode } = useTheme();

  return (
    <>
      <StatusBar style={effectiveMode === 'dark' ? 'light' : 'dark'} />
      {/* Rest of app */}
    </>
  );
}
```

---

## Common Color Patterns

### Selected Button/Chip
```typescript
<Pressable
  style={{
    backgroundColor: isSelected ? colors.primary : colors.cardSecondary,
  }}
>
  <Text style={{
    color: isSelected
      ? (colors.isDark ? colors.text : '#FFFFFF')
      : colors.textSecondary
  }}>
    {label}
  </Text>
</Pressable>
```

### Avatar with Initials
```typescript
<View style={{ backgroundColor: colors.primary }}>
  <Text style={{
    color: colors.isDark ? colors.text : '#FFFFFF'
  }}>
    {initials}
  </Text>
</View>
```

### Switch/Toggle
```typescript
<Switch
  value={isOn}
  trackColor={{
    false: colors.border,
    true: colors.primary + '80',
  }}
  thumbColor={isOn ? colors.primary : colors.background}
/>
```

---

## Need Help?

- Check existing components for examples (e.g., `EstimatedLevelsChart`, `WeightChart`)
- Review `useShotsyColors` hook to see all available colors
- Test in both light and dark modes before committing
- When in doubt, use semantic color names (background, text, border) over specific colors

---

**Last Updated:** Task 2.2 - Dark Mode Polish
**Maintained By:** Development Team
