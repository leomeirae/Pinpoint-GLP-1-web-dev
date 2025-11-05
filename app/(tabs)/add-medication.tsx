import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMedications } from '@/hooks/useMedications';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { MedicationType } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const MEDICATION_OPTIONS: { value: MedicationType; label: string }[] = [
  { value: 'mounjaro', label: 'Mounjaro' },
  { value: 'ozempic', label: 'Ozempic' },
  { value: 'saxenda', label: 'Saxenda' },
  { value: 'wegovy', label: 'Wegovy' },
  { value: 'zepbound', label: 'Zepbound' },
];

export default function AddMedicationScreen() {
  const colors = useShotsyColors();
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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (editId) {
        // Update existing medication
        await updateMedication(editId, {
          type,
          dosage: parseFloat(dosage),
          frequency,
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Sucesso!', 'Medicação atualizada', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        // Add new medication
        await addMedication({
          type,
          dosage: parseFloat(dosage),
          frequency,
          start_date: new Date().toISOString().split('T')[0],
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Sucesso!', 'Medicação adicionada', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', error.message);
      setLoading(false);
    }
  }

  const canSave = dosage.trim() !== '';

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {editId ? 'Editar Medicação' : 'Adicionar Medicação'}
          </Text>

          <TouchableOpacity onPress={handleSubmit} disabled={!canSave || loading}>
            <Text
              style={[
                styles.saveButton,
                { color: canSave && !loading ? colors.primary : colors.textSecondary }
              ]}
            >
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* TIPO DE MEDICAÇÃO */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              TIPO DE MEDICAÇÃO
            </Text>
            <View style={styles.optionsGrid}>
              {MEDICATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    type === option.value && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => {
                    setType(option.value);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: type === option.value ? colors.primary : colors.text }
                  ]}>
                    {option.label}
                  </Text>
                  {type === option.value && (
                    <Text style={[styles.optionCheck, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* DOSAGEM */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              DOSAGEM
            </Text>
            <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ex: 2.5"
                placeholderTextColor={colors.textSecondary}
                value={dosage}
                onChangeText={setDosage}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>mg</Text>
            </View>
          </View>

          {/* FREQUÊNCIA */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              FREQUÊNCIA DE APLICAÇÃO
            </Text>
            <View style={styles.frequencyRow}>
              <TouchableOpacity
                style={[
                  styles.frequencyCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  frequency === 'weekly' && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  setFrequency('weekly');
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.frequencyText,
                  { color: frequency === 'weekly' ? colors.primary : colors.text }
                ]}>
                  Semanal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.frequencyCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  frequency === 'daily' && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  setFrequency('daily');
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.frequencyText,
                  { color: frequency === 'daily' ? colors.primary : colors.text }
                ]}>
                  Diária
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {medicationsLoading && (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando dados do usuário...
            </Text>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,  // Consistência com outros screens
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  optionsGrid: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionCheck: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
