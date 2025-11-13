// components/dashboard/QuickActionsCard.tsx
// Card de Quick Actions no dashboard com deep-links

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Syringe, Scales, CurrencyCircleDollar, Pause, Wine } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { useFeatureFlag } from '@/lib/feature-flags';
import { ScalePress } from '@/components/animations';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  featureFlag?: 'FF_FINANCE_MVP' | 'FF_PAUSES_ALCOHOL';
}

export function QuickActionsCard() {
  const colors = useColors();
  const router = useRouter();
  const isFinanceEnabled = useFeatureFlag('FF_FINANCE_MVP');
  const isPausesAlcoholEnabled = useFeatureFlag('FF_PAUSES_ALCOHOL');

  // Definir ações com feature flags
  const allActions: QuickAction[] = [
    {
      id: 'add-dose',
      label: 'Registrar Dose',
      icon: <Syringe size={24} color={colors.primary} weight="regular" />,
      route: '/(tabs)/add-application',
    },
    {
      id: 'add-weight',
      label: 'Registrar Peso',
      icon: <Scales size={24} color={colors.primary} weight="regular" />,
      route: '/(tabs)/add-weight',
    },
    {
      id: 'add-purchase',
      label: 'Adicionar Compra',
      icon: <CurrencyCircleDollar size={24} color={colors.primary} weight="regular" />,
      route: '/(tabs)/finance/add-purchase',
      featureFlag: 'FF_FINANCE_MVP',
    },
    {
      id: 'pause-treatment',
      label: 'Pausar Tratamento',
      icon: <Pause size={24} color={colors.primary} weight="regular" />,
      route: '/(tabs)/treatment/pause',
      featureFlag: 'FF_PAUSES_ALCOHOL',
    },
    {
      id: 'mark-alcohol',
      label: 'Marcar Álcool',
      icon: <Wine size={24} color={colors.primary} weight="regular" />,
      route: '/(tabs)/habits/alcohol',
      featureFlag: 'FF_PAUSES_ALCOHOL',
    },
  ];

  // Filtrar ações baseado em feature flags
  const visibleActions = useMemo(() => {
    return allActions.filter((action) => {
      if (!action.featureFlag) return true;
      if (action.featureFlag === 'FF_FINANCE_MVP') return isFinanceEnabled;
      if (action.featureFlag === 'FF_PAUSES_ALCOHOL') return isPausesAlcoholEnabled;
      return false;
    });
  }, [isFinanceEnabled, isPausesAlcoholEnabled]);

  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        ShotsyDesignTokens.shadows.card,
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Ações Rápidas</Text>

      <View style={styles.actionsGrid}>
        {visibleActions.map((action) => (
          <ScalePress
            key={action.id}
            onPress={() => handleActionPress(action.route)}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.backgroundSecondary,
              },
            ]}
            hapticType="light"
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={`Navegar para ${action.label}`}
          >
            <View style={styles.iconContainer}>{action.icon}</View>
            <Text
              style={[styles.actionLabel, { color: colors.text }]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {action.label}
            </Text>
          </ScalePress>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
  },
  title: {
    ...ShotsyDesignTokens.typography.h4,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ShotsyDesignTokens.spacing.md,
  },
  actionButton: {
    width: '48%',
    minWidth: 140,
    aspectRatio: 1,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  iconContainer: {
    marginBottom: 4,
  },
  actionLabel: {
    ...ShotsyDesignTokens.typography.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
});

