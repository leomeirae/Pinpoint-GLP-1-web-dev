import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Insight } from '@/hooks/useInsights';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const bgColor = {
    positive: COLORS.success + '20',
    warning: COLORS.warning + '20',
    neutral: COLORS.primary + '20',
    tip: COLORS.info + '20',
  }[insight.type];

  const borderColor = {
    positive: COLORS.success,
    warning: COLORS.warning,
    neutral: COLORS.primary,
    tip: COLORS.info,
  }[insight.type];

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderLeftColor: borderColor }]}>
      <Text style={styles.emoji}>{insight.emoji}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});


