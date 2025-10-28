import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/clerk';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/constants/colors';

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Mounjaro Tracker</Text>
      <Text style={styles.subtitle}>
        Seu assistente de acompanhamento GLP-1
      </Text>

      <View style={styles.features}>
        <Text style={styles.feature}>✅ Registre seu peso diariamente</Text>
        <Text style={styles.feature}>💉 Acompanhe suas aplicações</Text>
        <Text style={styles.feature}>📊 Visualize seu progresso</Text>
        <Text style={styles.feature}>⚠️ Monitore efeitos colaterais</Text>
      </View>

      <View style={styles.buttons}>
        <Button
          label="Criar Conta"
          onPress={() => router.push('/(auth)/sign-up')}
        />
        <Button
          label="Já tenho conta"
          onPress={() => router.push('/(auth)/sign-in')}
          variant="outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    gap: 16,
    marginBottom: 48,
  },
  feature: {
    fontSize: 16,
    color: COLORS.text,
    paddingLeft: 8,
  },
  buttons: {
    gap: 12,
  },
});