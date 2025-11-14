/**
 * EstimatedLevelChart - Gráfico de Níveis Estimados usando Gifted Charts
 * 
 * Substituição do componente anterior usando Victory Native
 * Otimizado para mobile com labels legíveis e performance
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { Info, CalendarBlank } from 'phosphor-react-native';

interface Props {
  data: Array<{ date: Date; levelMg: number }>;
  range: 'week' | 'month' | '90days' | 'all';
  onRangeChange?: (range: 'week' | 'month' | '90days' | 'all') => void;
}

interface ChartDataPoint {
  value: number;
  label: string;
  dataPointText?: string;
  labelTextStyle?: any;
  dataPointColor?: string;
  dataPointRadius?: number;
}

const PERIOD_TABS = [
  { key: 'week' as const, label: 'Week' },
  { key: 'month' as const, label: 'Month' },
  { key: '90days' as const, label: '90 days' },
  { key: 'all' as const, label: 'All time' },
];

export const EstimatedLevelChart: React.FC<Props> = ({ data, range, onRangeChange }) => {
  const colors = useShotsyColors();

  // Ordenar dados por data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  // Calcular nível atual
  const currentLevel = useMemo(() => {
    if (sortedData.length === 0) return 0;
    return sortedData[sortedData.length - 1].levelMg;
  }, [sortedData]);

  // Processar dados para o gráfico
  const { chartData, maxValue } = useMemo(() => {
    if (sortedData.length === 0) {
      return { chartData: [], maxValue: 10 };
    }

    const now = new Date();
    const todayStr = now.toDateString();

    // Limitar pontos baseado no range para evitar labels sobrepostos
    let step = 1;
    if (range === 'week') {
      step = 1; // Mostrar todos os dias
    } else if (range === 'month') {
      step = Math.ceil(sortedData.length / 7); // Max 7 labels
    } else if (range === '90days') {
      step = Math.ceil(sortedData.length / 7); // Max 7 labels
    } else { // 'all'
      step = Math.ceil(sortedData.length / 7); // Max 7 labels
    }

    const points: ChartDataPoint[] = [];
    
    sortedData.forEach((point, index) => {
      const isToday = point.date.toDateString() === todayStr;
      const shouldShowLabel = index % step === 0 || index === sortedData.length - 1;

      // Formatar label baseado no range
      let label = '';
      if (shouldShowLabel) {
        if (range === 'week') {
          const days = ['Do', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          label = days[point.date.getDay()];
        } else {
          const day = point.date.getDate();
          const month = point.date.getMonth() + 1;
          label = `${day}/${month}`;
        }
      }

      points.push({
        value: point.levelMg,
        label: label,
        dataPointText: isToday ? `${point.levelMg.toFixed(1)}` : undefined,
        labelTextStyle: {
          color: colors.textSecondary,
          fontSize: 10,
          fontWeight: isToday ? '600' : '400',
        },
        dataPointColor: isToday ? colors.primary : undefined,
        dataPointRadius: isToday ? 6 : 4,
      });
    });

    // Calcular max value para o eixo Y
    const maxLevel = Math.max(...sortedData.map(d => d.levelMg));
    const maxY = Math.ceil(maxLevel * 1.2); // 20% padding

    return { chartData: points, maxValue: maxY };
  }, [sortedData, range, colors]);

  // Empty state
  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Estimated Levels</Text>
          <Info size={20} color={colors.textSecondary} weight="thin" />
        </View>
        <View style={styles.emptyState}>
          <CalendarBlank size={48} color={colors.textSecondary} weight="thin" />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add injections to see your medication levels
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Estimated Levels</Text>
        <Info size={20} color={colors.textSecondary} weight="thin" />
      </View>

      {/* Current Level Card */}
      <View style={[styles.currentLevelCard, { backgroundColor: colors.background }]}>
        <Text style={[styles.currentLevelLabel, { color: colors.textSecondary }]}>
          Current Estimated Level
        </Text>
        <Text style={[styles.currentLevelValue, { color: colors.primary }]}>
          {currentLevel.toFixed(2)} <Text style={[styles.unitText, { color: colors.textSecondary }]}>mg</Text>
        </Text>
      </View>

      {/* Period Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {PERIOD_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => onRangeChange?.(tab.key)}
            style={[
              styles.tab,
              {
                backgroundColor: range === tab.key ? colors.primary : 'transparent',
                borderColor: range === tab.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: range === tab.key ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: range === tab.key ? '600' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Chart */}
      {chartData.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              height={220}
              width={Math.max(350, chartData.length * 40)}
              initialSpacing={20}
              spacing={Math.max(30, 280 / chartData.length)}
              color={colors.primary}
              thickness={2.5}
              startFillColor={`${colors.primary}40`}
              endFillColor={`${colors.primary}10`}
              startOpacity={0.4}
              endOpacity={0.1}
              areaChart
              curved
              yAxisColor={colors.border}
              yAxisThickness={1}
              yAxisTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
              }}
              yAxisLabelSuffix=" mg"
              xAxisColor={colors.border}
              xAxisThickness={1}
              xAxisLabelTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
              }}
              noOfSections={4}
              maxValue={maxValue}
              rulesColor={`${colors.border}40`}
              rulesType="solid"
              rulesThickness={1}
              hideDataPoints={false}
              dataPointsColor={colors.primary}
              dataPointsRadius={4}
              textColor={colors.text}
              textFontSize={10}
              textShiftY={-8}
              textShiftX={-10}
              hideAxesAndRules={false}
              showVerticalLines={false}
              verticalLinesColor={`${colors.border}20`}
              yAxisOffset={0}
              disableScroll={false}
            />
          </View>
        </ScrollView>
      )}
      
      {/* Legend & Info */}
      <View style={styles.footerContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Nível Estimado
          </Text>
        </View>
        <Text style={[styles.footnote, { color: colors.textSecondary }]}>
          Based on ~5 day half-life
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  title: {
    ...ShotsyDesignTokens.typography.h3,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ShotsyDesignTokens.spacing.xxl,
    gap: ShotsyDesignTokens.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    ...ShotsyDesignTokens.typography.body,
  },
  currentLevelCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    padding: ShotsyDesignTokens.spacing.md,
    marginBottom: ShotsyDesignTokens.spacing.lg,
    alignItems: 'center',
  },
  currentLevelLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 4,
  },
  currentLevelValue: {
    ...ShotsyDesignTokens.typography.h2,
  },
  unitText: {
    ...ShotsyDesignTokens.typography.body,
    fontSize: 16,
  },
  tabsContainer: {
    gap: ShotsyDesignTokens.spacing.sm,
    paddingBottom: ShotsyDesignTokens.spacing.lg,
  },
  tab: {
    paddingHorizontal: ShotsyDesignTokens.spacing.md,
    paddingVertical: ShotsyDesignTokens.spacing.sm,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    borderWidth: 1,
  },
  tabText: {
    ...ShotsyDesignTokens.typography.buttonSmall,
    fontSize: 12,
  },
  chartWrapper: {
    paddingVertical: 10,
  },
  footerContainer: {
    marginTop: ShotsyDesignTokens.spacing.md,
    paddingTop: ShotsyDesignTokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
    gap: ShotsyDesignTokens.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...ShotsyDesignTokens.typography.caption,
    fontSize: 11,
  },
  footnote: {
    ...ShotsyDesignTokens.typography.caption,
    fontSize: 10,
    fontStyle: 'italic',
  },
});

