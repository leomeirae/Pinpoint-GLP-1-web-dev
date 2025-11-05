import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { router } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import { AppIcon } from '@/components/ui/icons';

export interface Shot {
  id: string;
  date: Date;
  dosage: number;
  injectionSites: string[];
  sideEffects: string[];
  notes?: string;
}

interface ShotCardProps {
  shot: Shot;
  onDelete: (id: string) => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({ shot, onDelete }) => {
  const colors = useShotsyColors();
  const swipeableRef = useRef<Swipeable>(null);

  const formatDate = (date: Date) => {
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
    return `${weekday}, ${day} de ${month}`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeableRef.current?.close();
    router.push(`/(tabs)/add-application?editId=${shot.id}`);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Deletar Injeção',
      'Tem certeza que deseja deletar esta injeção?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close()
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete(shot.id);
            swipeableRef.current?.close();
          },
        },
      ]
    );
  };

  const renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        <Animated.View style={[{ transform: [{ scale }] }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton, { backgroundColor: '#10B981' }]}  // Verde padrão para Edit (convenção UI)
            onPress={handleEdit}
          >
            <AppIcon name="pencil" size="md" color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        <Animated.View style={[{ transform: [{ scale }] }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error }]}
            onPress={handleDelete}
          >
            <AppIcon name="trash" size="md" color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Deletar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={40}
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={handleEdit}
        activeOpacity={0.7}
      >
        <ShotsyCard style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.date, { color: colors.text }]}>
                {formatDate(shot.date)}
              </Text>
              <Text style={[styles.time, { color: colors.textSecondary }]}>
                {formatTime(shot.date)}
              </Text>
            </View>
            <View style={[styles.dosageBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.dosageText, { color: colors.primary }]}>
                {shot.dosage}mg
              </Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={[styles.icon, { color: colors.primary }]}>📍</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>
                {shot.injectionSites.join(', ')}
              </Text>
            </View>

            {shot.sideEffects.length > 0 && (
              <View style={styles.sideEffectsContainer}>
                {shot.sideEffects.slice(0, 3).map((effect, index) => (
                  <View
                    key={index}
                    style={[styles.sideEffectChip, { backgroundColor: colors.background }]}
                  >
                    <Text style={[styles.sideEffectText, { color: colors.textSecondary }]}>
                      {effect}
                    </Text>
                  </View>
                ))}
                {shot.sideEffects.length > 3 && (
                  <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                    +{shot.sideEffects.length - 3}
                  </Text>
                )}
              </View>
            )}

            {shot.notes && (
              <Text
                style={[styles.notes, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {shot.notes}
              </Text>
            )}
          </View>
        </ShotsyCard>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    marginTop: 2,
  },
  dosageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dosageText: {
    fontSize: 14,
    fontWeight: '700',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  sideEffectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  sideEffectChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sideEffectText: {
    fontSize: 12,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  // Swipe Actions Styles
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 16,
    gap: 4,
  },
  editButton: {
    marginRight: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFFFFF', // Always white on colored backgrounds for contrast
    fontWeight: '600',
    fontSize: 12,
  },
});
