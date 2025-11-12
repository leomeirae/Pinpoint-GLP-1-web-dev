import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { CheckCircle, XCircle, TrendUp, TrendDown } from 'phosphor-react-native';

interface WeeklySummaryCardProps {
  shotStatus: 'done' | 'pending';
  weightChange: number | null;
  weeklySpending: number;
}

export function WeeklySummaryCard({ shotStatus, weightChange, weeklySpending }: WeeklySummaryCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Sua Semana</Text>
      <View style={styles.metricsContainer}>
        {/* Status da Aplicação */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Aplicação</Text>
          {shotStatus === 'done' ? (
            <View style={styles.metricValueContainer}>
              <CheckCircle size={20} color={colors.success} weight="bold" />
              <Text style={[styles.metricValue, { color: colors.success }]}>OK</Text>
            </View>
          ) : (
            <View style={styles.metricValueContainer}>
              <XCircle size={20} color={colors.error} weight="bold" />
              <Text style={[styles.metricValue, { color: colors.error }]}>Pendente</Text>
            </View>
          )}
        </View>

        {/* Variação de Peso */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Peso</Text>
          {weightChange !== null ? (
            <View style={styles.metricValueContainer}>
              {weightChange <= 0 ? (
                <TrendDown size={20} color={colors.success} weight="bold" />
              ) : (
                <TrendUp size={20} color={colors.error} weight="bold" />
              )}
              <Text style={[styles.metricValue, { color: weightChange <= 0 ? colors.success : colors.error }]}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </Text>
            </View>
          ) : (
            <Text style={[styles.metricValue, { color: colors.textMuted }]}>--</Text>
          )}
        </View>

        {/* Gastos da Semana */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Gastos</Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            R$ {weeklySpending.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: ShotsyDesignTokens.spacing.lg,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    ...ShotsyDesignTokens.shadows.card,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  title: {
    ...ShotsyDesignTokens.typography.h4,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    ...ShotsyDesignTokens.typography.caption,
    color: '#6B7280', // textSecondary
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    ...ShotsyDesignTokens.typography.h5,
  },
});
