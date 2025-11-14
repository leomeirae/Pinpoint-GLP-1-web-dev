// app/(tabs)/finance/add-purchase.tsx
// Tela para adicionar/editar compra

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { ScalePress } from '@/components/animations';
import { usePurchases } from '@/hooks/usePurchases';
import { getMedicationConfigs } from '@/lib/medicationConfig';
import { parseCurrencyToCents } from '@/lib/finance';
import { createLogger } from '@/lib/logger';
import type { MedicationConfig } from '@/constants/medications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarBlank } from 'phosphor-react-native';

const logger = createLogger('AddPurchaseScreen');

export default function AddPurchaseScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addPurchase, updatePurchase, purchases } = usePurchases();

  const purchaseId = params.purchaseId as string | undefined;
  const isEditing = !!purchaseId;

  const [medications, setMedications] = useState<MedicationConfig[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<MedicationConfig | null>(null);
  const [brand, setBrand] = useState('');
  const [selectedDosage, setSelectedDosage] = useState<number | null>(null);
  const [packageQty, setPackageQty] = useState('4');
  const [quantity, setQuantity] = useState('1');
  const [priceInput, setPriceInput] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Fetch medications
  useEffect(() => {
    fetchMedications();
  }, []);

  // Se editing, carregar dados da compra
  useEffect(() => {
    if (isEditing && purchaseId) {
      loadPurchaseData();
    }
  }, [purchaseId, purchases]);

  const fetchMedications = async () => {
    try {
      const configs = await getMedicationConfigs();
      setMedications(configs);
      logger.info('Medications fetched', { count: configs.length });
    } catch (error) {
      logger.error('Error fetching medications', error as Error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de medicamentos.');
    }
  };

  const loadPurchaseData = () => {
    const purchase = purchases.find((p) => p.id === purchaseId);
    if (!purchase) {
      Alert.alert('Erro', 'Compra não encontrada.');
      router.back();
      return;
    }

    // Carregar dados
    const medication = medications.find((m) => m.id === purchase.medication);
    if (medication) {
      setSelectedMedication(medication);
    }
    setBrand(purchase.brand || '');
    setSelectedDosage(purchase.dosage);
    setPackageQty(String(purchase.package_qty));
    setQuantity(String(purchase.quantity));
    setPriceInput((purchase.total_price_cents / 100).toFixed(2));
    setPurchaseDate(new Date(purchase.purchase_date));
    setLocation(purchase.location || '');
    setNotes(purchase.notes || '');
    setInitialLoading(false);
  };

  const handleMedicationSelect = (medication: MedicationConfig) => {
    setSelectedMedication(medication);
    setSelectedDosage(null); // Reset dosage
  };

  const handleDosageSelect = (dosage: number) => {
    setSelectedDosage(dosage);
  };

  const formatCurrencyInput = (value: string) => {
    // Remove tudo exceto números e vírgula
    let cleaned = value.replace(/[^0-9,]/g, '');
    
    // Permitir apenas uma vírgula
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      cleaned = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limitar casas decimais
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const handlePriceChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setPriceInput(formatted);
  };

  const validateForm = (): boolean => {
    if (!selectedMedication) {
      Alert.alert('Campo Obrigatório', 'Selecione um medicamento.');
      return false;
    }

    if (selectedDosage === null) {
      Alert.alert('Campo Obrigatório', 'Selecione uma dosagem.');
      return false;
    }

    if (!packageQty || parseInt(packageQty) < 1) {
      Alert.alert('Campo Inválido', 'Informe a quantidade de canetas/unidades por embalagem.');
      return false;
    }

    if (!quantity || parseInt(quantity) < 1) {
      Alert.alert('Campo Inválido', 'Informe a quantidade de embalagens.');
      return false;
    }

    if (!priceInput || parseFloat(priceInput.replace(',', '.')) <= 0) {
      Alert.alert('Campo Inválido', 'Informe o preço total da compra.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const totalPriceCents = parseCurrencyToCents(priceInput);

      const purchaseData = {
        medication: selectedMedication!.id,
        brand: brand.trim() || undefined,
        dosage: selectedDosage!,
        unit: selectedMedication!.unit,
        package_form: 'pen',
        package_qty: parseInt(packageQty),
        quantity: parseInt(quantity),
        currency: 'BRL',
        total_price_cents: totalPriceCents,
        purchase_date: purchaseDate.toISOString(),
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditing) {
        await updatePurchase(purchaseId!, purchaseData);
        logger.info('Purchase updated', { purchaseId });
        Alert.alert('Sucesso', 'Compra atualizada com sucesso.');
      } else {
        await addPurchase(purchaseData);
        logger.info('Purchase added');
        Alert.alert('Sucesso', 'Compra registrada com sucesso.');
      }

      router.back();
    } catch (error) {
      logger.error('Error saving purchase', error as Error);
      Alert.alert('Erro', 'Não foi possível salvar a compra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Medicamento */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Medicamento <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View style={styles.optionsGrid}>
            {medications.map((med) => (
              <ScalePress
                key={med.id}
                onPress={() => handleMedicationSelect(med)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      selectedMedication?.id === med.id
                        ? colors.primary
                        : colors.backgroundSecondary,
                    borderColor:
                      selectedMedication?.id === med.id ? colors.primary : colors.border,
                  },
                ]}
                hapticType="light"
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: selectedMedication?.id === med.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {med.name}
                </Text>
              </ScalePress>
            ))}
          </View>
        </View>

        {/* Marca (opcional) */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Marca (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundSecondary, color: colors.text },
            ]}
            value={brand}
            onChangeText={setBrand}
            placeholder="Ex: Lilly, Novo Nordisk"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Dosagem */}
        {selectedMedication && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>
              Dosagem <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <View style={styles.optionsGrid}>
              {selectedMedication?.availableDoses?.map((dose) => (
                <ScalePress
                  key={dose}
                  onPress={() => handleDosageSelect(dose)}
                  style={[
                    styles.optionButton,
                    styles.dosageButton,
                    {
                      backgroundColor:
                        selectedDosage === dose ? colors.primary : colors.backgroundSecondary,
                      borderColor: selectedDosage === dose ? colors.primary : colors.border,
                    },
                  ]}
                  hapticType="light"
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: selectedDosage === dose ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {dose}
                    {selectedMedication.unit}
                  </Text>
                </ScalePress>
              ))}
            </View>
          </View>
        )}

        {/* Canetas por embalagem */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Canetas por Embalagem <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundSecondary, color: colors.text },
            ]}
            value={packageQty}
            onChangeText={setPackageQty}
            keyboardType="number-pad"
            placeholder="Ex: 4"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Quantidade de Embalagens */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Quantidade de Embalagens <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundSecondary, color: colors.text },
            ]}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            placeholder="Ex: 1"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Preço Total */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Preço Total (R$) <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View style={styles.priceInputContainer}>
            <Text style={[styles.currencyPrefix, { color: colors.text }]}>R$</Text>
            <TextInput
              style={[
                styles.input,
                styles.priceInput,
                { backgroundColor: colors.backgroundSecondary, color: colors.text },
              ]}
              value={priceInput}
              onChangeText={handlePriceChange}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Data da Compra */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Data da Compra <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <CalendarBlank size={20} color={colors.primary} weight="regular" />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              {formatDateDisplay(purchaseDate)}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={purchaseDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setPurchaseDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Local (opcional) */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Local (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundSecondary, color: colors.text },
            ]}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Farmácia Pague Menos"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Notas (opcional) */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Notas (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.backgroundSecondary, color: colors.text },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Observações adicionais..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Botões */}
        <View style={styles.buttons}>
          <ScalePress
            onPress={handleCancel}
            style={[
              styles.button,
              styles.buttonSecondary,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
            ]}
            hapticType="light"
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
          </ScalePress>

          <ScalePress
            onPress={handleSave}
            style={[styles.button, styles.buttonPrimary, { backgroundColor: colors.primary }]}
            hapticType="medium"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Text>
            )}
          </ScalePress>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.lg,
    paddingBottom: ShotsyDesignTokens.spacing.xxl,
  },
  section: {
    marginBottom: ShotsyDesignTokens.spacing.lg,
  },
  label: {
    ...ShotsyDesignTokens.typography.h5,
    marginBottom: ShotsyDesignTokens.spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  optionButton: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    paddingVertical: ShotsyDesignTokens.spacing.sm,
    paddingHorizontal: ShotsyDesignTokens.spacing.md,
    borderWidth: 1,
  },
  dosageButton: {
    minWidth: 70,
  },
  optionText: {
    ...ShotsyDesignTokens.typography.button,
    textAlign: 'center',
  },
  input: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    paddingHorizontal: ShotsyDesignTokens.spacing.md,
    ...ShotsyDesignTokens.typography.body,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  currencyPrefix: {
    ...ShotsyDesignTokens.typography.h4,
  },
  priceInput: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    paddingHorizontal: ShotsyDesignTokens.spacing.md,
    borderWidth: 1,
  },
  dateButtonText: {
    ...ShotsyDesignTokens.typography.body,
    flex: 1,
  },
  textArea: {
    height: 100,
    paddingTop: ShotsyDesignTokens.spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.md,
    marginTop: ShotsyDesignTokens.spacing.lg,
  },
  button: {
    flex: 1,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    paddingVertical: ShotsyDesignTokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonPrimary: {},
  buttonText: {
    ...ShotsyDesignTokens.typography.button,
  },
});

