import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface LevelCardProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

export function LevelCard({ level, currentXP, xpToNextLevel }: LevelCardProps) {
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const progressPercent = ((currentXP - xpForCurrentLevel) / 100) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>⭐</Text>
        <View style={styles.levelInfo}>
          <Text style={styles.levelLabel}>Nível</Text>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {xpToNextLevel} XP para o próximo nível
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
