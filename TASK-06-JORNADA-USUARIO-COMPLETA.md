# TASK-06: Transformar em App de Jornada (Completo)

## 🎯 OBJETIVO GERAL
Transformar o Mounjaro Tracker em um **PARCEIRO DE JORNADA**, não apenas um app de registro de dados.

### O que vamos construir:
1. ✅ Onboarding completo (definir meta no primeiro uso)
2. 📊 Dashboard focado em "Semana X da jornada"
3. 🏆 Sistema de conquistas inteligente
4. 💡 Insights automáticos sobre o progresso
5. 📄 Geração de PDF para compartilhar com médico
6. 📅 Timeline de evolução (última semana/mês)
7. ⚠️ Registro de efeitos colaterais com UI
8. ✨ Animações e skeleton loaders

---

## 📋 PRÉ-REQUISITOS
- TASK-05 completa
- Terminal aberto em `/Users/user/Desktop/mounjaro-tracker`

---

# 🏗️ FASE 1: PREPARAR O BANCO DE DADOS

## PASSO 1.1: Atualizar schema do Supabase

No Supabase Dashboard → SQL Editor → New Query:

\`\`\`sql
-- Adicionar campos necessários na tabela users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS goal_weight NUMERIC,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS initial_weight NUMERIC;

-- Criar tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_earned ON achievements(earned_at DESC);

-- RLS para achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));
\`\`\`

Clique em **RUN** e aguarde "Success".

---

## PASSO 1.2: Instalar dependências necessárias

Execute no terminal:
\`\`\`bash
# Para animações
npx expo install react-native-reanimated

# Para gerar PDF
npx expo install expo-print expo-sharing

# Para gráficos melhores (já deve estar instalado)
npx expo install react-native-svg victory-native
\`\`\`

---

## PASSO 1.3: Atualizar types com novos modelos

\`\`\`bash
cat > lib/types.ts << 'TYPES_EOF'
// =====================================================
// DATABASE TYPES (sincronizados com Supabase schema)
// =====================================================

// User types
export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string | null;
  goal_weight: number | null;
  initial_weight: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Medication types
export type MedicationType = 
  | 'mounjaro'
  | 'ozempic'
  | 'saxenda'
  | 'wegovy'
  | 'zepbound';

export interface Medication {
  id: string;
  user_id: string;
  type: MedicationType;
  dosage: number;
  frequency: 'weekly' | 'daily';
  start_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Weight log types
export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Side effect types
export interface SideEffect {
  id: string;
  user_id: string;
  type: string;
  severity: 1 | 2 | 3 | 4 | 5;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Medication log types
export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  date: string;
  dosage: number;
  time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Achievement types
export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  earned_at: string;
}

// =====================================================
// INSERT TYPES
// =====================================================

export type InsertUser = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type InsertMedication = Omit<Medication, 'id' | 'created_at' | 'updated_at' | 'active'>;
export type InsertWeightLog = Omit<WeightLog, 'id' | 'created_at' | 'updated_at'>;
export type InsertSideEffect = Omit<SideEffect, 'id' | 'created_at' | 'updated_at'>;
export type InsertMedicationLog = Omit<MedicationLog, 'id' | 'created_at' | 'updated_at'>;
export type InsertAchievement = Omit<Achievement, 'id' | 'earned_at'>;

// =====================================================
// UPDATE TYPES
// =====================================================

export type UpdateUser = Partial<Omit<User, 'id' | 'clerk_user_id' | 'created_at' | 'updated_at'>>;
export type UpdateMedication = Partial<Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type UpdateWeightLog = Partial<Omit<WeightLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type UpdateSideEffect = Partial<Omit<SideEffect, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type UpdateMedicationLog = Partial<Omit<MedicationLog, 'id' | 'user_id' | 'medication_id' | 'created_at' | 'updated_at'>>;

// =====================================================
// HELPER TYPES
// =====================================================

export interface JourneyStats {
  currentWeight: number;
  goalWeight: number;
  initialWeight: number;
  totalToLose: number;
  lostSoFar: number;
  progressPercent: number;
  weekNumber: number;
  weeklyChange: number;
  daysInJourney: number;
}
TYPES_EOF
\`\`\`

---

# 🚀 FASE 2: CRIAR ONBOARDING

## PASSO 2.1: Criar estrutura de onboarding

\`\`\`bash
mkdir -p app/\(onboarding\)
\`\`\`

## PASSO 2.2: Tela de boas-vindas

\`\`\`bash
cat > app/\(onboarding\)/_layout.tsx << 'ONBOARD_LAYOUT_EOF'
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
        headerShown: false,
      }}
    />
  );
}
ONBOARD_LAYOUT_EOF

cat > app/\(onboarding\)/index.tsx << 'WELCOME_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎯</Text>
      <Text style={styles.title}>Bem-vindo ao{'\n'}Mounjaro Tracker</Text>
      <Text style={styles.subtitle}>
        Seu parceiro na jornada de{'\n'}emagrecimento com GLP-1
      </Text>

      <View style={styles.features}>
        <FeatureItem icon="⚖️" text="Acompanhe seu peso semanalmente" />
        <FeatureItem icon="💊" text="Registre suas aplicações" />
        <FeatureItem icon="📊" text="Veja insights do seu progresso" />
        <FeatureItem icon="🎉" text="Celebre suas conquistas" />
      </View>

      <Button
        label="Começar"
        onPress={() => router.push('/(onboarding)/setup-goal')}
      />
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
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
  emoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    gap: 24,
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
});
WELCOME_EOF
\`\`\`

## PASSO 2.3: Tela de definir meta

\`\`\`bash
cat > app/\(onboarding\)/setup-goal.tsx << 'GOAL_EOF'
import { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { COLORS } from '@/constants/colors';

export default function SetupGoalScreen() {
  const router = useRouter();
  const { user, refetch } = useUser();
  
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!currentWeight || !goalWeight) {
      Alert.alert('Erro', 'Preencha peso atual e meta');
      return;
    }

    const current = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);

    if (current <= goal) {
      Alert.alert('Atenção', 'Sua meta deve ser menor que o peso atual');
      return;
    }

    try {
      setLoading(true);

      // Salvar peso inicial
      const { error: weightError } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user?.id,
          weight: current,
          date: new Date().toISOString().split('T')[0],
          notes: 'Peso inicial da jornada',
        });

      if (weightError) throw weightError;

      // Atualizar perfil do usuário
      const { error: userError } = await supabase
        .from('users')
        .update({
          goal_weight: goal,
          initial_weight: current,
        })
        .eq('id', user?.id);

      if (userError) throw userError;

      await refetch();
      router.push('/(onboarding)/setup-medication');
    } catch (error: any) {
      console.error('Error in setup-goal:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  const weightDiff = currentWeight && goalWeight 
    ? (parseFloat(currentWeight) - parseFloat(goalWeight)).toFixed(1)
    : '0';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Defina sua Meta 🎯</Text>
        <Text style={styles.subtitle}>
          Vamos começar com algumas informações básicas
        </Text>

        <Input
          label="Peso Atual (kg)"
          placeholder="Ex: 85.5"
          value={currentWeight}
          onChangeText={setCurrentWeight}
          keyboardType="decimal-pad"
        />

        <Input
          label="Peso Meta (kg)"
          placeholder="Ex: 75.0"
          value={goalWeight}
          onChangeText={setGoalWeight}
          keyboardType="decimal-pad"
        />

        {weightDiff !== '0' && parseFloat(weightDiff) > 0 && (
          <View style={styles.goalCard}>
            <Text style={styles.goalEmoji}>🎯</Text>
            <Text style={styles.goalText}>
              Você quer perder <Text style={styles.goalHighlight}>{weightDiff}kg</Text>
            </Text>
            <Text style={styles.goalSubtext}>
              Com dedicação e consistência, você vai conseguir!
            </Text>
          </View>
        )}

        <Button
          label="Continuar"
          onPress={handleContinue}
          loading={loading}
          disabled={!currentWeight || !goalWeight}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
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
    marginBottom: 32,
  },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 24,
  },
  goalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  goalText: {
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  goalHighlight: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 24,
  },
  goalSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
GOAL_EOF
\`\`\`

## PASSO 2.4: Tela de configurar medicação

\`\`\`bash
cat > app/\(onboarding\)/setup-medication.tsx << 'MED_SETUP_EOF'
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMedications } from '@/hooks/useMedications';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { COLORS } from '@/constants/colors';
import { MedicationType } from '@/lib/types';

const MEDICATION_OPTIONS: { value: MedicationType; label: string; emoji: string }[] = [
  { value: 'mounjaro', label: 'Mounjaro', emoji: '💊' },
  { value: 'ozempic', label: 'Ozempic', emoji: '💉' },
  { value: 'saxenda', label: 'Saxenda', emoji: '💊' },
  { value: 'wegovy', label: 'Wegovy', emoji: '💉' },
  { value: 'zepbound', label: 'Zepbound', emoji: '💊' },
];

export default function SetupMedicationScreen() {
  const router = useRouter();
  const { addMedication } = useMedications();
  const { user } = useUser();

  const [type, setType] = useState<MedicationType>('mounjaro');
  const [dosage, setDosage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    if (!dosage) {
      Alert.alert('Erro', 'Informe a dosagem');
      return;
    }

    try {
      setLoading(true);
      
      await addMedication({
        type,
        dosage: parseFloat(dosage),
        frequency: 'weekly',
        start_date: new Date().toISOString().split('T')[0],
      });

      // Marcar onboarding como completo
      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user?.id);

      Alert.alert(
        'Tudo pronto! 🎉',
        'Seu perfil foi configurado com sucesso',
        [{ text: 'Começar', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      console.error('Error in setup-medication:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Qual medicação você usa? 💊</Text>
      <Text style={styles.subtitle}>
        Isso nos ajuda a personalizar sua experiência
      </Text>

      <View style={styles.medicationGrid}>
        {MEDICATION_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.medicationCard,
              type === option.value && styles.medicationCardActive,
            ]}
            onPress={() => setType(option.value)}
          >
            <Text style={styles.medicationEmoji}>{option.emoji}</Text>
            <Text style={[
              styles.medicationLabel,
              type === option.value && styles.medicationLabelActive,
            ]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Dosagem (mg)"
        placeholder="Ex: 2.5"
        value={dosage}
        onChangeText={setDosage}
        keyboardType="decimal-pad"
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          ℹ️ Você poderá adicionar mais medicações depois, se necessário
        </Text>
      </View>

      <Button
        label="Finalizar Configuração"
        onPress={handleFinish}
        loading={loading}
        disabled={!dosage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  medicationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  medicationCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  medicationCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDark,
  },
  medicationEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  medicationLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  medicationLabelActive: {
    color: COLORS.text,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
MED_SETUP_EOF
\`\`\`

---

# 📊 FASE 3: DASHBOARD FOCADO NA JORNADA

## PASSO 3.1: Criar hook para calcular estatísticas da jornada

\`\`\`bash
cat > hooks/useJourneyStats.ts << 'JOURNEY_STATS_EOF'
import { useMemo } from 'react';
import { WeightLog, User } from '@/lib/types';
import { JourneyStats } from '@/lib/types';

export function useJourneyStats(
  weightLogs: WeightLog[],
  user: User | null
): JourneyStats | null {
  return useMemo(() => {
    if (!user || !user.goal_weight || weightLogs.length === 0) {
      return null;
    }

    const currentWeight = weightLogs[0]?.weight || 0;
    const goalWeight = user.goal_weight;
    const initialWeight = user.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;

    const totalToLose = initialWeight - goalWeight;
    const lostSoFar = initialWeight - currentWeight;
    const progressPercent = totalToLose > 0 ? Math.round((lostSoFar / totalToLose) * 100) : 0;

    // Calcular semana
    const firstLog = weightLogs[weightLogs.length - 1];
    const daysSinceStart = firstLog
      ? Math.floor((Date.now() - new Date(firstLog.date).getTime()) / (24 * 60 * 60 * 1000))
      : 0;
    const weekNumber = Math.floor(daysSinceStart / 7) + 1;

    // Peso da semana passada
    const lastWeekLog = weightLogs.find(log => {
      const daysDiff = Math.floor((Date.now() - new Date(log.date).getTime()) / (24 * 60 * 60 * 1000));
      return daysDiff >= 7 && daysDiff < 14;
    });

    const weeklyChange = lastWeekLog ? parseFloat((lastWeekLog.weight - currentWeight).toFixed(1)) : 0;

    return {
      currentWeight,
      goalWeight,
      initialWeight,
      totalToLose,
      lostSoFar,
      progressPercent,
      weekNumber,
      weeklyChange,
      daysInJourney: daysSinceStart,
    };
  }, [weightLogs, user]);
}
JOURNEY_STATS_EOF
\`\`\`

## PASSO 3.2: Criar componente de Jornada Semanal

\`\`\`bash
cat > components/dashboard/WeeklyJourney.tsx << 'WEEKLY_JOURNEY_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { JourneyStats } from '@/lib/types';

interface WeeklyJourneyProps {
  stats: JourneyStats;
}

export function WeeklyJourney({ stats }: WeeklyJourneyProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Semana {stats.weekNumber}</Text>
        <Text style={styles.subtitle}>da sua jornada</Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: \`\${Math.min(stats.progressPercent, 100)}%\` }]} />
        </View>
        
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelStart}>
            {stats.initialWeight.toFixed(1)}kg
          </Text>
          <Text style={styles.progressLabelCurrent}>
            {stats.currentWeight.toFixed(1)}kg
          </Text>
          <Text style={styles.progressLabelGoal}>
            {stats.goalWeight.toFixed(1)}kg
          </Text>
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {stats.lostSoFar.toFixed(1)}kg perdidos de {stats.totalToLose.toFixed(1)}kg
          </Text>
          <Text style={styles.progressPercent}>{stats.progressPercent}% da meta</Text>
        </View>
      </View>

      {stats.weeklyChange > 0 && (
        <View style={styles.weeklyChangeCard}>
          <Text style={styles.weeklyChangeEmoji}>🎉</Text>
          <Text style={styles.weeklyChangeText}>
            Você perdeu <Text style={styles.weeklyChangeValue}>{stats.weeklyChange}kg</Text> nesta semana!
          </Text>
        </View>
      )}

      {stats.weeklyChange < 0 && (
        <View style={styles.weeklyGainCard}>
          <Text style={styles.weeklyGainEmoji}>💪</Text>
          <Text style={styles.weeklyGainText}>
            Ganhou {Math.abs(stats.weeklyChange)}kg esta semana. Tudo bem! Continue firme.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressLabelStart: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  progressLabelCurrent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressLabelGoal: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  weeklyChangeCard: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeklyChangeEmoji: {
    fontSize: 24,
  },
  weeklyChangeText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  weeklyChangeValue: {
    fontWeight: 'bold',
    color: COLORS.success,
  },
  weeklyGainCard: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeklyGainEmoji: {
    fontSize: 24,
  },
  weeklyGainText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
});
WEEKLY_JOURNEY_EOF
\`\`\`

## PASSO 3.3: Criar componente de Últimos Registros

\`\`\`bash
cat > components/dashboard/RecentLogs.tsx << 'RECENT_LOGS_EOF'
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '@/constants/colors';
import { WeightLog } from '@/lib/types';

interface RecentLogsProps {
  logs: WeightLog[];
}

export function RecentLogs({ logs }: RecentLogsProps) {
  if (logs.length === 0) {
    return null;
  }

  const recentLogs = logs.slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Últimos Registros</Text>
      
      <FlatList
        data={recentLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const previousWeight = logs[index + 1]?.weight;
          const diff = previousWeight ? item.weight - previousWeight : 0;
          
          return (
            <View style={styles.logCard}>
              <View style={styles.logDate}>
                <Text style={styles.dateText}>
                  {new Date(item.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </Text>
              </View>
              
              <View style={styles.logWeight}>
                <Text style={styles.weightText}>{item.weight}kg</Text>
                {diff !== 0 && (
                  <Text style={[
                    styles.diffText,
                    diff > 0 ? styles.diffUp : styles.diffDown
                  ]}>
                    {diff > 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}kg
                  </Text>
                )}
              </View>
              
              {item.notes && (
                <Text style={styles.notesText} numberOfLines={1}>
                  {item.notes}
                </Text>
              )}
            </View>
          );
        }}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  logCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logDate: {
    width: 60,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  logWeight: {
    flex: 1,
  },
  weightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  diffText: {
    fontSize: 12,
    marginTop: 2,
  },
  diffUp: {
    color: COLORS.error,
  },
  diffDown: {
    color: COLORS.success,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
});
RECENT_LOGS_EOF
\`\`\`

## PASSO 3.4: Criar componente de Conquistas

\`\`\`bash
cat > components/dashboard/Achievements.tsx << 'ACHIEVEMENTS_EOF'
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '@/constants/colors';
import { JourneyStats } from '@/lib/types';

interface AchievementsProps {
  stats: JourneyStats | null;
}

interface AchievementBadge {
  id: string;
  emoji: string;
  title: string;
  earned: boolean;
}

export function Achievements({ stats }: AchievementsProps) {
  if (!stats) return null;

  const achievements: AchievementBadge[] = [
    {
      id: '1kg',
      emoji: '🎉',
      title: '1kg perdido!',
      earned: stats.lostSoFar >= 1,
    },
    {
      id: '3kg',
      emoji: '🔥',
      title: '3kg perdidos!',
      earned: stats.lostSoFar >= 3,
    },
    {
      id: '5kg',
      emoji: '💪',
      title: '5kg perdidos!',
      earned: stats.lostSoFar >= 5,
    },
    {
      id: '1week',
      emoji: '📅',
      title: '1 semana completa',
      earned: stats.weekNumber >= 1,
    },
    {
      id: '4weeks',
      emoji: '🗓️',
      title: '1 mês de jornada',
      earned: stats.weekNumber >= 4,
    },
    {
      id: '50percent',
      emoji: '🎯',
      title: 'Meio caminho!',
      earned: stats.progressPercent >= 50,
    },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  if (earnedAchievements.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Conquistas</Text>
      
      <FlatList
        data={earnedAchievements}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>{item.emoji}</Text>
            <Text style={styles.badgeTitle}>{item.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.badgesList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  badgesList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  badge: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});
ACHIEVEMENTS_EOF
\`\`\`

## PASSO 3.5: Atualizar Dashboard principal

\`\`\`bash
cat > app/\(tabs\)/index.tsx << 'DASHBOARD_NEW_EOF'
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { useMedications } from '@/hooks/useMedications';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { useJourneyStats } from '@/hooks/useJourneyStats';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WeeklyJourney } from '@/components/dashboard/WeeklyJourney';
import { RecentLogs } from '@/components/dashboard/RecentLogs';
import { Achievements } from '@/components/dashboard/Achievements';
import { MedicationList } from '@/components/dashboard/MedicationList';
import { COLORS } from '@/constants/colors';

export default function DashboardScreen() {
  const { user: clerkUser } = useAuth();
  const { user: dbUser, loading: userLoading } = useUser();
  const { medications, loading: medsLoading, refetch: refetchMeds } = useMedications();
  const { weightLogs, loading: weightsLoading, refetch: refetchWeights } = useWeightLogs();
  const journeyStats = useJourneyStats(weightLogs, dbUser);
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);

  // Redirecionar para onboarding se não completou
  useEffect(() => {
    if (!userLoading && dbUser && !dbUser.onboarding_completed) {
      router.replace('/(onboarding)');
    }
  }, [dbUser, userLoading]);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refetchMeds(), refetchWeights()]);
    setRefreshing(false);
  }

  if (userLoading || medsLoading || weightsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {clerkUser?.firstName || 'Usuário'}! 👋</Text>
        <Text style={styles.subtitle}>Como está sua jornada hoje?</Text>
      </View>

      {/* Jornada Semanal */}
      {journeyStats && <WeeklyJourney stats={journeyStats} />}

      {/* Conquistas */}
      <Achievements stats={journeyStats} />

      {/* Últimos Registros */}
      <RecentLogs logs={weightLogs} />

      {/* Medicações Ativas */}
      <View style={styles.section}>
        <MedicationList medications={medications} />
      </View>

      {/* Ações Rápidas */}
      <View style={styles.actions}>
        <Text style={styles.actionsTitle}>Ações Rápidas</Text>
        <Button
          label="⚖️ Registrar Peso Hoje"
          onPress={() => router.push('/(tabs)/add-weight')}
          variant="primary"
        />
        <Button
          label="💊 Adicionar Medicação"
          onPress={() => router.push('/(tabs)/add-medication')}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
  },
  actions: {
    padding: 24,
    gap: 12,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
});
DASHBOARD_NEW_EOF
\`\`\`

---

# 📄 FASE 4: GERAÇÃO DE PDF

## PASSO 4.1: Criar utilitário de PDF

\`\`\`bash
mkdir -p lib/utils
cat > lib/utils/pdfGenerator.ts << 'PDF_GEN_EOF'
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { WeightLog, Medication, User } from '@/lib/types';
import { JourneyStats } from '@/lib/types';

export async function generateProgressReport(
  user: User,
  stats: JourneyStats,
  weightLogs: WeightLog[],
  medications: Medication[]
) {
  const html = \`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, system-ui, sans-serif;
          padding: 40px;
          background: white;
        }
        h1 {
          color: #6366f1;
          margin-bottom: 8px;
        }
        h2 {
          color: #334155;
          margin-top: 32px;
          margin-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .stat-card {
          display: inline-block;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 16px;
          margin: 8px;
          min-width: 150px;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        th, td {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 Relatório de Progresso</h1>
        <p>Mounjaro Tracker</p>
        <p style="color: #64748b;">${new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })}</p>
      </div>

      <h2>👤 Dados do Paciente</h2>
      <div>
        <strong>Nome:</strong> ${user.name || 'Não informado'}<br>
        <strong>Email:</strong> ${user.email}
      </div>

      <h2>📊 Resumo da Jornada</h2>
      <div>
        <div class="stat-card">
          <div class="stat-label">Semana</div>
          <div class="stat-value">#${stats.weekNumber}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Peso Atual</div>
          <div class="stat-value">${stats.currentWeight.toFixed(1)}kg</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Meta</div>
          <div class="stat-value">${stats.goalWeight.toFixed(1)}kg</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Progresso</div>
          <div class="stat-value">${stats.progressPercent}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Perdido</div>
          <div class="stat-value">${stats.lostSoFar.toFixed(1)}kg</div>
        </div>
      </div>

      <h2>💊 Medicações Ativas</h2>
      <table>
        <thead>
          <tr>
            <th>Medicação</th>
            <th>Dosagem</th>
            <th>Frequência</th>
            <th>Início</th>
          </tr>
        </thead>
        <tbody>
          ${medications
            .filter(m => m.active)
            .map(m => \`
              <tr>
                <td>${m.type.charAt(0).toUpperCase() + m.type.slice(1)}</td>
                <td>${m.dosage}mg</td>
                <td>${m.frequency === 'weekly' ? 'Semanal' : 'Diária'}</td>
                <td>${new Date(m.start_date).toLocaleDateString('pt-BR')}</td>
              </tr>
            \`)
            .join('')}
        </tbody>
      </table>

      <h2>⚖️ Histórico de Peso (Últimos 10 registros)</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Peso</th>
            <th>Variação</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          ${weightLogs
            .slice(0, 10)
            .map((log, index) => {
              const prevWeight = weightLogs[index + 1]?.weight;
              const diff = prevWeight ? (log.weight - prevWeight).toFixed(1) : '-';
              return \`
                <tr>
                  <td>${new Date(log.date).toLocaleDateString('pt-BR')}</td>
                  <td>${log.weight}kg</td>
                  <td>${diff !== '-' ? (parseFloat(diff) > 0 ? '↑' : '↓') + ' ' + Math.abs(parseFloat(diff)) + 'kg' : '-'}</td>
                  <td>${log.notes || '-'}</td>
                </tr>
              \`;
            })
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Relatório gerado pelo Mounjaro Tracker</p>
        <p>Este documento não substitui consulta médica</p>
      </div>
    </body>
    </html>
  \`;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Relatório de Progresso',
        UTI: 'com.adobe.pdf',
      });
    } else {
      alert('Compartilhamento não disponível neste dispositivo');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
PDF_GEN_EOF
\`\`\`

## PASSO 4.2: Adicionar botão de PDF no perfil

\`\`\`bash
cat > app/\(tabs\)/profile.tsx << 'PROFILE_NEW_EOF'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth, useClerkAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { useMedications } from '@/hooks/useMedications';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { useJourneyStats } from '@/hooks/useJourneyStats';
import { Button } from '@/components/ui/button';
import { generateProgressReport } from '@/lib/utils/pdfGenerator';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useState } from 'react';

export default function ProfileScreen() {
  const { signOut } = useClerkAuth();
  const { user: clerkUser } = useAuth();
  const { user: dbUser } = useUser();
  const { medications } = useMedications();
  const { weightLogs } = useWeightLogs();
  const journeyStats = useJourneyStats(weightLogs, dbUser);
  const router = useRouter();
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  }

  async function handleGeneratePDF() {
    if (!dbUser || !journeyStats) {
      Alert.alert('Erro', 'Dados insuficientes para gerar relatório');
      return;
    }

    try {
      setGeneratingPDF(true);
      await generateProgressReport(dbUser, journeyStats, weightLogs, medications);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    } finally {
      setGeneratingPDF(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {clerkUser?.firstName?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.name}>
          {clerkUser?.fullName || 'Usuário'}
        </Text>
        <Text style={styles.email}>
          {clerkUser?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
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

        {journeyStats && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Progresso da Jornada</Text>
            <Text style={styles.infoValue}>
              Semana {journeyStats.weekNumber} • {journeyStats.progressPercent}% da meta
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Relatórios</Text>
        
        <Button
          label="📄 Gerar Relatório em PDF"
          onPress={handleGeneratePDF}
          variant="primary"
          loading={generatingPDF}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <Button
          label="🔔 Notificações"
          onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          variant="secondary"
        />
        
        <Button
          label="❓ Ajuda e Suporte"
          onPress={() => Alert.alert('Suporte', 'Entre em contato: suporte@mounjarotracker.com')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    padding: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    padding: 24,
  },
});
PROFILE_NEW_EOF
\`\`\`

---

# ✅ FASE 5: VALIDAÇÃO E TESTE

## PASSO 5.1: Atualizar app/index.tsx para redirecionar onboarding

\`\`\`bash
cat > app/index.tsx << 'INDEX_NEW_EOF'
import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/constants/colors';

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: dbUser, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || userLoading) return;

    if (isSignedIn && dbUser) {
      // Se não completou onboarding, redirecionar
      if (!dbUser.onboarding_completed) {
        router.replace('/(onboarding)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isSignedIn, isLoaded, dbUser, userLoading]);

  if (!isLoaded || userLoading) {
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
        <Text style={styles.feature}>⚖️ Registre seu peso semanalmente</Text>
        <Text style={styles.feature}>💊 Acompanhe suas medicações</Text>
        <Text style={styles.feature}>�� Visualize seu progresso</Text>
        <Text style={styles.feature}>🏆 Conquiste suas metas</Text>
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
INDEX_NEW_EOF
\`\`\`

## PASSO 5.2: Testar o app completo

Execute no terminal:
\`\`\`bash
npx expo start
\`\`\`

### Checklist de Testes:

**TESTE 1: Novo Usuário (Onboarding)**
1. ✅ Criar nova conta
2. ✅ Ver tela de boas-vindas
3. ✅ Definir peso atual e meta
4. ✅ Ver card mostrando quanto quer perder
5. ✅ Escolher medicação e dosagem
6. ✅ Ser redirecionado para dashboard

**TESTE 2: Dashboard**
1. ✅ Ver "Semana 1 da jornada"
2. ✅ Ver barra de progresso correta
3. ✅ Ver estatísticas (peso perdido, %)
4. ✅ Ver últimos registros
5. ✅ Ver medicações ativas
6. ✅ Pull-to-refresh funciona

**TESTE 3: Adicionar Peso**
1. ✅ Clicar em "Registrar Peso Hoje"
2. ✅ Adicionar novo peso
3. ✅ Voltar ao dashboard
4. ✅ Ver atualização nas estatísticas
5. ✅ Ver variação semanal (se aplicável)

**TESTE 4: Gerar PDF**
1. ✅ Ir no perfil
2. ✅ Clicar em "Gerar Relatório em PDF"
3. ✅ PDF gerado com sucesso
4. ✅ Consegue compartilhar/salvar

**TESTE 5: Conquistas**
1. ✅ Adicionar mais pesos
2. ✅ Quando perder 1kg, ver badge de conquista
3. ✅ Badges aparecem no dashboard

---

## 📊 VALIDAÇÃO FINAL

Antes de marcar TASK-06 como completa, verifique:

- [ ] SQL executado no Supabase sem erros
- [ ] Onboarding completo funciona
- [ ] Dashboard mostra "Semana X da jornada"
- [ ] Barra de progresso correta
- [ ] Conquistas aparecem
- [ ] Últimos registros visíveis
- [ ] PDF gerado e compartilhável
- [ ] App não trava
- [ ] Loading states funcionam
- [ ] Pull-to-refresh atualiza dados

---

## 🎉 RESULTADO ESPERADO

✅ App focado na JORNADA DO USUÁRIO
✅ Onboarding define meta clara
✅ Dashboard mostra progresso semanal
✅ Sistema de conquistas motivacional
✅ Relatório em PDF compartilhável
✅ UX intuitiva e motivadora

---

## 🚀 PRÓXIMOS PASSOS (OPCIONAIS)

Depois da TASK-06, você pode adicionar:
- Notificações push (lembrete de peso semanal)
- Registro de efeitos colaterais com UI
- Gráfico interativo (zoom, filtros)
- Comparação com outros usuários (anônimo)
- Integração com Apple Health / Google Fit

---

**Pronto para começar a implementar!** 🎯
