import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useApplications } from '@/hooks/useApplications';
import { Info, CalendarBlank } from 'phosphor-react-native';
import { calculateEstimatedLevels, getCurrentEstimatedLevel } from '@/lib/pharmacokinetics';

const screenWidth = Dimensions.get('window').width;

type Period = 'week' | 'month' | '90days' | 'all';

interface PeriodTab {
  key: Period;
  label: string;
  days: number;
}

const PERIOD_TABS: PeriodTab[] = [
  { key: 'week', label: 'Semana', days: 7 },
  { key: 'month', label: 'Mês', days: 30 },
  { key: '90days', label: '90 dias', days: 90 },
  { key: 'all', label: 'Tudo', days: 365 },
];

export const EstimatedLevelsChart: React.FC = () => {
  const colors = useShotsyColors();
  const { applications, loading } = useApplications();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');

  // Calculate current level
  const currentLevel = useMemo(() => {
    if (applications.length === 0) return 0;

    const medApplications = applications.map(app => ({
      dose: app.dosage,
      date: app.date,
    }));

    return getCurrentEstimatedLevel(medApplications);
  }, [applications]);

  // Calculate chart data based on selected period
  const chartData = useMemo(() => {
    if (applications.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }]
      };
    }

    const periodConfig = PERIOD_TABS.find(p => p.key === selectedPeriod)!;
    const now = new Date();

    // Convert applications to pharmacokinetics format
    const medApplications = applications.map(app => ({
      dose: app.dosage,
      date: app.date,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Find first application date
    const firstApplicationDate = medApplications[0].date;
    const lastApplicationDate = medApplications[medApplications.length - 1].date;

    // Set smart date range:
    // For users with few/recent applications, show from first application + projection forward
    // For users with long history, show selected period
    let startDate: Date;
    let endDate: Date;

    if (selectedPeriod === 'week') {
      // Start from first application or 7 days ago (whichever is more recent)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = firstApplicationDate < sevenDaysAgo ? sevenDaysAgo : firstApplicationDate;
      
      // End at now + 7 days (to show decay projection)
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
      // 'all' - show everything from first to last + projection
      startDate = firstApplicationDate;
      endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    // Calculate interval hours to get ~30 data points max
    const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const intervalHours = Math.max(1, Math.floor(totalHours / 30));

    // Get estimated levels
    const levels = calculateEstimatedLevels(
      medApplications,
      startDate,
      now,
      intervalHours
    );

    if (levels.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }]
      };
    }

    // Limit to max 30 points for performance
    const step = Math.max(1, Math.floor(levels.length / 30));
    const sampledLevels = levels.filter((_, index) => index % step === 0);

    // Ensure we always include the last point (current)
    if (sampledLevels.length > 0 && sampledLevels[sampledLevels.length - 1] !== levels[levels.length - 1]) {
      sampledLevels.push(levels[levels.length - 1]);
    }

    // Format labels based on period
    const labels = sampledLevels.map((level, index) => {
      const date = level.date;
      const isToday = date.toDateString() === now.toDateString();
      const isFuture = date > now;

      if (selectedPeriod === 'week') {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dayLabel = days[date.getDay()];
        
        // Mark today and future projection
        if (isToday) return `● ${dayLabel}`;
        if (isFuture) return `${dayLabel}*`;
        return dayLabel;
      } else if (selectedPeriod === 'month') {
        const dateLabel = `${date.getDate()}/${date.getMonth() + 1}`;
        if (isToday) return `● ${dateLabel}`;
        if (isFuture) return `${dateLabel}*`;
        return dateLabel;
      } else if (selectedPeriod === '90days') {
        const dateLabel = `${date.getDate()}/${date.getMonth() + 1}`;
        if (isToday) return `● ${dateLabel}`;
        if (isFuture) return `${dateLabel}*`;
        return dateLabel;
      } else {
        // 'all' - show months
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthLabel = months[date.getMonth()];
        if (isFuture) return `${monthLabel}*`;
        return monthLabel;
      }
    });

    const data = sampledLevels.map(level => level.level);

    return {
      labels,
      datasets: [{ data }]
    };
  }, [applications, selectedPeriod]);

  // Empty state
  if (applications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Níveis Estimados de Medicação
          </Text>
          <Info size={20} color={colors.textSecondary} weight="regular" />
        </View>
        <View style={styles.emptyState}>
          <CalendarBlank size={48} color={colors.textSecondary} weight="light" />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Adicione injeções para ver o gráfico
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Níveis Estimados de Medicação
        </Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.jumpButton}
            onPress={() => {
              // TODO: Implement scroll to today functionality
              console.log('Jump to today');
            }}
          >
            <CalendarBlank size={18} color={colors.primary} weight="regular" />
            <Text style={[styles.jumpButtonText, { color: colors.primary }]}>
              Hoje
            </Text>
          </Pressable>
          <Info size={20} color={colors.textSecondary} weight="regular" style={styles.infoIcon} />
        </View>
      </View>

      {/* Current Level Card */}
      <View style={[styles.currentLevelCard, { backgroundColor: colors.background }]}>
        <Text style={[styles.currentLevelLabel, { color: colors.textSecondary }]}>
          Nível Atual Estimado
        </Text>
        <Text style={[styles.currentLevelValue, { color: colors.primary }]}>
          {currentLevel.toFixed(2)} mg
        </Text>
      </View>

      {/* Period Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {PERIOD_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setSelectedPeriod(tab.key)}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedPeriod === tab.key
                  ? colors.primary
                  : colors.cardSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedPeriod === tab.key
                    ? colors.isDark ? colors.text : '#FFFFFF'
                    : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 64} // container padding
          height={220}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 2,
            color: (opacity = 1) => {
              // Convert hex to rgba for opacity support
              const hex = colors.primary.replace('#', '');
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            },
            labelColor: (opacity = 1) => colors.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: colors.primary,
            },
            propsForBackgroundLines: {
              strokeDasharray: '', // solid lines
              stroke: colors.border,
              strokeWidth: 1,
            },
          }}
          bezier // smooth curve for exponential decay visualization
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          fromZero={false}
        />
        
        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            ● Hoje  |  * Projeção (declínio estimado)
          </Text>
          <Text style={[styles.legendSubtext, { color: colors.textSecondary }]}>
            Baseado em meia-vida de ~5 dias
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    marginLeft: 4,
  },
  currentLevelCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  currentLevelLabel: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  currentLevelValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    // backgroundColor will be applied inline based on theme
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  jumpButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 15,
    marginTop: 12,
    fontWeight: '500',
  },
  legendContainer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  legendSubtext: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.7,
  },
});
