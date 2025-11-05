import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useApplications } from '@/hooks/useApplications';
import { useProfile } from '@/hooks/useProfile';
import { useMedications } from '@/hooks/useMedications';
import { EstimatedLevelsChart } from '@/components/dashboard/EstimatedLevelsChart';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

interface ApplicationData {
  id?: string;
  date: Date;
  dosage: number | null;
  injectionSite: string;
  painLevel: number;
  notes: string;
  medication: string;
}

const MEDICATIONS = [
  { id: 'zepbound', name: 'Zepbound®' },
  { id: 'wegovy', name: 'Wegovy®' },
  { id: 'mounjaro', name: 'Mounjaro®' },
  { id: 'ozempic', name: 'Ozempic®' },
  { id: 'tirzepatide', name: 'Tirzepatida' },
  { id: 'semaglutide', name: 'Semaglutida' },
];

const INJECTION_SITES = [
  { id: 'stomach_upper_left', name: 'Estômago - Sup. Esquerdo' },
  { id: 'stomach_upper_middle', name: 'Estômago - Sup. Meio' },
  { id: 'stomach_lower_left', name: 'Estômago - Inf. Esquerdo' },
  { id: 'stomach_lower_middle', name: 'Estômago - Inf. Meio' },
  { id: 'stomach_upper_right', name: 'Estômago - Sup. Direito' },
  { id: 'stomach_lower_right', name: 'Estômago - Inf. Direito' },
  { id: 'thigh_left', name: 'Coxa Esquerda' },
  { id: 'thigh_right', name: 'Coxa Direita' },
  { id: 'arm_left', name: 'Braço Esquerdo' },
  { id: 'arm_right', name: 'Braço Direito' },
  { id: 'buttock_left', name: 'Glúteo Esquerdo' },
  { id: 'buttock_right', name: 'Glúteo Direito' },
  { id: 'hip_left', name: 'Quadril Esquerdo' },
  { id: 'hip_right', name: 'Quadril Direito' },
  { id: 'unknown', name: 'Desconhecido' },
];

// Dosage colors - these are intentionally hardcoded as they represent
// specific dosage levels and should remain consistent across themes
const DOSAGES = [
  { value: 2.5, color: '#6B7280' }, // Gray
  { value: 5, color: '#8B5CF6' }, // Purple
  { value: 7.5, color: '#14B8A6' }, // Teal
  { value: 10, color: '#EC4899' }, // Pink
  { value: 12.5, color: '#3B82F6' }, // Blue
  { value: 15, color: '#EF4444' }, // Red
];

