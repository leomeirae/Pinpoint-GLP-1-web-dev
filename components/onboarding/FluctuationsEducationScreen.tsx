import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

interface FluctuationsEducationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// V0 Design: Level data (0.15, 0.18, etc.)
// Converted to SVG coordinates (x: 0-360, y: 0-200, inverted for SVG)
const data = [
  { x: 0, y: 0.15 }, // 16/10 -> 0.15 (150px from top)
  { x: 60, y: 0.18 }, // 18/10 -> 0.18 (120px from top)
  { x: 120, y: 0.12 }, // 20/10 -> 0.12 (180px from top)
  { x: 180, y: 0.24 }, // 22/10 -> 0.24 (60px from top)
  { x: 240, y: 0.2 }, // 24/10 -> 0.2 (100px from top)
  { x: 300, y: 0.16 }, // 26/10 -> 0.16 (140px from top)
  { x: 360, y: 0.14 }, // 28/10 -> 0.14 (160px from top)
];

export function FluctuationsEducationScreen({ onNext, onBack }: FluctuationsEducationScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 96, 400); // Max width with padding

  return (
    <OnboardingScreenBase
      title="Supere seus dias mais difíceis."
      subtitle="A jornada com GLP-1 pode ter altos e baixos. O Pinpoint GLP-1 vai ajudar você a entender as flutuações e como equilibrar os efeitos colaterais com o progresso."
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Chart Card - V0 Design */}
        <View style={[styles.chartCard, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Semanas de Exemplo</Text>
            <View style={styles.logoContainer}>
              <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
                <View style={styles.logoDots}>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={[styles.logoDot, { backgroundColor: colors.background }]} />
                  ))}
            </View>
            </View>
              <Text style={[styles.logoText, { color: colors.text }]}>Pinpoint GLP-1</Text>
            </View>
            </View>

          <View style={styles.chartContainer}>
            <Svg
              width={chartWidth}
              height={192}
              viewBox="0 0 400 200"
              preserveAspectRatio="xMidYMid meet"
            >
              <Defs>
                <LinearGradient id="colorLevel" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="5%" stopColor={colors.primary} stopOpacity="0.8" />
                  <Stop offset="95%" stopColor={colors.primary} stopOpacity="0.2" />
                </LinearGradient>
              </Defs>

              {/* Grid lines - horizontal */}
              <Line x1="0" y1="50" x2="400" y2="50" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="100" x2="400" y2="100" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="150" x2="400" y2="150" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />

              {/* Grid lines - vertical */}
              <Line x1="66" y1="0" x2="66" y2="200" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="133" y1="0" x2="133" y2="200" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="200" y1="0" x2="200" y2="200" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="266" y1="0" x2="266" y2="200" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="333" y1="0" x2="333" y2="200" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />

              {/* Filled area path - flutuações */}
              <Path
                d="M 0,150 L 66,120 L 133,180 L 200,60 L 266,100 L 333,140 L 400,160 L 400,200 L 0,200 Z"
                fill="url(#colorLevel)"
              />

              {/* Solid line - flutuações */}
              <Path
                d="M 0,150 L 66,120 L 133,180 L 200,60 L 266,100 L 333,140 L 400,160"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
              />
            </Svg>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>16/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>18/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>20/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>22/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>24/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>26/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>28/10</Text>
            </View>
          </View>

          <Text style={[styles.chartCaption, { color: colors.textSecondary }]}>
            O Pinpoint GLP-1 estima níveis com base em médias, não em medições. Trabalhe com seu
            médico para gerenciar os níveis de dosagem para seu corpo.
          </Text>
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
  chartCard: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoDots: {
    flexDirection: 'row',
    gap: 2,
  },
  logoDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartContainer: {
    height: 192,
    marginBottom: 16,
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  xAxisLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  xAxisLabel: {
    fontSize: 10,
  },
  chartCaption: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
