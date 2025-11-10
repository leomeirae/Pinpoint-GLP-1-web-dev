import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { Ionicons } from '@expo/vector-icons';

interface HealthDisclaimerScreenProps {
  onNext: (consentAccepted: boolean) => void;
  onBack: () => void;
}

export function HealthDisclaimerScreen({ onNext, onBack }: HealthDisclaimerScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(31, 41, 55, 0.5)' }]}>
      {/* Progress bar */}
      <View style={[styles.progressContainer, { top: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: '35%', backgroundColor: colors.primary }]} />
        </View>
      </View>

      {/* Modal */}
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Aviso de Saúde</Text>

        <Text style={[styles.text, { color: colors.textSecondary }]}>
          As informações fornecidas por este aplicativo são apenas para fins de acompanhamento e educação. O Pinpoint GLP-1
          não deve ser usado como substituto de aconselhamento médico profissional, diagnóstico ou tratamento.
          Sempre consulte seu médico ou outro profissional de saúde qualificado antes de tomar decisões médicas.
        </Text>

        <Text style={[styles.textHighlight, { color: colors.text }]}>
          <Text style={{ fontWeight: '700' }}>⚕️ Prescrição Obrigatória no Brasil:</Text> O uso de medicamentos GLP-1 (Mounjaro®, Ozempic®, Wegovy®) requer prescrição e acompanhamento médico contínuo.
        </Text>

        <View style={[styles.switchContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Aceitar aviso de saúde</Text>
          <Switch
            value={accepted}
            onValueChange={setAccepted}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <ShotsyButton
          title="Continuar"
          onPress={() => onNext(accepted)}
          disabled={!accepted}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  progressContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  textHighlight: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 24,
  },
});
