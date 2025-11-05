import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { VictoryArea, VictoryChart, VictoryAxis, VictoryScatter } from 'victory-native';

interface EducationGraphScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Dados farmacocinéticos realistas para Mounjaro/GLP-1
// Baseado em estudos clínicos (simplificados para visualização educacional)
const pharmacokineticData = [
  { day: 0, level: 0 },
  { day: 1, level: 0.3 },
  { day: 2, level: 0.7 },
  { day: 3, level: 1.1 },
  { day: 4, level: 1.2 }, // Pico (Tmax ~96h)
  { day: 5, level: 0.9 },
  { day: 6, level: 0.6 },
  { day: 7, level: 0.3 }, // Antes da próxima dose
];

export function EducationGraphScreen({ onNext, onBack }: EducationGraphScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();

  return (
    <OnboardingScreenBase
      title="Entenda seus níveis estimados"
      subtitle="Veja como o medicamento age no seu corpo ao longo do tempo"
      onNext={onNext}
      onBack={onBack}
      nextButtonText="Entendi"
    >
      <View style={styles.content}>
        <ShotsyCard variant="elevated" style={styles.graphCard}>
          <VictoryChart
            height={220}
            width={Dimensions.get('window').width - 64}
            padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
          >
            {/* Eixo Y - Níveis de medicamento */}
            <VictoryAxis
              dependentAxis
              label="Nível (mg)"
              style={{
                axisLabel: {
                  fontSize: 12,
                  padding: 35,
                  fill: colors.textSecondary,
                },
                tickLabels: {
                  fontSize: 10,
                  fill: colors.textMuted,
                },
                grid: {
                  stroke: colors.border,
                  strokeDasharray: '4,4',
                  strokeOpacity: 0.5,
                },
                axis: { stroke: colors.border },
              }}
              tickValues={[0, 0.5, 1.0, 1.5]}
            />

            {/* Eixo X - Dias */}
            <VictoryAxis
              label="Dias"
              style={{
                axisLabel: {
                  fontSize: 12,
                  padding: 30,
                  fill: colors.textSecondary,
                },
                tickLabels: {
                  fontSize: 10,
                  fill: colors.textMuted,
                },
                axis: { stroke: colors.border },
              }}
              tickValues={[0, 2, 4, 6, 7]}
            />

            {/* Área preenchida - curva farmacológica */}
            <VictoryArea
              data={pharmacokineticData}
              x="day"
              y="level"
              style={{
                data: {
                  fill: currentAccent,
                  fillOpacity: 0.3,
                  stroke: currentAccent,
                  strokeWidth: 2,
                },
              }}
              interpolation="natural" // Curva suave
            />

            {/* Ponto do pico (Tmax) */}
            <VictoryScatter
              data={[{ day: 4, level: 1.2 }]}
              x="day"
              y="level"
              size={6}
              style={{
                data: { fill: currentAccent },
              }}
            />
          </VictoryChart>

          {/* Label do pico */}
          <Text style={[styles.peakLabel, { color: currentAccent }]}>← Pico: 1.2mg (dia 4)</Text>
        </ShotsyCard>

        <ShotsyCard style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Como funciona?</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Após cada aplicação, o nível do medicamento aumenta gradualmente e depois diminui ao
            longo dos dias. O gráfico acima mostra uma estimativa desses níveis.
          </Text>
        </ShotsyCard>

        <ShotsyCard style={[styles.warningCard, { backgroundColor: colors.card }]}>
          <Text style={styles.warningEmoji}>💡</Text>
          <Text style={[styles.warningText, { color: colors.textSecondary }]}>
            Essas estimativas são baseadas em dados clínicos e podem variar de pessoa para pessoa.
            Sempre siga as orientações do seu médico.
          </Text>
        </ShotsyCard>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  graphCard: {
    padding: 20,
  },
  peakLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -40, // Sobrepor ao gráfico
    marginRight: 20,
  },
  infoCard: {
    padding: 20, // Mudança: 16 → 20px (match Shotsy)
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  warningCard: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  warningEmoji: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
