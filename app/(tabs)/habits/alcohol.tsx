// app/(tabs)/habits/alcohol.tsx
// Tela para registrar consumo de álcool

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wine, Check, X, Info, ChartBar } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ScalePress } from '@/components/animations';
import { useAlcoholLogs } from '@/hooks/useAlcoholLogs';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AlcoholScreen() {
  const colors = useColors();
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const {
    logs,
    loading,
    toggleAlcoholForDate,
    hasAlcoholOnDate,
    getLogForDate,
    getStats,
  } = useAlcoholLogs(format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd'));

  const [todayConsumed, setTodayConsumed] = useState<boolean | null>(null);
  const [drinksCount, setDrinksCount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pegar log de hoje (se existir)
  const todayLog = useMemo(() => {
    const todayStr = format(currentDate, 'yyyy-MM-dd');
    return getLogForDate(todayStr);
  }, [logs, currentDate, getLogForDate]);

  // Inicializar estado com log de hoje
  React.useEffect(() => {
    if (todayLog) {
      setTodayConsumed(todayLog.consumed);
      setDrinksCount(todayLog.drinks_count?.toString() || '');
      setNotes(todayLog.notes || '');
    }
  }, [todayLog]);

  // Stats
  const stats = useMemo(() => getStats(), [getStats]);

  // Gerar dias do mês atual
  const daysOfMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  // Handler para salvar log de hoje
  const handleSave = async () => {
    if (todayConsumed === null) {
      Alert.alert('Atenção', 'Por favor, indique se bebeu álcool hoje');
      return;
    }

    try {
      setSubmitting(true);
      const todayStr = format(currentDate, 'yyyy-MM-dd');

      await toggleAlcoholForDate(
        todayStr,
        todayConsumed,
        drinksCount ? parseInt(drinksCount, 10) : undefined,
        notes.trim() || undefined
      );

      Alert.alert('Salvo', 'Registro de álcool atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao salvar log de álcool:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para clicar em um dia do calendário
  const handleDayPress = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const log = getLogForDate(dayStr);
    
    if (log) {
      Alert.alert(
        format(day, "d 'de' MMMM", { locale: ptBR }),
        `${log.consumed ? 'Álcool consumido' : 'Sem álcool'}${
          log.drinks_count ? `\n${log.drinks_count} dose(s)` : ''
        }${log.notes ? `\n\n${log.notes}` : ''}`,
        [
          { text: 'Fechar', style: 'cancel' },
          {
            text: 'Editar',
            onPress: () => {
              // Preencher form com dados do dia selecionado
              setTodayConsumed(log.consumed);
              setDrinksCount(log.drinks_count?.toString() || '');
              setNotes(log.notes || '');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        format(day, "d 'de' MMMM", { locale: ptBR }),
        'Nenhum registro para este dia'
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Toggle para Hoje */}
        <View
          style={[
            styles.quickToggleCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            ShotsyDesignTokens.shadows.card,
          ]}
        >
          <View style={styles.cardHeader}>
            <Wine size={28} color={colors.primary} weight="regular" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Bebi álcool hoje?
            </Text>
          </View>

          <View style={styles.toggleButtons}>
            <TouchableOpacity
              onPress={() => setTodayConsumed(true)}
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    todayConsumed === true ? colors.error : colors.backgroundSecondary,
                  borderColor: todayConsumed === true ? colors.error : colors.border,
                },
              ]}
            >
              <Check
                size={20}
                color={todayConsumed === true ? '#FFFFFF' : colors.textSecondary}
                weight="bold"
              />
              <Text
                style={[
                  styles.toggleButtonText,
                  {
                    color: todayConsumed === true ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                SIM
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTodayConsumed(false)}
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    todayConsumed === false ? colors.success : colors.backgroundSecondary,
                  borderColor: todayConsumed === false ? colors.success : colors.border,
                },
              ]}
            >
              <X
                size={20}
                color={todayConsumed === false ? '#FFFFFF' : colors.textSecondary}
                weight="bold"
              />
              <Text
                style={[
                  styles.toggleButtonText,
                  {
                    color: todayConsumed === false ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                NÃO
              </Text>
            </TouchableOpacity>
          </View>

          {todayConsumed && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Quantas doses? (opcional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Ex: 2"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={drinksCount}
                  onChangeText={setDrinksCount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Observações (opcional)
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Adicione observações..."
                  placeholderTextColor={colors.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </>
          )}

          <ScalePress
            onPress={handleSave}
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            hapticType="medium"
            disabled={submitting || todayConsumed === null}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </ScalePress>
        </View>

        {/* Estatísticas */}
        {stats.totalDaysLogged > 0 && (
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            <View style={styles.statsHeader}>
              <ChartBar size={24} color={colors.text} weight="regular" />
              <Text style={[styles.statsTitle, { color: colors.text }]}>
                Estatísticas do Mês
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.daysWithAlcohol}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Dias com álcool
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.daysWithoutAlcohol}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Dias sem álcool
                </Text>
              </View>

              {stats.totalDrinks > 0 && (
                <>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.warning }]}>
                      {stats.totalDrinks}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Total de doses
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.avgDrinksPerDay}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Média por dia
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Calendário Visual */}
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            ShotsyDesignTokens.shadows.card,
          ]}
        >
          <Text style={[styles.calendarTitle, { color: colors.text }]}>
            {format(currentDate, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}
          </Text>

          <View style={styles.calendar}>
            {daysOfMonth.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const hasAlcohol = hasAlcoholOnDate(dayStr);
              const isCurrentDay = isToday(day);

              return (
                <TouchableOpacity
                  key={dayStr}
                  onPress={() => handleDayPress(day)}
                  style={[
                    styles.calendarDay,
                    {
                      backgroundColor: hasAlcohol
                        ? colors.errorBackground
                        : colors.backgroundSecondary,
                      borderColor: isCurrentDay ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      {
                        color: hasAlcohol ? colors.error : colors.text,
                        fontWeight: isCurrentDay ? '700' : '400',
                      },
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                  {hasAlcohol && (
                    <Wine size={12} color={colors.error} weight="fill" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Aviso de Privacidade */}
        <View style={[styles.privacyCard, { backgroundColor: colors.infoBackground }]}>
          <Info size={20} color={colors.info} weight="regular" />
          <Text style={[styles.privacyText, { color: colors.info }]}>
            Seus dados de álcool são privados e criptografados. Apenas você pode vê-los.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: ShotsyDesignTokens.spacing.lg,
    gap: ShotsyDesignTokens.spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickToggleCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
    gap: ShotsyDesignTokens.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  cardTitle: {
    ...ShotsyDesignTokens.typography.h3,
    fontWeight: '700',
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    borderWidth: 2,
  },
  toggleButtonText: {
    ...ShotsyDesignTokens.typography.button,
    fontWeight: '700',
  },
  inputGroup: {
    gap: ShotsyDesignTokens.spacing.xs,
  },
  inputLabel: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '600',
  },
  input: {
    ...ShotsyDesignTokens.typography.body,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    padding: ShotsyDesignTokens.spacing.md,
    borderWidth: 1,
  },
  textArea: {
    ...ShotsyDesignTokens.typography.body,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    padding: ShotsyDesignTokens.spacing.md,
    minHeight: 60,
    borderWidth: 1,
  },
  saveButton: {
    paddingVertical: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ShotsyDesignTokens.spacing.xs,
  },
  saveButtonText: {
    ...ShotsyDesignTokens.typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
    gap: ShotsyDesignTokens.spacing.md,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  statsTitle: {
    ...ShotsyDesignTokens.typography.h4,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ShotsyDesignTokens.spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
  },
  statValue: {
    ...ShotsyDesignTokens.typography.h2,
    fontWeight: '700',
  },
  statLabel: {
    ...ShotsyDesignTokens.typography.caption,
    textAlign: 'center',
  },
  calendarCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
    gap: ShotsyDesignTokens.spacing.md,
  },
  calendarTitle: {
    ...ShotsyDesignTokens.typography.h4,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ShotsyDesignTokens.spacing.xs,
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 2,
  },
  calendarDayText: {
    ...ShotsyDesignTokens.typography.caption,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    padding: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
  },
  privacyText: {
    ...ShotsyDesignTokens.typography.caption,
    flex: 1,
  },
});

