import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useShotsyColors';
import { EstimatedLevelsChartV2 } from '@/components/dashboard/EstimatedLevelsChartV2';
import { NextShotWidget } from '@/components/dashboard/NextShotWidget';
import { router } from 'expo-router';
import { useApplications } from '@/hooks/useApplications';
import { useWeights } from '@/hooks/useWeights';
import { useProfile } from '@/hooks/useProfile';
import { calculateNextShotDate } from '@/lib/pharmacokinetics';
import { createLogger } from '@/lib/logger';
import { List } from 'phosphor-react-native';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { FadeInView } from '@/components/animations';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WeeklySummaryCard } from '@/components/dashboard/WeeklySummaryCard';
import { CoachmarkSystem } from '@/components/dashboard/CoachmarkSystem'; // Importar
import { supabase } from '@/lib/supabase';

const logger = createLogger('Dashboard');

export default function DashboardScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const { applications, refetch: refetchApplications } = useApplications();
  const { weights } = useWeights();
  const { profile } = useProfile();

  const [weeklySpending, setWeeklySpending] = useState(0);

  // ... (Lógica do Resumo Semanal) ...
  const weeklySummaryData = useMemo(() => { /* ... */ return { shotStatus: 'pending', weightChange: null }; }, [applications, weights]);
  useEffect(() => { /* ... */ }, [applications]);


  const onRefresh = useCallback(async () => { /* ... */ }, [refetchApplications]);

  const totalShots = applications.length;
  const lastShotDate = applications.length > 0 ? applications[0].date : undefined;
  const frequency = profile?.frequency || 'weekly';
  const nextShotDate = useMemo(() => {
    if (applications.length === 0) return undefined;
    let intervalDays = 7;
    const freq = frequency.toLowerCase();
    if (freq.includes('biweekly')) intervalDays = 14;
    else if (freq.includes('daily')) intervalDays = 1;
    const medicationApps = applications.map((app) => ({
      dose: app.dosage,
      date: new Date(app.date),
    }));
    return calculateNextShotDate(medicationApps, intervalDays);
  }, [applications, frequency]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.menuButton}>
          <List size={24} color={colors.text} weight="regular" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Resumo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <QuickActions />
        <WeeklySummaryCard
          shotStatus={weeklySummaryData.shotStatus}
          weightChange={weeklySummaryData.weightChange}
          weeklySpending={weeklySpending}
        />
        <FadeInView duration={800} delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Níveis Estimados</Text>
          <EstimatedLevelsChartV2 />
        </FadeInView>
        <FadeInView duration={800} delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Próxima Aplicação</Text>
          <NextShotWidget
            totalShots={totalShots}
            nextShotDate={nextShotDate}
            lastShotDate={lastShotDate}
            frequency={frequency}
          />
        </FadeInView>
      </ScrollView>

      {/* Coachmarks são renderizados por cima de tudo */}
      <CoachmarkSystem />
    </SafeAreaView>
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
  menuButton: {
    padding: ShotsyDesignTokens.spacing.sm,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h3,
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
});
