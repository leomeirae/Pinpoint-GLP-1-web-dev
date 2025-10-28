import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Achievement } from '@/lib/types';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{achievement.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{achievement.title}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
        <Text style={styles.date}>
          {new Date(achievement.earned_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '20', // 20% opacity
  },
  icon: {
    fontSize: 40,
    marginRight: 16,
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
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});



