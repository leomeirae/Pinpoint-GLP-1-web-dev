import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { COLORS } from '@/constants/colors';

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Feliz', value: 'Feliz' },
  { emoji: '💪', label: 'Motivado', value: 'Motivado' },
  { emoji: '😌', label: 'Bem', value: 'Bem' },
  { emoji: '😐', label: 'Normal', value: 'Normal' },
  { emoji: '😔', label: 'Triste', value: 'Triste' },
  { emoji: '😤', label: 'Frustrado', value: 'Frustrado' },
  { emoji: '🤢', label: 'Nauseado', value: 'Nauseado' },
  { emoji: '😴', label: 'Cansado', value: 'Cansado' },
];

export default function AddWeightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId as string | undefined;
  const { addWeightLog, updateWeightLog, weightLogs, loading: weightLogsLoading } = useWeightLogs();

  const [weight, setWeight] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Load weight log data for editing
  useEffect(() => {
    if (editId && weightLogs.length > 0) {
      const log = weightLogs.find(l => l.id === editId);
      if (log) {
        setWeight(log.weight.toString());
        // Parse notes to extract mood if it exists
        if (log.notes) {
          const moodOption = MOOD_OPTIONS.find(m => log.notes?.includes(m.value));
          if (moodOption) {
            setSelectedMood(moodOption.value);
            // Remove mood from notes to get additional notes
            const additionalNotesText = log.notes.replace(moodOption.value, '').replace(/^[\s-]+|[\s-]+$/g, '');
            setAdditionalNotes(additionalNotesText);
          } else {
            setAdditionalNotes(log.notes);
          }
        }
      }
    }
  }, [editId, weightLogs]);

  async function handleSubmit() {
    if (!weight) {
      Alert.alert('Erro', 'Preencha o peso');
      return;
    }

    try {
      setLoading(true);
      
      // Combinar mood e notas adicionais
      const finalNotes = [selectedMood, additionalNotes].filter(Boolean).join(' - ');
      
      if (editId) {
        // Update existing weight log
        await updateWeightLog(editId, {
          weight: parseFloat(weight),
          notes: finalNotes || null,
        });
        Alert.alert('Sucesso!', 'Peso atualizado');
      } else {
        // Add new weight log
        await addWeightLog({
          weight: parseFloat(weight),
          date: new Date().toISOString().split('T')[0],
          notes: finalNotes || null,
        });
        Alert.alert('Sucesso!', 'Peso registrado');
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
          <Text style={styles.title}>{editId ? 'Editar Peso' : 'Registrar Peso'}</Text>

          <Input
            label="Peso (kg)"
            placeholder="Ex: 85.5"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          <View style={styles.moodSection}>
            <Text style={styles.moodLabel}>Como você está se sentindo?</Text>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => (
                <Pressable
                  key={mood.value}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.value && styles.moodButtonSelected,
                  ]}
                  onPress={() => setSelectedMood(mood.value)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodButtonLabel,
                    selectedMood === mood.value && styles.moodLabelSelected,
                  ]}>
                    {mood.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input
            label="Notas Adicionais (opcional)"
            placeholder="Ex: Comecei exercícios..."
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
          />

          {weightLogsLoading && (
            <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
          )}
          
          <Button
            label={editId ? 'Salvar Alterações' : 'Salvar Peso'}
            onPress={handleSubmit}
            loading={loading}
            disabled={weightLogsLoading || loading}
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  moodSection: {
    marginVertical: 20,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '22%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodButtonLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
