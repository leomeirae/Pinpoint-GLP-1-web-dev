// app/(tabs)/settings/privacy.tsx
// Tela de configurações de privacidade e consentimentos

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, Info, X } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { getAnalyticsOptIn, setAnalyticsOptIn } from '@/lib/analytics';
import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PrivacyScreen');

export default function PrivacyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { userId } = useAuth();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [consentDate, setConsentDate] = useState<string | null>(null);

  // Carregar status atual
  useEffect(() => {
    loadAnalyticsStatus();
  }, []);

  const loadAnalyticsStatus = async () => {
    try {
      setLoading(true);
      
      // Carregar status de opt-in
      const optIn = await getAnalyticsOptIn();
      setAnalyticsEnabled(optIn);

      // Buscar data do último consentimento
      if (userId) {
        const { data } = await supabase
          .from('consent_history')
          .select('created_at')
          .eq('user_id', userId)
          .eq('consent_type', 'analytics')
          .eq('action', 'granted')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setConsentDate(data.created_at);
        }
      }
    } catch (error) {
      logger.error('Erro ao carregar status de analytics', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAnalytics = async (value: boolean) => {
    try {
      setSaving(true);
      
      if (!userId) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      await setAnalyticsOptIn(value, userId);
      setAnalyticsEnabled(value);

      if (value) {
        setConsentDate(new Date().toISOString());
        Alert.alert(
          'Ativado',
          'Dados anônimos de uso serão compartilhados para melhorar o app.'
        );
      } else {
        Alert.alert(
          'Desativado',
          'Dados de uso não serão mais compartilhados.'
        );
      }
    } catch (error) {
      logger.error('Erro ao alterar opt-in de analytics', error as Error);
      Alert.alert('Erro', 'Não foi possível salvar a preferência. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ShieldCheck size={48} color={colors.primary} weight="regular" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Privacidade
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Gerencie seus dados e consentimentos
          </Text>
        </View>

        {/* Seção Analytics */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            ShotsyDesignTokens.shadows.card,
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Compartilhar Dados de Uso
            </Text>
            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Info size={20} color={colors.textSecondary} weight="regular" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Dados anônimos ajudam a melhorar o app. Nenhum dado pessoal é compartilhado.
          </Text>

          <View style={styles.toggleContainer}>
            <Switch
              value={analyticsEnabled}
              onValueChange={handleToggleAnalytics}
              disabled={saving}
              trackColor={{ false: colors.border, true: colors.primaryBackground }}
              thumbColor={analyticsEnabled ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              {saving ? 'Salvando...' : analyticsEnabled ? 'Ativado' : 'Desativado'}
            </Text>
          </View>

          {consentDate && analyticsEnabled && (
            <Text style={[styles.statusText, { color: colors.textMuted }]}>
              Ativado desde {format(new Date(consentDate), "d 'de' MMMM", { locale: ptBR })}
            </Text>
          )}
        </View>

        {/* Informação Adicional */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.infoBackground,
              borderColor: colors.info,
            },
          ]}
        >
          <Info size={20} color={colors.info} weight="regular" />
          <Text style={[styles.infoText, { color: colors.info }]}>
            Você pode alterar essa preferência a qualquer momento. Seus dados pessoais estão
            sempre protegidos e criptografados.
          </Text>
        </View>

        {/* Link para Política de Privacidade */}
        <TouchableOpacity
          style={[styles.linkButton, { borderColor: colors.border }]}
          onPress={() => {
            Alert.alert(
              'Política de Privacidade',
              'Link para a política de privacidade será aberto em breve.'
            );
          }}
        >
          <Text style={[styles.linkButtonText, { color: colors.primary }]}>
            Ler Política de Privacidade Completa
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Informações */}
      <Modal
        visible={showInfoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                O que rastreamos?
              </Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.textSecondary} weight="bold" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                Quando você ativa o compartilhamento de dados, coletamos apenas informações
                anônimas sobre como você usa o app:
              </Text>

              <View style={styles.listItem}>
                <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.text }]}>
                  Telas visualizadas
                </Text>
              </View>

              <View style={styles.listItem}>
                <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.text }]}>
                  Funcionalidades utilizadas
                </Text>
              </View>

              <View style={styles.listItem}>
                <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.text }]}>
                  Tempo de uso do app
                </Text>
              </View>

              <View style={styles.listItem}>
                <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.text }]}>
                  Erros e problemas técnicos
                </Text>
              </View>

              <Text style={[styles.modalText, { color: colors.textSecondary, marginTop: 16 }]}>
                <Text style={{ fontWeight: '700' }}>NÃO coletamos:</Text>
                {'\n'}• Dados pessoais de saúde
                {'\n'}• Informações de identificação
                {'\n'}• Localização precisa
                {'\n'}• Dados financeiros
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowInfoModal(false)}
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.lg,
    gap: ShotsyDesignTokens.spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h2,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...ShotsyDesignTokens.typography.body,
    textAlign: 'center',
  },
  section: {
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
    gap: ShotsyDesignTokens.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h4,
    fontWeight: '600',
  },
  sectionDescription: {
    ...ShotsyDesignTokens.typography.body,
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
    marginTop: ShotsyDesignTokens.spacing.xs,
  },
  toggleLabel: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '600',
  },
  statusText: {
    ...ShotsyDesignTokens.typography.caption,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ShotsyDesignTokens.spacing.sm,
    padding: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    borderWidth: 1,
  },
  infoText: {
    ...ShotsyDesignTokens.typography.caption,
    flex: 1,
    lineHeight: 18,
  },
  linkButton: {
    padding: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  linkButtonText: {
    ...ShotsyDesignTokens.typography.button,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: ShotsyDesignTokens.borderRadius.xl,
    borderTopRightRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  modalTitle: {
    ...ShotsyDesignTokens.typography.h3,
    fontWeight: '700',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalText: {
    ...ShotsyDesignTokens.typography.body,
    lineHeight: 22,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ShotsyDesignTokens.spacing.sm,
    marginBottom: ShotsyDesignTokens.spacing.xs,
  },
  bullet: {
    ...ShotsyDesignTokens.typography.h4,
    fontWeight: '700',
  },
  listText: {
    ...ShotsyDesignTokens.typography.body,
    flex: 1,
  },
  modalButton: {
    padding: ShotsyDesignTokens.spacing.md,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    alignItems: 'center',
    marginTop: ShotsyDesignTokens.spacing.md,
  },
  modalButtonText: {
    ...ShotsyDesignTokens.typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

