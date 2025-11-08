import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { useWeights } from '@/hooks/useWeights';
import { useProfile } from '@/hooks/useProfile';
import { useApplications } from '@/hooks/useApplications';
import { WeightChartV2 } from '@/components/results/WeightChartV2';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { Scales, TrendDown, TrendUp, Target } from 'phosphor-react-native';
import { router } from 'expo-router';
import { createLogger } from '@/lib/logger';
import { FadeInView, ConfettiCelebration } from '@/components/animations';

const logger = createLogger('Results');

type TimeFilter = '1month' | '3months' | '6months' | 'all';

interface TimeFilterOption {
  key: TimeFilter;
  label: string;
}

const TIME_FILTERS: TimeFilterOption[] = [
  { key: '1month', label: '1 month' },
  { key: '3months', label: '3 months' },
  { key: '6months', label: '6 months' },
  { key: 'all', label: 'All time' },
];

export default function ResultsScreen() {
  const colors = useColors();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { weights, loading: weightsLoading, refetch: refetchWeights } = useWeights();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const {
    applications,
    loading: applicationsLoading,
    refetch: refetchApplications,
  } = useApplications();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWeights(), refetchProfile(), refetchApplications()]);
    setRefreshing(false);
  };

  // Filter weights based on time filter
  const filteredWeights = useMemo(() => {
    const now = new Date();
    switch (timeFilter) {
      case '1month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return weights.filter((w) => w.date >= oneMonthAgo);
      case '3months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return weights.filter((w) => w.date >= threeMonthsAgo);
      case '6months':
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        return weights.filter((w) => w.date >= sixMonthsAgo);
      default:
        return weights;
    }
  }, [weights, timeFilter]);

  // Calculate statistics
  const startWeight = useMemo(() => {
    return weights.length > 0 ? weights[weights.length - 1].weight : 0;
  }, [weights]);

  const currentWeight = useMemo(() => {
    return filteredWeights.length > 0 ? filteredWeights[0].weight : 0;
  }, [filteredWeights]);

  const targetWeight = profile?.target_weight || 75;
  const height = profile?.height || 1.75;

  const weightChange = currentWeight - startWeight;
  const percentChange = startWeight > 0 ? (weightChange / startWeight) * 100 : 0;

  // Current BMI calculation
  const currentBMI = currentWeight > 0 && height > 0 ? currentWeight / (height * height) : 0;

  // Calculate weekly average loss
  const weeklyAvg = useMemo(() => {
    if (filteredWeights.length < 2) return 0;
    const firstWeight = filteredWeights[filteredWeights.length - 1].weight;
    const lastWeight = filteredWeights[0].weight;
    const timeDiff =
      filteredWeights[0].date.getTime() - filteredWeights[filteredWeights.length - 1].date.getTime();
    const weeks = timeDiff / (7 * 24 * 60 * 60 * 1000);
    return weeks > 0 ? Math.abs(firstWeight - lastWeight) / weeks : 0;
  }, [filteredWeights]);

  // Progress to goal
  const totalToLose = startWeight - targetWeight;
  const lost = startWeight - currentWeight;
  const progressPercent = totalToLose > 0 ? (lost / totalToLose) * 100 : 0;
  const remainingToGoal = currentWeight - targetWeight;

  // Show confetti when goal is reached
  useEffect(() => {
    if (remainingToGoal <= 0 && currentWeight < startWeight) {
      // Goal achieved! Show confetti
      setShowConfetti(true);
    }
  }, [remainingToGoal, currentWeight, startWeight]);

  // Prepare weight data for chart (with dosage info)
  const weightData = useMemo(() => {
    return filteredWeights.map((w) => {
      // Find application closest to this weight date
      const closestApp = applications
        .filter((app) => {
          const appDate = app.date || new Date(app.application_date);
          return appDate <= w.date;
        })
        .sort((a, b) => {
          const dateA = a.date || new Date(a.application_date);
          const dateB = b.date || new Date(b.application_date);
          return dateB.getTime() - dateA.getTime();
        })[0];

      return {
        date: w.date,
        weight: w.weight,
        dosage: closestApp?.dosage || 0,
      };
    });
  }, [filteredWeights, applications]);

  const loading = weightsLoading || profileLoading || applicationsLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Shotsy Style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Results</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} />}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Weight Chart V2 - Shotsy Style */}
        <FadeInView duration={800} delay={100}>
          <WeightChartV2
            data={weightData}
            targetWeight={targetWeight}
            initialWeight={startWeight}
          />
        </FadeInView>

        {/* Metrics Section */}
        <FadeInView duration={800} delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Detailed Metrics</Text>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Total Change */}
            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.metricHeader}>
                <TrendDown size={20} color={colors.primary} weight="bold" />
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Total Change
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {weightChange >= 0 ? '+' : ''}
                {weightChange.toFixed(1)}
                <Text style={[styles.metricUnit, { color: colors.textSecondary }]}> kg</Text>
              </Text>
              <Text style={[styles.metricPercent, { color: colors.textMuted }]}>
                {percentChange >= 0 ? '+' : ''}
                {percentChange.toFixed(1)}%
              </Text>
            </View>

            {/* Current BMI */}
            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.metricHeader}>
                <Scales size={20} color={colors.primary} weight="bold" />
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Current BMI
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {currentBMI > 0 ? currentBMI.toFixed(1) : '—'}
              </Text>
              <Text style={[styles.metricSubtext, { color: colors.textMuted }]}>
                {currentBMI < 18.5
                  ? 'Underweight'
                  : currentBMI < 25
                    ? 'Normal'
                    : currentBMI < 30
                      ? 'Overweight'
                      : 'Obese'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            {/* Weekly Average */}
            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.metricHeader}>
                <TrendDown size={20} color={colors.success} weight="bold" />
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Weekly Avg
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {weeklyAvg > 0 ? (
                  <>
                    -{weeklyAvg.toFixed(2)}
                    <Text style={[styles.metricUnit, { color: colors.textSecondary }]}> kg</Text>
                  </>
                ) : (
                  '—'
                )}
              </Text>
              <Text style={[styles.metricSubtext, { color: colors.textMuted }]}>per week</Text>
            </View>

            {/* To Goal */}
            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.metricHeader}>
                <Target size={20} color={colors.warning} weight="bold" />
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>To Goal</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {remainingToGoal > 0 ? (
                  <>
                    {remainingToGoal.toFixed(1)}
                    <Text style={[styles.metricUnit, { color: colors.textSecondary }]}> kg</Text>
                  </>
                ) : (
                  <Text style={{ color: colors.success }}>Goal Reached! 🎉</Text>
                )}
              </Text>
              <Text style={[styles.metricSubtext, { color: colors.textMuted }]}>
                {Math.max(0, progressPercent).toFixed(0)}% complete
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Confetti celebration when goal is reached */}
      {showConfetti && (
        <ConfettiCelebration
          count={50}
          onComplete={() => setShowConfetti(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h2,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: ShotsyDesignTokens.spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginTop: ShotsyDesignTokens.spacing.xl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.md,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  metricLabel: {
    ...ShotsyDesignTokens.typography.caption,
  },
  metricValue: {
    ...ShotsyDesignTokens.typography.h2,
    marginBottom: 4,
  },
  metricUnit: {
    ...ShotsyDesignTokens.typography.body,
  },
  metricPercent: {
    ...ShotsyDesignTokens.typography.caption,
  },
  metricSubtext: {
    ...ShotsyDesignTokens.typography.caption,
  },

  bottomSpacer: {
    height: ShotsyDesignTokens.spacing.xxl,
  },
});
