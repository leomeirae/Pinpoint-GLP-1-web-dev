// components/onboarding/ProgressIndicator.tsx
// Indicador de progresso com 5 dots para onboarding core

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

interface ProgressIndicatorProps {
  currentStep: number; // 1-5
  totalSteps?: number; // Default: 5
}

export function ProgressIndicator({ currentStep, totalSteps = 5 }: ProgressIndicatorProps) {
  const colors = useColors();

  return (
    <View style={styles.container} accessibilityLabel={`Passo ${currentStep} de ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <View
            key={stepNumber}
            style={[
              styles.dot,
              {
                backgroundColor: isActive
                  ? colors.primary
                  : isCompleted
                    ? colors.primary
                    : colors.border,
                opacity: isActive ? 1 : isCompleted ? 0.6 : 0.3,
              },
            ]}
            accessibilityLabel={
              isCompleted
                ? `Passo ${stepNumber} concluído`
                : isActive
                  ? `Passo ${stepNumber} atual`
                  : `Passo ${stepNumber} não iniciado`
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    paddingVertical: ShotsyDesignTokens.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