export default function AddApplicationScreen() {
  const colors = useShotsyColors();
  const params = useLocalSearchParams();
  const isEditMode = !!params.editId;

  const {
    applications,
    createApplication,
    updateApplication,
    deleteApplication,
    loading: applicationsLoading,
  } = useApplications();

  const { profile } = useProfile();
  const { medications, loading: medicationsLoading, addMedication } = useMedications();
  
  // Get active medication
  const activeMedication = medications.find(m => m.active);

  // State
  const [data, setData] = useState<ApplicationData>({
    date: new Date(),
    dosage: null,
    injectionSite: '',
    painLevel: 0,
    notes: '',
    medication: 'mounjaro',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showDosageModal, setShowDosageModal] = useState(false);
  const [showInjectionSiteModal, setShowInjectionSiteModal] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (isEditMode && params.editId) {
      const applicationToEdit = applications.find((app) => app.id === params.editId);

      if (applicationToEdit) {
        setData({
          id: applicationToEdit.id,
          date: applicationToEdit.date || new Date(),
          dosage: applicationToEdit.dosage,
          injectionSite: applicationToEdit.injection_sites[0] || '',
          painLevel: 0, // pain_level was removed from schema
          notes: applicationToEdit.notes || '',
          medication: 'mounjaro', // medication_type was removed, using default
        });
      }
    }
  }, [isEditMode, params.editId, applications]);

  // Load medication from profile
  useEffect(() => {
    if (profile?.medication) {
      setData((prev) => ({ ...prev, medication: profile.medication }));
    }
  }, [profile]);

  // Validations
  const canSave = data.dosage !== null && data.injectionSite !== '';

  // Handlers
  const handleSave = async () => {
    if (!canSave || isSaving) return;

    // Se não houver medicação ativa, criar uma automaticamente com base nos dados do formulário
    let medicationToUse = activeMedication;

    if (!medicationToUse) {
      // Só criar medicação automaticamente se tiver dosagem preenchida
      if (!data.dosage) {
        Alert.alert(
          'Erro',
          'Por favor, selecione a dosagem antes de salvar. Se você ainda não tem uma medicação cadastrada, ela será criada automaticamente.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Tentar criar medicação automaticamente com dados do formulário
      try {
        setIsSaving(true);
        
        // Usar dados do profile se disponível, senão usar valores do formulário
        const medicationType = data.medication || profile?.medication || 'mounjaro';
        const dosage = data.dosage; // Já validado acima
        const frequency = profile?.frequency || 'weekly';

        const newMedication = await addMedication({
          type: medicationType,
          dosage: dosage,
          frequency: frequency,
          start_date: new Date().toISOString().split('T')[0],
          active: true, // Sempre criar como ativa
        });

        medicationToUse = newMedication;
      } catch (error) {
        console.error('Error creating medication:', error);
        Alert.alert(
          'Erro',
          'Não foi possível criar a medicação automaticamente. Por favor, adicione uma medicação primeiro.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Adicionar Medicação',
              onPress: () => router.push('/(tabs)/add-medication'),
            },
          ]
        );
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(true);

    try {
      // Format date as YYYY-MM-DD
      const dateString = data.date.toISOString().split('T')[0];
      
      // Format time as HH:MM
      const timeString = data.date.toTimeString().split(' ')[0].substring(0, 5);

      const formattedData = {
        medication_id: medicationToUse.id,
        application_date: dateString,
        application_time: timeString,
        dosage: data.dosage!,
        injection_sites: [data.injectionSite],
        side_effects_list: [],
        notes: data.notes || undefined,
      };

      if (isEditMode && data.id) {
        await updateApplication(data.id, formattedData);
      } else {
        await createApplication(formattedData);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Sucesso',
        isEditMode ? 'Aplicação atualizada!' : 'Aplicação adicionada!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error saving application:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar a aplicação. Tente novamente.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!data.id) return;

    Alert.alert('Deletar Aplicação', 'Tem certeza que deseja deletar esta aplicação?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await deleteApplication(data.id!);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert('Sucesso', 'Aplicação deletada com sucesso!', [
              { text: 'OK', onPress: () => router.back() },
            ]);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              console.error('Error deleting application:', error);
            Alert.alert('Erro', 'Não foi possível deletar a aplicação. Tente novamente.');
              setIsSaving(false);
            }
          },
        },
    ]);
  };

  // Formatters
  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday
      ? 'Hoje'
      : date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeElapsed = () => {
    const now = new Date();
    const diff = now.getTime() - data.date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    return 'Agora';
  };

  const getMedicationName = () => {
    return MEDICATIONS.find((m) => m.id === data.medication)?.name || 'Mounjaro®';
  };

  const getInjectionSiteName = () => {
    return INJECTION_SITES.find((s) => s.id === data.injectionSite)?.name || '';
  };

  const getDosageColor = (dosage: number) => {
    return DOSAGES.find((d) => d.value === dosage)?.color || colors.primary;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Adicionar Injeção</Text>

          <TouchableOpacity onPress={handleSave} disabled={!canSave || isSaving}>
            <Text
              style={[
                styles.saveButton,
                {
                  color: canSave && !isSaving ? colors.primary : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* DATA */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA</Text>
            <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={[styles.dateInputText, { color: colors.text }]}>{formatDate(data.date)}</Text>
                <Text style={{ color: colors.textSecondary }}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* HORÁRIO */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HORÁRIO</Text>
            <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={[styles.timeInputText, { color: colors.text }]}>Tempo Decorrido</Text>
                </View>
                <Text style={[styles.timeValue, { color: colors.text }]}>{formatTimeElapsed()}</Text>
              </View>
            </View>
          </View>

          {/* DETALHES */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DETALHES</Text>

            {/* Nome do Medicamento */}
            <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Nome do Medicamento</Text>
            <TouchableOpacity
                style={styles.detailValue}
                onPress={() => setShowMedicationModal(true)}
            >
                <Text style={[styles.detailValueText, { color: colors.primary }]}>
                  {getMedicationName()}
                </Text>
                <Text style={{ color: colors.textSecondary }}>▼</Text>
            </TouchableOpacity>
            </View>

            {/* Dosagem */}
            <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Dosagem</Text>
            <TouchableOpacity
                style={styles.detailValue}
                onPress={() => setShowDosageModal(true)}
              >
                {data.dosage ? (
                  <View
                    style={[
                      styles.dosageTag,
                      { backgroundColor: getDosageColor(data.dosage) },
                    ]}
                  >
                    <Text style={styles.dosageTagText}>{data.dosage}mg</Text>
                  </View>
                ) : (
                  <Text style={[styles.detailValueText, { color: colors.textSecondary }]}>
                    Selecione
                  </Text>
                )}
                <Text style={{ color: colors.textSecondary }}>▼</Text>
            </TouchableOpacity>
            </View>

            {/* Local de Injeção */}
            <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Local de Injeção</Text>
              <TouchableOpacity
                style={styles.detailValue}
                onPress={() => setShowInjectionSiteModal(true)}
              >
                <Text
                  style={[
                    styles.detailValueText,
                    { color: data.injectionSite ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {data.injectionSite ? getInjectionSiteName() : 'Selecione'}
                </Text>
                <Text style={{ color: colors.textSecondary }}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Nível de Dor */}
            <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Nível de Dor</Text>
              <View style={styles.painSliderContainer}>
                <Slider
                  style={styles.painSlider}
                  minimumValue={0}
                  maximumValue={10}
                  value={data.painLevel}
                  onValueChange={(value) => setData({ ...data, painLevel: value })}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
            />
                <Text style={[styles.painValue, { color: colors.primary }]}>
                  {Math.round(data.painLevel)}
                </Text>
              </View>
            </View>
          </View>

          {/* PRÉVIA NÍVEL ESTIMADO */}
          {data.dosage && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                PRÉVIA NÍVEL ESTIMADO
              </Text>
              <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <EstimatedLevelsChart
                  applications={[
                    {
                      id: 'preview',
                      user_id: '',
                      date: data.date,
                      dosage: data.dosage || 0,
                      injection_sites: [],
                      side_effects: [],
                      notes: '',
                      created_at: data.date,
                      updated_at: data.date,
                    },
                    ...applications,
                  ]}
                  period="week"
            />
              </View>
            </View>
          )}

          {/* NOTAS */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NOTAS DE INJEÇÃO</Text>
            <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
                style={[styles.notesInput, { color: colors.text }]}
                placeholder="Adicionar notas"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={data.notes}
              onChangeText={(notes) => setData({ ...data, notes })}
            />
            </View>
          </View>

          {/* Delete Button */}
          {isEditMode && (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Deletar Aplicação</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Medication Modal */}
        <Modal
          visible={showMedicationModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMedicationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowMedicationModal(false)}>
                  <Text style={[styles.modalCloseButton, { color: colors.primary }]}>Fechar</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Nome do Medicamento
                </Text>
                <View style={{ width: 60 }} />
              </View>
              <FlatList
                data={MEDICATIONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      { borderBottomColor: colors.border },
                      data.medication === item.id && { backgroundColor: colors.cardSecondary },
                    ]}
                    onPress={() => {
                      setData({ ...data, medication: item.id });
                      setShowMedicationModal(false);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={[styles.modalItemText, { color: colors.text }]}>{item.name}</Text>
                    {data.medication === item.id && (
                      <Text style={[styles.modalItemCheck, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Dosage Modal */}
        <Modal
          visible={showDosageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDosageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowDosageModal(false)}>
                  <Text style={[styles.modalCloseButton, { color: colors.primary }]}>Fechar</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Opções de Dosagem</Text>
                <View style={{ width: 60 }} />
              </View>
              <FlatList
                data={DOSAGES}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      { borderBottomColor: colors.border },
                      data.dosage === item.value && { backgroundColor: colors.cardSecondary },
                    ]}
                    onPress={() => {
                      setData({ ...data, dosage: item.value });
                      setShowDosageModal(false);
                      Haptics.selectionAsync();
                    }}
                  >
                    <View style={[styles.dosageTag, { backgroundColor: item.color }]}>
                      <Text style={styles.dosageTagText}>{item.value}mg</Text>
                    </View>
                    {data.dosage === item.value && (
                      <View
                        style={[
                          styles.dosageCheck,
                          { borderColor: item.color },
                        ]}
                      >
                        <View style={[styles.dosageCheckInner, { backgroundColor: item.color }]} />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Injection Site Modal */}
        <Modal
          visible={showInjectionSiteModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowInjectionSiteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowInjectionSiteModal(false)}>
                  <Text style={[styles.modalCloseButton, { color: colors.primary }]}>Fechar</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Locais de Injeção</Text>
                <Text style={{ width: 60 }} />
              </View>
              <View style={[styles.modalSectionHeader, { backgroundColor: colors.background }]}>
                <Text style={[styles.modalSectionHeaderText, { color: colors.textSecondary }]}>
                  ROTAÇÃO ATIVA
                </Text>
              </View>
              <FlatList
                data={INJECTION_SITES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      { borderBottomColor: colors.border },
                      data.injectionSite === item.id && { backgroundColor: colors.cardSecondary },
                    ]}
                    onPress={() => {
                      setData({ ...data, injectionSite: item.id });
                      setShowInjectionSiteModal(false);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={[styles.modalItemText, { color: colors.text }]}>{item.name}</Text>
                    {data.injectionSite === item.id && (
                      <Text style={[styles.modalItemCheck, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={data.date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setData({ ...data, date: selectedDate });
              }
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={data.date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event, selectedDate) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setData({ ...data, date: selectedDate });
              }
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
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
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
  },
  timeInputText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,  // Adicionar minHeight para touch target adequado
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dosageTag: {
    paddingHorizontal: 8,  // Mudança: 12 → 8px (Shotsy badge padding)
    paddingVertical: 6,
    borderRadius: 16,
  },
  dosageTagText: {
    color: '#FFFFFF', // Always white for contrast on colored dosage badges
    fontSize: 14,
    fontWeight: '600',
  },
  painSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  painSlider: {
    flex: 1,
    height: 40,
  },
  painValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  chartContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 200,
  },
  notesInput: {
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  deleteButton: {
    // backgroundColor will be applied inline using colors.error
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  deleteButtonText: {
    color: '#FFFFFF', // Always white for contrast on error background
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay - same in both modes
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalSectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,  // Adicionar minHeight para touch target adequado
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  modalItemCheck: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dosageCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dosageCheckInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
