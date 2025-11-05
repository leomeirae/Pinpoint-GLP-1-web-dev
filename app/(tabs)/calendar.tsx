import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { DayEventsList } from '@/components/calendar/DayEventsList';
import { useApplications } from '@/hooks/useApplications';
import { useWeights } from '@/hooks/useWeights';

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
  const colors = useShotsyColors();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data from Supabase
  const { applications, loading: loadingApplications, refetch: refetchApplications } = useApplications();
  const { weights, loading: loadingWeights, getWeightDifference, refetch: refetchWeights } = useWeights();

  // Calculate weight difference for a given weight entry
  const calculateDifference = (currentWeight: number, previousWeight: number | undefined): number | undefined => {
    if (previousWeight === undefined) return undefined;
    return currentWeight - previousWeight;
  };

  // Transform applications and weights into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const shotEvents: CalendarEvent[] = applications.map(app => ({
      id: app.id,
      type: 'shot' as const,
      date: app.date,
      time: app.date,
      dosage: app.dosage,
      medication: 'Mounjaro',
    }));

    // Sort weights by date (ascending) to calculate differences correctly
    const sortedWeights = [...weights].sort((a, b) => a.date.getTime() - b.date.getTime());

    const weightEvents: CalendarEvent[] = sortedWeights.map((weight, index) => {
      const previousWeight = index > 0 ? sortedWeights[index - 1].weight : undefined;
      const difference = calculateDifference(weight.weight, previousWeight);

      return {
        id: weight.id,
        type: 'weight' as const,
        date: weight.date,
        time: weight.date,
        weight: weight.weight,
        difference,
      };
    });

    return [...shotEvents, ...weightEvents].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [applications, weights]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchApplications(), refetchWeights()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const formatMonthYear = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return today.getTime() === checkDate.getTime();
  };

  const isLoading = loadingApplications || loadingWeights;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header de navegação do mês */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePreviousMonth}
          >
            <Text style={[styles.navButtonText, { color: colors.primary }]}>
              ← Anterior
            </Text>
          </TouchableOpacity>

          <View style={styles.monthTitle}>
            <Text
              style={[
                styles.monthText,
                { color: colors.text, textTransform: 'capitalize' },
              ]}
            >
              {formatMonthYear(currentDate)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextMonth}
          >
            <Text style={[styles.navButtonText, { color: colors.primary }]}>
              Próximo →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão "Hoje" */}
        {!isToday(currentDate) && (
          <View style={styles.todayButtonContainer}>
            <TouchableOpacity
              style={[
                styles.todayButton,
                {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                },
              ]}
              onPress={handleGoToToday}
            >
              <Text style={[styles.todayButtonText, { color: colors.primary }]}>
                Ir para Hoje
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando eventos...
            </Text>
          </View>
        ) : (
          <>
            {/* Calendário mensal */}
            <MonthCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={events}
            />

            {/* Lista de eventos do dia selecionado */}
            <View style={styles.eventsSection}>
              <DayEventsList
                selectedDate={selectedDate}
                events={events}
              />
            </View>

            {/* Empty State */}
            {events.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  Nenhum evento registrado
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Comece a registrar suas aplicações e pesos para visualizá-los no calendário
                </Text>
              </View>
            )}
          </>
        )}
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
    paddingVertical: 16,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  monthTitle: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
  },
  todayButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  todayButton: {
    paddingVertical: 12,  // Mudança: 10 → 12px (Shotsy vertical padding)
    paddingHorizontal: 20,  // Mudança: 16 → 20px (Shotsy horizontal padding)
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  eventsSection: {
    marginTop: 24,
    minHeight: 300,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
