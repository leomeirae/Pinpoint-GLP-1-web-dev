// app/(onboarding)/Permissions.tsx
// Tela 5: Solicitar permissão de notificações

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/clerk';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboardingContext } from '@/hooks/OnboardingContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  registerForPushNotifications,
  scheduleWeeklyReminderWithWindow,
} from '@/lib/notifications';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Permissions');

export default function PermissionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { state } = useOnboardingContext();
  const { saveOnboarding5CoreData } = useOnboarding();

  const handleAllowNotifications = async () => {
    try {
      const status = await registerForPushNotifications();
      if (status === 'granted') {
        // Agendar primeira notificação semanal (C2)
        if (
          state.preferredDay !== undefined &&
          state.preferredTime &&
          state.preferredDay >= 0 &&
          state.preferredDay <= 6
        ) {
          logger.info('Agendando lembrete semanal', {
            day: state.preferredDay,
            time: state.preferredTime,
          });

          // Janela padrão: 4h de duração
          const [hour, minute] = state.preferredTime.split(':').map(Number);
          const endHour = (hour + 4) % 24;
          const windowEnd = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

          const result = await scheduleWeeklyReminderWithWindow(
            state.preferredDay,
            state.preferredTime,
            windowEnd
          );

          if (result) {
            logger.info('Lembrete agendado com sucesso', result);
          } else {
            logger.warn('Falha ao agendar lembrete');
          }
        } else {
          logger.warn('Dados insuficientes para agendar lembrete', {
            preferredDay: state.preferredDay,
            preferredTime: state.preferredTime,
          });
        }
      }
      // Avançar mesmo se não permitir (não bloqueante)
      handleComplete();
    } catch (error) {
      logger.error('Erro ao solicitar notificações', error as Error);
      // Avançar mesmo se houver erro
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      // Salvar dados do onboarding
      const isGuestMode = !isSignedIn;
      await saveOnboarding5CoreData(
        {
          medication: state.medication,
          dosage: state.dosage,
          preferredDay: state.preferredDay,
          preferredTime: state.preferredTime,
          consentVersion: state.consentVersion,
          consentAcceptedAt: state.consentAcceptedAt,
          analyticsOptIn: state.analyticsOptIn,
        },
        isGuestMode
      );

      // Finalizar onboarding e redirecionar para dashboard
      // Usar setTimeout para garantir que Root Layout está montado
      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 100);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Mesmo com erro, redirecionar para dashboard
      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 100);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Ícone */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Bell size={64} color={colors.primary} weight="bold" />
        </View>

        {/* Título */}
        <Text style={[styles.title, { color: colors.text }]}>
          Nunca esqueça sua dose semanal
        </Text>

        {/* Descrição */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Receba lembretes semanais no dia e horário que você configurou. Você pode alterar
          isso a qualquer momento nas configurações.
        </Text>

        {/* Preview do lembrete */}
        {state.preferredDay !== undefined && state.preferredTime && (
          <View style={[styles.previewCard, { backgroundColor: colors.card }, ShotsyDesignTokens.shadows.card]}>
            <Bell size={20} color={colors.primary} weight="bold" />
            <View style={styles.previewTextContainer}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>
                Lembrete configurado
              </Text>
              <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
                Toda semana às {state.preferredTime}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Botões */}
      <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
        <OnboardingButton
          label="Permitir Notificações"
          onPress={handleAllowNotifications}
          variant="primary"
          size="large"
          style={styles.primaryButton}
          accessibilityLabel="Permitir notificações"
          accessibilityHint="Solicita permissão para enviar lembretes semanais"
        />
        <OnboardingButton
          label="Pular"
          onPress={handleSkip}
          variant="ghost"
          size="medium"
          accessibilityLabel="Pular configuração de notificações"
          accessibilityHint="Continua sem ativar notificações, você pode configurar depois"
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  title: {
    ...ShotsyDesignTokens.typography.h2,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  description: {
    ...ShotsyDesignTokens.typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: ShotsyDesignTokens.spacing.xxl,
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewTitle: {
    ...ShotsyDesignTokens.typography.label,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewSubtitle: {
    ...ShotsyDesignTokens.typography.caption,
    fontSize: 14,
  },
  buttonContainer: {
    padding: ShotsyDesignTokens.spacing.xl,
    borderTopWidth: 1,
    gap: ShotsyDesignTokens.spacing.md,
  },
  primaryButton: {
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
});

