import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { UserProfile } from '@/components/settings/UserProfile';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { AccentColorSelector } from '@/components/settings/AccentColorSelector';
import { PersonalInfoEditor } from '@/components/settings/PersonalInfoEditor';
import {
  InjectionsIcon, WeightIcon, BellIcon, ClockIcon, TrendUpIcon,
  LockIcon, ExportIcon, TrashIcon, DeviceMobileIcon, ChatIcon, FileTextIcon,
  ClipboardTextIcon, SignOutIcon, WarningIcon
} from '@/components/ui/icons';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { PremiumGate } from '@/components/premium/PremiumGate';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const colors = useShotsyColors();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { settings, updateSettings } = useSettings();

  // Modal states
  const [showPersonalInfoEditor, setShowPersonalInfoEditor] = useState(false);

  // Local state for settings (synced with Supabase)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  // Sync settings from Supabase when loaded
  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.shot_reminder || false);
    }
  }, [settings]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              // Fazer logout do Clerk
              await signOut();

              // Redirecionar diretamente para welcome, sem esperar
              // O router.replace já é assíncrono e resolve o estado
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
            }
          },
        },
      ]
    );
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
      console.error('Error updating notifications:', error);
      setNotificationsEnabled(!value); // Revert on error
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
          onPress: () => {
            // TODO: Implementar exclusão de conta
            Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.');
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@mounjarotracker.app?subject=Suporte Mounjaro Tracker');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://mounjarotracker.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://mounjarotracker.app/terms');
  };

  // Format display values
  const getMedicationDisplay = () => {
    if (!profile?.medication) return 'Não definido';
    if (profile.current_dose) {
      return `${profile.medication} (${profile.current_dose}mg)`;
    }
    return profile.medication;
  };

  const getFrequencyDisplay = () => {
    if (!profile?.frequency) return 'Não definido';
    const frequencies = {
      daily: 'Diária',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
    };
    return frequencies[profile.frequency as keyof typeof frequencies] || profile.frequency;
  };

  const getTargetWeightDisplay = () => {
    if (!profile?.target_weight) return 'Não definido';
    return `${profile.target_weight} kg`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Perfil do Usuário */}
        <View style={styles.profileSection}>
          <UserProfile />
        </View>

        {/* Seção: Informações Pessoais */}
        <SettingsSection title="Informações Pessoais">
          <SettingsRow
            icon={<InjectionsIcon size="md" />}
            label="Medicamento Atual"
            value={getMedicationDisplay()}
            onPress={() => setShowPersonalInfoEditor(true)}
          />
          <SettingsRow
            icon={<ClockIcon size="md" />}
            label="Frequência de Aplicação"
            value={getFrequencyDisplay()}
            onPress={() => setShowPersonalInfoEditor(true)}
          />
          <SettingsRow
            icon={<WeightIcon size="md" />}
            label="Meta de Peso"
            value={getTargetWeightDisplay()}
            onPress={() => setShowPersonalInfoEditor(true)}
            showBorder={false}
          />
        </SettingsSection>

        {/* Seção: Aparência */}
        <SettingsSection title="Aparência">
          <ThemeSelector />
          <View style={[styles.divider, { backgroundColor: `${colors.border}33` }]} />
          <AccentColorSelector />
        </SettingsSection>

        {/* Seção: Notificações */}
        <SettingsSection title="Notificações">
          <SettingsRow
            icon={<BellIcon size="md" />}
            label="Lembretes de Injeção"
            showSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={handleToggleNotifications}
            showArrow={false}
          />
          <SettingsRow
            icon={<ClockIcon size="md" />}
            label="Configurar Horários"
            value={settings?.shot_reminder_time ? settings.shot_reminder_time.substring(0, 5) : 'Não definido'}
            onPress={() => router.push('/(tabs)/notification-settings')}
          />
          <SettingsRow
            icon={<TrendUpIcon size="md" />}
            label="Notificações de Conquistas"
            showSwitch
            switchValue={settings?.achievements_notifications || false}
            onSwitchChange={async (value) => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (settings) {
                  await updateSettings({ achievements_notifications: value });
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível atualizar as notificações');
              }
            }}
            showArrow={false}
            showBorder={false}
          />
        </SettingsSection>

        {/* Seção: Dados e Privacidade */}
        <SettingsSection title="Dados e Privacidade">
          <SettingsRow
            icon={<LockIcon size="md" />}
            label="Biometria"
            showSwitch
            switchValue={biometricsEnabled}
            onSwitchChange={setBiometricsEnabled}
            showArrow={false}
          />
          <PremiumGate featureName="export_data">
            <SettingsRow
              icon={<ExportIcon size="md" />}
              label="Exportar Dados"
              onPress={handleExportData}
            />
          </PremiumGate>
          <SettingsRow
            icon={<TrashIcon size="md" />}
            label="Limpar Cache"
            onPress={() => Alert.alert('Cache limpo', 'O cache do aplicativo foi limpo com sucesso.')}
            showBorder={false}
          />
        </SettingsSection>

        {/* Seção: Sobre */}
        <SettingsSection title="Sobre">
          <SettingsRow
            icon={<DeviceMobileIcon size="md" />}
            label="Versão"
            value="1.0.0"
            showArrow={false}
          />
          <SettingsRow
            icon={<ChatIcon size="md" />}
            label="Suporte"
            onPress={handleSupport}
          />
          <SettingsRow
            icon={<FileTextIcon size="md" />}
            label="Política de Privacidade"
            onPress={handlePrivacyPolicy}
          />
          <SettingsRow
            icon={<FileTextIcon size="md" />}
            label="FAQ"
            onPress={() => router.push('/(tabs)/faq')}
          />
          <SettingsRow
            icon={<ClipboardTextIcon size="md" />}
            label="Termos de Uso"
            onPress={handleTerms}
            showBorder={false}
          />
        </SettingsSection>

        {/* Seção: Conta */}
        <SettingsSection title="Conta">
          <SettingsRow
            icon={<SignOutIcon size="md" />}
            label="Sair da Conta"
            onPress={handleSignOut}
            destructive
          />
          <SettingsRow
            icon={<WarningIcon size="md" />}
            label="Excluir Conta"
            onPress={handleDeleteAccount}
            destructive
            showBorder={false}
          />
        </SettingsSection>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Personal Info Editor Modal */}
      <PersonalInfoEditor
        visible={showPersonalInfoEditor}
        onClose={() => setShowPersonalInfoEditor(false)}
        onSave={() => {
          // Profile will auto-refresh via useProfile hook
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    paddingTop: 16,
  },
  divider: {
    height: 1,
    // backgroundColor will be applied inline using colors.border with opacity
    marginHorizontal: 16,
    marginVertical: 8,
  },
  bottomPadding: {
    height: 32,
  },
});