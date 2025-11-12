import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { router } from 'expo-router';
import { Syringe, Scale, ShoppingCartSimple } from 'phosphor-react-native';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

export function QuickActions() {
  const colors = useColors();

  const actions = [
    {
      label: '+ Dose',
      icon: <Syringe size={24} color={colors.primary} />,
      onPress: () => router.push('/(tabs)/add-application'),
    },
    {
      label: '+ Peso',
      icon: <Scale size={24} color={colors.primary} />,
      onPress: () => router.push('/(tabs)/add-weight'),
    },
    {
      label: '+ Compra',
      icon: <ShoppingCartSimple size={24} color={colors.primary} />,
      onPress: () => router.push('/(tabs)/add-purchase'),
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, { backgroundColor: colors.card }]}
          onPress={action.onPress}
        >
          {action.icon}
          <Text style={[styles.label, { color: colors.primary }]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: ShotsyDesignTokens.spacing.md,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    ...ShotsyDesignTokens.shadows.subtle,
    gap: 8,
  },
  label: {
    ...ShotsyDesignTokens.typography.button,
    fontWeight: '600',
  },
});
