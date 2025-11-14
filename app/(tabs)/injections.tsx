import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotCard, Shot } from '@/components/shots/ShotCard';
import { useApplications } from '@/hooks/useApplications';
import { useProfile } from '@/hooks/useProfile';
import { calculateNextShotDate, getCurrentEstimatedLevel, MedicationApplication } from '@/lib/pharmacokinetics';
import { createLogger } from '@/lib/logger';
import { ShotsyCircularProgressV2 } from '@/components/ui/ShotsyCircularProgressV2';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { getDosageColor } from '@/lib/dosageColors';
import { Syringe, Pill, ChartBar, Plus } from 'phosphor-react-native';

const logger = createLogger('Injections');

export default function ShotsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real data from Supabase
  const {
    applications,
    loading,
    deleteApplication,
    refetch: refetchApplications,
  } = useApplications();
  const { profile } = useProfile();

  // Map Application to Shot format
  const shots = useMemo(() => {
    return applications.map((app) => ({
      id: app.id,
      date: app.date || new Date(app.application_date),
      dosage: app.dosage,
      injectionSites: app.injection_sites || [],
      sideEffects: app.side_effects_list || [],
      notes: app.notes,
    }));
  }, [applications]);

  // Calculate statistics
  const totalShots = shots.length;
  const lastShot = shots.length > 0 ? shots[0] : null;
  const lastDose = lastShot?.dosage || 0;

  // Calculate estimated level
  const estimatedLevel = useMemo(() => {
    if (applications.length === 0) return 0;

    const medApplications: MedicationApplication[] = applications.map((app) => ({
      dose: app.dosage,
      date: app.date || new Date(app.application_date),
    }));

    return getCurrentEstimatedLevel(medApplications);
  }, [applications]);

  // Calculate next injection date
  const nextInjectionData = useMemo(() => {
    if (applications.length === 0) {
      return {
        daysUntil: null,
        percentage: 0,
        message: 'Bem-vindo!',
        subtitle: 'Adicione sua primeira injeção para começar.',
      };
    }

    const frequency = profile?.frequency || 'weekly';
    let intervalDays = 7; // Default weekly

    const freq = frequency.toLowerCase();
    if (freq.includes('biweekly') || freq.includes('bi-weekly')) {
      intervalDays = 14;
    } else if (freq.includes('daily') || freq.includes('day')) {
      intervalDays = 1;
    }

    const medApplications: MedicationApplication[] = applications.map((app) => ({
      dose: app.dosage,
      date: app.date || new Date(app.application_date),
    }));

    const nextDate = calculateNextShotDate(medApplications, intervalDays);
    if (!nextDate) {
      return {
        daysUntil: null,
        percentage: 0,
        message: 'Bem-vindo!',
        subtitle: 'Adicione sua primeira injeção para começar.',
      };
    }

    const now = new Date();
    const daysDiff = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntil = Math.max(0, daysDiff);

    // Calculate percentage (0-100) based on days until next injection
    // If interval is 7 days, and we're 0 days away, we're at 0%
    // If we're 7 days away, we're at 100%
    const percentage = Math.min(100, Math.max(0, ((intervalDays - daysUntil) / intervalDays) * 100));

    return {
      daysUntil,
      percentage,
      message: daysUntil === 0 ? 'Hoje!' : daysUntil === 1 ? 'Amanhã' : `${daysUntil} dias`,
      subtitle: daysUntil === 0 ? 'Hora da sua injeção!' : `Próxima injeção em ${daysUntil} dia(s)`,
    };
  }, [applications, profile?.frequency]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchApplications();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
    } catch (error) {
      logger.error('Error deleting application:', error as Error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando injeções...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Shotsy Style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Injections</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/add-application')}
          style={styles.addButton}
        >
          <Plus size={20} color={colors.primary} weight="bold" />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Add shot</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid - Shotsy Style */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>

          <View style={styles.statsGrid}>
            {/* Injeções tomadas */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.statHeader}>
                <Syringe size={20} color={colors.primary} weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Shots
                </Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{totalShots}</Text>
            </View>

            {/* Última dose */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.statHeader}>
                <Pill size={20} color={lastDose > 0 ? getDosageColor(lastDose) : colors.textMuted} weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Last Dose</Text>
              </View>
              {lastDose > 0 ? (
                <Text
                  style={[
                    styles.statValue,
                    { color: getDosageColor(lastDose) },
                  ]}
                >
                  {lastDose}mg
                </Text>
              ) : (
                <Text style={[styles.statPlaceholder, { color: colors.textMuted }]}>—</Text>
              )}
            </View>

            {/* Nível Est. */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.statHeader}>
                <ChartBar size={20} color={colors.success} weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Est. Level</Text>
              </View>
              {estimatedLevel > 0 ? (
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {estimatedLevel.toFixed(1)}mg
                </Text>
              ) : (
                <Text style={[styles.statPlaceholder, { color: colors.textMuted }]}>—</Text>
              )}
            </View>
          </View>
        </View>

        {/* Next Injection Section - Shotsy Style */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Injection</Text>

          <View
            style={[
              styles.nextInjectionCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {/* Circular Progress - V2 Component */}
            <View style={styles.progressContainer}>
              <ShotsyCircularProgressV2
                progress={nextInjectionData.percentage / 100}
                size="large"
                state={
                  nextInjectionData.percentage >= 80
                    ? 'success'
                    : nextInjectionData.percentage >= 50
                      ? 'warning'
                      : 'normal'
                }
                centerText={nextInjectionData.message}
                centerLabel={nextInjectionData.subtitle}
              />
            </View>
          </View>
        </View>

        {/* Shots List - Timeline Visual */}
        {shots.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shot History</Text>
            <View style={styles.listContainer}>
              {shots.map((shot) => (
                <ShotCard key={shot.id} shot={shot} onDelete={handleDelete} />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {shots.length === 0 && (
          <View style={styles.emptyState}>
            <Syringe size={64} color={colors.textMuted} weight="thin" />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No Injections Yet
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
              Start tracking your GLP-1 journey by adding your first injection.
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/add-application')}
            >
              <Plus size={20} color="#FFFFFF" weight="bold" />
              <Text style={styles.emptyStateButtonText}>Add First Injection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
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
    paddingBottom: 100,
  },
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  statLabel: {
    ...ShotsyDesignTokens.typography.caption,
  },
  statValue: {
    ...ShotsyDesignTokens.typography.h2,
  },
  statPlaceholder: {
    ...ShotsyDesignTokens.typography.h3,
    fontWeight: '400',
  },

  // Next Injection Card
  nextInjectionCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.xl,
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shots List
  listContainer: {
    gap: ShotsyDesignTokens.spacing.md,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: ShotsyDesignTokens.spacing.xxxxl,
    gap: ShotsyDesignTokens.spacing.lg,
  },
  emptyStateTitle: {
    ...ShotsyDesignTokens.typography.h2,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...ShotsyDesignTokens.typography.body,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    paddingHorizontal: ShotsyDesignTokens.spacing.xl,
    paddingVertical: ShotsyDesignTokens.spacing.lg,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    marginTop: ShotsyDesignTokens.spacing.md,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    ...ShotsyDesignTokens.typography.label,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: ShotsyDesignTokens.spacing.lg,
    ...ShotsyDesignTokens.typography.body,
  },

  bottomSpacer: {
    height: ShotsyDesignTokens.spacing.xxl,
  },
});
