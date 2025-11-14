import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity, Text, ActivityIndicator, Switch, Platform } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { ShotsyCircularProgressV2 } from '@/components/ui/ShotsyCircularProgressV2';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as StoreReview from 'expo-store-review';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { performSignOut, performAccountDeletion } from '@/lib/auth';
import { getAnalyticsOptIn, setAnalyticsOptIn } from '@/lib/analytics';
import { useTheme, ThemeMode } from '@/lib/theme-context';
import {
  CreditCard,
  Target,
  Pill,
  BellRinging,
  Database,
  Info,
  Question,
  Star,
  SignOut,
  Warning,
  ShieldCheck,
  Envelope,
  ChatCircle,
  FileText,
} from 'phosphor-react-native';

const logger = createLogger('Settings');

interface SettingsItem {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
  premium?: boolean;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { mode, setMode } = useTheme();

  // Local state for settings (synced with Supabase)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load analytics opt-in status
  useEffect(() => {
    const loadAnalyticsStatus = async () => {
      const optIn = await getAnalyticsOptIn();
      setAnalyticsEnabled(optIn);
    };
    loadAnalyticsStatus();
  }, []);

  const handleSignOut = async () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await performSignOut(signOut, router);
          } catch (error) {
            logger.error('Error during sign out', error as Error);
            // Try fallback navigation
            try {
              logger.debug('Attempting fallback redirect with push');
              router.push('/(auth)/welcome');
            } catch (fallbackError) {
              logger.error('Fallback redirect also failed', fallbackError as Error);
              Alert.alert('Erro', 'Não foi possível sair da conta. Por favor, feche o app e tente novamente.');
            }
          }
        },
      },
    ]);
  };

  const handleToggleAnalytics = async (value: boolean) => {
    try {
      setAnalyticsEnabled(value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!user?.id) {
        Alert.alert('Erro', 'Usuário não autenticado');
        setAnalyticsEnabled(!value);
        return;
      }

      await setAnalyticsOptIn(value, user.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const message = value 
        ? 'Dados anônimos de uso serão compartilhados para melhorar o app.' 
        : 'Dados de uso não serão mais compartilhados.';
      
      Alert.alert(value ? 'Ativado' : 'Desativado', message);
    } catch (error) {
      logger.error('Error updating analytics opt-in', error as Error);
      setAnalyticsEnabled(!value);
      Alert.alert('Erro', 'Não foi possível atualizar as preferências de analytics');
    }
  };

  const handleThemePress = () => {
    Alert.alert(
      'Selecionar Tema',
      'Escolha o tema do aplicativo',
      [
        {
          text: 'Claro',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await setMode('light');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: mode === 'light' ? 'default' : undefined,
        },
        {
          text: 'Escuro',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await setMode('dark');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: mode === 'dark' ? 'default' : undefined,
        },
        {
          text: 'Automático',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await setMode('system');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: mode === 'system' ? 'default' : undefined,
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente excluídos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            // Confirmation dialog before actual deletion
            Alert.alert(
              'Confirmação Final',
              'Tem certeza? Esta ação é irreversível.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sim, Excluir',
                  style: 'destructive',
                  onPress: () => handleAccountDeletionConfirmed(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleAccountDeletionConfirmed = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    try {
      setDeletingAccount(true);
      await performAccountDeletion(user.id, signOut, router);

      Alert.alert('Sucesso', 'Sua conta foi excluída com sucesso.', [
        {
          text: 'OK',
          onPress: () => {
            logger.info('User acknowledged account deletion');
          },
        },
      ]);
    } catch (error) {
      setDeletingAccount(false);

      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido ao excluir conta';

      Alert.alert(
        'Erro ao Excluir Conta',
        `Não foi possível excluir a conta. Detalhes: ${errorMessage}\n\nTente novamente ou entre em contato com o suporte.`,
        [
          { text: 'Tentar Novamente', style: 'default' },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  // Helper para converter para CSV
  const convertToCSV = (data: any): string => {
    const { applications, weights, purchases } = data;
    
    let csv = 'APLICAÇÕES\n';
    csv += 'Data,Dosagem,Local,Notas\n';
    applications?.forEach((app: any) => {
      csv += `${app.application_date},${app.dosage},${app.injection_sites?.[0] || ''},${app.notes || ''}\n`;
    });
    
    csv += '\n\nPESOS\n';
    csv += 'Data,Peso (kg)\n';
    weights?.forEach((w: any) => {
      csv += `${w.date},${w.weight}\n`;
    });
    
    csv += '\n\nCOMPRAS\n';
    csv += 'Data,Medicamento,Dosagem,Quantidade,Preço (R$)\n';
    purchases?.forEach((p: any) => {
      csv += `${p.purchase_date},${p.medication},${p.dosage},${p.quantity},${(p.total_price_cents / 100).toFixed(2)}\n`;
    });
    
    return csv;
  };

  const handleExportData = async () => {
    Alert.alert(
      'Exportar Dados',
      'Escolha o formato de exportação:',
      [
        {
          text: 'CSV',
          onPress: async () => {
            try {
              setLoading(true);
              
              if (!user?.id) {
                Alert.alert('Erro', 'Usuário não autenticado');
                setLoading(false);
                return;
              }
              
              // Buscar todos os dados do usuário
              const { data: applications } = await supabase
                .from('applications')
                .select('*')
                .eq('user_id', user.id)
                .order('application_date', { ascending: false });
              
              const { data: weights } = await supabase
                .from('weights')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
              
              const { data: purchases } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', user.id)
                .order('purchase_date', { ascending: false });
              
              // Converter para CSV
              const csv = convertToCSV({
                applications,
                weights,
                purchases,
              });
              
              // Salvar arquivo temporário
              const fileUri = `${FileSystem.documentDirectory}pinpoint-data-${Date.now()}.csv`;
              await FileSystem.writeAsStringAsync(fileUri, csv, {
                encoding: FileSystem.EncodingType.UTF8,
              });
              
              // Compartilhar arquivo
              await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Exportar Dados - Pinpoint GLP-1',
                UTI: 'public.comma-separated-values-text',
              });
              
              setLoading(false);
              Alert.alert('Sucesso', 'Dados exportados com sucesso!');
            } catch (error) {
              setLoading(false);
              logger.error('Error exporting data', error as Error);
              Alert.alert('Erro', 'Não foi possível exportar os dados');
            }
          },
        },
        {
          text: 'JSON',
          onPress: async () => {
            try {
              setLoading(true);
              
              if (!user?.id) {
                Alert.alert('Erro', 'Usuário não autenticado');
                setLoading(false);
                return;
              }
              
              // Buscar todos os dados
              const { data: applications } = await supabase
                .from('applications')
                .select('*')
                .eq('user_id', user.id);
              
              const { data: weights } = await supabase
                .from('weights')
                .select('*')
                .eq('user_id', user.id);
              
              const { data: purchases } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', user.id);
              
              const exportData = {
                export_date: new Date().toISOString(),
                user_id: user.id,
                applications,
                weights,
                purchases,
              };
              
              const json = JSON.stringify(exportData, null, 2);
              
              // Salvar arquivo
              const fileUri = `${FileSystem.documentDirectory}pinpoint-data-${Date.now()}.json`;
              await FileSystem.writeAsStringAsync(fileUri, json, {
                encoding: FileSystem.EncodingType.UTF8,
              });
              
              await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Exportar Dados - Pinpoint GLP-1',
              });
              
              setLoading(false);
              Alert.alert('Sucesso', 'Dados exportados com sucesso!');
            } catch (error) {
              setLoading(false);
              logger.error('Error exporting data', error as Error);
              Alert.alert('Erro', 'Não foi possível exportar os dados');
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Apagar Dados',
      'Isso irá excluir PERMANENTEMENTE todos os seus registros de:\n\n• Aplicações\n• Pesos\n• Compras\n• Efeitos colaterais\n• Pausas no tratamento\n\nSua conta permanecerá ativa.\n\nEsta ação NÃO pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            // Confirmação dupla
            Alert.alert(
              'Confirmação Final',
              'Tem certeza absoluta? Não há como recuperar os dados depois.',
              [
                { text: 'Não, Cancelar', style: 'cancel' },
                {
                  text: 'Sim, Apagar Tudo',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (!user?.id) {
                        Alert.alert('Erro', 'Usuário não autenticado');
                        return;
                      }

                      setLoading(true);
                      
                      // Deletar todos os dados do usuário
                      await Promise.all([
                        supabase.from('applications').delete().eq('user_id', user.id),
                        supabase.from('weights').delete().eq('user_id', user.id),
                        supabase.from('side_effects').delete().eq('user_id', user.id),
                        supabase.from('purchases').delete().eq('user_id', user.id),
                        supabase.from('treatment_pauses').delete().eq('user_id', user.id),
                        supabase.from('alcohol_logs').delete().eq('user_id', user.id),
                      ]);
                      
                      setLoading(false);
                      Alert.alert(
                        'Dados Apagados',
                        'Todos os seus dados foram permanentemente excluídos.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              // Recarregar app ou voltar para home
                              router.replace('/(tabs)/dashboard');
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      setLoading(false);
                      logger.error('Error deleting data', error as Error);
                      Alert.alert('Erro', 'Não foi possível apagar os dados. Tente novamente.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleRateApp = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        // Solicitar avaliação in-app (iOS/Android)
        await StoreReview.requestReview();
      } else {
        // Fallback: abrir loja diretamente
        const storeUrl = Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/id[YOUR_APP_ID]' // TODO: Substituir com ID real
          : 'https://play.google.com/store/apps/details?id=com.pinpointglp1.app'; // TODO: Substituir com package real
        
        await Linking.openURL(storeUrl);
      }
    } catch (error) {
      logger.error('Error opening app store', error as Error);
      Alert.alert('Erro', 'Não foi possível abrir a página de avaliação');
    }
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@pinpointglp1.app?subject=Suporte Pinpoint GLP-1');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://pinpointglp1.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://pinpointglp1.app/terms');
  };

  // Get current theme name from theme context
  const currentTheme = mode === 'light' ? 'Claro' : mode === 'dark' ? 'Escuro' : 'Automático';

  // 1. CONTA & ASSINATURA
  const accountItems: SettingsItem[] = [
    {
      icon: <CreditCard size={20} color={colors.primary} weight="bold" />,
      label: 'Minha Assinatura',
      onPress: () => router.push('/(tabs)/premium'),
      premium: true,
    },
  ];

  // 2. TRATAMENTO
  const treatmentItems: SettingsItem[] = [
    {
      icon: <Pill size={20} color={colors.primary} weight="bold" />,
      label: 'Medicamento & Frequência',
      onPress: () => router.push('/treatment-settings'),
    },
    {
      icon: <Target size={20} color={colors.accentGreen || '#22c55e'} weight="bold" />,
      label: 'Altura & Peso Meta',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      icon: <BellRinging size={20} color={colors.accentOrange || '#f97316'} weight="bold" />,
      label: 'Notificações',
      onPress: () => router.push('/(tabs)/notification-settings'),
    },
  ];

  // 3. DADOS & PRIVACIDADE
  const privacyItems: SettingsItem[] = [
    {
      icon: <Database size={20} color={colors.accentBlue || '#3b82f6'} weight="bold" />,
      label: 'Exportar Meus Dados',
      subtitle: 'CSV ou JSON',
      onPress: handleExportData,
    },
    {
      icon: <Warning size={20} color={colors.error} weight="bold" />,
      label: 'Apagar Meus Dados',
      subtitle: 'Registros e progresso',
      color: colors.error,
      onPress: handleDeleteData,
    },
    {
      icon: <ShieldCheck size={20} color={colors.textSecondary} weight="bold" />,
      label: 'Política de Privacidade',
      onPress: handlePrivacyPolicy,
    },
    {
      icon: <FileText size={20} color={colors.textSecondary} weight="bold" />,
      label: 'Termos de Uso',
      onPress: handleTerms,
    },
  ];

  // 4. AJUDA & SOBRE
  const helpItems: SettingsItem[] = [
    {
      icon: <Question size={20} color={colors.textSecondary} weight="bold" />,
      label: 'Perguntas Frequentes',
      onPress: () => router.push('/(tabs)/faq'),
    },
    {
      icon: <ChatCircle size={20} color={colors.primary} weight="bold" />,
      label: 'Falar com Suporte',
      subtitle: 'Email ou WhatsApp',
      onPress: handleSupport,
    },
    {
      icon: <Info size={20} color={colors.textSecondary} weight="bold" />,
      label: 'Sobre o App',
      onPress: () => router.push('/about'),
    },
    {
      icon: <Star size={20} color={colors.accentYellow || '#eab308'} weight="bold" />,
      label: 'Avalie este App',
      onPress: handleRateApp,
    },
  ];

  const renderSettingsItem = (item: SettingsItem, index: number, isLast: boolean) => {
    const content = (
      <TouchableOpacity
        style={[
          styles.settingsItem,
          isLast && styles.lastItem,
        ]}
        onPress={item.onPress}
        disabled={loading}
      >
        <View style={styles.settingsItemContent}>
          {item.icon}
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingsItemLabel, { color: item.color || colors.text }]}>
              {item.label}
            </Text>
            {item.subtitle && (
              <Text style={[styles.settingsItemSubtitle, { color: colors.textMuted }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </View>
      </TouchableOpacity>
    );

    if (item.premium) {
      return (
        <PremiumGate key={index} featureName="premium">
          {content}
        </PremiumGate>
      );
    }

    return <View key={index}>{content}</View>;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Simplified */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme Preview Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tema</Text>
          <TouchableOpacity
            style={[
              styles.themePreviewCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={handleThemePress}
          >
            <View style={styles.themePreviewContent}>
              <ShotsyCircularProgressV2
                progress={0.75}
                size="small"
                state="normal"
                centerText=""
              />
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>Tema Ativo</Text>
                <Text style={[styles.themeName, { color: colors.text }]}>{currentTheme}</Text>
                <Text style={[styles.themeDescription, { color: colors.textMuted }]}>
                  Tap to customize theme
                </Text>
              </View>
            </View>
            <View style={styles.chevronContainer}>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 1. CONTA & ASSINATURA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conta & Assinatura</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {/* Email readonly */}
            <View style={styles.emailContainer}>
              <Envelope size={20} color={colors.textSecondary} weight="bold" />
              <View style={styles.emailContent}>
                <Text style={[styles.emailLabel, { color: colors.textMuted }]}>
                  Email
                </Text>
                <Text style={[styles.emailValue, { color: colors.text }]}>
                  {user?.email || 'Não disponível'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            {accountItems.map((item, index) =>
              renderSettingsItem(item, index, index === accountItems.length - 1)
            )}
          </View>
        </View>

        {/* 2. TRATAMENTO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tratamento</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {treatmentItems.map((item, index) =>
              renderSettingsItem(item, index, index === treatmentItems.length - 1)
            )}
          </View>
        </View>

        {/* 3. DADOS & PRIVACIDADE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados & Privacidade</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {/* Analytics Opt-in Toggle */}
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemContent}>
                <ShieldCheck size={20} color={colors.accentPurple || '#a855f7'} weight="bold" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingsItemLabel, { color: colors.text }]}>
                    Compartilhar Dados de Uso
                  </Text>
                  <Text style={[styles.settingsItemSubtitle, { color: colors.textMuted }]}>
                    Ajude a melhorar o app com dados anônimos
                  </Text>
                </View>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={handleToggleAnalytics}
                trackColor={{ false: colors.textMuted, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {privacyItems.map((item, index) =>
              renderSettingsItem(item, index, index === privacyItems.length - 1)
            )}
          </View>
        </View>

        {/* 4. AJUDA & SOBRE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ajuda & Sobre</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {helpItems.map((item, index) =>
              renderSettingsItem(item, index, index === helpItems.length - 1)
            )}
          </View>
        </View>

        {/* 5. AÇÕES DA CONTA (Separado) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conta</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={handleSignOut}
              disabled={loading}
            >
              <View style={styles.settingsItemContent}>
                <SignOut size={20} color={colors.error} weight="bold" />
                <Text style={[styles.settingsItemLabel, { color: colors.error }]}>
                  Sair da Conta
                </Text>
              </View>
              <View style={styles.chevronContainer}>
                <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingsItem, styles.lastItem]}
              onPress={handleDeleteAccount}
              disabled={deletingAccount || loading}
            >
              <View style={styles.settingsItemContent}>
                {deletingAccount ? (
                  <ActivityIndicator color={colors.error} />
                ) : (
                  <Warning size={20} color={colors.error} weight="bold" />
                )}
                <Text style={[styles.settingsItemLabel, { color: colors.error }]}>
                  {deletingAccount ? 'Excluindo...' : 'Excluir Conta'}
                </Text>
              </View>
              {!deletingAccount && (
                <View style={styles.chevronContainer}>
                  <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h3,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.md,
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingVertical: ShotsyDesignTokens.spacing.lg,
  },
  emailContent: {
    flex: 1,
  },
  emailLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 2,
  },
  emailValue: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ShotsyDesignTokens.spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: ShotsyDesignTokens.spacing.xxl,
  },
  sectionTitle: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: ShotsyDesignTokens.spacing.md,
  },

  // Theme Preview Card - NEW!
  themePreviewCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    padding: ShotsyDesignTokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.lg,
    flex: 1,
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    ...ShotsyDesignTokens.typography.caption,
    marginBottom: 2,
  },
  themeName: {
    ...ShotsyDesignTokens.typography.h3,
    marginBottom: 2,
  },
  themeDescription: {
    ...ShotsyDesignTokens.typography.caption,
  },

  // Settings Card
  settingsCard: {
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingVertical: ShotsyDesignTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.md,
    flex: 1,
  },
  settingsItemLabel: {
    ...ShotsyDesignTokens.typography.body,
    fontWeight: '500',
  },
  settingsItemSubtitle: {
    ...ShotsyDesignTokens.typography.caption,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: ShotsyDesignTokens.spacing.lg + 20 + ShotsyDesignTokens.spacing.md, // icon width + gap
  },
  chevronContainer: {
    width: 20,
    alignItems: 'center',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },

  bottomSpacer: {
    height: ShotsyDesignTokens.spacing.xxl,
  },
});
