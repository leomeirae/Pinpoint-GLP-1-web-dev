// app/(onboarding)/Schedule.tsx
// Tela 4: Seleção de dia da semana e horário

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { DayPicker } from '@/components/onboarding/DayPicker';
import { useOnboardingContext } from '@/hooks/OnboardingContext';

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function ScheduleScreen() {
  const colors = useColors();
  const { state, updateData, nextStep, canGoNext } = useOnboardingContext();
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Converter preferredTime string (HH:mm) para Date
  const getTimeFromString = (timeStr?: string): Date => {
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours || 18, minutes || 0, 0, 0);
      return date;
    }
    const date = new Date();
    date.setHours(18, 0, 0, 0); // Default: 18:00
    return date;
  };

  const [selectedTime, setSelectedTime] = useState<Date>(getTimeFromString(state.preferredTime));

  // Inicializar horário padrão se não existir (para iOS spinner que não dispara onChange ao abrir)
  React.useEffect(() => {
    if (!state.preferredTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      updateData({ preferredTime: `${hours}:${minutes}` });
    }
  }, []);

  // DEBUG: Log do estado atual
  React.useEffect(() => {
    console.log('🕐 Schedule State:', {
      preferredDay: state.preferredDay,
      preferredTime: state.preferredTime,
      canGoNext: canGoNext(),
    });
  }, [state.preferredDay, state.preferredTime, canGoNext]);

  const handleSelectDay = (day: number) => {
    updateData({ preferredDay: day });
  };

  const handleTimeChange = (_event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      updateData({ preferredTime: `${hours}:${minutes}` });
    }
  };

  const handleNext = () => {
    console.log('🔘 Tentando avançar:', {
      preferredDay: state.preferredDay,
      preferredTime: state.preferredTime,
      canGoNext: canGoNext(),
    });
    if (canGoNext()) {
      nextStep();
    } else {
      console.warn('❌ Não pode avançar - dados faltando');
    }
  };

  // Calcular próxima aplicação
  const getNextApplicationPreview = (): string => {
    if (state.preferredDay === undefined || !state.preferredTime) {
      return 'Selecione dia e horário';
    }

    const today = new Date();
    const currentDay = today.getDay(); // 0 = domingo
    const [hours, minutes] = state.preferredTime.split(':').map(Number);

    // Calcular dias até o próximo dia da semana selecionado
    let daysUntilNext = state.preferredDay - currentDay;
    if (daysUntilNext < 0) {
      daysUntilNext += 7; // Próxima semana
    }
    if (daysUntilNext === 0) {
      // Se for hoje, verificar se já passou do horário
      const now = new Date();
      const selectedTimeToday = new Date();
      selectedTimeToday.setHours(hours, minutes, 0, 0);
      if (now > selectedTimeToday) {
        daysUntilNext = 7; // Próxima semana
      }
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    nextDate.setHours(hours, minutes, 0, 0);

    const dayName = DAY_NAMES[state.preferredDay];
    const timeStr = state.preferredTime;

    return `${dayName}, ${timeStr}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Quando você aplica?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Configure o dia e horário para receber lembretes semanais
        </Text>

        {/* Day Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Dia da semana
          </Text>
          <DayPicker selectedDay={state.preferredDay} onSelectDay={handleSelectDay} />
        </View>

        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Horário preferido
          </Text>
          <View style={styles.timePickerContainer}>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
                style={styles.timePicker}
                textColor={colors.text}
              />
            ) : (
              <>
                <OnboardingButton
                  label={`${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`}
                  onPress={() => setShowTimePicker(true)}
                  variant="secondary"
                  size="large"
                  style={styles.timeButton}
                />
                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </>
            )}
          </View>
        </View>

        {/* Preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
          <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
            Próxima aplicação:
          </Text>
          <Text style={[styles.previewValue, { color: colors.primary }]}>
            {getNextApplicationPreview()}
          </Text>
        </View>
      </View>

      {/* Botão Continuar */}
      <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
        <OnboardingButton
          label="Continuar"
          onPress={handleNext}
          variant="primary"
          size="large"
          disabled={!canGoNext()}
          accessibilityLabel="Continuar para permissões"
          accessibilityHint={
            canGoNext()
              ? 'Avança para configuração de notificações'
              : 'É necessário selecionar dia e horário para continuar'
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: ShotsyDesignTokens.spacing.xl,
  },
  title: {
    ...ShotsyDesignTokens.typography.h2,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  subtitle: {
    ...ShotsyDesignTokens.typography.body,
    marginBottom: ShotsyDesignTokens.spacing.xxl,
    lineHeight: 22,
  },
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  sectionLabel: {
    ...ShotsyDesignTokens.typography.label,
    marginBottom: ShotsyDesignTokens.spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerContainer: {
    alignItems: 'center',
  },
  timePicker: {
    width: '100%',
    height: 200,
  },
  timeButton: {
    minWidth: 120,
  },
  previewCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    alignItems: 'center',
    marginTop: ShotsyDesignTokens.spacing.lg,
  },
  previewLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: ShotsyDesignTokens.spacing.xs,
  },
  previewValue: {
    ...ShotsyDesignTokens.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  buttonContainer: {
    padding: ShotsyDesignTokens.spacing.xl,
    borderTopWidth: 1,
  },
});

