import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth, useUser as useClerkUser } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useColors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const { user: dbUser } = useUser();
  const router = useRouter();
  const colors = useColors();
  const { mode, setMode } = useTheme();

  const styles = createStyles(colors);

  async function handleSignOut() {
    Alert.alert(
      'Confirmar Saída',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Signing out...');
              
              // Clear Supabase session
              await supabase.auth.signOut();
              console.log('Supabase session cleared');
              
              // Sign out from Clerk
              await signOut();
              console.log('Clerk sign out successful');
              
              // Redirect to login
              router.replace('/');
              console.log('Redirected to login');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(dbUser?.name || clerkUser?.firstName)?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.name}>
          {dbUser?.name || clerkUser?.fullName || 'Usuário'}
        </Text>
        <Text style={styles.email}>
          {clerkUser?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>ID do Usuário</Text>
          <Text style={styles.infoValue}>
            {dbUser?.id.slice(0, 8)}...
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Membro desde</Text>
          <Text style={styles.infoValue}>
            {dbUser ? new Date(dbUser.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }) : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        {/* Theme Selector */}
        <View style={styles.themeCard}>
          <Text style={styles.themeTitle}>🌓 Tema</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[styles.themeOption, mode === 'light' && styles.themeOptionActive]}
              onPress={() => setMode('light')}
            >
              <Text style={[styles.themeOptionText, mode === 'light' && styles.themeOptionTextActive]}>☀️ Claro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeOption, mode === 'dark' && styles.themeOptionActive]}
              onPress={() => setMode('dark')}
            >
              <Text style={[styles.themeOptionText, mode === 'dark' && styles.themeOptionTextActive]}>🌙 Escuro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeOption, styles.themeOptionLast, mode === 'system' && styles.themeOptionActive]}
              onPress={() => setMode('system')}
            >
              <Text style={[styles.themeOptionText, mode === 'system' && styles.themeOptionTextActive]}>⚙️ Sistema</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Button
          label="📊 Ver Estatísticas Completas"
          onPress={() => {}}
          variant="secondary"
        />
        
        <Button
          label="🔔 Notificações"
          onPress={() => router.push('/(tabs)/notification-settings')}
          variant="secondary"
        />
        
        <Button
          label="❓ Ajuda e Suporte"
          onPress={() => {}}
          variant="secondary"
        />
      </View>

      <View style={styles.section}>
        <Button
          label="Sair da Conta"
          onPress={handleSignOut}
          variant="outline"
        />
      </View>

      <Text style={styles.version}>Versão 1.0.0</Text>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    padding: 24,
    // gap: 12, // Not supported in React Native StyleSheet
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  themeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    // gap: 8, // Not supported in React Native StyleSheet
  },
  themeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 4,
  },
  themeOptionLast: {
    marginRight: 0,
  },
  themeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeOptionTextActive: {
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    padding: 24,
  },
});

