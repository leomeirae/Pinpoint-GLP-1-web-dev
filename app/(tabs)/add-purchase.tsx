import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { Input } from '@/components/ui/input';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { trackEvent } from '@/lib/analytics';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPurchaseScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useProfile();

  const [medicationName, setMedicationName] = useState(profile?.medication || '');
  const [packageDetails, setPackageDetails] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = medicationName && price && purchaseDate;

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    const priceNumber = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNumber)) {
      Alert.alert('Erro', 'Por favor, insira um valor de preço válido.');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('purchases').insert([
        {
          medication_name: medicationName,
          package_details: packageDetails || null,
          price: priceNumber,
          location: location || null,
          purchase_date: purchaseDate.toISOString().split('T')[0],
        },
      ]);
      if (error) throw error;
      trackEvent('purchase_added', {
        medication_name: medicationName,
        price: priceNumber,
      });
      Alert.alert('Sucesso!', 'Compra registrada com sucesso.');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível salvar a compra. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: colors.primary, fontSize: 16 }}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Adicionar Compra</Text>
            <TouchableOpacity onPress={handleSave} disabled={!canSave || isSaving}>
                <Text style={{ color: canSave && !isSaving ? colors.primary : colors.textMuted, fontSize: 16, fontWeight: '600' }}>Salvar</Text>
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Input
            label="Nome do Medicamento"
            placeholder="Ex: Mounjaro, Ozempic"
            value={medicationName}
            onChangeText={setMedicationName}
          />
          <Input
            label="Detalhes do Pacote (Opcional)"
            placeholder="Ex: 2 canetas de 1.5mg"
            value={packageDetails}
            onChangeText={setPackageDetails}
          />
          <Input
            label="Preço (R$)"
            placeholder="Ex: 1200,50"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <Input
            label="Local da Compra (Opcional)"
            placeholder="Ex: Farmácia São Paulo"
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateInput, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.textSecondary }}>Data da Compra</Text>
            <Text style={{ color: colors.text, ...ShotsyDesignTokens.typography.body }}>
              {purchaseDate.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={purchaseDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setPurchaseDate(selectedDate);
                }
              }}
            />
          )}
        </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h4,
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  dateInput: {
    padding: 16,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
