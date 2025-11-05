import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useWeights } from '@/hooks/useWeights';
import { useProfile } from '@/hooks/useProfile';
import { useApplications } from '@/hooks/useApplications';
import { MetricCard } from '@/components/results/MetricCard';
import { WeightChart } from '@/components/results/WeightChart';
import { BMIChart } from '@/components/results/BMIChart';
import { DetailedStats } from '@/components/results/DetailedStats';
import { PeriodSelector, PeriodFilter } from '@/components/results/PeriodSelector';
import { ExportButton } from '@/components/results/ExportButton';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { ResultsScreenSkeleton } from '@/components/results/ResultsSkeleton';
import { WeightIcon, SparkleIcon } from '@/components/ui/icons';
import { useRouter } from 'expo-router';

export default function ResultsScreen() {
  const colors = useShotsyColors();
  const router = useRouter();
  const { weights, loading: weightsLoading, refetch: refetchWeights } = useWeights();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { applications, loading: applicationsLoading, refetch: refetchApplications } = useApplications();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('30days');
  const [refreshing, setRefreshing] = useState(false);

  const periodFilterMap: Record<PeriodFilter, 'week' | 'month' | '90days' | 'all'> = {
    '7days': 'week',
    '30days': 'month',
    '90days': '90days',
    'all': 'all',
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWeights(), refetchProfile(), refetchApplications()]);
    setRefreshing(false);
  };

  // Transform weights data for charts
  const weightData = useMemo(() => {
    return weights.map(w => ({
      date: w.date,
      weight: w.weight,
    }));
  }, [weights]);

  // Calculate BMI data
  const bmiData = useMemo(() => {
    const height = profile?.height || 1.75; // Default to 1.75m if not set
    return weights.map(w => ({
      date: w.date,
      bmi: w.weight / (height * height),
    }));
  }, [weights, profile?.height]);

  // Calculate metrics
  const startWeight = useMemo(() => {
    return weights.length > 0 ? weights[weights.length - 1].weight : 0;
  }, [weights]);

  const currentWeight = useMemo(() => {
    return weights.length > 0 ? weights[0].weight : 0;
  }, [weights]);

  const targetWeight = profile?.target_weight || 75;
  const height = profile?.height || 1.75;

  const weightChange = currentWeight - startWeight;
  const percentChange = startWeight > 0 ? (weightChange / startWeight) * 100 : 0;

  // Current BMI calculation
  const currentBMI = currentWeight > 0 && height > 0 ? currentWeight / (height * height) : 0;

  // Progress to goal
  const totalToLose = startWeight - targetWeight;
  const lost = startWeight - currentWeight;
  const progressPercent = totalToLose > 0 ? (lost / totalToLose) * 100 : 0;

  // Remaining to goal
  const remainingToGoal = currentWeight - targetWeight;

  // Calculate weeks in treatment
  const weeks = useMemo(() => {
    if (weights.length < 2) return 0;
    const firstDate = weights[weights.length - 1].date;
    const lastDate = weights[0].date;
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks || 1;
  }, [weights]);

  // Average weekly loss
  const avgWeeklyLoss = weeks > 0 ? Math.abs(weightChange) / weeks : 0;

  // Calculate weekly weight changes for min/max
  const weeklyChanges = useMemo(() => {
    if (weights.length < 2) return [];
    const changes = [];
    for (let i = 0; i < weights.length - 1; i++) {
      const current = weights[i];
      const previous = weights[i + 1];
      const timeDiff = Math.abs(current.date.getTime() - previous.date.getTime());
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      const weightDiff = previous.weight - current.weight;
      const weeklyChange = daysDiff > 0 ? (weightDiff / daysDiff) * 7 : 0;
      changes.push({
        value: Math.abs(weeklyChange),
        date: current.date,
      });
    }
    return changes;
  }, [weights]);

  const maxWeeklyLoss = useMemo(() => {
    if (weeklyChanges.length === 0) return 0;
    return Math.max(...weeklyChanges.map(c => c.value));
  }, [weeklyChanges]);

  const maxWeeklyLossDate = useMemo(() => {
    if (weeklyChanges.length === 0) return new Date();
    const max = weeklyChanges.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );
    return max.date;
  }, [weeklyChanges]);

  const minWeeklyLoss = useMemo(() => {
    if (weeklyChanges.length === 0) return 0;
    return Math.min(...weeklyChanges.map(c => c.value));
  }, [weeklyChanges]);

  const minWeeklyLossDate = useMemo(() => {
    if (weeklyChanges.length === 0) return new Date();
    const min = weeklyChanges.reduce((prev, current) =>
      current.value < prev.value ? current : prev
    );
    return min.date;
  }, [weeklyChanges]);

  // Get current dose from profile or latest application
  const currentDose = useMemo(() => {
    if (profile?.current_dose) return profile.current_dose;
    if (applications.length > 0) return applications[0].dosage;
    return 10;
  }, [profile, applications]);

  // Calculate next titration (placeholder logic - can be customized)
  const nextTitration = useMemo(() => {
    const nextDose = currentDose + 2.5;
    return `Em 2 semanas (${nextDose}mg)`;
  }, [currentDose]);

  const loading = weightsLoading || profileLoading || applicationsLoading;

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ResultsScreenSkeleton />
      </View>
    );
  }

  // Empty state
  if (!loading && weights.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
            <WeightIcon size="xl" color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Nenhum dado de peso registrado
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Comece a acompanhar seu progresso registrando seu primeiro peso.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/add-weight')}
          >
            <SparkleIcon size="sm" color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Adicionar Primeiro Peso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Export Button */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Resultados</Text>
        <PremiumGate featureName="export_data">
          <ExportButton
            weights={weights.map(w => ({ date: w.date, weight: w.weight }))}
            applications={applications.map(a => ({
              date: a.date,
              dosage: a.dosage,
              location: a.location || 'N/A'
            }))}
            profile={{
              height: profile?.height,
              target_weight: profile?.target_weight,
              start_weight: profile?.start_weight,
              current_dose: profile?.current_dose,
            }}
          />
        </PremiumGate>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} />
        }
      >
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        <View style={styles.content}>
          {/* Métricas Principais */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricRow}>
              <MetricCard
                title="Mudança Total"
                value={`${weightChange.toFixed(1)} kg`}
                subtitle={`${percentChange.toFixed(1)}%`}
                trend={weightChange < 0 ? "down" : weightChange > 0 ? "up" : undefined}
              />
              <MetricCard
                title="IMC Atual"
                value={currentBMI.toFixed(1)}
                subtitle={currentBMI < 25 ? 'Normal' : currentBMI < 30 ? 'Sobrepeso' : 'Obesidade'}
              />
            </View>
            <View style={styles.metricRow}>
              <MetricCard
                title="Peso Atual"
                value={`${currentWeight.toFixed(1)} kg`}
              />
              <MetricCard
                title="Por Cento"
                value={`${Math.max(0, progressPercent).toFixed(0)}%`}
                subtitle="até a meta"
              />
            </View>
            <View style={styles.metricRow}>
              <MetricCard
                title="Média Semanal"
                value={`${avgWeeklyLoss > 0 ? '-' : ''}${avgWeeklyLoss.toFixed(1)} kg`}
                subtitle="por semana"
                trend={avgWeeklyLoss > 0 ? "down" : undefined}
              />
              <MetricCard
                title="Para a Meta"
                value={`${Math.max(0, remainingToGoal).toFixed(1)} kg`}
                subtitle="restantes"
              />
            </View>
          </View>

          {/* Gráfico de Peso */}
          <WeightChart
            data={weightData}
            targetWeight={targetWeight}
            periodFilter={periodFilterMap[selectedPeriod]}
          />

          {/* Gráfico de IMC */}
          <BMIChart
            data={bmiData}
            periodFilter={periodFilterMap[selectedPeriod]}
          />

          {/* Estatísticas Detalhadas */}
          <DetailedStats
            avgWeeklyLoss={avgWeeklyLoss}
            maxWeeklyLoss={maxWeeklyLoss}
            maxWeeklyLossDate={maxWeeklyLossDate}
            minWeeklyLoss={minWeeklyLoss}
            minWeeklyLossDate={minWeeklyLossDate}
            weeksInTreatment={weeks}
            totalShots={applications.length}
            currentDose={currentDose}
            nextTitration={nextTitration}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,  // Mudança: 60 → 56px (Shotsy header padding)
    paddingBottom: 16,  // Mudança: 12 → 16px (Shotsy bottom padding)
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,  // Mudança: 28 → 26px (Shotsy title size)
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
