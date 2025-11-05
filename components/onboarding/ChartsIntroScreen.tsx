import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { VictoryArea, VictoryChart, VictoryAxis } from 'victory-native';

interface ChartsIntroScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Dados de exemplo para o chart preview
const sampleChartData = [
  { x: 0, y: 0.2 },
  { x: 1, y: 0.5 },
  { x: 2, y: 0.9 },
  { x: 3, y: 1.16 }, // Pico
  { x: 4, y: 0.8 },
  { x: 5, y: 0.6 },
  { x: 6, y: 0.4 },
  { x: 7, y: 0.2 },
];

export function ChartsIntroScreen({ onNext, onBack }: ChartsIntroScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();

  return (
    <OnboardingScreenBase
      title="Mounjaro Tracker pode ajudar você a entender sua jornada através de ferramentas educativas"
      subtitle="Sinta-se mais confiante aprendendo como o medicamento funciona no seu corpo."
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        <ShotsyCard variant="elevated" style={styles.chartPreview}>
          <VictoryChart
            height={200}
            width={Dimensions.get('window').width - 64}
            padding={{ top: 20, bottom: 30, left: 40, right: 20 }}
          >
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: colors.border },
                tickLabels: { fontSize: 10, fill: colors.textMuted },
                grid: { stroke: colors.border, strokeDasharray: '4,4', strokeOpacity: 0.5 },
              }}
              tickValues={[0, 0.5, 1.0, 1.5]}
            />
            <VictoryAxis
              style={{
                axis: { stroke: colors.border },
                tickLabels: { fontSize: 10, fill: colors.textMuted },
              }}
              tickValues={[0, 2, 4, 6, 7]}
            />
            <VictoryArea
              data={sampleChartData}
              style={{
                data: {
                  fill: currentAccent,
                  fillOpacity: 0.3,
                  stroke: currentAccent,
                  strokeWidth: 2,
                },
              }}
              interpolation="natural"
            />
          </VictoryChart>

          <Text style={[styles.chartAnnotation, { color: colors.text }]}>1.16mg</Text>
          <Text style={[styles.chartTimestamp, { color: colors.textMuted }]}>
            28 de out. de 2025, 10
          </Text>
        </ShotsyCard>

        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          Mounjaro Tracker usa resultados de ensaios clínicos publicados pela FDA para mapear os
          níveis estimados de medicação ao longo do tempo
        </Text>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  chartPreview: {
    padding: 20,
    marginBottom: 16,
  },
  chartAnnotation: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: -30,
  },
  chartTimestamp: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
