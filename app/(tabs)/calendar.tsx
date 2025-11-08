import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Syringe, Scales, TrendUp, Flame, ForkKnife, Drop, Note, CalendarBlank } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { useApplications } from '@/hooks/useApplications';
import { useWeights } from '@/hooks/useWeights';
import { useNutrition } from '@/hooks/useNutrition';
import { useSideEffects } from '@/hooks/useSideEffects';
import { getCurrentEstimatedLevel, MedicationApplication } from '@/lib/pharmacokinetics';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { getDosageColor } from '@/lib/dosageColors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Calendar');

// Event type to match calendar components
type CalendarEvent = {
  id: string;
  type: 'shot' | 'weight';
  date: Date;
  time: Date;
  dosage?: number;
  medication?: string;
  weight?: number;
  difference?: number;
};

export default function CalendarViewScreen() {
  const colors = useColors();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data from Supabase
  const {
    applications,
    loading: loadingApplications,
    refetch: refetchApplications,
  } = useApplications();
  const {
    weights,
    loading: loadingWeights,
    refetch: refetchWeights,
  } = useWeights();
  const {
    nutrition,
    loading: loadingNutrition,
    getNutritionByDate,
    refetch: refetchNutrition,
  } = useNutrition();
  const {
    sideEffects,
    loading: loadingSideEffects,
    refetch: refetchSideEffects,
  } = useSideEffects();

  // Transform applications and weights into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const shotEvents: CalendarEvent[] = applications.map((app) => ({
      id: app.id,
      type: 'shot' as const,
      date: app.date || new Date(app.application_date),
      time: app.date || new Date(app.application_date),
      dosage: app.dosage,
      medication: 'Mounjaro',
    }));

    const weightEvents: CalendarEvent[] = weights.map((weight) => ({
      id: weight.id,
      type: 'weight' as const,
      date: weight.date,
      time: weight.date,
      weight: weight.weight,
    }));

    return [...shotEvents, ...weightEvents].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [applications, weights]);

  // Get data for selected date
  const selectedDateData = useMemo(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    // Get injection for selected date
    const injection = applications.find((app) => {
      const appDate = app.date || new Date(app.application_date);
      appDate.setHours(0, 0, 0, 0);
      return appDate.getTime() === selectedDateOnly.getTime();
    });

    // Get weight for selected date
    const weight = weights.find((w) => {
      const wDate = new Date(w.date);
      wDate.setHours(0, 0, 0, 0);
      return wDate.getTime() === selectedDateOnly.getTime();
    });

    // Get nutrition for selected date
    const nutritionData = nutrition.find((n) => {
      const nDate = new Date(n.date);
      nDate.setHours(0, 0, 0, 0);
      return nDate.getTime() === selectedDateOnly.getTime();
    });

    // Get side effects for selected date
    const daySideEffects = sideEffects.filter((se) => {
      const seDate = new Date(se.date);
      seDate.setHours(0, 0, 0, 0);
      return seDate.getTime() === selectedDateOnly.getTime();
    });

    // Calculate estimated level
    const medApplications: MedicationApplication[] = applications
      .filter((app) => {
        const appDate = app.date || new Date(app.application_date);
        return appDate <= selectedDate;
      })
      .map((app) => ({
        dose: app.dosage,
        date: app.date || new Date(app.application_date),
      }));
    const estimatedLevel = getCurrentEstimatedLevel(medApplications, selectedDate);

    return {
      injection,
      weight,
      nutrition: nutritionData,
      sideEffects: daySideEffects,
      estimatedLevel,
    };
  }, [selectedDate, applications, weights, nutrition, sideEffects]);

  // Generate days for horizontal scroll (current week)
  const weekDays = useMemo(() => {
    const today = new Date();
    const days: Date[] = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - 3); // Show 3 days before selected

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchApplications(),
        refetchWeights(),
        refetchNutrition(),
        refetchSideEffects(),
      ]);
    } catch (error) {
      logger.error('Error refreshing data:', error as Error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const formatMonthYear = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatDayDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
    }).format(date);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return today.getTime() === checkDate.getTime();
  };

  const isSelected = (date: Date): boolean => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return selected.getTime() === checkDate.getTime();
  };

  const isLoading = loadingApplications || loadingWeights || loadingNutrition || loadingSideEffects;

  // Get dosage color for injection indicator
  const injectionColor = selectedDateData.injection
    ? getDosageColor(selectedDateData.injection.dosage)
    : colors.textMuted;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Shotsy Style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calendar</Text>
        <TouchableOpacity onPress={handleGoToToday} style={styles.todayButton}>
          <CalendarBlank size={18} color={colors.primary} weight="bold" />
          <Text style={[styles.todayButtonText, { color: colors.primary }]}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Day View - Shotsy Style */}
        <View style={styles.currentDayView}>
          {/* Horizontal Day Buttons with Visual Enhancement */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScroll}
          >
            {weekDays.map((day, index) => {
              const dayIsSelected = isSelected(day);
              const dayIsToday = isToday(day);

              // Check if day has injection
              const dayHasInjection = applications.some(app => {
                const appDate = app.date || new Date(app.application_date);
                appDate.setHours(0, 0, 0, 0);
                const checkDay = new Date(day);
                checkDay.setHours(0, 0, 0, 0);
                return appDate.getTime() === checkDay.getTime();
              });

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: dayIsSelected
                        ? colors.primary
                        : colors.card,
                    },
                    dayIsSelected && ShotsyDesignTokens.shadows.card,
                  ]}
                  onPress={() => setSelectedDate(day)}
                  accessibilityLabel={`Select ${formatDayDate(day)}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.dayButtonNumber,
                      {
                        color: dayIsSelected ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {dayIsToday && (
                    <View style={[styles.todayDot, { backgroundColor: colors.warning }]} />
                  )}
                  {dayHasInjection && !dayIsToday && (
                    <View style={[styles.injectionDot, { backgroundColor: colors.success }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Date Title with Visual Hierarchy */}
          <Text style={[styles.dateTitle, { color: colors.text }]}>
            {isToday(selectedDate) ? 'Today' : ''}{isToday(selectedDate) && ', '}{formatDayDate(selectedDate)}
          </Text>

          {/* Daily Stats Cards - Shotsy Style with Dosage Colors */}
          <View style={styles.statsGrid}>
            {/* Injection Card with Dosage Color Indicator */}
            <TouchableOpacity
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
              onPress={() => router.push('/(tabs)/add-application')}
              accessibilityLabel={selectedDateData.injection ? `Injection recorded: ${selectedDateData.injection.dosage}mg` : 'Add injection'}
            >
              {selectedDateData.injection && (
                <View
                  style={[
                    styles.dosageIndicator,
                    { backgroundColor: injectionColor }
                  ]}
                />
              )}
              <View style={styles.statHeader}>
                <Syringe size={20} color={injectionColor} weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Injection</Text>
              </View>
              {selectedDateData.injection ? (
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: injectionColor }]}>
                    {selectedDateData.injection.dosage}
                    <Text style={[styles.statUnit, { color: colors.textSecondary }]}>mg</Text>
                  </Text>
                </View>
              ) : (
                <Text style={[styles.statPlaceholder, { color: colors.textMuted }]}>
                  Tap to add
                </Text>
              )}
            </TouchableOpacity>

            {/* Estimated Level Card */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.statHeader}>
                <TrendUp size={20} color={colors.primary} weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Est. Level</Text>
              </View>
              {selectedDateData.estimatedLevel > 0 ? (
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {selectedDateData.estimatedLevel.toFixed(1)}
                    <Text style={[styles.statUnit, { color: colors.textSecondary }]}>mg</Text>
                  </Text>
                </View>
              ) : (
                <Text style={[styles.statPlaceholder, { color: colors.textMuted }]}>
                  No data
                </Text>
              )}
            </View>

            {/* Weight Card */}
            <TouchableOpacity
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
              onPress={() => router.push('/(tabs)/add-application')}
              accessibilityLabel={selectedDateData.weight ? `Weight: ${selectedDateData.weight.weight}kg` : 'Add weight'}
            >
              <View style={styles.statHeader}>
                <Scales size={20} color={colors.success} weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Weight</Text>
              </View>
              {selectedDateData.weight ? (
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {selectedDateData.weight.weight.toFixed(1)}
                    <Text style={[styles.statUnit, { color: colors.textSecondary }]}>kg</Text>
                  </Text>
                </View>
              ) : (
                <Text style={[styles.statPlaceholder, { color: colors.textMuted }]}>
                  Tap to add
                </Text>
              )}
            </TouchableOpacity>

            {/* Calories Card */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.statHeader}>
                <Flame size={20} color="#F97316" weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calories</Text>
              </View>
              {selectedDateData.nutrition?.calories ? (
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {selectedDateData.nutrition.calories}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.statPlaceholder, { color: colors.textMuted }]}>—</Text>
              )}
            </View>

            {/* Protein Card */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card },
                ShotsyDesignTokens.shadows.card,
              ]}
            >
              <View style={styles.statHeader}>
                <ForkKnife size={20} color="#EF4444" weight="bold" />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Protein</Text>
              </View>
              {selectedDateData.nutrition?.protein ? (
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {selectedDateData.nutrition.protein}
                    <Text style={[styles.statUnit, { color: colors.textSecondary }]}>g</Text>
                  </Text>
                </View>
              ) : (
                <Text style={[styles.statPlaceholder, { color: colors.textMuted }]}>—</Text>
              )}
            </View>
          </View>

          {/* Side Effects Card - Shotsy Style */}
          <TouchableOpacity
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={() => router.push('/(tabs)/add-side-effect')}
            accessibilityLabel={`Side effects: ${selectedDateData.sideEffects.length} recorded`}
          >
            <View style={styles.sectionHeader}>
              <Drop size={20} color="#10B981" weight="bold" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Side Effects</Text>
            </View>
            {selectedDateData.sideEffects.length > 0 ? (
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                {selectedDateData.sideEffects.length} effect(s) recorded
              </Text>
            ) : (
              <Text style={[styles.sectionPlaceholder, { color: colors.textMuted }]}>
                Tap to add side effects
              </Text>
            )}
          </TouchableOpacity>

          {/* Daily Notes Card - Shotsy Style */}
          <TouchableOpacity
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={() => router.push('/(tabs)/add-application')}
          >
            <View style={styles.sectionHeader}>
              <Note size={20} color={colors.primary} weight="bold" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Notes</Text>
            </View>
            {selectedDateData.nutrition?.notes ? (
              <Text style={[styles.sectionContent, { color: colors.text }]} numberOfLines={2}>
                {selectedDateData.nutrition.notes}
              </Text>
            ) : (
              <Text style={[styles.sectionPlaceholder, { color: colors.textMuted }]}>
                Tap to add notes
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Calendar Month View - Shotsy Style */}
        <View style={[styles.monthView, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {formatMonthYear(currentDate)}
          </Text>

          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading events...
              </Text>
            </View>
          ) : (
            <MonthCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={events}
            />
          )}
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
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h2,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
    paddingHorizontal: ShotsyDesignTokens.spacing.sm,
    paddingVertical: 4,
  },
  todayButtonText: {
    ...ShotsyDesignTokens.typography.label,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: ShotsyDesignTokens.spacing.xxl,
  },
  currentDayView: {
    padding: ShotsyDesignTokens.spacing.lg,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  daysScroll: {
    paddingVertical: ShotsyDesignTokens.spacing.sm,
    gap: ShotsyDesignTokens.spacing.sm,
  },
  dayButton: {
    width: 56,
    height: 64,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ShotsyDesignTokens.spacing.sm,
  },
  dayButtonNumber: {
    ...ShotsyDesignTokens.typography.h4,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  injectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  dateTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginTop: ShotsyDesignTokens.spacing.lg,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ShotsyDesignTokens.spacing.md,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  statCard: {
    width: '47%',
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  dosageIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: ShotsyDesignTokens.borderRadius.lg,
    borderTopRightRadius: ShotsyDesignTokens.borderRadius.lg,
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
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    ...ShotsyDesignTokens.typography.h2,
  },
  statUnit: {
    ...ShotsyDesignTokens.typography.body,
  },
  statPlaceholder: {
    ...ShotsyDesignTokens.typography.caption,
    fontStyle: 'italic',
  },
  sectionCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.label,
    fontWeight: '600',
  },
  sectionContent: {
    ...ShotsyDesignTokens.typography.body,
  },
  sectionPlaceholder: {
    ...ShotsyDesignTokens.typography.body,
    fontStyle: 'italic',
  },
  monthView: {
    marginHorizontal: ShotsyDesignTokens.spacing.lg,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  monthTitle: {
    ...ShotsyDesignTokens.typography.h2,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 400,
  },
  loadingText: {
    ...ShotsyDesignTokens.typography.body,
    marginTop: ShotsyDesignTokens.spacing.lg,
  },
});
