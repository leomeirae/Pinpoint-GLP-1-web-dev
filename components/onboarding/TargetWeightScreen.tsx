import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface TargetWeightScreenProps {
  onNext: (data: { targetWeight: number }) => void;
  onBack: () => void;
  weightUnit?: 'kg' | 'lb';
  currentWeight?: number;
  startingWeight?: number;
  height?: number;
}

// Função auxiliar para calcular IMC
const calculateBMI = (weightKg: number, heightCm: number) => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// Função para categorizar IMC
const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Baixo Peso', color: '#A855F7' };
  if (bmi < 25) return { label: 'Peso Normal', color: '#10B981' };
  if (bmi < 30) return { label: 'Sobrepeso', color: '#F59E0B' };
  return { label: 'Obesidade', color: '#EF4444' };
};

export function TargetWeightScreen({
  onNext,
  onBack,
  weightUnit = 'kg',
  currentWeight = 0,
  startingWeight = 0,
  height = 170,
}: TargetWeightScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  
  // Calcular range inteligente baseado no peso atual
  const minWeight = Math.max(40, Math.floor(currentWeight * 0.7)); // -30% do atual
  const maxWeight = Math.ceil(currentWeight * 0.95); // -5% do atual
  
  const [targetWeight, setTargetWeight] = useState(
    Math.round((minWeight + maxWeight) / 2)
  );

  const handleNext = () => {
    onNext({ targetWeight });
  };

  const targetBMI = calculateBMI(targetWeight, height);
  const bmiCategory = getBMICategory(targetBMI);
  const weightToLose = currentWeight - targetWeight;

  const isValid = targetWeight < currentWeight && targetWeight >= minWeight;

  return (
    <OnboardingScreenBase
      title="Qual é o seu peso meta?"
      subtitle="Defina um objetivo realista e saudável"
      onNext={handleNext}
      onBack={onBack}
      disableNext={!isValid}
    >
      <View style={styles.content}>
        {/* Main Slider Card */}
        <ShotsyCard variant="elevated" style={styles.sliderCard}>
          {/* Big Weight Display */}
          <Text style={[styles.weightValue, { color: colors.text }]}>
            {targetWeight.toFixed(1)}{weightUnit}
          </Text>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={minWeight}
              maximumValue={maxWeight}
              step={0.5}
              value={targetWeight}
              onValueChange={(value) => {
                setTargetWeight(Math.round(value * 2) / 2); // Round to 0.5
                Haptics.selectionAsync();
              }}
              minimumTrackTintColor={currentAccent}
              maximumTrackTintColor={colors.border}
              thumbTintColor={currentAccent}
            />
            {/* Weight Range Labels */}
            <View style={styles.rangeLabels}>
              <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>
                {minWeight}{weightUnit}
              </Text>
              <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>
                {maxWeight}{weightUnit}
              </Text>
            </View>
          </View>

          {/* BMI Display */}
          <View style={styles.bmiDisplay}>
            <Text style={[styles.bmiValue, { color: bmiCategory.color }]}>
              IMC: {targetBMI.toFixed(1)}
            </Text>
            <View
              style={[
                styles.bmiPill,
                { backgroundColor: bmiCategory.color + '20' },
              ]}
            >
              <Text style={[styles.bmiLabelText, { color: bmiCategory.color }]}>
                {bmiCategory.label}
              </Text>
            </View>
          </View>

          {/* BMI Category Bar */}
          <View style={styles.bmiBarContainer}>
            <View style={styles.bmiBar}>
              {/* Underweight */}
              <View style={[styles.bmiSegment, { flex: 1.85, backgroundColor: '#A855F7' }]} />
              {/* Normal */}
              <View style={[styles.bmiSegment, { flex: 0.65, backgroundColor: '#10B981' }]} />
              {/* Overweight */}
              <View style={[styles.bmiSegment, { flex: 0.5, backgroundColor: '#F59E0B' }]} />
              {/* Obese */}
              <View style={[styles.bmiSegment, { flex: 1, backgroundColor: '#EF4444' }]} />
              
              {/* Current BMI Indicator */}
              <View
                style={[
                  styles.bmiIndicator,
                  {
                    left: `${Math.min(Math.max((targetBMI / 40) * 100, 0), 100)}%`,
                    backgroundColor: currentAccent,
                  },
                ]}
              />
            </View>

            {/* Labels */}
            <View style={styles.bmiLabels}>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#A855F7' }]}>Baixo</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>&lt;18.5</Text>
              </View>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#10B981' }]}>Normal</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>18.5-25</Text>
              </View>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#F59E0B' }]}>Alto</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>25-30</Text>
              </View>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#EF4444' }]}>Muito Alto</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>30+</Text>
              </View>
            </View>
          </View>
        </ShotsyCard>

        {/* Progress Summary */}
        <ShotsyCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Perder:
            </Text>
            <Text style={[styles.summaryValue, { color: currentAccent }]}>
              {weightToLose.toFixed(1)} {weightUnit}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Do peso atual:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {currentWeight.toFixed(1)} {weightUnit}
            </Text>
          </View>
        </ShotsyCard>

        <Text style={styles.emoji}>🎯</Text>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  sliderCard: {
    padding: 24,
    alignItems: 'center',
  },
  weightValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 24,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: 12,
  },
  bmiDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  bmiPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bmiLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bmiBarContainer: {
    width: '100%',
  },
  bmiBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  bmiSegment: {
    height: '100%',
  },
  bmiIndicator: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 20,
    borderRadius: 2,
    marginLeft: -2,
  },
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiLabelItem: {
    alignItems: 'center',
    flex: 1,
  },
  bmiCategoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  bmiRange: {
    fontSize: 10,
    marginTop: 2,
  },
  summaryCard: {
    padding: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
  },
});
