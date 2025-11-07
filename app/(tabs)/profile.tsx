import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth, useUser as useClerkUser } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useColors } from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { performSignOut } from '@/lib/auth';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Profile');

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const { user: dbUser } = useUser();
  const router = useRouter();
  const colors = useColors();
  const { mode, setMode } = useTheme();

  async function handleSignOut() {
    Alert.alert('Confirmar Saída', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await performSignOut(signOut, router);
          } catch (error) {
            logger.error('Error signing out', error as Error);
            Alert.alert('Erro', 'Não foi possível sair da conta. Por favor, tente novamente.');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: '#ffffff' }]}>
            {(dbUser?.name || clerkUser?.firstName)?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {dbUser?.name || clerkUser?.fullName || 'Usuário'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {clerkUser?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações da Conta</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>ID do Usuário</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {dbUser?.id.slice(0, 8)}...
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Membro desde</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {dbUser
              ? new Date(dbUser.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Configurações</Text>

        {/* Theme Selector */}
        <View style={[styles.themeCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.themeTitle, { color: colors.text }]}>🌓 Tema</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: colors.backgroundLight, borderColor: colors.border },
                mode === 'light' && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + '20',
                },
              ]}
              onPress={() => setMode('light')}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  { color: colors.textSecondary },
                  mode === 'light' && { color: colors.primary },
                ]}
              >
                ☀️ Claro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: colors.backgroundLight, borderColor: colors.border },
                mode === 'dark' && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + '20',
                },
              ]}
              onPress={() => setMode('dark')}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  { color: colors.textSecondary },
                  mode === 'dark' && { color: colors.primary },
                ]}
              >
                🌙 Escuro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                styles.themeOptionLast,
                { backgroundColor: colors.backgroundLight, borderColor: colors.border },
                mode === 'system' && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + '20',
                },
              ]}
              onPress={() => setMode('system')}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  { color: colors.textSecondary },
                  mode === 'system' && { color: colors.primary },
                ]}
              >
                ⚙️ Sistema
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button label="📊 Ver Estatísticas Completas" onPress={() => {}} variant="secondary" />

        <Button
          label="🔔 Notificações"
          onPress={() => router.push('/(tabs)/notification-settings')}
          variant="secondary"
        />

        <Button label="❓ Ajuda e Suporte" onPress={() => {}} variant="secondary" />
      </View>

      <View style={styles.section}>
        <Button label="Sair da Conta" onPress={handleSignOut} variant="outline" />
      </View>

      <Text style={[styles.version, { color: colors.textMuted }]}>Versão 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    padding: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  themeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  themeOptionLast: {
    marginRight: 0,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    padding: 24,
  },
});
