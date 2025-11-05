import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryArea } from 'victory-native';

interface FluctuationsEducationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Dados de exemplo mostrando flutuações típicas de peso
const fluctuationData = [
  { day: 1, weight: 80.0 },
  { day: 2, weight: 81.2 }, // +1.2kg (retenção líquidos)
  { day: 3, weight: 80.5 }, // -0.7kg
  { day: 4, weight: 80.8 }, // +0.3kg
  { day: 5, weight: 79.6 }, // -1.2kg (grande variação)
  { day: 6, weight: 80.2 }, // +0.6kg
  { day: 7, weight: 79.8 }, // -0.4kg (tendência geral: ↓)
];

export function FluctuationsEducationScreen({ onNext, onBack }: FluctuationsEducationScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();

  return (
    <OnboardingScreenBase
      title="É normal ter flutuações"
      subtitle="Seu peso pode variar de um dia para o outro, e está tudo bem"
      onNext={onNext}
      onBack={onBack}
      nextButtonText="Entendi"
    >
      <View style={styles.content}>
        <ShotsyCard variant="elevated" style={styles.graphCard}>
          <Text style={[styles.graphTitle, { color: colors.text }]}>
            Flutuações típicas de peso
          </Text>

          <VictoryChart
            height={180}
            width={Dimensions.get('window').width - 80}
            padding={{ top: 20, bottom: 30, left: 50, right: 20 }}
          >
            {/* Área sombreada (±2kg zona normal) */}
            <VictoryArea
              data={[
                { day: 1, y0: 78, y: 82 },
                { day: 7, y0: 78, y: 82 },
              ]}
              style={{
                data: { fill: colors.textMuted, opacity: 0.1 },
              }}
            />

            {/* Linha de peso com variações */}
            <VictoryLine
              data={fluctuationData}
              x="day"
              y="weight"
              style={{
                data: {
                  stroke: currentAccent,
                  strokeWidth: 3,
                },
              }}
              interpolation="natural"
            />

            {/* Eixos */}
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${t}kg`}
              style={{
                tickLabels: { fontSize: 10, fill: colors.textMuted },
                grid: { stroke: colors.border, strokeDasharray: '2,2', strokeOpacity: 0.5 },
                axis: { stroke: colors.border },
              }}
            />
            <VictoryAxis
              label="Dias"
              style={{
                axisLabel: { fontSize: 12, padding: 25, fill: colors.textSecondary },
                tickLabels: { fontSize: 10, fill: colors.textMuted },
                axis: { stroke: colors.border },
              }}
            />
          </VictoryChart>

          <Text style={[styles.graphCaption, { color: colors.textMuted }]}>
            Variações de até 2kg são completamente normais
          </Text>
        </ShotsyCard>

        <ShotsyCard style={styles.factorsCard}>
          <Text style={[styles.factorsTitle, { color: colors.text }]}>
            Fatores que afetam o peso diário:
          </Text>
          <View style={styles.factorsList}>
            <View style={styles.factor}>
              <Text style={styles.factorEmoji}>💧</Text>
              <Text style={[styles.factorText, { color: colors.textSecondary }]}>
                Retenção de líquidos
              </Text>
            </View>
            <View style={styles.factor}>
              <Text style={styles.factorEmoji}>🍽️</Text>
              <Text style={[styles.factorText, { color: colors.textSecondary }]}>
                Última refeição
              </Text>
            </View>
            <View style={styles.factor}>
              <Text style={styles.factorEmoji}>😴</Text>
              <Text style={[styles.factorText, { color: colors.textSecondary }]}>
                Qualidade do sono
              </Text>
            </View>
            <View style={styles.factor}>
              <Text style={styles.factorEmoji}>🏃</Text>
              <Text style={[styles.factorText, { color: colors.textSecondary }]}>
                Exercícios recentes
              </Text>
            </View>
            <View style={styles.factor}>
              <Text style={styles.factorEmoji}>🧂</Text>
              <Text style={[styles.factorText, { color: colors.textSecondary }]}>
                Consumo de sódio
              </Text>
            </View>
          </View>
        </ShotsyCard>

        <ShotsyCard style={[styles.tipCard, { borderLeftColor: currentAccent }]}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Foque na tendência geral, não nos números diários. O que importa é a direção que você
            está seguindo ao longo das semanas.
          </Text>
        </ShotsyCard>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  graphCard: {
    padding: 20,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  graphCaption: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  factorsCard: {
    padding: 20,
  },
  factorsTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  factorsList: {
    gap: 12,
  },
  factor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factorEmoji: {
    fontSize: 24,
  },
  factorText: {
    fontSize: 15,
    flex: 1,
  },
  tipCard: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
});
