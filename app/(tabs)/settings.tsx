import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useShotsyColors';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useUser } from '@/hooks/useUser';
import { PremiumGate } from '@/components/premium/PremiumGate';
import * as Haptics from 'expo-haptics';
import { createLogger } from '@/lib/logger';
import { performSignOut, performAccountDeletion } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';

const logger = createLogger('Settings');

interface SettingsItem {
  icon: string;
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

  // V0 Design: Settings items
  const settingsItems: SettingsItem[] = [
    {
      icon: 'card',
      label: 'Sua Assinatura',
      color: colors.accentPurple || '#a855f7',
      onPress: () => router.push('/(tabs)/premium'),
      premium: true,
    },
    {
      icon: 'scale',
      label: 'Unidades de Medida',
      color: colors.accentBlue || '#3b82f6',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: 'fitness',
      label: 'Altura & Peso Meta',
      color: colors.accentGreen || '#22c55e',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      icon: 'calendar',
      label: 'Dias Entre Injeções',
      color: colors.accentOrange || '#f97316',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      icon: 'color-palette',
      label: 'Personalizar',
      color: colors.accentPink || '#ec4899',
      onPress: () => router.push('/(tabs)/theme'),
    },
    {
      icon: 'grid',
      label: 'Widgets',
      color: colors.accentYellow || '#eab308',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: 'medical',
      label: 'Medicamentos',
      color: colors.primary || '#06b6d4',
      onPress: () => router.push('/(tabs)/medications'),
    },
    {
      icon: 'notifications',
      label: 'Notificações',
      color: colors.accentRed || '#ef4444',
      onPress: () => router.push('/(tabs)/notification-settings'),
    },
  ];

  // V0 Design: Data items
  const dataItems: SettingsItem[] = [
    {
      icon: 'heart',
      label: 'Dados do Apple Saúde',
      color: colors.accentRed || '#ef4444',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: 'server',
      label: 'Gerenciar Meus Dados',
      color: colors.accentBlue || '#3b82f6',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: 'refresh',
      label: 'Status do iCloud',
      color: colors.primary || '#06b6d4',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
  ];

  // V0 Design: Info items
  const infoItems: SettingsItem[] = [
    {
      icon: 'information-circle',
      label: 'Sobre este App',
      color: colors.textSecondary || '#6b7280',
      onPress: () => Alert.alert('Pinpoint GLP-1', 'Versão 1.0.0'),
    },
    {
      icon: 'help-circle',
      label: 'Perguntas Frequentes',
      color: colors.textSecondary || '#6b7280',
      onPress: () => router.push('/(tabs)/faq'),
    },
    {
      icon: 'megaphone',
      label: 'O que há de novo',
      color: colors.textSecondary || '#6b7280',
      onPress: () => Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.'),
    },
    {
      icon: 'star',
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
          { borderBottomColor: colors.border },
          isLast && styles.lastItem,
        ]}
        onPress={item.onPress}
      >
        <View style={styles.settingsItemContent}>
          <Ionicons name={item.icon as any} size={20} color={item.color} />
          <Text style={[styles.settingsItemLabel, { color: colors.text }]}>{item.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
      {/* Header - V0 Design */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ajustes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Settings Section - V0 Design */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {settingsItems.map((item, index) =>
            renderSettingsItem(item, index, index === settingsItems.length - 1)
          )}
        </View>

        {/* Data Section - V0 Design */}
        <View style={[styles.section, { backgroundColor: colors.card, marginTop: 16 }]}>
          {dataItems.map((item, index) =>
            renderSettingsItem(item, index, index === dataItems.length - 1)
          )}
        </View>

        {/* Info Section - V0 Design */}
        <View style={[styles.section, { backgroundColor: colors.card, marginTop: 16 }]}>
          {infoItems.map((item, index) =>
            renderSettingsItem(item, index, index === infoItems.length - 1)
          )}
        </View>

        {/* Account Section - V0 Design */}
        <View style={[styles.section, { backgroundColor: colors.card, marginTop: 16 }]}>
          <TouchableOpacity
            style={[styles.settingsItem, { borderBottomColor: colors.border }]}
            onPress={handleSignOut}
          >
            <View style={styles.settingsItemContent}>
              <Ionicons name="log-out" size={20} color={colors.accentRed || '#ef4444'} />
              <Text style={[styles.settingsItemLabel, { color: colors.accentRed || '#ef4444' }]}>
                Sair da Conta
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
                <Ionicons name="warning" size={20} color={colors.accentRed || '#ef4444'} />
              )}
              <Text style={[styles.settingsItemLabel, { color: colors.accentRed || '#ef4444' }]}>
                {deletingAccount ? 'Excluindo...' : 'Excluir Conta'}
              </Text>
            </View>
            {!deletingAccount && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    borderRadius: 0,
    marginHorizontal: 0,
    marginTop: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingsItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
});
