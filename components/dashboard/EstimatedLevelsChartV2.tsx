/**
 * EstimatedLevelsChartV2 - Gráfico de Níveis Estimados (Shotsy-style)
 *
 * Características Shotsy:
 * - Gráfico de área com gradiente azul preenchido
 * - Linha tracejada para previsões futuras
 * - Tabs para períodos (Week, Month, 90 days, All time)
 * - Botão "Jump to Today"
 * - Grid lines discretas
 * - Animações suaves
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryLine } from 'victory-native';
import { LinearGradient, Defs, Stop } from 'react-native-svg';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useApplications } from '@/hooks/useApplications';
import { Info, CalendarBlank } from 'phosphor-react-native';
import { calculateEstimatedLevels, getCurrentEstimatedLevel } from '@/lib/pharmacokinetics';
import { getEstimatedLevelsGradient } from '@/lib/dosageColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EstimatedLevelsChartV2');
const screenWidth = Dimensions.get('window').width;

type Period = 'week' | 'month' | '90days' | 'all';

interface PeriodTab {
  key: Period;
  label: string;
  days: number;
}

const PERIOD_TABS: PeriodTab[] = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: '90days', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: 365 },
];

interface DataPoint {
  x: number;
  y: number;
  date: Date;
  isFuture: boolean;
}

export const EstimatedLevelsChartV2: React.FC = () => {
  const colors = useShotsyColors();
  const { applications, loading } = useApplications();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const gradient = getEstimatedLevelsGradient();

  // Calculate current level
  const currentLevel = useMemo(() => {
    if (applications.length === 0) return 0;

    const medApplications = applications.map((app) => ({
      dose: app.dosage,
      date: app.date,
    }));

    return getCurrentEstimatedLevel(medApplications);
  }, [applications]);

  // Calculate chart data based on selected period
  const { chartData, maxY, todayIndex } = useMemo(() => {
    if (applications.length === 0) {
      return {
        chartData: [],
        maxY: 10,
        todayIndex: 0,
      };
    }

    const periodConfig = PERIOD_TABS.find((p) => p.key === selectedPeriod)!;
    const now = new Date();

    // Convert applications to pharmacokinetics format
    const medApplications = applications
      .map((app) => ({
        dose: app.dosage,
        date: app.date,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const firstApplicationDate = medApplications[0].date;

    // Set date range
    let startDate: Date;
    let endDate: Date;

    if (selectedPeriod === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = firstApplicationDate < sevenDaysAgo ? sevenDaysAgo : firstApplicationDate;
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (selectedPeriod === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = firstApplicationDate < thirtyDaysAgo ? thirtyDaysAgo : firstApplicationDate;
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (selectedPeriod === '90days') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate = firstApplicationDate < ninetyDaysAgo ? ninetyDaysAgo : firstApplicationDate;
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = firstApplicationDate;
      endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    // Calculate interval hours to get ~40 data points
    const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const intervalHours = Math.max(1, Math.floor(totalHours / 40));

    // Get estimated levels
    const levels = calculateEstimatedLevels(medApplications, startDate, now, intervalHours);

    if (levels.length === 0) {
      return {
        chartData: [],
        maxY: 10,
        todayIndex: 0,
      };
    }

    // Convert to Victory data format
    let todayIdx = 0;
    const data: DataPoint[] = levels.map((level, index) => {
      const isFuture = level.date > now;
      if (level.date.toDateString() === now.toDateString()) {
        todayIdx = index;
      }

      return {
        x: index,
        y: level.level,
        date: level.date,
        isFuture,
      };
    });

    // Calculate max Y for axis scaling
    const maxLevel = Math.max(...data.map((d) => d.y));
    const maxYValue = Math.ceil(maxLevel * 1.2); // 20% padding

    return {
      chartData: data,
      maxY: maxYValue,
      todayIndex: todayIdx,
    };
  }, [applications, selectedPeriod]);

  // Separate past and future data for different line styles
  const pastData = chartData.filter((d) => !d.isFuture);
  const futureData = chartData.filter((d, i) => d.isFuture || i === todayIndex);

  // Empty state
  if (applications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Estimated Levels</Text>
          <Info size={20} color={colors.textSecondary} weight="thin" />
        </View>
        <View style={styles.emptyState}>
          <CalendarBlank size={48} color={colors.textSecondary} weight="thin" />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
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
        <View style={styles.headerRight}>
          <Pressable
            style={styles.jumpButton}
            onPress={() => {
              logger.debug('Jump to today');
              // TODO: Implement scroll to today
            }}
          >
            <CalendarBlank size={16} color={colors.primary} weight="thin" />
            <Text style={[styles.jumpButtonText, { color: colors.primary }]}>Today</Text>
          </Pressable>
          <Info size={20} color={colors.textSecondary} weight="thin" />
        </View>
      </View>

      {/* Current Level Card */}
      <View style={[styles.currentLevelCard, { backgroundColor: colors.background }]}>
        <Text style={[styles.currentLevelLabel, { color: colors.textSecondary }]}>
          Current Estimated Level
        </Text>
        <Text style={[styles.currentLevelValue, { color: colors.primary }]}>
          {currentLevel.toFixed(2)} <Text style={styles.unitText}>mg</Text>
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
            onPress={() => setSelectedPeriod(tab.key)}
            style={[
              styles.tab,
              {
                backgroundColor: selectedPeriod === tab.key ? colors.primary : 'transparent',
                borderColor: selectedPeriod === tab.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: selectedPeriod === tab.key ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: selectedPeriod === tab.key ? '600' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Chart */}
      {chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <VictoryChart
            width={screenWidth - 64}
            height={240}
            padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
          >
            {/* Gradient Definition */}
            <Defs>
              <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={gradient.start} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={gradient.end} stopOpacity="0.05" />
              </LinearGradient>
            </Defs>

            {/* Grid lines */}
            <VictoryAxis
              dependentAxis
              style={{
                grid: { stroke: colors.border, strokeWidth: 1, strokeOpacity: 0.3 },
                axis: { stroke: 'transparent' },
                tickLabels: {
                  fill: colors.textSecondary,
                  fontSize: 10,
                  fontWeight: '400',
                },
              }}
              tickCount={5}
            />

            <VictoryAxis
              style={{
                grid: { stroke: 'transparent' },
                axis: { stroke: colors.border, strokeWidth: 1 },
                tickLabels: {
                  fill: colors.textSecondary,
                  fontSize: 10,
                  fontWeight: '400',
                },
              }}
              tickFormat={() => ''}
            />

            {/* Area chart for past data */}
            <VictoryArea
              data={pastData}
              style={{
                data: {
                  fill: 'url(#areaGradient)',
                  stroke: gradient.start,
                  strokeWidth: 2.5,
                },
              }}
              interpolation="natural"
            />

            {/* Dashed line for future projection */}
            {futureData.length > 1 && (
              <VictoryLine
                data={futureData}
                style={{
                  data: {
                    stroke: gradient.start,
                    strokeWidth: 2.5,
                    strokeDasharray: '5,5',
                    strokeOpacity: 0.6,
                  },
                }}
                interpolation="natural"
              />
            )}
          </VictoryChart>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={[styles.legendLine, { backgroundColor: gradient.start }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Actual levels
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.legendLine,
                  styles.legendLineDashed,
                  { backgroundColor: gradient.start, opacity: 0.6 },
                ]}
              />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Projected decay
              </Text>
            </View>
          </View>

          <Text style={[styles.footnote, { color: colors.textSecondary }]}>
            Based on ~5 day half-life
          </Text>
        </View>
      ) : null}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.md,
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: ShotsyDesignTokens.spacing.sm,
    paddingVertical: 4,
  },
  jumpButtonText: {
    ...ShotsyDesignTokens.typography.caption,
    fontWeight: '600',
  },
  currentLevelCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    padding: ShotsyDesignTokens.spacing.lg,
    marginBottom: ShotsyDesignTokens.spacing.lg,
    alignItems: 'center',
  },
  currentLevelLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 4,
  },
  currentLevelValue: {
    ...ShotsyDesignTokens.typography.numberLarge,
  },
  unitText: {
    fontSize: 20,
    fontWeight: '400',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.sm,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  tab: {
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingVertical: ShotsyDesignTokens.spacing.sm,
    borderRadius: ShotsyDesignTokens.borderRadius.full,
    borderWidth: 1,
  },
  tabText: {
    ...ShotsyDesignTokens.typography.caption,
  },
  chartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: ShotsyDesignTokens.spacing.xl,
    marginTop: ShotsyDesignTokens.spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
  },
  legendLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  legendLineDashed: {
    width: 20,
  },
  legendText: {
    ...ShotsyDesignTokens.typography.tiny,
  },
  footnote: {
    ...ShotsyDesignTokens.typography.tiny,
    textAlign: 'center',
    marginTop: ShotsyDesignTokens.spacing.xs,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    ...ShotsyDesignTokens.typography.body,
    marginTop: ShotsyDesignTokens.spacing.md,
    textAlign: 'center',
  },
});
