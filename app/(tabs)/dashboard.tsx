import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Text } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { EstimatedLevelsChart } from '@/components/dashboard/EstimatedLevelsChart';
import { NextShotWidget } from '@/components/dashboard/NextShotWidget';
import { TodaySection } from '@/components/dashboard/TodaySection';
import { ShotHistoryCards } from '@/components/dashboard/ShotHistoryCards';
import { ResultsPreview, Metrics } from '@/components/dashboard/ResultsPreview';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { router } from 'expo-router';
import { useApplications } from '@/hooks/useApplications';
import { useWeights } from '@/hooks/useWeights';
import { useProfile } from '@/hooks/useProfile';
import { useNutrition } from '@/hooks/useNutrition';
import { NextShotWidgetSkeleton, ShotHistoryCardsSkeleton } from '@/components/ui/shotsy-skeleton';
import { calculateNextShotDate } from '@/lib/pharmacokinetics';

export default function DashboardScreen() {
  const colors = useShotsyColors();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch real data from Supabase
  const { applications, loading: applicationsLoading, refetch: refetchApplications } = useApplications();
  const { weights, loading: weightsLoading } = useWeights();
  const { profile, loading: profileLoading } = useProfile();
  const { getTodayNutrition, loading: nutritionLoading } = useNutrition();

  const isLoading = applicationsLoading || weightsLoading || profileLoading || nutritionLoading;

  // Calculate real metrics from Supabase data
  const totalShots = applications.length;
  const lastShot = applications[0]; // Most recent (already sorted by date desc)
  const lastDose = lastShot?.dosage || null;
  const lastShotDate = lastShot?.date;

  // Get frequency from profile (default to weekly)
  const frequency = profile?.frequency || 'weekly';

  // Calculate next shot date using pharmacokinetics library
  const nextShotDate = React.useMemo(() => {
    if (applications.length === 0) return undefined;

    // Determine interval days based on frequency
    let intervalDays = 7; // Default weekly
    const freq = frequency.toLowerCase();

    if (freq.includes('biweekly') || freq.includes('bi-weekly')) {
      intervalDays = 14;
    } else if (freq.includes('daily') || freq.includes('day')) {
      intervalDays = 1;
    }

    // Convert applications to pharmacokinetics format
    const medicationApps = applications.map(app => ({
      dose: app.dosage,
      date: app.date,
    }));

    // Use pharmacokinetics library to calculate next shot date
    const nextDate = calculateNextShotDate(medicationApps, intervalDays);
    return nextDate || undefined;
  }, [applications, frequency]);

  // Basic estimated level calculation (simplified - will be improved later)
  const calculateEstimatedLevel = (): number | null => {
    if (!lastShot) return null;

    const daysSinceLastShot = Math.floor(
      (new Date().getTime() - new Date(lastShot.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Simple decay model: 50% reduction every 7 days
    const halfLife = 7;
    const decayFactor = Math.pow(0.5, daysSinceLastShot / halfLife);
    const estimatedLevel = lastShot.dosage * decayFactor;

    return parseFloat(estimatedLevel.toFixed(2));
  };

  const estimatedLevel = calculateEstimatedLevel();
  const currentLevel = estimatedLevel || 0;

  // Calculate metrics for ResultsPreview
  const calculateMetrics = (): Metrics => {
    const startWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
    const currentWeight = weights.length > 0 ? weights[0].weight : 0;
    const targetWeight = profile?.target_weight || 75;
    const height = profile?.height || 1.75;

    const weightChange = currentWeight - startWeight;
    const currentBMI = currentWeight > 0 && height > 0 ? currentWeight / (height * height) : 0;

    // Progress to goal
    const totalToLose = startWeight - targetWeight;
    const lost = startWeight - currentWeight;
    const progressPercent = totalToLose > 0 ? (lost / totalToLose) * 100 : 0;

    // Remaining to goal
    const remainingToGoal = currentWeight - targetWeight;

    // Calculate weeks in treatment
    const weeks = React.useMemo(() => {
      if (weights.length < 2) return 0;
      const firstDate = weights[weights.length - 1].date;
      const lastDate = weights[0].date;
      const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      return diffWeeks || 1;
    }, [weights]);

    // Average weekly loss
    const avgWeeklyLoss = weeks > 0 ? Math.abs(weightChange) / weeks : 0;

    return {
      totalChange: weightChange,
      currentBMI,
      currentWeight,
      percentProgress: progressPercent,
      weeklyAverage: avgWeeklyLoss,
      toGoal: remainingToGoal,
    };
  };

  const metrics = calculateMetrics();

  // Calculate today's data for TodaySection
  const getTodayData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's weight
    const todayWeight = weights.find(w => {
      const weightDate = new Date(w.date);
      weightDate.setHours(0, 0, 0, 0);
      return weightDate.getTime() === today.getTime();
    });

    // Get today's side effects from applications
    const todayApplication = applications.find(app => {
      const appDate = new Date(app.date);
      appDate.setHours(0, 0, 0, 0);
      return appDate.getTime() === today.getTime();
    });

    // Get today's nutrition
    const todayNutrition = getTodayNutrition();

    return {
      todayWeight: todayWeight?.weight,
      todayCalories: todayNutrition?.calories,
      todayProtein: todayNutrition?.protein,
      todaySideEffects: todayApplication?.side_effects,
      todayNotes: todayWeight?.notes || todayApplication?.notes || todayNutrition?.notes,
    };
  };

  const todayData = getTodayData();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchApplications();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchApplications]);

  const handleAddShot = () => {
    router.push('/(tabs)/add-application');
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={[styles.emptyStateEmoji, { color: colors.text }]}>💉</Text>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        Bem-vindo ao Mounjaro Tracker!
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
        Adicione sua primeira injeção para começar a acompanhar seu progresso
      </Text>
      <ShotsyButton
        title="+ Adicionar Primeira Injeção"
        onPress={handleAddShot}
        size="large"
        style={styles.emptyStateButton}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading ? (
          // Loading state
          <>
            <View style={styles.chartPlaceholder} />
            <NextShotWidgetSkeleton />
            <ShotHistoryCardsSkeleton />
          </>
        ) : applications.length === 0 ? (
          // Empty state
          <EmptyState />
        ) : (
          // Data loaded state
          <>
            {/* Estimated Levels Chart - now calculates level internally */}
            <EstimatedLevelsChart />

            {/* Next Shot Widget */}
            <NextShotWidget
              totalShots={totalShots}
              nextShotDate={nextShotDate}
              lastShotDate={lastShotDate}
              frequency={frequency}
            />

            {/* Today Section */}
            <TodaySection
              todayWeight={todayData.todayWeight}
              todayCalories={todayData.todayCalories}
              todayProtein={todayData.todayProtein}
              todaySideEffects={todayData.todaySideEffects}
              todayNotes={todayData.todayNotes}
            />

            {/* Shot History Cards */}
            <ShotHistoryCards
              data={{
                totalShots,
                lastDose,
                estimatedLevel,
              }}
            />

            {/* Results Preview - Only show if we have weight data */}
            {weights.length > 0 && <ResultsPreview metrics={metrics} />}

            {/* Add Shot Button */}
            <View style={styles.buttonContainer}>
              <ShotsyButton
                title="+ Adicionar Injeção"
                onPress={handleAddShot}
                size="large"
                style={styles.addButton}
              />
            </View>
          </>
        )}

        {/* Bottom spacing for safe area */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,  // Mudança: 16 → 20px (Shotsy horizontal padding)
    paddingTop: 64,  // Mudança: 60 → 64px (Shotsy status bar + title space)
  },
  buttonContainer: {
    marginVertical: 16,
  },
  addButton: {
    width: '100%',
  },
  bottomSpacer: {
    height: 24,
  },
  chartPlaceholder: {
    height: 220,  // Mudança: 200 → 220px (Shotsy chart height)
    marginBottom: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateEmoji: {
    fontSize: 72,  // Mudança: 80 → 72px (Shotsy emoji size)
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,  // Mudança: 24 → 22px (Shotsy title size)
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    width: '100%',
    maxWidth: 300,
  },
});
