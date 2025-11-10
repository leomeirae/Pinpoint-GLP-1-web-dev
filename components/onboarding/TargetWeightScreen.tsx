import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface TargetWeightScreenProps {
  onNext: (data: { targetWeight: number }) => void;
  onBack: () => void;
  currentWeight?: number;
  startingWeight?: number;
  height?: number;
}

// V0 Design: Simple range 70-80kg
const MIN_WEIGHT = 70;
const MAX_WEIGHT = 80;
const BMI = 24.5; // Fixed BMI for V0 design

export function TargetWeightScreen({
  onNext,
  onBack,
  currentWeight = 0,
  startingWeight = 0,
  height = 170,
}: TargetWeightScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const [targetWeight, setTargetWeight] = useState(75);

  const handleNext = () => {
    onNext({ targetWeight });
  };

  return (
    <OnboardingScreenBase
      title="Peso meta"
      subtitle="Agora vamos definir seu peso-alvo. Isso nos ajudará a personalizar suas metas."
      onNext={handleNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Goal Weight Display - V0 Design */}
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.weightDisplay}>
          <Text style={[styles.weightValue, { color: colors.text }]}>
              {targetWeight}kg
          </Text>
          </View>

          {/* Slider - V0 Design */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={MIN_WEIGHT}
              maximumValue={MAX_WEIGHT}
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
              <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>{MIN_WEIGHT}</Text>
              <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>{MAX_WEIGHT}</Text>
            </View>
          </View>

          {/* BMI Display - V0 Design */}
          <View style={styles.bmiDisplay}>
            <Text style={[styles.bmiValue, { color: '#10B981' }]}>{BMI}</Text>
            <Text style={[styles.bmiLabel, { color: colors.textSecondary }]}>IMC</Text>
            <View style={[styles.bmiPill, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.bmiPillText, { color: '#065F46' }]}>Peso Normal</Text>
            </View>
          </View>

          {/* BMI Scale - V0 Design */}
          <View style={styles.bmiScale}>
            <View style={styles.bmiBar}>
              <View style={[styles.bmiSegment, { flex: 0.2, backgroundColor: '#A855F7' }]} />
              <View style={[styles.bmiSegment, { flex: 0.3, backgroundColor: '#10B981' }]} />
              <View style={[styles.bmiSegment, { flex: 0.25, backgroundColor: '#F59E0B' }]} />
              <View style={[styles.bmiSegment, { flex: 0.25, backgroundColor: '#EF4444' }]} />
            </View>
            <View style={styles.bmiLabels}>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#A855F7' }]}>Baixo</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>&lt;18.5</Text>
              </View>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#10B981' }]}>Saudável</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>18.5–25</Text>
              </View>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#F59E0B' }]}>Alto</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>25–30</Text>
              </View>
              <View style={styles.bmiLabelItem}>
                <Text style={[styles.bmiCategoryLabel, { color: '#EF4444' }]}>Muito Alto</Text>
                <Text style={[styles.bmiRange, { color: colors.textMuted }]}>30+</Text>
              </View>
            </View>
          </View>
          </View>
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
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
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
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 14,
  },
  bmiDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  bmiLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  bmiPill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
  },
  bmiPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bmiScale: {
    width: '100%',
  },
  bmiBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bmiSegment: {
    height: '100%',
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
    fontSize: 12,
    fontWeight: '600',
  },
  bmiRange: {
    fontSize: 11,
    marginTop: 2,
  },
});
