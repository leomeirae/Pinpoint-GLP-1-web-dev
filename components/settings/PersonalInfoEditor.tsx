import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import * as Haptics from 'expo-haptics';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PersonalInfoEditor');

interface PersonalInfoEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const colors = useShotsyColors();
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [medication, setMedication] = useState('');
  const [currentDose, setCurrentDose] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');

  // Load profile data when modal opens
  useEffect(() => {
    if (visible && profile) {
      setName(profile.name || '');
      setHeight(profile.height?.toString() || '');
      setStartWeight(profile.start_weight?.toString() || '');
      setTargetWeight(profile.target_weight?.toString() || '');
      setMedication(profile.medication || '');
      setCurrentDose(profile.current_dose?.toString() || '');
      setFrequency((profile.frequency as 'daily' | 'weekly' | 'biweekly') || 'weekly');
    }
  }, [visible, profile]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome');
      return false;
    }

    if (height && (parseFloat(height) < 1.0 || parseFloat(height) > 2.5)) {
      Alert.alert('Erro', 'Altura deve estar entre 1.0 e 2.5 metros');
      return false;
    }

    if (startWeight && parseFloat(startWeight) <= 0) {
      Alert.alert('Erro', 'Peso inicial deve ser maior que zero');
      return false;
    }

    if (targetWeight && parseFloat(targetWeight) <= 0) {
      Alert.alert('Erro', 'Peso alvo deve ser maior que zero');
      return false;
    }

    if (currentDose && parseFloat(currentDose) <= 0) {
      Alert.alert('Erro', 'Dose atual deve ser maior que zero');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const updates: Partial<UserProfile> = {
        name: name.trim(),
      };

      if (height) updates.height = parseFloat(height);
      if (startWeight) updates.start_weight = parseFloat(startWeight);
      if (targetWeight) updates.target_weight = parseFloat(targetWeight);
      if (medication) updates.medication = medication.trim();
      if (currentDose) updates.current_dose = parseFloat(currentDose);
      if (frequency) updates.frequency = frequency;

      await updateProfile(updates);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Informações pessoais atualizadas!');
      onSave();
      onClose();
    } catch (error) {
      logger.error('Error saving profile:', error as Error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível salvar as informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const FrequencyButton: React.FC<{ value: 'daily' | 'weekly' | 'biweekly'; label: string }> = ({
    value,
    label,
  }) => (
    <TouchableOpacity
      style={[
        styles.frequencyButton,
        {
          backgroundColor: frequency === value ? colors.primary : colors.card,
          borderColor: frequency === value ? colors.primary : colors.border,
        },
      ]}
      onPress={() => {
        setFrequency(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.frequencyButtonText,
          { color: frequency === value ? (colors.isDark ? colors.text : '#FFFFFF') : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.headerButton, { color: colors.primary }]}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Informações Pessoais</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Nome */}
          <ShotsyCard style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </ShotsyCard>

          {/* Altura */}
          <ShotsyCard style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Altura (metros)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={height}
              onChangeText={setHeight}
              placeholder="Ex: 1.75"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Entre 1.0 e 2.5 metros
            </Text>
          </ShotsyCard>

          {/* Pesos */}
          <ShotsyCard style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Peso Inicial (kg)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={startWeight}
              onChangeText={setStartWeight}
              placeholder="Ex: 85.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
              Peso Alvo (kg)
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={targetWeight}
              onChangeText={setTargetWeight}
              placeholder="Ex: 75.0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </ShotsyCard>

          {/* Medicação */}
          <ShotsyCard style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Medicamento</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={medication}
              onChangeText={setMedication}
              placeholder="Ex: Tirzepatida, Ozempic"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
              Dose Atual (mg)
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={currentDose}
              onChangeText={setCurrentDose}
              placeholder="Ex: 2.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </ShotsyCard>

          {/* Frequência */}
          <ShotsyCard style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Frequência das Injeções</Text>
            <View style={styles.frequencyContainer}>
              <FrequencyButton value="daily" label="Diária" />
              <FrequencyButton value="weekly" label="Semanal" />
              <FrequencyButton value="biweekly" label="Quinzenal" />
            </View>
          </ShotsyCard>

          {/* Save Button */}
          <ShotsyButton
            title={loading ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
    marginTop: 4,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 24,
  },
});
