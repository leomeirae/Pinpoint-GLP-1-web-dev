// components/onboarding/OnboardingButton.tsx
// Botão estilizado para onboarding

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'large' | 'medium' | 'small';

interface OnboardingButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function OnboardingButton({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: OnboardingButtonProps) {
  const colors = useColors();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: ShotsyDesignTokens.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: ShotsyDesignTokens.spacing.sm,
      minHeight: 56, // Touch area mínimo 44px, usando 56px para conforto
    };

    // Size
    if (size === 'small') {
      baseStyle.paddingVertical = ShotsyDesignTokens.spacing.sm;
      baseStyle.paddingHorizontal = ShotsyDesignTokens.spacing.lg;
      baseStyle.minHeight = 44;
    } else if (size === 'medium') {
      baseStyle.paddingVertical = ShotsyDesignTokens.spacing.md;
      baseStyle.paddingHorizontal = ShotsyDesignTokens.spacing.xl;
      baseStyle.minHeight = 48;
    } else {
      baseStyle.paddingVertical = ShotsyDesignTokens.spacing.lg;
      baseStyle.paddingHorizontal = ShotsyDesignTokens.spacing.xxl;
    }

    // Variant
    if (variant === 'primary') {
      baseStyle.backgroundColor = disabled ? colors.textMuted : colors.primary;
    } else if (variant === 'secondary') {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = disabled ? colors.border : colors.primary;
    } else {
      // ghost
      baseStyle.backgroundColor = 'transparent';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...ShotsyDesignTokens.typography.button,
      fontWeight: '600',
    };

    // Size
    if (size === 'small') {
      baseStyle.fontSize = 14;
    } else if (size === 'medium') {
      baseStyle.fontSize = 16;
    } else {
      baseStyle.fontSize = 18;
    }

    // Variant
    if (variant === 'primary') {
      baseStyle.color = '#FFFFFF';
    } else if (variant === 'secondary') {
      baseStyle.color = disabled ? colors.textMuted : colors.primary;
    } else {
      baseStyle.color = disabled ? colors.textMuted : colors.text;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : colors.primary}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

