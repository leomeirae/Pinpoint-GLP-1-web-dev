import { useTheme } from '@/lib/theme-context';
import { ACCENT_COLORS } from '@/constants/ShotsyThemes';

export function useColors() {
  const { effectiveMode, colors } = useTheme();
  const isDark = effectiveMode === 'dark';

  return {
    // Backgrounds
    background: isDark ? colors.backgroundDark : colors.backgroundLight,
    backgroundSecondary: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    card: isDark ? colors.cardDark : colors.cardLight,
    cardSecondary: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    backgroundLight: colors.backgroundLight,
    backgroundDark: colors.backgroundDark,
    cardLight: colors.cardLight,
    cardDark: colors.cardDark,

    // Text
    text: isDark ? colors.textDark : colors.textLight,
    textSecondary: isDark ? colors.textSecondaryDark : colors.textSecondaryLight,
    textMuted: isDark ? colors.textMutedDark : colors.textMutedLight,
    textLight: colors.textLight,
    textDark: colors.textDark,
    textSecondaryLight: colors.textSecondaryLight,
    textSecondaryDark: colors.textSecondaryDark,
    textMutedLight: colors.textMutedLight,
    textMutedDark: colors.textMutedDark,

    // Borders
    border: isDark ? colors.borderDark : colors.borderLight,
    borderLight: colors.borderLight,
    borderDark: colors.borderDark,

    // Status
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    // Primary
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,

    // Accent colors
    accentPurple: ACCENT_COLORS.purple,
    accentBlue: ACCENT_COLORS.blue,
    accentGreen: '#10B981',
    accentOrange: ACCENT_COLORS.orange,
    accentPink: ACCENT_COLORS.pink,
    accentYellow: ACCENT_COLORS.yellow,
    accentRed: '#EF4444',

    // Mode
    isDark,
  };
}

// Backward compatibility alias
export const useShotsyColors = useColors;
