// components/finance/CostPerKgOptInModal.tsx
// Modal para opt-in do cálculo R$/kg

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { CheckCircle, Circle, Info } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ScalePress } from '@/components/animations';

interface CostPerKgOptInModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function CostPerKgOptInModal({
  visible,
  onAccept,
  onDecline,
}: CostPerKgOptInModalProps) {
  const colors = useColors();
  const [understood, setUnderstood] = useState(false);

  const handleAccept = () => {
    if (understood) {
      onAccept();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Ícone */}
            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Info size={48} color={colors.warning} weight="regular" />
            </View>

            {/* Título */}
            <Text style={[styles.title, { color: colors.text }]}>
              Calcular custo por kg perdido?
            </Text>

            {/* Descrição */}
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Esta métrica calcula o <Text style={styles.bold}>custo financeiro</Text> para cada
                quilo perdido durante o tratamento.
              </Text>

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                É um <Text style={styles.bold}>indicador econômico</Text>, não uma medida clínica
                de sucesso do tratamento.
              </Text>

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                O objetivo é ajudar você a{' '}
                <Text style={styles.bold}>acompanhar o investimento</Text> em seu tratamento.
              </Text>
            </View>

            {/* Checkbox de confirmação */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setUnderstood(!understood)}
              activeOpacity={0.7}
              accessibilityLabel="Entendo que este é apenas um indicador financeiro"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: understood }}
            >
              {understood ? (
                <CheckCircle size={24} color={colors.primary} weight="fill" />
              ) : (
                <Circle size={24} color={colors.textMuted} weight="regular" />
              )}
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Entendo que este é apenas um indicador financeiro
              </Text>
            </TouchableOpacity>

            {/* Botões */}
            <View style={styles.buttons}>
              <ScalePress
                onPress={onDecline}
                style={[
                  styles.button,
                  styles.buttonSecondary,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                ]}
                hapticType="light"
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>Não, obrigado</Text>
              </ScalePress>

              <ScalePress
                onPress={handleAccept}
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  { backgroundColor: understood ? colors.primary : colors.backgroundSecondary },
                ]}
                hapticType="medium"
                disabled={!understood}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: understood ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  Sim, mostrar
                </Text>
              </ScalePress>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ShotsyDesignTokens.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    ...Platform.select({
      ios: ShotsyDesignTokens.shadows.modal,
      android: {
        elevation: 8,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  title: {
    ...ShotsyDesignTokens.typography.h3,
    textAlign: 'center',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  descriptionContainer: {
    gap: ShotsyDesignTokens.spacing.sm,
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  description: {
    ...ShotsyDesignTokens.typography.body,
    textAlign: 'left',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    marginBottom: ShotsyDesignTokens.spacing.lg,
    paddingVertical: ShotsyDesignTokens.spacing.sm,
  },
  checkboxLabel: {
    ...ShotsyDesignTokens.typography.body,
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonPrimary: {},
  buttonText: {
    ...ShotsyDesignTokens.typography.button,
  },
});

