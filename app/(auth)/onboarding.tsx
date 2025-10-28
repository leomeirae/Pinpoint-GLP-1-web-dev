import { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COLORS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth, useUser as useClerkUser } from '@/lib/clerk';

export default function OnboardingScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user: clerkUser } = useClerkUser();

  const [name, setName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (!name.trim() || !currentWeight || !goalWeight) {
      Alert.alert('Atenção', 'Preencha todos os campos para continuar');
      return;
    }

    const current = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);

    if (isNaN(current) || isNaN(goal)) {
      Alert.alert('Erro', 'Digite valores numéricos válidos');
      return;
    }

    if (goal >= current) {
      Alert.alert('Atenção', 'Sua meta deve ser menor que seu peso atual');
      return;
    }

    try {
      setLoading(true);

      // Buscar o usuário no Supabase
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar usuário com dados do onboarding
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          initial_weight: current,
          goal_weight: goal,
          onboarding_completed: true,
        })
        .eq('id', userData.id);

      if (updateError) throw updateError;

      // Criar primeiro registro de peso
      const { error: weightError } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userData.id,
          weight: current,
          date: new Date().toISOString().split('T')[0],
          notes: 'Peso inicial - Início da jornada',
        });

      if (weightError) throw weightError;

      console.log('Onboarding completed successfully');
      
      // Desbloquear conquista de onboarding (será detectada automaticamente no dashboard)
      
      // Redirecionar para o dashboard
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar seus dados');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>Bem-vindo(a)!</Text>
            <Text style={styles.subtitle}>
              Vamos começar sua jornada definindo suas metas
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seus dados</Text>

            <Input
              label="Como você gostaria de ser chamado?"
              placeholder="Ex: João"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />

            <Input
              label="Seu peso atual (kg)"
              placeholder="Ex: 85.5"
              value={currentWeight}
              onChangeText={setCurrentWeight}
              keyboardType="decimal-pad"
            />

            <Input
              label="Sua meta de peso (kg)"
              placeholder="Ex: 75.0"
              value={goalWeight}
              onChangeText={setGoalWeight}
              keyboardType="decimal-pad"
            />

            {currentWeight && goalWeight && !isNaN(parseFloat(currentWeight)) && !isNaN(parseFloat(goalWeight)) && (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Sua jornada:</Text>
                <Text style={styles.previewText}>
                  {parseFloat(currentWeight).toFixed(1)}kg → {parseFloat(goalWeight).toFixed(1)}kg
                </Text>
                <Text style={styles.previewGoal}>
                  Meta: perder {(parseFloat(currentWeight) - parseFloat(goalWeight)).toFixed(1)}kg
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              Você poderá ajustar suas metas a qualquer momento no seu perfil
            </Text>
          </View>

          <Button
            label="Começar minha jornada"
            onPress={handleComplete}
            loading={loading}
            disabled={loading}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  previewGoal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
