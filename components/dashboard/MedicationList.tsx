import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Medication } from '@/lib/types';
import { useRouter } from 'expo-router';

interface MedicationListProps {
  medications: Medication[];
  onEdit?: (medication: Medication) => void;
  onDelete?: (medicationId: string) => void;
}

const MEDICATION_NAMES: Record<string, string> = {
  mounjaro: 'Mounjaro',
  ozempic: 'Ozempic',
  saxenda: 'Saxenda',
  wegovy: 'Wegovy',
  zepbound: 'Zepbound',
};

export function MedicationList({ medications, onEdit, onDelete }: MedicationListProps) {
  const router = useRouter();

  const handleDelete = (medication: Medication) => {
    Alert.alert(
      'Excluir Medicação',
      `Tem certeza que deseja excluir ${MEDICATION_NAMES[medication.type] || medication.type}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => onDelete?.(medication.id)
        },
      ]
    );
  };

  if (medications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💊</Text>
        <Text style={styles.emptyText}>Nenhuma medicação cadastrada</Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={() => router.push('/(tabs)/add-medication')}
        >
          <Text style={styles.emptyButtonText}>Clique para cadastrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicações Ativas</Text>
      <FlatList
        data={medications.filter(m => m.active)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>
                  {MEDICATION_NAMES[item.type] || item.type}
                </Text>
                <Text style={styles.medicationDosage}>{item.dosage}mg</Text>
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
            <Text style={styles.medicationFrequency}>
              Frequência: {item.frequency === 'weekly' ? 'Semanal' : 'Diária'}
            </Text>
            <Text style={styles.medicationStart}>
              Início: {new Date(item.start_date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
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
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    fontWeight: '600',
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  medicationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 12, // Not supported in React Native StyleSheet
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 12,
  },
  medicationDosage: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    // gap: 8, // Not supported in React Native StyleSheet
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  medicationFrequency: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  medicationStart: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});

