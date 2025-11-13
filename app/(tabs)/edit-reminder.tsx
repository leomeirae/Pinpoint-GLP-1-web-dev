// app/(tabs)/edit-reminder.tsx
// Tela de edição de horário do lembrete semanal (C2)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { DayPicker } from '@/components/onboarding/DayPicker';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useUser } from '@/hooks/useUser';
import {
  updateWeeklyReminder,
  getScheduledWeeklyReminder,
  cancelWeeklyReminders,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditReminder');

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function EditReminderScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar dados atuais do usuário
  useEffect(() => {
    if (user && !userLoading) {
      if (user.preferred_day !== undefined && user.preferred_day !== null) {
        setSelectedDay(user.preferred_day);
      }
      if (user.preferred_time) {
        const [hours, minutes] = user.preferred_time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours || 18, minutes || 0, 0, 0);
        setSelectedTime(date);
      }
    }
  }, [user, userLoading]);

  const handleTimeChange = (_event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  const getNextReminderPreview = (): string => {
    if (selectedDay === undefined) {
      return 'Selecione o dia da semana';
    }

    const today = new Date();
    const currentDay = today.getDay();
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();

    // Calcular dias até o próximo dia da semana selecionado
    let daysUntilNext = selectedDay - currentDay;
    if (daysUntilNext < 0) {
      daysUntilNext += 7;
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

    const dayName = DAY_NAMES[selectedDay];
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return `${dayName}, ${timeStr}`;
  };

  const handleSave = async () => {
    if (selectedDay === undefined) {
      Alert.alert('Atenção', 'Selecione um dia da semana');
      return;
    }

    setSaving(true);
    try {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      logger.info('Salvando novo horário de lembrete', {
        day: selectedDay,
        time: timeStr,
      });

      // 1. Atualizar no Supabase
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update({
            preferred_day: selectedDay,
            preferred_time: timeStr,
          })
          .eq('id', user.id);

        if (error) {
          // Ignorar erros de cache do PostgREST (bug conhecido)
          if (error.code === 'PGRST204' || error.code === 'PGRST202') {
            logger.warn('PostgREST cache issue, mas continuando...', { code: error.code });
          } else {
            throw error;
          }
        }
      }

      // 2. Atualizar notificação local
      const success = await updateWeeklyReminder(selectedDay, timeStr);

      if (success) {
        Alert.alert(
          'Lembrete atualizado',
          `Novo lembrete: ${getNextReminderPreview()}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Atenção', 'Lembrete foi atualizado, mas pode não disparar corretamente');
        router.back();
      }
    } catch (error) {
      logger.error('Erro ao salvar lembrete', error as Error);
      Alert.alert('Erro', 'Não foi possível salvar o lembrete');
    } finally {
      setSaving(false);
    }
  };

  const handleDisableReminder = async () => {
    Alert.alert(
      'Desativar lembretes',
      'Tem certeza que deseja desativar os lembretes semanais?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelWeeklyReminders();
              Alert.alert('Lembretes desativados', 'Você pode reativá-los a qualquer momento', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              logger.error('Erro ao cancelar lembretes', error as Error);
              Alert.alert('Erro', 'Não foi possível desativar os lembretes');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Editar Lembrete',
          headerShown: true,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Dia da semana */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Dia da semana</Text>
            <DayPicker selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          </View>

          {/* Horário */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Horário preferido</Text>
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
              Próximo lembrete:
            </Text>
            <Text style={[styles.previewValue, { color: colors.primary }]}>
              {getNextReminderPreview()}
            </Text>
          </View>
        </View>

        {/* Botões */}
        <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
          <OnboardingButton
            label={saving ? 'Salvando...' : 'Salvar'}
            onPress={handleSave}
            variant="primary"
            size="large"
            disabled={saving || selectedDay === undefined}
            accessibilityLabel="Salvar alterações"
          />
          <OnboardingButton
            label="Desativar Lembretes"
            onPress={handleDisableReminder}
            variant="ghost"
            size="medium"
            accessibilityLabel="Desativar lembretes semanais"
          />
        </View>
      </SafeAreaView>
    </>
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
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  sectionLabel: {
    ...ShotsyDesignTokens.typography.label,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  timePickerContainer: {
    alignItems: 'center',
  },
  timePicker: {
    width: '100%',
    maxWidth: 400,
  },
  timeButton: {
    minWidth: 120,
  },
  previewCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.xl,
    alignItems: 'center',
  },
  previewLabel: {
    ...ShotsyDesignTokens.typography.caption,
    fontSize: 14,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  previewValue: {
    ...ShotsyDesignTokens.typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  buttonContainer: {
    padding: ShotsyDesignTokens.spacing.xl,
    borderTopWidth: 1,
    gap: ShotsyDesignTokens.spacing.md,
  },
});

