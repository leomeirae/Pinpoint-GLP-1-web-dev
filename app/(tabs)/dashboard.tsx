import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useShotsyColors';
import { EstimatedLevelChart } from '@/components/charts/EstimatedLevelChart';
import { calculateEstimatedLevels } from '@/lib/pharmacokinetics';
import { NextShotWidget } from '@/components/dashboard/NextShotWidget';
import { ShotsyCircularProgressV2, ProgressValue } from '@/components/ui/ShotsyCircularProgressV2';
import { WeightChart } from '@/components/dashboard/WeightChart';
import { FinancialSummaryCard } from '@/components/finance/FinancialSummaryCard';
import { router } from 'expo-router';
import { useApplications } from '@/hooks/useApplications';
import { useWeights } from '@/hooks/useWeights';
import { useProfile } from '@/hooks/useProfile';
import { usePurchases } from '@/hooks/usePurchases';
import { useFeatureFlag } from '@/lib/feature-flags';
import { calculateTotalSpent, calculateWeeklySpent, calculateCostPerKg } from '@/lib/finance';
import { calculateNextShotDate, getCurrentEstimatedLevel, MedicationApplication } from '@/lib/pharmacokinetics';
import { createLogger } from '@/lib/logger';
import { Plus } from 'phosphor-react-native';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { getDosageColor } from '@/lib/dosageColors';
import { FadeInView, ScalePress } from '@/components/animations';
import { CoachmarkProvider, Coachmark, CoachmarkController, useCoachmarks } from '@/components/coachmarks';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logger = createLogger('Dashboard');

const DASHBOARD_FIRST_VISIT_KEY = '@mounjaro:dashboard_first_visit';

