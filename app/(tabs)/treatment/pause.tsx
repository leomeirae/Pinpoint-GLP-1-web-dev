// app/(tabs)/treatment/pause.tsx
// Tela para gerenciar pausas no tratamento

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pause, Play, CalendarBlank, Clock, X } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ScalePress } from '@/components/animations';
import { useTreatmentPauses } from '@/hooks/useTreatmentPauses';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PAUSE_REASONS = [
  { value: 'efeitos_colaterais', label: 'Efeitos Colaterais' },
  { value: 'viagem', label: 'Viagem' },
  { value: 'orientacao_medica', label: 'Orientação Médica' },
  { value: 'outro', label: 'Outro' },
];

export default function PauseScreen() {
  const colors = useColors();
  const {
    pauses,
    activePause,
    loading,
    startPause,
    endPause,
    getPauseDuration,
    refetch,
  } = useTreatmentPauses();

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPaused = useMemo(() => activePause !== null, [activePause]);

  // Handler para iniciar pausa
  const handleStartPause = async () => {
    if (!selectedReason) {
      Alert.alert('Atenção', 'Por favor, selecione um motivo para a pausa');
      return;
    }

    try {
      setSubmitting(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      await startPause({
        start_date: today,
        reason: selectedReason,
        notes: notes.trim() || undefined,
      });

      setShowModal(false);
      setSelectedReason('');
      setNotes('');
      
      Alert.alert(
        'Tratamento Pausado',
        'Seus lembretes foram pausados automaticamente. Você pode retomar quando quiser.'
      );
    } catch (error) {
      console.error('Erro ao pausar tratamento:', error);
      Alert.alert('Erro', 'Não foi possível pausar o tratamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para encerrar pausa
  const handleEndPause = () => {
    Alert.alert(
      'Retomar Tratamento',
      'Deseja retomar seu tratamento? Seus lembretes serão reagendados automaticamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retomar',
          style: 'default',
          onPress: async () => {
            try {
              if (!activePause) return;
              
              setSubmitting(true);
              const today = format(new Date(), 'yyyy-MM-dd');
              
              await endPause(activePause.id, today);
              
              Alert.alert(
                'Tratamento Retomado',
                'Seus lembretes foram reagendados. Continue acompanhando seu progresso!'
              );
            } catch (error) {
              console.error('Erro ao retomar tratamento:', error);
              Alert.alert('Erro', 'Não foi possível retomar o tratamento. Tente novamente.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // Formatar duração de pausa
  const formatDuration = (pause: any): string => {
    const duration = getPauseDuration(pause);
    if (duration === 0) return 'Menos de 1 dia';
    if (duration === 1) return '1 dia';
    return `${duration} dias`;
  };

  // Obter label de motivo
  const getReasonLabel = (value: string): string => {
    return PAUSE_REASONS.find((r) => r.value === value)?.label || value;
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
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            ShotsyDesignTokens.shadows.card,
          ]}
        >
          <View style={styles.statusHeader}>
            {isPaused ? (
              <Pause size={32} color={colors.warning} weight="regular" />
            ) : (
              <Play size={32} color={colors.success} weight="regular" />
            )}
            <Text
              style={[
                styles.statusTitle,
                { color: isPaused ? colors.warning : colors.success },
              ]}
            >
              {isPaused ? 'Tratamento Pausado' : 'Tratamento Ativo'}
            </Text>
          </View>

          {isPaused && activePause && (
            <View style={styles.pauseInfo}>
              <View style={styles.infoRow}>
                <CalendarBlank size={20} color={colors.textSecondary} weight="regular" />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Pausado desde {format(new Date(activePause.start_date), "d 'de' MMMM", { locale: ptBR })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Clock size={20} color={colors.textSecondary} weight="regular" />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Duração: {formatDuration(activePause)}
                </Text>
              </View>
              {activePause.reason && (
                <View style={[styles.reasonBadge, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.reasonText, { color: colors.text }]}>
                    {getReasonLabel(activePause.reason)}
                  </Text>
                </View>
              )}
              {activePause.notes && (
                <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                  {activePause.notes}
                </Text>
              )}
            </View>
          )}

          <ScalePress
            onPress={isPaused ? handleEndPause : () => setShowModal(true)}
            style={[
              styles.actionButton,
              {
                backgroundColor: isPaused ? colors.success : colors.warning,
              },
            ]}
            hapticType="medium"
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                {isPaused ? (
                  <Play size={20} color="#FFFFFF" weight="bold" />
                ) : (
                  <Pause size={20} color="#FFFFFF" weight="bold" />
                )}
                <Text style={styles.actionButtonText}>
                  {isPaused ? 'Retomar Tratamento' : 'Pausar Tratamento'}
                </Text>
              </>
            )}
          </ScalePress>
        </View>

        {/* Timeline de Pausas Anteriores */}
        {pauses.length > (isPaused ? 1 : 0) && (
          <View style={styles.timelineSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Histórico de Pausas
            </Text>

            {pauses
              .filter((p) => p.end_date !== null)
              .map((pause) => (
                <View
                  key={pause.id}
                  style={[
                    styles.timelineCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.timelineHeader}>
                    <Text style={[styles.timelineDate, { color: colors.text }]}>
                      {format(new Date(pause.start_date), "d 'de' MMM", { locale: ptBR })} -{' '}
                      {pause.end_date
                        ? format(new Date(pause.end_date), "d 'de' MMM", { locale: ptBR })
                        : 'Em andamento'}
                    </Text>
                    <Text style={[styles.timelineDuration, { color: colors.textSecondary }]}>
                      {formatDuration(pause)}
                    </Text>
                  </View>
                  {pause.reason && (
                    <Text style={[styles.timelineReason, { color: colors.textSecondary }]}>
                      {getReasonLabel(pause.reason)}
                    </Text>
                  )}
                  {pause.notes && (
                    <Text style={[styles.timelineNotes, { color: colors.textMuted }]}>
                      {pause.notes}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de Pausa */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Pausar Tratamento?
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={colors.textSecondary} weight="bold" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalWarning, { color: colors.textSecondary }]}>
              Seus lembretes serão pausados automaticamente
            </Text>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>
                Motivo da pausa
              </Text>
              {PAUSE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  onPress={() => setSelectedReason(reason.value)}
                  style={[
                    styles.reasonOption,
                    {
                      backgroundColor:
                        selectedReason === reason.value
                          ? colors.primaryBackground
                          : colors.backgroundSecondary,
                      borderColor:
                        selectedReason === reason.value ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.reasonOptionText,
                      {
                        color:
                          selectedReason === reason.value ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>
                Observações (opcional)
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Adicione observações sobre a pausa..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.modalButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStartPause}
                style={[styles.modalButton, { backgroundColor: colors.warning }]}
                disabled={submitting || !selectedReason}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Confirmar Pausa</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statusCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
    gap: ShotsyDesignTokens.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  statusTitle: {
    ...ShotsyDesignTokens.typography.h3,
    fontWeight: '700',
  },
  pauseInfo: {
    gap: ShotsyDesignTokens.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
  },
  infoText: {
    ...ShotsyDesignTokens.typography.body,
  },
  reasonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: ShotsyDesignTokens.spacing.sm,
    paddingVertical: ShotsyDesignTokens.spacing.xs,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    marginTop: ShotsyDesignTokens.spacing.xs,
  },
  reasonText: {
    ...ShotsyDesignTokens.typography.caption,
    fontWeight: '600',
  },
  notesText: {
    ...ShotsyDesignTokens.typography.body,
    fontStyle: 'italic',
    marginTop: ShotsyDesignTokens.spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ShotsyDesignTokens.spacing.xs,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    marginTop: ShotsyDesignTokens.spacing.xs,
  },
  actionButtonText: {
    ...ShotsyDesignTokens.typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timelineSection: {
    gap: ShotsyDesignTokens.spacing.md,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h4,
    fontWeight: '600',
  },
  timelineCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.md,
    borderWidth: 1,
    gap: ShotsyDesignTokens.spacing.xs,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineDate: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '600',
  },
  timelineDuration: {
    ...ShotsyDesignTokens.typography.caption,
  },
  timelineReason: {
    ...ShotsyDesignTokens.typography.caption,
  },
  timelineNotes: {
    ...ShotsyDesignTokens.typography.caption,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: ShotsyDesignTokens.borderRadius.xl,
    borderTopRightRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    gap: ShotsyDesignTokens.spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...ShotsyDesignTokens.typography.h3,
    fontWeight: '700',
  },
  modalWarning: {
    ...ShotsyDesignTokens.typography.body,
    fontStyle: 'italic',
  },
  modalSection: {
    gap: ShotsyDesignTokens.spacing.sm,
  },
  modalLabel: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '600',
  },
  reasonOption: {
    padding: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    borderWidth: 1.5,
  },
  reasonOptionText: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '500',
  },
  notesInput: {
    ...ShotsyDesignTokens.typography.body,
    borderRadius: ShotsyDesignTokens.borderRadius.md,
    padding: ShotsyDesignTokens.spacing.md,
    minHeight: 80,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.sm,
    marginTop: ShotsyDesignTokens.spacing.xs,
  },
  modalButton: {
    flex: 1,
    padding: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    ...ShotsyDesignTokens.typography.button,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    ...ShotsyDesignTokens.typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

