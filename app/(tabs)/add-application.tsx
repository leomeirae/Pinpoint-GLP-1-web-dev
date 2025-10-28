import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMedicationApplications } from '@/hooks/useMedicationApplications';
import { useMedications } from '@/hooks/useMedications';
import { COLORS } from '@/constants/colors';

const MEDICATION_NAMES: Record<string, string> = {
  mounjaro: 'Mounjaro',
  ozempic: 'Ozempic',
  saxenda: 'Saxenda',
  wegovy: 'Wegovy',
  zepbound: 'Zepbound',
};

export default function AddApplicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId as string | undefined;
  const { addApplication, updateApplication, applications } = useMedicationApplications();
  const { medications } = useMedications();

  const [selectedMedicationId, setSelectedMedicationId] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const activeMedications = medications.filter(m => m.active);

  // Load application data for editing
  useEffect(() => {
    if (editId && applications.length > 0) {
      const application = applications.find(a => a.id === editId);
      if (application) {
        setSelectedMedicationId(application.medication_id);
        setDosage(application.dosage.toString());
        setNotes(application.notes || '');
      }
    }
  }, [editId, applications]);

  // Auto-selecionar primeira medicação (apenas para novo registro)
  useEffect(() => {
    if (!editId && activeMedications.length > 0 && !selectedMedicationId) {
      setSelectedMedicationId(activeMedications[0].id);
      setDosage(activeMedications[0].dosage.toString());
    }
  }, [activeMedications.length, editId]);

  async function handleSubmit() {
    if (!selectedMedicationId) {
      Alert.alert('Erro', 'Selecione uma medicação');
      return;
    }

    if (!dosage) {
      Alert.alert('Erro', 'Informe a dosagem');
      return;
    }

    try {
      setLoading(true);

      if (editId) {
        // Update existing application
        await updateApplication(editId, {
          medication_id: selectedMedicationId,
          dosage: parseFloat(dosage),
          notes: notes || null,
        });
        Alert.alert('Sucesso! 💉', 'Aplicação atualizada', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        // Add new application
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

        await addApplication({
          medication_id: selectedMedicationId,
          application_date: currentDate,
          application_time: currentTime,
          dosage: parseFloat(dosage),
          notes: notes || null,
        });
        Alert.alert('Sucesso! 💉', 'Aplicação registrada', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Error with application:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (activeMedications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💊</Text>
        <Text style={styles.emptyTitle}>Nenhuma medicação cadastrada</Text>
        <Text style={styles.emptyText}>
          Cadastre uma medicação primeiro para registrar aplicações
        </Text>
        <Button
          label="Cadastrar Medicação"
          onPress={() => router.push('/(tabs)/add-medication')}
        />
      </View>
    );
  }

  const selectedMedication = medications.find(m => m.id === selectedMedicationId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>💉</Text>
        <Text style={styles.title}>{editId ? 'Editar Aplicação' : 'Registrar Aplicação'}</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Selecione a Medicação</Text>
        <View style={styles.medicationsList}>
          {activeMedications.map((med) => (
            <Pressable
              key={med.id}
              style={[
                styles.medicationCard,
                selectedMedicationId === med.id && styles.medicationCardActive,
              ]}
              onPress={() => {
                setSelectedMedicationId(med.id);
                setDosage(med.dosage.toString());
              }}
            >
              <Text style={styles.medicationName}>
                {MEDICATION_NAMES[med.type] || med.type}
              </Text>
              <Text style={styles.medicationDosage}>{med.dosage}mg</Text>
              <Text style={styles.medicationFrequency}>
                {med.frequency === 'weekly' ? 'Semanal' : 'Diária'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Input
        label="Dosagem Aplicada (mg)"
        placeholder="Ex: 2.5"
        value={dosage}
        onChangeText={setDosage}
        keyboardType="decimal-pad"
      />

      <Input
        label="Observações (opcional)"
        placeholder="Como você está se sentindo? Alguma reação?"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {selectedMedication && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Sua próxima aplicação de {MEDICATION_NAMES[selectedMedication.type]} deve ser em{' '}
            {selectedMedication.frequency === 'weekly' ? '7 dias' : '1 dia'}
          </Text>
        </View>
      )}

      <Button
        label={editId ? 'Salvar Alterações' : 'Registrar Aplicação'}
        onPress={handleSubmit}
        loading={loading}
        disabled={!selectedMedicationId || !dosage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  medicationsList: {
    gap: 12,
  },
  medicationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  medicationCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDark,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationFrequency: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});

