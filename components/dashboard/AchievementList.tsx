import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Achievement } from '@/lib/types';
import { AchievementCard } from './AchievementCard';

interface AchievementListProps {
  achievements: Achievement[];
  loading?: boolean;
  maxVisible?: number;
}

export function AchievementList({ achievements, loading, maxVisible }: AchievementListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (achievements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🏆</Text>
        <Text style={styles.emptyText}>Nenhuma conquista ainda</Text>
        <Text style={styles.emptySubtext}>
          Continue registrando seu progresso para desbloquear conquistas!
        </Text>
      </View>
    );
  }

  const displayAchievements = maxVisible 
    ? achievements.slice(0, maxVisible)
    : achievements;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Suas Conquistas</Text>
        <Text style={styles.count}>{achievements.length}</Text>
      </View>
      
      <FlatList
        data={displayAchievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AchievementCard achievement={item} />}
        scrollEnabled={false}
      />

      {maxVisible && achievements.length > maxVisible && (
        <Text style={styles.moreText}>
          +{achievements.length - maxVisible} conquistas
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  moreText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});



