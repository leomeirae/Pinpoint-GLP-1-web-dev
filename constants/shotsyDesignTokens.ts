/**
 * Shotsy Design Tokens
 * Sistema de design completo para alinhamento visual com Shotsy
 *
 * Estes tokens definem os valores de design base para:
 * - Espaçamento (spacing)
 * - Raios de borda (borderRadius)
 * - Sombras (shadows)
 * - Tipografia (typography)
 */

import { TextStyle, ViewStyle } from 'react-native';

// ============================================
// SPACING
// ============================================
export const spacing = {
  /** 4px - Espaçamento micro */
  xs: 4,
  /** 8px - Espaçamento pequeno */
  sm: 8,
  /** 12px - Espaçamento médio */
  md: 12,
  /** 16px - Espaçamento padrão */
  lg: 16,
  /** 20px - Espaçamento grande */
  xl: 20,
  /** 24px - Espaçamento extra grande */
  xxl: 24,
  /** 32px - Espaçamento jumbo */
  xxxl: 32,
  /** 40px - Espaçamento massivo */
  xxxxl: 40,
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const borderRadius = {
  /** 4px - Cantos minimos */
  xs: 4,
  /** 8px - Cantos pequenos */
  sm: 8,
  /** 12px - Cantos médios */
  md: 12,
  /** 16px - Cantos padrão (cards) */
  lg: 16,
  /** 20px - Cantos grandes */
  xl: 20,
  /** 24px - Cantos extra grandes */
  xxl: 24,
  /** 999px - Cantos completamente arredondados (pills) */
  full: 999,
} as const;

// ============================================
// SHADOWS (iOS-style)
// ============================================
export const shadows = {
  /** Nenhuma sombra */
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  /** Sombra sutil para cards */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  /** Sombra média para elementos elevados */
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  /** Sombra forte para modais e overlays */
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  /** Sombra muito sutil para elementos sutis */
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
  /** Título principal (28px/700) */
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.5,
  } as TextStyle,

  /** Título secundário (24px/700) */
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.4,
  } as TextStyle,

  /** Título terciário (20px/700) */
  h3: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
  } as TextStyle,

  /** Título pequeno (18px/600) */
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.2,
  } as TextStyle,

  /** Título micro (16px/600) */
  h5: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  /** Corpo de texto grande (17px/400) */
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  /** Corpo de texto padrão (16px/400) */
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  /** Corpo de texto pequeno (14px/400) */
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  /** Texto de legenda (12px/500) */
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.1,
  } as TextStyle,

  /** Texto muito pequeno (10px/500) */
  tiny: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.2,
  } as TextStyle,

  /** Texto de botão (16px/600) */
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.1,
  } as TextStyle,

  /** Texto de botão pequeno (14px/600) */
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  /** Texto de label (14px/500) */
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  /** Texto monoespaçado para números (24px/700) */
  number: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    fontFamily: 'System', // Usar fonte monoespaçada se disponível
  } as TextStyle,

  /** Texto grande para números (32px/700) */
  numberLarge: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    fontFamily: 'System',
  } as TextStyle,
} as const;

// ============================================
// OPACITY
// ============================================
export const opacity = {
  /** Totalmente transparente */
  transparent: 0,
  /** Muito sutil (5%) */
  subtle: 0.05,
  /** Sutil (10%) */
  light: 0.1,
  /** Moderado (20%) */
  moderate: 0.2,
  /** Médio (40%) */
  medium: 0.4,
  /** Semi-transparente (60%) */
  semitransparent: 0.6,
  /** Quase opaco (80%) */
  opaque: 0.8,
  /** Completamente opaco */
  solid: 1,
} as const;

// ============================================
// ANIMATION DURATIONS
// ============================================
export const duration = {
  /** 150ms - Transições rápidas */
  fast: 150,
  /** 250ms - Transições normais */
  normal: 250,
  /** 350ms - Transições suaves */
  smooth: 350,
  /** 500ms - Transições lentas */
  slow: 500,
} as const;

// ============================================
// Z-INDEX
// ============================================
export const zIndex = {
  /** Elementos base */
  base: 0,
  /** Elementos elevados */
  elevated: 10,
  /** Dropdowns e popovers */
  dropdown: 100,
  /** Modais */
  modal: 1000,
  /** Toasts e notificações */
  toast: 2000,
  /** Tooltips */
  tooltip: 3000,
} as const;

// ============================================
// ICON SIZES
// ============================================
export const iconSize = {
  /** 12px - Ícone micro */
  xs: 12,
  /** 16px - Ícone pequeno */
  sm: 16,
  /** 20px - Ícone médio */
  md: 20,
  /** 24px - Ícone padrão */
  lg: 24,
  /** 28px - Ícone grande */
  xl: 28,
  /** 32px - Ícone extra grande */
  xxl: 32,
  /** 40px - Ícone jumbo */
  xxxl: 40,
  /** 48px - Ícone massivo */
  xxxxl: 48,
} as const;

// ============================================
// EXPORTAÇÃO CONSOLIDADA
// ============================================
export const ShotsyDesignTokens = {
  spacing,
  borderRadius,
  shadows,
  typography,
  opacity,
  duration,
  zIndex,
  iconSize,
} as const;

export default ShotsyDesignTokens;
