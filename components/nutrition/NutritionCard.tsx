import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { Trash, Pencil } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

export interface NutritionCardProps {
  id: string;
  date: Date;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  notes?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function NutritionCard({
  id,
  date,
  calories,
  protein,
  carbs,
  fats,
  notes,
  onDelete,
  onEdit,
}: NutritionCardProps) {
  const colors = useShotsyColors();
  const styles = getStyles(colors);

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Excluir registro',
      'Tem certeza que deseja excluir este registro de nutrição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete?.(id);
          },
        },
      ]
    );
  };

  const handleEdit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit?.(id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{formatDate(date)}</Text>
          <Text style={styles.time}>{formatTime(date)}</Text>
        </View>

        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Pencil size={20} color={colors.textSecondary} weight="bold" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Trash size={20} color="#EF4444" weight="bold" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Macros */}
      {(calories || protein || carbs || fats) && (
        <View style={styles.macrosContainer}>
          {calories && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>🔥 {calories}</Text>
              <Text style={styles.macroLabel}>kcal</Text>
            </View>
          )}
          {protein && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>💪 {protein}g</Text>
              <Text style={styles.macroLabel}>proteína</Text>
            </View>
          )}
          {carbs && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>🍞 {carbs}g</Text>
              <Text style={styles.macroLabel}>carboidratos</Text>
            </View>
          )}
          {fats && (
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>🥑 {fats}g</Text>
              <Text style={styles.macroLabel}>gorduras</Text>
            </View>
          )}
        </View>
      )}

      {/* Notes */}
      {notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notes} numberOfLines={4}>
            {notes}
          </Text>
        </View>
      )}
    </View>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,  // Mudança: 16 → 12px (consistência com ShotCard e design system)
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  time: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  macroLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  notesContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});