// Componente interno que usa coachmarks
function DashboardContent() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | '90days' | 'all'>('week');
  const { startTour } = useCoachmarks();

  // Fetch real data from Supabase
  const {
    applications,
    loading: applicationsLoading,
    refetch: refetchApplications,
  } = useApplications();
  const { weights, loading: weightsLoading } = useWeights();
  const { profile, loading: profileLoading } = useProfile();
  const { purchases, loading: purchasesLoading } = usePurchases();
  const financeEnabled = useFeatureFlag('FF_FINANCE_MVP');

  const isLoading = applicationsLoading || weightsLoading || profileLoading;

  // Iniciar tour na primeira visita ao dashboard
  useEffect(() => {
    checkFirstVisitAndStartTour();
  }, []);

  const checkFirstVisitAndStartTour = async () => {
    try {
      const visited = await AsyncStorage.getItem(DASHBOARD_FIRST_VISIT_KEY);
      if (!visited && !isLoading) {
        // Aguardar um pouco para garantir que elementos estão renderizados
        setTimeout(() => {
          startTour();
          AsyncStorage.setItem(DASHBOARD_FIRST_VISIT_KEY, 'true');
        }, 1000);
      }
    } catch (error) {
      logger.error('Error checking first visit', error as Error);
    }
  };

  // Calculate real metrics from Supabase data
  const totalShots = applications.length;
  const lastShot = applications[0]; // Most recent (already sorted by date desc)
  const lastDose = lastShot?.dosage || null;
  const lastShotDate = lastShot?.date;

  // Get frequency from profile (default to weekly)
  const frequency = profile?.frequency || 'weekly';

  // Calculate adherence rate (exemplo: shots realizadas vs esperadas no mês)
  const adherenceRate = useMemo(() => {
    if (applications.length === 0) return 0;

    // Conta shots dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentShots = applications.filter(app => new Date(app.date) >= thirtyDaysAgo).length;

    // Calcula shots esperadas (assumindo weekly = 4 shots/mês)
    const expectedShots = frequency === 'weekly' ? 4 : frequency === 'biweekly' ? 2 : 30;

    return Math.min(recentShots / expectedShots, 1);
  }, [applications, frequency]);

  // Calculate next shot date using pharmacokinetics library
  const nextShotDate = useMemo(() => {
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
    const medicationApps: MedicationApplication[] = applications.map((app) => ({
      dose: app.dosage,
      date: new Date(app.date),
    }));

    // Use pharmacokinetics library to calculate next shot date
    const nextDate = calculateNextShotDate(medicationApps, intervalDays);
    return nextDate || undefined;
  }, [applications, frequency]);

  // Calculate estimated level
  const estimatedLevel = useMemo(() => {
    if (applications.length === 0) return null;

    const medicationApps: MedicationApplication[] = applications.map((app) => ({
      dose: app.dosage,
      date: new Date(app.date),
    }));

    return getCurrentEstimatedLevel(medicationApps);
  }, [applications]);

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    if (!financeEnabled || purchases.length === 0) {
      return null;
    }

    const totalSpent = calculateTotalSpent(purchases);
    const weeklySpent = calculateWeeklySpent(purchases);
    const costPerKg = weights.length >= 2 && profile?.costPerKgOptIn
      ? calculateCostPerKg(purchases, weights)
      : null;

    return {
      totalSpentCents: totalSpent,
      weeklySpentCents: weeklySpent,
      costPerKgCents: costPerKg,
      nextPurchaseDate: null, // TODO: Calculate based on purchase frequency
      hasOptIn: profile?.costPerKgOptIn || false,
    };
  }, [purchases, weights, profile, financeEnabled]);

  // Calculate chart data for Estimated Levels
  const estimatedLevelsData = useMemo(() => {
    if (applications.length === 0) {
      return [];
    }

    // Convert applications to the format expected by pharmacokinetics
    const medApplications = applications.map((app) => ({
      dose: app.dosage,
      date: app.date,
    }));

    // Calculate date range based on selected period
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days for forecast

    switch (chartPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = medApplications.length > 0 
          ? new Date(Math.min(...medApplications.map(a => a.date.getTime())))
          : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Calculate estimated levels
    const levels = calculateEstimatedLevels(medApplications, startDate, endDate);

    // Transform to the format expected by the chart component
    return levels.map((level) => ({
      date: level.date,
      levelMg: level.level,
    }));
  }, [applications, chartPeriod]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchApplications();
    } catch (error) {
      logger.error('Error refreshing data:', error as Error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchApplications]);

  const handleAddShot = () => {
    router.push('/(tabs)/add-application');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Shotsy Style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Summary</Text>
        <Coachmark
          id="home_add_dose"
          title="Registrar Dose"
          description="Registre suas aplicações semanais aqui para acompanhar seu tratamento"
          order={1}
        >
          <ScalePress onPress={handleAddShot} style={styles.addButton} hapticType="medium">
            <Plus size={20} color={colors.primary} weight="bold" />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>Add shot</Text>
          </ScalePress>
        </Coachmark>
      </View>

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
        {/* Progress Ring Section - New! */}
        {totalShots > 0 && (
          <FadeInView duration={800} delay={100} style={styles.section}>
            <View style={styles.progressSection}>
              <ShotsyCircularProgressV2
                progress={adherenceRate}
                size="large"
                state={adherenceRate >= 0.8 ? 'success' : adherenceRate >= 0.5 ? 'warning' : 'normal'}
                centerText={`${Math.round(adherenceRate * 100)}%`}
                centerLabel="Adherence"
              />

              <View style={styles.progressStats}>
                <View style={styles.progressStatItem}>
                  <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                    Total Shots
                  </Text>
                  <Text style={[styles.progressStatValue, { color: colors.text }]}>
                    {totalShots}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.progressStatItem}>
                  <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                    Last Dose
                  </Text>
                  <Text
                    style={[
                      styles.progressStatValue,
                      { color: lastDose ? getDosageColor(lastDose) : colors.textMuted },
                    ]}
                  >
                    {lastDose ? `${lastDose}mg` : '—'}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.progressStatItem}>
                  <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                    Est. Level
                  </Text>
                  <Text style={[styles.progressStatValue, { color: colors.primary }]}>
                    {estimatedLevel !== null ? `${estimatedLevel.toFixed(1)}mg` : '—'}
                  </Text>
                </View>
              </View>
            </View>
          </FadeInView>
        )}

        {/* Stats Cards - Shotsy Style */}
        {totalShots === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card },
                  ShotsyDesignTokens.shadows.card,
                ]}
              >
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Shots</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card },
                  ShotsyDesignTokens.shadows.card,
                ]}
              >
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Last Dose</Text>
                <Text style={[styles.statValue, { color: colors.textMuted }]}>—</Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card },
                  ShotsyDesignTokens.shadows.card,
                ]}
              >
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Est. Level</Text>
                <Text style={[styles.statValue, { color: colors.textMuted }]}>—</Text>
              </View>
            </View>
          </View>
        )}

        {/* Estimated Medication Levels - New Chart */}
        <FadeInView duration={800} delay={200} style={styles.section}>
          <EstimatedLevelChart 
            data={estimatedLevelsData} 
            range={chartPeriod} 
            onRangeChange={setChartPeriod}
          />
        </FadeInView>

        {/* Weight Evolution Chart */}
        {weights.length > 0 && (
          <FadeInView duration={800} delay={250} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Evolução do Peso</Text>
            <WeightChart
              data={weights}
              goalWeight={profile?.target_weight}
              initialWeight={profile?.start_weight}
            />
          </FadeInView>
        )}

        {/* Next Injection */}
        <FadeInView duration={800} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Injection</Text>
          <NextShotWidget
            totalShots={totalShots}
            nextShotDate={nextShotDate}
            lastShotDate={lastShotDate}
            frequency={frequency}
          />
        </FadeInView>

        {/* Financial Summary */}
        {financeEnabled && financialMetrics && (
          <FadeInView duration={800} delay={350} style={styles.section}>
            <FinancialSummaryCard
              totalSpentCents={financialMetrics.totalSpentCents}
              weeklySpentCents={financialMetrics.weeklySpentCents}
              nextPurchaseDate={financialMetrics.nextPurchaseDate}
              costPerKgCents={financialMetrics.costPerKgCents}
              hasOptIn={financialMetrics.hasOptIn}
              onOptInPress={() => {
                // TODO: Open opt-in modal or navigate to settings
                logger.info('Cost per kg opt-in pressed');
              }}
            />
          </FadeInView>
        )}

        {/* Quick Actions Card */}
        <FadeInView duration={800} delay={400} style={styles.section}>
          <Coachmark
            id="home_quick_actions"
            title="Ações Rápidas"
            description="Acesso rápido às ações mais usadas do app"
            order={2}
          >
            <QuickActionsCard />
          </Coachmark>
        </FadeInView>
      </ScrollView>

      {/* Coachmark Controller */}
      <CoachmarkController />
    </SafeAreaView>
  );
}

// Wrapper com Provider
export default function DashboardScreen() {
  return (
    <CoachmarkProvider>
      <DashboardContent />
    </CoachmarkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: ShotsyDesignTokens.spacing.sm,
    paddingVertical: 4,
  },
  addButtonText: {
    ...ShotsyDesignTokens.typography.buttonSmall,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.lg,
    paddingBottom: 80,
  },
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },

  // Progress Ring Section
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xl,
  },
  progressStats: {
    flex: 1,
    gap: ShotsyDesignTokens.spacing.lg,
  },
  progressStatItem: {
    alignItems: 'center',
  },
  progressStatLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 4,
  },
  progressStatValue: {
    ...ShotsyDesignTokens.typography.h4,
  },
  divider: {
    height: 1,
    opacity: 0.3,
  },

  // Stats Grid (empty state)
  statsGrid: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    alignItems: 'center',
  },
  statLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 4,
  },
  statValue: {
    ...ShotsyDesignTokens.typography.h2,
  },
});
