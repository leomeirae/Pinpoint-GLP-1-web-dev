import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { OnboardingScreenBase } from './OnboardingScreenBase';
import { useColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import Svg, { Path, Circle, Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ChartsIntroScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// V0 Design: Chart data matching the V0 design
const chartData = [
  { x: 0, y: 0.25 }, // 0mg -> 250px from top (inverted)
  { x: 30, y: 0.2 }, // 30px -> 200px
  { x: 60, y: 0.18 }, // 60px -> 180px
  { x: 90, y: 0.22 }, // 90px -> 220px
  { x: 120, y: 0.17 }, // 120px -> 170px
  { x: 150, y: 0.15 }, // 150px -> 150px
  { x: 180, y: 0.19 }, // 180px -> 190px
  { x: 210, y: 0.14 }, // 210px -> 140px
  { x: 240, y: 0.12 }, // 240px -> 120px
  { x: 270, y: 0.16 }, // 270px -> 160px
  { x: 300, y: 0.11 }, // 300px -> 110px (current point)
];

const forecastData = [
  { x: 300, y: 0.11 },
  { x: 330, y: 0.13 },
  { x: 360, y: 0.15 },
  { x: 390, y: 0.17 },
  { x: 420, y: 0.185 },
  { x: 450, y: 0.2 },
  { x: 480, y: 0.215 },
  { x: 510, y: 0.225 },
  { x: 540, y: 0.235 },
  { x: 570, y: 0.245 },
  { x: 600, y: 0.25 },
];

export function ChartsIntroScreen({ onNext, onBack }: ChartsIntroScreenProps) {
  const colors = useColors();
  const { currentAccent } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 96, 600); // Max width with padding
  const chartHeight = 300;

  return (
    <OnboardingScreenBase
      title="Pinpoint GLP-1 pode ajudar você a entender sua jornada com Mounjaro® através de ferramentas educativas"
      subtitle="Sinta-se mais confiante aprendendo mais sobre como esses medicamentos funcionam."
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.content}>
        {/* Chart container - V0 Design */}
        <View style={styles.chartContainer}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={[styles.yAxisLabel, { color: colors.textMuted }]}>3mg</Text>
            <Text style={[styles.yAxisLabel, { color: colors.textMuted }]}>2mg</Text>
            <Text style={[styles.yAxisLabel, { color: colors.textMuted }]}>1mg</Text>
            <Text style={[styles.yAxisLabel, { color: colors.textMuted }]}>0mg</Text>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            <Svg width={chartWidth} height={chartHeight} viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
              <Defs>
                <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
                  <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.3" />
                </LinearGradient>
              </Defs>

              {/* Grid lines - horizontal */}
              <Line x1="0" y1="75" x2="600" y2="75" stroke={colors.border} strokeWidth="1" />
              <Line x1="0" y1="150" x2="600" y2="150" stroke={colors.border} strokeWidth="1" />
              <Line x1="0" y1="225" x2="600" y2="225" stroke={colors.border} strokeWidth="1" />

              {/* Grid lines - vertical (dashed) */}
              <Line x1="100" y1="0" x2="100" y2="300" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="200" y1="0" x2="200" y2="300" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="300" y1="0" x2="300" y2="300" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="400" y1="0" x2="400" y2="300" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="500" y1="0" x2="500" y2="300" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />

              {/* Filled area path */}
              <Path
                d="M 0,250 L 30,200 L 60,180 L 90,220 L 120,170 L 150,150 L 180,190 L 210,140 L 240,120 L 270,160 L 300,110 L 300,300 L 0,300 Z"
                fill="url(#chartGradient)"
              />

              {/* Solid line */}
              <Path
                d="M 0,250 L 30,200 L 60,180 L 90,220 L 120,170 L 150,150 L 180,190 L 210,140 L 240,120 L 270,160 L 300,110"
                fill="none"
                stroke={colors.primary}
                strokeWidth="3"
              />

              {/* Dashed forecast line */}
              <Path
                d="M 300,110 L 330,130 L 360,150 L 390,170 L 420,185 L 450,200 L 480,215 L 510,225 L 540,235 L 570,245 L 600,250"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                strokeDasharray="8 4"
              />

              {/* Interactive point */}
              <Circle cx="300" cy="110" r="8" fill={colors.primary} stroke={colors.background} strokeWidth="3" />

              {/* Tooltip background */}
              <Rect x="240" y="60" width="120" height="40" fill={colors.background} rx="8" stroke={colors.border} strokeWidth="1" />

              {/* Vertical line from point */}
              <Line x1="300" y1="110" x2="300" y2="300" stroke={colors.primary} strokeWidth="1" strokeDasharray="4 2" />
            </Svg>

            {/* Tooltip text */}
            <View style={styles.tooltip}>
              <Text style={[styles.tooltipValue, { color: colors.primary }]}>1.16mg</Text>
              <Text style={[styles.tooltipDate, { color: colors.textSecondary }]}>28 de out. de 2025, 10</Text>
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>19/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>26/10</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>2/11</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>9/11</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>16/11</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>23/11</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>30/11</Text>
              <Text style={[styles.xAxisLabel, { color: colors.textMuted }]}>...</Text>
            </View>
          </View>
        </View>

        {/* Caption - V0 Design */}
        <Text style={[styles.caption, { color: colors.textSecondary }]}>
          Pinpoint GLP-1 usa resultados de ensaios clínicos publicados pela FDA para mapear os
          níveis estimados de medicação ao longo do tempo
        </Text>
      </View>
    </OnboardingScreenBase>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingHorizontal: 24,
  },
  chartContainer: {
    flexDirection: 'row',
    minHeight: 300,
    marginBottom: 16,
  },
  yAxisLabels: {
    width: 48,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 48,
  },
  yAxisLabel: {
    fontSize: 12,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  tooltip: {
    position: 'absolute',
    left: '50%',
    marginLeft: -60,
    top: 60,
    width: 120,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  tooltipDate: {
    fontSize: 11,
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
    fontSize: 12,
  },
  caption: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
});
