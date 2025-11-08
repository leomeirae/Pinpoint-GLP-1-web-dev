import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { EstimatedLevelsChartV2 } from '@/components/dashboard/EstimatedLevelsChartV2';
import { NextShotWidget } from '@/components/dashboard/NextShotWidget';
import { ShotsyCircularProgressV2, ProgressValue } from '@/components/ui/ShotsyCircularProgressV2';
import { router } from 'expo-router';
import { useApplications } from '@/hooks/useApplications';
import { useWeights } from '@/hooks/useWeights';
import { useProfile } from '@/hooks/useProfile';
import { calculateNextShotDate, getCurrentEstimatedLevel, MedicationApplication } from '@/lib/pharmacokinetics';
import { createLogger } from '@/lib/logger';
import { List, Plus } from 'phosphor-react-native';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { getDosageColor } from '@/lib/dosageColors';
import { FadeInView, ScalePress } from '@/components/animations';

const logger = createLogger('Dashboard');

export default function DashboardScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real data from Supabase
  const {
    applications,
    loading: applicationsLoading,
    refetch: refetchApplications,
  } = useApplications();
  const { weights, loading: weightsLoading } = useWeights();
  const { profile, loading: profileLoading } = useProfile();

  const isLoading = applicationsLoading || weightsLoading || profileLoading;

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Shotsy Style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.menuButton}>
          <List size={24} color={colors.text} weight="regular" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Summary</Text>
        <ScalePress onPress={handleAddShot} style={styles.addButton} hapticType="medium">
          <Plus size={20} color={colors.primary} weight="bold" />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Add shot</Text>
        </ScalePress>
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

        {/* Estimated Medication Levels - V2 Chart */}
        <FadeInView duration={800} delay={200} style={styles.section}>
          <EstimatedLevelsChartV2 />
        </FadeInView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: ShotsyDesignTokens.spacing.sm,
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
    ...ShotsyDesignTokens.typography.label,
    fontWeight: '600',
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

  bottomSpacer: {
    height: ShotsyDesignTokens.spacing.xxl,
  },
});
