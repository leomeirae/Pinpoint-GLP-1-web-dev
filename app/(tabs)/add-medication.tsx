import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMedications } from '@/hooks/useMedications';
import { COLORS } from '@/constants/colors';
import { MedicationType } from '@/lib/types';

const MEDICATION_OPTIONS: { value: MedicationType; label: string }[] = [
  { value: 'mounjaro', label: 'Mounjaro' },
  { value: 'ozempic', label: 'Ozempic' },
  { value: 'saxenda', label: 'Saxenda' },
  { value: 'wegovy', label: 'Wegovy' },
  { value: 'zepbound', label: 'Zepbound' },
];

export default function AddMedicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId as string | undefined;
  const { addMedication, updateMedication, medications, loading: medicationsLoading } = useMedications();

  const [type, setType] = useState<MedicationType>('mounjaro');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'daily'>('weekly');
  const [loading, setLoading] = useState(false);

  // Load medication data for editing
  useEffect(() => {
    if (editId && medications.length > 0) {
      const medication = medications.find(m => m.id === editId);
      if (medication) {
        setType(medication.type);
        setDosage(medication.dosage.toString());
        setFrequency(medication.frequency);
      }
    }
  }, [editId, medications]);

  async function handleSubmit() {
    if (!dosage) {
      Alert.alert('Erro', 'Preencha a dosagem');
      return;
    }

    try {
      setLoading(true);
      
      if (editId) {
        // Update existing medication
        await updateMedication(editId, {
          type,
          dosage: parseFloat(dosage),
          frequency,
        });
        Alert.alert('Sucesso!', 'Medicação atualizada');
      } else {
        // Add new medication
        await addMedication({
          type,
          dosage: parseFloat(dosage),
          frequency,
          start_date: new Date().toISOString().split('T')[0],
        });
        Alert.alert('Sucesso!', 'Medicação adicionada');
      }

      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
      <Text style={styles.title}>{editId ? 'Editar Medicação' : 'Adicionar Medicação'}</Text>

      <Text style={styles.label}>Tipo de Medicação</Text>
      <View style={styles.optionsGrid}>
        {MEDICATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            label={option.label}
            onPress={() => setType(option.value)}
            variant={type === option.value ? 'primary' : 'outline'}
          />
        ))}
      </View>

      <Input
        label="Dosagem (mg)"
        placeholder="Ex: 2.5"
        value={dosage}
        onChangeText={setDosage}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Frequência</Text>
      <View style={styles.frequencyRow}>
        <Button
          label="Semanal"
          onPress={() => setFrequency('weekly')}
          variant={frequency === 'weekly' ? 'primary' : 'outline'}
        />
        <Button
          label="Diária"
          onPress={() => setFrequency('daily')}
          variant={frequency === 'daily' ? 'primary' : 'outline'}
        />
      </View>

      {medicationsLoading && (
        <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
      )}
      
      <Button
        label={editId ? 'Salvar Alterações' : 'Adicionar Medicação'}
        onPress={handleSubmit}
        loading={loading}
        disabled={medicationsLoading || loading}
      />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 16,
  },
  optionsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
