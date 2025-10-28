import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { SideEffect } from '@/lib/types';

interface SideEffectsListProps {
  sideEffects: SideEffect[];
  maxVisible?: number;
  onEdit?: (sideEffect: SideEffect) => void;
  onDelete?: (sideEffectId: string) => void;
}

const SEVERITY_COLORS = {
  1: '#10b981',
  2: '#84cc16',
  3: '#f59e0b',
  4: '#f97316',
  5: '#ef4444',
};

const SEVERITY_LABELS = {
  1: 'Muito Leve',
  2: 'Leve',
  3: 'Moderado',
  4: 'Forte',
  5: 'Muito Forte',
};

export function SideEffectsList({ sideEffects, maxVisible, onEdit, onDelete }: SideEffectsListProps) {
  const handleDelete = (sideEffect: SideEffect) => {
    Alert.alert(
      'Excluir Efeito Colateral',
      `Tem certeza que deseja excluir "${sideEffect.type}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDelete?.(sideEffect.id)
        }
      ]
    );
  };

  if (sideEffects.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.emptyText}>Nenhum efeito colateral registrado</Text>
        <Text style={styles.emptySubtext}>
          Ótimo! Continue registrando caso sinta algo.
        </Text>
      </View>
    );
  }

  const displayEffects = maxVisible 
    ? sideEffects.slice(0, maxVisible)
    : sideEffects;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚠️ Efeitos Colaterais</Text>
        <Text style={styles.count}>{sideEffects.length}</Text>
      </View>
      
      <FlatList
        data={displayEffects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const severityColor = SEVERITY_COLORS[item.severity];
          const severityLabel = SEVERITY_LABELS[item.severity];
          
          return (
            <View style={styles.effectCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardContent}>
                  <View style={styles.effectHeader}>
                    <View style={styles.effectTitleRow}>
                      <View
                        style={[
                          styles.severityDot,
                          { backgroundColor: severityColor },
                        ]}
                      />
                      <Text style={styles.effectType}>{item.type}</Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: severityColor + '20' }]}>
                      <Text style={[styles.severityText, { color: severityColor }]}>
                        {severityLabel}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.effectDate}>
                    {new Date(item.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  
                  {item.notes && (
                    <Text style={styles.effectNotes}>{item.notes}</Text>
                  )}
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    onPress={() => onEdit?.(item)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(item)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        scrollEnabled={false}
      />

      {maxVisible && sideEffects.length > maxVisible && (
        <Text style={styles.moreText}>
          +{sideEffects.length - maxVisible} efeitos registrados
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
  effectCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    alignSelf: 'flex-start',
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  actionIcon: {
    fontSize: 16,
  },
  effectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  effectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  effectType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  effectDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  effectNotes: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  moreText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});


