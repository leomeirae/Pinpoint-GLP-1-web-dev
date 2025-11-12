import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';

interface TargetWeightScreenProps {
  onNext: (data: { targetWeight: number }) from => void;
  onBack: () => void;
  onSkip: () => void;
  currentWeight: number;
  height: number;
}

const calculateBmi = (weight: number, heightCm: number) => {
  if (heightCm === 0) return 0;
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
};

export function TargetWeightScreen({
  onNext,
  onBack,
  onSkip,
  currentWeight = 80,
  height = 170,
}: TargetWeightScreenProps) {
  const colors = useColors();

  const initialTarget = Math.round(currentWeight * 0.9); // Sugestão inicial de 10% de perda
  const [targetWeight, setTargetWeight] = useState(initialTarget);

  const weightRange = useMemo(() => {
    const min = Math.max(40, Math.round(currentWeight * 0.7)); // Mínimo de 40kg ou 70% do peso atual
    const max = currentWeight;
    return { min, max };
  }, [currentWeight]);

  const bmi = useMemo(() => calculateBmi(targetWeight, height), [targetWeight, height]);

  const handleNext = () => {
    onNext({ targetWeight });
  };

  return (
    <OnboardingScreenBase
      title="Qual peso você gostaria de alcançar?"
      subtitle="Ter uma meta em mente pode ajudar muito na motivação!"
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.weightDisplay}>
            <Text style={[styles.weightValue, { color: colors.text }]}>
              {targetWeight}kg
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={weightRange.min}
              maximumValue={weightRange.max}
              step={1}
              value={targetWeight}
              onValueChange={(value) => {
                setTargetWeight(Math.round(value));
                Haptics.selectionAsync();
              }}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.rangeLabels}>
              <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>{weightRange.min}kg</Text>
              <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>{weightRange.max}kg</Text>
            </View>
          </View>
        </View>

        <ShotsyButton
            title="Não tenho certeza"
            onPress={onSkip}
            variant="ghost"
        />
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
  },
  weightDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  weightValue: {
    ...ShotsyDesignTokens.typography.h1,
    fontSize: 48,
  },
  sliderContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    ...ShotsyDesignTokens.typography.caption,
  },
});
