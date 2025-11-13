import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
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
import { createLogger } from '@/lib/logger';
import { performSignOut, performAccountDeletion } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';
import {
  CreditCard,
  Ruler,
  Target,
  CalendarDots,
  Palette,
  GridFour,
  Pill,
  BellRinging,
  Heart,
  Database,
  CloudArrowUp,
  Info,
  Question,
  Megaphone,
  Star,
  SignOut,
  Warning,
  List,
  Gear,
  ShieldCheck,
} from 'phosphor-react-native';

const logger = createLogger('Settings');

interface SettingsItem {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
  premium?: boolean;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { profile } = useProfile();
  const { settings, updateSettings } = useSettings();

  // Local state for settings (synced with Supabase)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync settings from Supabase when loaded
  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.shot_reminder || false);
    }
  }, [settings]);

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

  const handleToggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (settings) {
        await updateSettings({ shot_reminder: value });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      logger.error('Error updating notifications', error as Error);
      setNotificationsEnabled(!value);
      Alert.alert('Erro', 'Não foi possível atualizar as notificações');
    }
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

  const handleSupport = () => {
    Linking.openURL('mailto:support@pinpointglp1.app?subject=Suporte Pinpoint GLP-1');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://pinpointglp1.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://pinpointglp1.app/terms');
  };

  // Get current theme name (simplified - you can make this dynamic based on actual theme)
  const currentTheme = settings?.theme || 'Auto';

  // Shotsy Design: Settings items with Phosphor icons
  const settingsItems: SettingsItem[] = [
    {
      icon: <CreditCard size={20} color={colors.accentPurple || '#a855f7'} weight="bold" />,
      label: 'Sua Assinatura',
      color: colors.accentPurple || '#a855f7',
      onPress: () => router.push('/(tabs)/premium'),
      premium: true,
    },
    {
      icon: <Ruler size={20} color={colors.accentBlue || '#3b82f6'} weight="bold" />,
      label: 'Unidades de Medida',
      color: colors.accentBlue || '#3b82f6',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: <Target size={20} color={colors.accentGreen || '#22c55e'} weight="bold" />,
      label: 'Altura & Peso Meta',
      color: colors.accentGreen || '#22c55e',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      icon: <CalendarDots size={20} color={colors.accentOrange || '#f97316'} weight="bold" />,
      label: 'Dias Entre Injeções',
      color: colors.accentOrange || '#f97316',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      icon: <Palette size={20} color={colors.accentPink || '#ec4899'} weight="bold" />,
      label: 'Personalizar',
      color: colors.accentPink || '#ec4899',
      onPress: () => router.push('/(tabs)/theme'),
    },
    {
      icon: <GridFour size={20} color={colors.accentYellow || '#eab308'} weight="bold" />,
      label: 'Widgets',
      color: colors.accentYellow || '#eab308',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: <Pill size={20} color={colors.primary || '#06b6d4'} weight="bold" />,
      label: 'Medicamentos',
      color: colors.primary || '#06b6d4',
      onPress: () => router.push('/(tabs)/medications'),
    },
    {
      icon: <BellRinging size={20} color={colors.accentRed || '#ef4444'} weight="bold" />,
      label: 'Notificações',
      color: colors.accentRed || '#ef4444',
      onPress: () => router.push('/(tabs)/notification-settings'),
    },
  ];

  // Shotsy Design: Data items
  const dataItems: SettingsItem[] = [
    {
      icon: <ShieldCheck size={20} color={colors.accentPurple || '#a855f7'} weight="bold" />,
      label: 'Consentimentos & Privacidade',
      color: colors.accentPurple || '#a855f7',
      onPress: () => router.push('/(tabs)/settings/privacy' as any),
    },
    {
      icon: <Heart size={20} color={colors.accentRed || '#ef4444'} weight="bold" />,
      label: 'Dados do Apple Saúde',
      color: colors.accentRed || '#ef4444',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: <Database size={20} color={colors.accentBlue || '#3b82f6'} weight="bold" />,
      label: 'Gerenciar Meus Dados',
      color: colors.accentBlue || '#3b82f6',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: <CloudArrowUp size={20} color={colors.primary || '#06b6d4'} weight="bold" />,
      label: 'Status do iCloud',
      color: colors.primary || '#06b6d4',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
  ];

  // Shotsy Design: Info items
  const infoItems: SettingsItem[] = [
    {
      icon: <Info size={20} color={colors.textSecondary || '#6b7280'} weight="bold" />,
      label: 'Sobre este App',
      color: colors.textSecondary || '#6b7280',
      onPress: () => Alert.alert('Pinpoint GLP-1', 'Versão 1.0.0'),
    },
    {
      icon: <Question size={20} color={colors.textSecondary || '#6b7280'} weight="bold" />,
      label: 'Perguntas Frequentes',
      color: colors.textSecondary || '#6b7280',
      onPress: () => router.push('/(tabs)/faq'),
    },
    {
      icon: <Megaphone size={20} color={colors.textSecondary || '#6b7280'} weight="bold" />,
      label: 'O que há de novo',
      color: colors.textSecondary || '#6b7280',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: <Star size={20} color={colors.textSecondary || '#6b7280'} weight="bold" />,
      label: 'Avalie este App',
      color: colors.textSecondary || '#6b7280',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
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
      >
        <View style={styles.settingsItemContent}>
          {item.icon}
          <Text style={[styles.settingsItemLabel, { color: colors.text }]}>{item.label}</Text>
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
      {/* Header - Shotsy Style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.menuButton}>
          <List size={24} color={colors.text} weight="regular" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <TouchableOpacity style={styles.gearButton}>
          <Gear size={24} color={colors.text} weight="regular" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme Preview Card - NEW! */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Theme</Text>
          <TouchableOpacity
            style={[
              styles.themePreviewCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
            onPress={() => router.push('/(tabs)/theme')}
          >
            <View style={styles.themePreviewContent}>
              <ShotsyCircularProgressV2
                progress={0.75}
                size="small"
                state="normal"
                centerText=""
              />
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>Active Theme</Text>
                <Text style={[styles.themeName, { color: colors.text }]}>{currentTheme}</Text>
                <Text style={[styles.themeDescription, { color: colors.textMuted }]}>
                  Tap to customize colors
                </Text>
              </View>
            </View>
            <View style={styles.chevronContainer}>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {settingsItems.map((item, index) =>
              renderSettingsItem(item, index, index === settingsItems.length - 1)
            )}
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Privacy</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {dataItems.map((item, index) =>
              renderSettingsItem(item, index, index === dataItems.length - 1)
            )}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Information</Text>
          <View
            style={[
              styles.settingsCard,
              { backgroundColor: colors.card },
              ShotsyDesignTokens.shadows.card,
            ]}
          >
            {infoItems.map((item, index) =>
              renderSettingsItem(item, index, index === infoItems.length - 1)
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
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
            >
              <View style={styles.settingsItemContent}>
                <SignOut size={20} color={colors.accentRed || '#ef4444'} weight="bold" />
                <Text style={[styles.settingsItemLabel, { color: colors.accentRed || '#ef4444' }]}>
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
              disabled={deletingAccount}
            >
              <View style={styles.settingsItemContent}>
                {deletingAccount ? (
                  <ActivityIndicator color={colors.accentRed || '#ef4444'} />
                ) : (
                  <Warning size={20} color={colors.accentRed || '#ef4444'} weight="bold" />
                )}
                <Text style={[styles.settingsItemLabel, { color: colors.accentRed || '#ef4444' }]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ShotsyDesignTokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: ShotsyDesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: ShotsyDesignTokens.spacing.sm,
  },
  gearButton: {
    padding: ShotsyDesignTokens.spacing.sm,
  },
  headerTitle: {
    ...ShotsyDesignTokens.typography.h3,
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
