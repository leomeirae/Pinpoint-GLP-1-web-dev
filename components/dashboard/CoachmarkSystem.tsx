import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { trackEvent } from '@/lib/analytics';

const COACHMARKS_SEEN_KEY = '@app:coachmarks_seen_v1';

interface Coachmark {
  id: string;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

const coachmarks: Coachmark[] = [
  { id: 'add_dose', title: 'Adicionar Dose', description: 'Toque aqui para registrar sua primeira aplicação de medicamento.', actionText: 'Registrar agora', onAction: () => router.push('/(tabs)/add-application') },
  { id: 'add_weight', title: 'Registrar Peso', description: 'Acompanhe seu progresso registrando seu peso regularmente.', actionText: 'Pesar agora', onAction: () => router.push('/(tabs)/add-weight') },
  { id: 'add_purchase', title: 'Adicionar Compra', description: 'Use o módulo de custos para acompanhar seus gastos com o tratamento.', actionText: 'Adicionar compra', onAction: () => router.push('/(tabs)/add-purchase') },
  { id: 'mark_alcohol', title: 'Registrar Álcool', description: 'Marque os dias de consumo de álcool para entender seu impacto.', actionText: 'Ver módulo', onAction: () => router.push('/(tabs)/alcohol') },
  { id: 'pause_treatment', title: 'Pausar Tratamento', description: 'Precisa de uma pausa? Você pode suspender os lembretes aqui.', actionText: 'Saber mais', onAction: () => router.push('/(tabs)/pauses') },
];

export function CoachmarkSystem() {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkCoachmarks = async () => {
      const seen = await AsyncStorage.getItem(COACHMARKS_SEEN_KEY);
      if (seen !== 'true') {
        setCurrentIndex(0); // Inicia a sequência
        trackEvent('coachmark_sequence_started');
      }
    };
    checkCoachmarks();
  }, []);

  const handleDismiss = async () => {
    trackEvent('coachmark_dismissed', { coachmark_id: coachmarks[currentIndex!].id });
    await AsyncStorage.setItem(COACHMARKS_SEEN_KEY, 'true');
    setCurrentIndex(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAction = () => {
    const coachmark = coachmarks[currentIndex!];
    trackEvent('coachmark_action_clicked', { coachmark_id: coachmark.id });
    coachmark.onAction(); // Executa a navegação
    handleDismiss(); // Fecha o sistema após a ação
  };

  const handleNext = () => {
      if (currentIndex !== null && currentIndex < coachmarks.length - 1) {
          setCurrentIndex(currentIndex + 1);
          trackEvent('coachmark_next', { from: coachmarks[currentIndex].id, to: coachmarks[currentIndex + 1].id });
      } else {
          handleDismiss(); // Fecha no final da sequência
      }
  };

  if (currentIndex === null) {
    return null;
  }

  const currentCoachmark = coachmarks[currentIndex];

  return (
    <View style={styles.overlay}>
      <View style={[styles.popover, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{currentCoachmark.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{currentCoachmark.description}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleDismiss}>
            <Text style={[styles.buttonText, { color: colors.textMuted }]}>Ver depois</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAction}>
            <Text style={[styles.buttonText, { color: colors.primary, fontWeight: 'bold' }]}>{currentCoachmark.actionText}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progress}>
            {coachmarks.map((_, index) => (
                <View key={index} style={[styles.dot, { backgroundColor: index === currentIndex ? colors.primary : colors.border }]} />
            ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popover: {
    width: '100%',
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    ...ShotsyDesignTokens.shadows.modal,
  },
  title: {
    ...ShotsyDesignTokens.typography.h4,
    marginBottom: 8,
  },
  description: {
    ...ShotsyDesignTokens.typography.body,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 24,
  },
  buttonText: {
    ...ShotsyDesignTokens.typography.button,
  },
  progress: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
      gap: 8,
  },
  dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
  }
});
