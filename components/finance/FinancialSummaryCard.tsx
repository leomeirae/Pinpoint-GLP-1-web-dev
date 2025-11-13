// components/finance/FinancialSummaryCard.tsx
// Card de resumo financeiro com métricas principais

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  CurrencyCircleDollar, 
  CalendarBlank, 
  TrendDown, 
  Info 
} from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { formatCurrency } from '@/lib/finance';

interface FinancialSummaryCardProps {
  totalSpentCents: number;
  weeklySpentCents: number | null;
  nextPurchaseDate: Date | null;
  costPerKgCents: number | null;
  hasOptIn: boolean;
  onOptInPress?: () => void;
}

export function FinancialSummaryCard({
  totalSpentCents,
  weeklySpentCents,
  nextPurchaseDate,
  costPerKgCents,
  hasOptIn,
  onOptInPress,
}: FinancialSummaryCardProps) {
  const colors = useColors();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        ShotsyDesignTokens.shadows.card,
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Resumo Financeiro</Text>

      <View style={styles.metricsGrid}>
        {/* Métrica 1: Total Gasto */}
        <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.metricIcon}>
            <CurrencyCircleDollar size={24} color={colors.primary} weight="regular" />
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Total Gasto
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatCurrency(totalSpentCents)}
          </Text>
        </View>

        {/* Métrica 2: Gasto Semanal */}
        <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.metricIcon}>
            <CalendarBlank size={24} color={colors.primary} weight="regular" />
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Por Semana
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {weeklySpentCents !== null ? formatCurrency(weeklySpentCents) : '—'}
          </Text>
        </View>

        {/* Métrica 3: Próxima Compra Prevista */}
        {nextPurchaseDate && (
          <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.metricIcon}>
              <CalendarBlank size={24} color={colors.success} weight="regular" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Próxima Compra
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {formatDate(nextPurchaseDate)}
            </Text>
          </View>
        )}

        {/* Métrica 4: R$/kg (apenas se opt-in) */}
        {hasOptIn && costPerKgCents !== null && (
          <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.metricHeader}>
              <View style={styles.metricIcon}>
                <TrendDown size={24} color={colors.warning} weight="regular" />
              </View>
              <TouchableOpacity 
                onPress={onOptInPress}
                accessibilityLabel="Informações sobre custo por kg"
                accessibilityHint="Toque para saber mais sobre esta métrica"
              >
                <Info size={16} color={colors.textMuted} weight="regular" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Custo por Kg
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {formatCurrency(costPerKgCents)}/kg
            </Text>
            <Text style={[styles.metricSubtext, { color: colors.textMuted }]}>
              Indicador econômico
            </Text>
          </View>
        )}

        {/* Se não tem opt-in, mostrar card para ativar */}
        {!hasOptIn && costPerKgCents === null && (
          <TouchableOpacity
            style={[
              styles.metricCard,
              styles.optInCard,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
            ]}
            onPress={onOptInPress}
            accessibilityLabel="Ativar custo por kg"
            accessibilityHint="Toque para ativar o cálculo de custo por kg perdido"
          >
            <View style={styles.metricIcon}>
              <TrendDown size={24} color={colors.textMuted} weight="regular" />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Custo por Kg
            </Text>
            <Text style={[styles.optInText, { color: colors.primary }]}>
              Toque para ativar
            </Text>
          </TouchableOpacity>
        )}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ShotsyDesignTokens.spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ShotsyDesignTokens.spacing.xs,
  },
  metricIcon: {
    marginBottom: ShotsyDesignTokens.spacing.xs,
  },
  metricLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 4,
  },
  metricValue: {
    ...ShotsyDesignTokens.typography.h3,
  },
  metricSubtext: {
    ...ShotsyDesignTokens.typography.tiny,
    marginTop: 2,
  },
  optInCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optInText: {
    ...ShotsyDesignTokens.typography.caption,
    fontWeight: '600',
    marginTop: 4,
  },
});

