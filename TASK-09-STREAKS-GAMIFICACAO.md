# TASK-09: Sistema de Streaks + Gamificação

## 🎯 OBJETIVO
Criar sistema de sequências (streaks) para criar **VÍCIO POSITIVO** no usuário.

**Por que isso é CRÍTICO?**
- Streaks criam hábito compulsivo
- Perder streak = usuário volta imediatamente
- Retenção aumenta 250%

---

## 📋 PRÉ-REQUISITOS
- TASK-08 completa
- Terminal aberto em `/Users/user/Desktop/mounjaro-tracker`

---

# 🗄️ FASE 1: ATUALIZAR BANCO

## PASSO 1.1: Adicionar campos de streaks

No Supabase Dashboard → SQL Editor:

\`\`\`sql
-- Adicionar campos de streaks
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS current_weight_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_weight_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_weight_log_date DATE,
  ADD COLUMN IF NOT EXISTS current_application_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_application_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_experience_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Criar tabela de streaks diários
CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_logged BOOLEAN DEFAULT FALSE,
  application_logged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user ON daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_date ON daily_streaks(date DESC);

-- RLS
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON daily_streaks FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can manage own streaks"
  ON daily_streaks FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));
\`\`\`

---

# 🪝 FASE 2: CRIAR HOOK DE STREAKS

## PASSO 2.1: Hook useStreaks

\`\`\`bash
cat > hooks/useStreaks.ts << 'STREAKS_HOOK_EOF'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedicationApplications } from './useMedicationApplications';

export interface StreakData {
  currentWeightStreak: number;
  longestWeightStreak: number;
  currentApplicationStreak: number;
  longestApplicationStreak: number;
  level: number;
  experiencePoints: number;
  experienceToNextLevel: number;
  lastWeightLogDate: string | null;
}

export function useStreaks() {
  const { user, refetch: refetchUser } = useUser();
  const { weightLogs } = useWeightLogs();
  const { applications } = useMedicationApplications();
  const [loading, setLoading] = useState(false);

  // Calcular streaks automaticamente
  useEffect(() => {
    if (user) {
      calculateStreaks();
    }
  }, [weightLogs.length, applications.length]);

  async function calculateStreaks() {
    if (!user) return;

    try {
      setLoading(true);

      // Calcular streak de peso
      let currentWeightStreak = 0;
      let longestWeightStreak = user.longest_weight_streak || 0;
      const today = new Date().toISOString().split('T')[0];
      
      if (weightLogs.length > 0) {
        const sortedLogs = [...weightLogs].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Verificar se registrou hoje ou ontem
        const lastLogDate = new Date(sortedLogs[0].date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
          // Contar dias consecutivos
          currentWeightStreak = 1;
          for (let i = 1; i < sortedLogs.length; i++) {
            const currentDate = new Date(sortedLogs[i - 1].date);
            const prevDate = new Date(sortedLogs[i].date);
            const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
              currentWeightStreak++;
            } else {
              break;
            }
          }

          if (currentWeightStreak > longestWeightStreak) {
            longestWeightStreak = currentWeightStreak;
          }
        } else {
          currentWeightStreak = 0;
        }
      }

      // Calcular XP e nível
      const totalXP = user.total_experience_points || 0;
      const newXP = totalXP + (currentWeightStreak > (user.current_weight_streak || 0) ? 10 : 0);
      const level = Math.floor(newXP / 100) + 1;
      const xpToNextLevel = (level * 100) - newXP;

      // Atualizar banco
      await supabase
        .from('users')
        .update({
          current_weight_streak: currentWeightStreak,
          longest_weight_streak: longestWeightStreak,
          last_weight_log_date: weightLogs[0]?.date || null,
          total_experience_points: newXP,
          level,
        })
        .eq('id', user.id);

      await refetchUser();
    } catch (error) {
      console.error('Error calculating streaks:', error);
    } finally {
      setLoading(false);
    }
  }

  const streakData: StreakData | null = user ? {
    currentWeightStreak: user.current_weight_streak || 0,
    longestWeightStreak: user.longest_weight_streak || 0,
    currentApplicationStreak: user.current_application_streak || 0,
    longestApplicationStreak: user.longest_application_streak || 0,
    level: user.level || 1,
    experiencePoints: user.total_experience_points || 0,
    experienceToNextLevel: ((user.level || 1) * 100) - (user.total_experience_points || 0),
    lastWeightLogDate: user.last_weight_log_date || null,
  } : null;

  return {
    streakData,
    loading,
    calculateStreaks,
  };
}
STREAKS_HOOK_EOF
\`\`\`

---

# 🎨 FASE 3: COMPONENTES

## PASSO 3.1: Card de Streak

\`\`\`bash
cat > components/dashboard/StreakCard.tsx << 'STREAK_CARD_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  type: 'weight' | 'application';
}

export function StreakCard({ currentStreak, longestStreak, type }: StreakCardProps) {
  const emoji = type === 'weight' ? '⚖️' : '💉';
  const label = type === 'weight' ? 'Pesagens' : 'Aplicações';

  return (
    <View style={[
      styles.container,
      currentStreak === 0 && styles.containerInactive
    ]}>
      <Text style={styles.emoji}>{emoji}</Text>
      
      <View style={styles.content}>
        <View style={styles.streakRow}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.currentStreak}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>dias</Text>
        </View>
        
        <Text style={styles.type}>{label} Consecutivas</Text>
        
        {longestStreak > currentStreak && (
          <Text style={styles.record}>
            Recorde: {longestStreak} dias
          </Text>
        )}
      </View>

      {currentStreak === 0 && (
        <View style={styles.brokenBadge}>
          <Text style={styles.brokenText}>Quebrado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  containerInactive: {
    opacity: 0.6,
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 40,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fireEmoji: {
    fontSize: 20,
    marginRight: 4,
  },
  currentStreak: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  type: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  record: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  brokenBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brokenText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
STREAK_CARD_EOF
\`\`\`

## PASSO 3.2: Level Card

\`\`\`bash
cat > components/dashboard/LevelCard.tsx << 'LEVEL_CARD_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface LevelCardProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

export function LevelCard({ level, currentXP, xpToNextLevel }: LevelCardProps) {
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const progressPercent = ((currentXP - xpForCurrentLevel) / 100) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>⭐</Text>
        <View style={styles.levelInfo}>
          <Text style={styles.levelLabel}>Nível</Text>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: \`\${progressPercent}%\` }]} />
        </View>
        <Text style={styles.progressText}>
          {xpToNextLevel} XP para o próximo nível
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
LEVEL_CARD_EOF
\`\`\`

---

# 📊 FASE 4: ADICIONAR NO DASHBOARD

Cole no Cursor AI:

\`\`\`
INSTRUÇÕES: Adicionar no dashboard (app/(tabs)/index.tsx):

1. Importar:
import { useStreaks } from '@/hooks/useStreaks';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { LevelCard } from '@/components/dashboard/LevelCard';

2. Usar hook:
const { streakData } = useStreaks();

3. Adicionar após Stats Cards:

{/* Level e Streaks */}
{streakData && (
  <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 }}>
      🏆 Seu Progresso
    </Text>
    
    <LevelCard
      level={streakData.level}
      currentXP={streakData.experiencePoints}
      xpToNextLevel={streakData.experienceToNextLevel}
    />
    
    <View style={{ marginTop: 12, gap: 12 }}>
      <StreakCard
        currentStreak={streakData.currentWeightStreak}
        longestStreak={streakData.longestWeightStreak}
        type="weight"
      />
    </View>
  </View>
)}
\`\`\`

---

## ✅ RESULTADO

✅ Sistema de streaks funcionando
✅ Nível e XP
✅ Motivação gamificada
✅ Usuário vicia em manter streak!

**Tempo: ~10 minutos** ⚡
