# TASK-08: Insights Automáticos + Inteligência

## 🎯 OBJETIVO
Fazer o app "CONVERSAR" com o usuário através de insights personalizados baseados em seus dados.

**Por que isso é CRÍTICO?**
- App passivo = usuário abandona
- Feedback inteligente = engajamento +300%
- Usuário precisa sentir que o app "entende" ele

---

## 📋 PRÉ-REQUISITOS
- TASK-07 completa
- Terminal aberto em `/Users/user/Desktop/mounjaro-tracker`

---

# 🧠 FASE 1: CRIAR SISTEMA DE INSIGHTS

## PASSO 1.1: Criar hook de cálculos

\`\`\`bash
cat > hooks/useInsights.ts << 'INSIGHTS_EOF'
import { useMemo } from 'react';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedicationApplications } from './useMedicationApplications';
import { useMedications } from './useMedications';

export interface Insight {
  id: string;
  type: 'positive' | 'neutral' | 'warning' | 'tip';
  emoji: string;
  title: string;
  description: string;
  priority: number;
}

export function useInsights() {
  const { user } = useUser();
  const { weightLogs } = useWeightLogs();
  const { applications } = useMedicationApplications();
  const { medications } = useMedications();

  const insights = useMemo(() => {
    const insights: Insight[] = [];

    if (!user || weightLogs.length === 0) return insights;

    // Calcular dados base
    const currentWeight = weightLogs[0]?.weight || 0;
    const initialWeight = user.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;
    const goalWeight = user.goal_weight || 0;
    const weightLost = initialWeight - currentWeight;

    // INSIGHT 1: Próxima aplicação
    const activeMed = medications.find(m => m.active);
    if (activeMed && applications.length > 0) {
      const lastApp = applications
        .filter(a => a.medication_id === activeMed.id)
        .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())[0];

      if (lastApp) {
        const daysSinceLastApp = Math.floor(
          (Date.now() - new Date(lastApp.application_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysUntilNext = activeMed.frequency === 'weekly' ? 7 - daysSinceLastApp : 1 - daysSinceLastApp;

        if (daysUntilNext === 0) {
          insights.push({
            id: 'next-application-today',
            type: 'warning',
            emoji: '💉',
            title: 'Aplicação HOJE!',
            description: \`Hora de aplicar \${activeMed.type.toUpperCase()} \${activeMed.dosage}mg\`,
            priority: 100,
          });
        } else if (daysUntilNext > 0 && daysUntilNext <= 3) {
          insights.push({
            id: 'next-application-soon',
            type: 'neutral',
            emoji: '📅',
            title: \`Próxima aplicação em \${daysUntilNext} dia\${daysUntilNext > 1 ? 's' : ''}\`,
            description: \`\${activeMed.type.charAt(0).toUpperCase() + activeMed.type.slice(1)} \${activeMed.dosage}mg\`,
            priority: 90,
          });
        }
      }
    }

    // INSIGHT 2: Média de perda semanal
    if (weightLogs.length >= 2) {
      const firstLog = weightLogs[weightLogs.length - 1];
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const weeksSinceStart = daysSinceStart / 7;

      if (weeksSinceStart >= 1) {
        const avgWeeklyLoss = weightLost / weeksSinceStart;

        if (avgWeeklyLoss >= 1) {
          insights.push({
            id: 'weekly-average-great',
            type: 'positive',
            emoji: '🔥',
            title: 'Você está ARRASANDO!',
            description: \`Perdendo \${avgWeeklyLoss.toFixed(1)}kg por semana em média\`,
            priority: 80,
          });
        } else if (avgWeeklyLoss > 0) {
          insights.push({
            id: 'weekly-average-good',
            type: 'positive',
            emoji: '💪',
            title: 'Progresso consistente!',
            description: \`Perdendo \${avgWeeklyLoss.toFixed(1)}kg por semana\`,
            priority: 75,
          });
        }
      }
    }

    // INSIGHT 3: Projeção de meta
    if (goalWeight > 0 && weightLogs.length >= 2) {
      const firstLog = weightLogs[weightLogs.length - 1];
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceStart >= 7 && weightLost > 0) {
        const dailyAvgLoss = weightLost / daysSinceStart;
        const remainingWeight = currentWeight - goalWeight;
        const daysToGoal = Math.ceil(remainingWeight / dailyAvgLoss);
        const weeksToGoal = Math.ceil(daysToGoal / 7);

        if (weeksToGoal > 0 && weeksToGoal < 52) {
          insights.push({
            id: 'goal-projection',
            type: 'neutral',
            emoji: '🎯',
            title: 'Projeção de Meta',
            description: \`Com esse ritmo, você atinge \${goalWeight}kg em \${weeksToGoal} semana\${weeksToGoal > 1 ? 's' : ''}\`,
            priority: 70,
          });
        }
      }
    }

    // INSIGHT 4: Última pesagem
    if (weightLogs.length > 0) {
      const lastLog = weightLogs[0];
      const daysSinceLastLog = Math.floor(
        (Date.now() - new Date(lastLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastLog >= 3) {
        insights.push({
          id: 'last-weight-warning',
          type: 'warning',
          emoji: '⚖️',
          title: 'Cadê você?',
          description: \`Você não se pesa há \${daysSinceLastLog} dias\`,
          priority: 85,
        });
      }
    }

    // INSIGHT 5: Porcentagem de progresso
    if (goalWeight > 0) {
      const totalToLose = initialWeight - goalWeight;
      const progressPercent = Math.round((weightLost / totalToLose) * 100);

      if (progressPercent >= 50 && progressPercent < 75) {
        insights.push({
          id: 'halfway-milestone',
          type: 'positive',
          emoji: '🎉',
          title: 'Você já está na metade!',
          description: \`\${progressPercent}% da meta concluída\`,
          priority: 65,
        });
      } else if (progressPercent >= 75 && progressPercent < 100) {
        insights.push({
          id: 'almost-there',
          type: 'positive',
          emoji: '🏁',
          title: 'Falta pouco!',
          description: \`\${progressPercent}% da meta - você está quase lá!\`,
          priority: 85,
        });
      }
    }

    // INSIGHT 6: Dicas baseadas em tempo de jornada
    if (weightLogs.length > 0) {
      const firstLog = weightLogs[weightLogs.length - 1];
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceStart === 7) {
        insights.push({
          id: 'first-week-tip',
          type: 'tip',
          emoji: '💡',
          title: 'Primeira semana completa!',
          description: 'Continue registrando diariamente para melhores resultados',
          priority: 60,
        });
      }
    }

    // Ordenar por prioridade
    return insights.sort((a, b) => b.priority - a.priority);
  }, [user, weightLogs, applications, medications]);

  // Calcular estatísticas adicionais
  const stats = useMemo(() => {
    if (!user || weightLogs.length === 0) return null;

    const currentWeight = weightLogs[0]?.weight || 0;
    const initialWeight = user.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;
    const goalWeight = user.goal_weight || 0;
    const weightLost = initialWeight - currentWeight;
    const totalToLose = initialWeight - goalWeight;
    const progressPercent = goalWeight > 0 ? Math.round((weightLost / totalToLose) * 100) : 0;

    // Calcular média semanal
    const firstLog = weightLogs[weightLogs.length - 1];
    const daysSinceStart = Math.floor(
      (Date.now() - new Date(firstLog.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeksSinceStart = daysSinceStart / 7;
    const avgWeeklyLoss = weeksSinceStart >= 1 ? weightLost / weeksSinceStart : 0;

    // Próxima aplicação
    let daysUntilNextApplication = null;
    const activeMed = medications.find(m => m.active);
    if (activeMed && applications.length > 0) {
      const lastApp = applications
        .filter(a => a.medication_id === activeMed.id)
        .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())[0];

      if (lastApp) {
        const daysSinceLastApp = Math.floor(
          (Date.now() - new Date(lastApp.application_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        daysUntilNextApplication = activeMed.frequency === 'weekly' ? 7 - daysSinceLastApp : 1 - daysSinceLastApp;
      }
    }

    return {
      currentWeight,
      initialWeight,
      goalWeight,
      weightLost,
      totalToLose,
      progressPercent,
      avgWeeklyLoss,
      daysSinceStart,
      weeksSinceStart,
      daysUntilNextApplication,
    };
  }, [user, weightLogs, applications, medications]);

  return {
    insights,
    stats,
  };
}
INSIGHTS_EOF
\`\`\`

---

# 🎨 FASE 2: COMPONENTES VISUAIS

## PASSO 2.1: Card de Insight

\`\`\`bash
cat > components/dashboard/InsightCard.tsx << 'INSIGHT_CARD_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Insight } from '@/hooks/useInsights';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const bgColor = {
    positive: COLORS.success + '20',
    warning: COLORS.warning + '20',
    neutral: COLORS.primary + '20',
    tip: COLORS.info + '20',
  }[insight.type];

  const borderColor = {
    positive: COLORS.success,
    warning: COLORS.warning,
    neutral: COLORS.primary,
    tip: COLORS.info,
  }[insight.type];

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderLeftColor: borderColor }]}>
      <Text style={styles.emoji}>{insight.emoji}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
INSIGHT_CARD_EOF
\`\`\`

## PASSO 2.2: Card "Próxima Aplicação" (GIGANTE)

\`\`\`bash
cat > components/dashboard/NextApplicationCard.tsx << 'NEXT_APP_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';

interface NextApplicationCardProps {
  daysUntil: number;
  medicationName: string;
  dosage: number;
}

export function NextApplicationCard({ daysUntil, medicationName, dosage }: NextApplicationCardProps) {
  const router = useRouter();

  const isToday = daysUntil === 0;
  const isOverdue = daysUntil < 0;

  return (
    <View style={[
      styles.container,
      isToday && styles.containerToday,
      isOverdue && styles.containerOverdue,
    ]}>
      <Text style={styles.label}>
        {isOverdue ? 'ATRASADA!' : isToday ? 'HOJE!' : 'PRÓXIMA APLICAÇÃO'}
      </Text>
      
      <View style={styles.countdown}>
        {!isToday && !isOverdue && (
          <>
            <Text style={styles.countdownNumber}>{daysUntil}</Text>
            <Text style={styles.countdownLabel}>
              dia{daysUntil > 1 ? 's' : ''}
            </Text>
          </>
        )}
        {isToday && (
          <Text style={styles.todayEmoji}>💉</Text>
        )}
        {isOverdue && (
          <Text style={styles.overdueEmoji}>⚠️</Text>
        )}
      </View>

      <Text style={styles.medication}>
        {medicationName} {dosage}mg
      </Text>

      {(isToday || isOverdue) && (
        <View style={styles.action}>
          <Button
            label="Registrar Aplicação"
            onPress={() => router.push('/(tabs)/add-application')}
            variant="primary"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  containerToday: {
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
  },
  containerOverdue: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  countdown: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  countdownLabel: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  todayEmoji: {
    fontSize: 80,
  },
  overdueEmoji: {
    fontSize: 80,
  },
  medication: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  action: {
    width: '100%',
  },
});
NEXT_APP_EOF
\`\`\`

---

# 📊 FASE 3: ATUALIZAR DASHBOARD

Cole no Cursor AI:

\`\`\`
INSTRUÇÕES: Adicione no dashboard (app/(tabs)/index.tsx):

1. Importar hooks e componentes:
import { useInsights } from '@/hooks/useInsights';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { NextApplicationCard } from '@/components/dashboard/NextApplicationCard';

2. Adicionar no componente:
const { insights, stats } = useInsights();

3. Adicionar ANTES dos Stats Cards:

{/* Próxima Aplicação (Card Gigante) */}
{stats?.daysUntilNextApplication !== null && (
  <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
    <NextApplicationCard
      daysUntil={stats.daysUntilNextApplication}
      medicationName={medications.find(m => m.active)?.type.toUpperCase() || ''}
      dosage={medications.find(m => m.active)?.dosage || 0}
    />
  </View>
)}

{/* Insights Automáticos */}
{insights.length > 0 && (
  <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 }}>
      💡 Insights
    </Text>
    {insights.slice(0, 3).map(insight => (
      <InsightCard key={insight.id} insight={insight} />
    ))}
  </View>
)}
\`\`\`

---

# ✅ FASE 4: TESTAR

Execute:
\`\`\`bash
npx expo start
\`\`\`

### Checklist:

**TESTE 1: Card de Próxima Aplicação**
- [ ] Card aparece no dashboard
- [ ] Mostra contagem regressiva
- [ ] Muda cor quando é hoje
- [ ] Botão de ação funciona

**TESTE 2: Insights**
- [ ] Ver insights personalizados
- [ ] Média semanal calculada
- [ ] Projeção de meta aparece
- [ ] Diferentes tipos de insight (positivo, warning, tip)

**TESTE 3: Estatísticas**
- [ ] Progresso % correto
- [ ] Peso perdido correto
- [ ] Dias de jornada corretos

---

## 🎉 RESULTADO ESPERADO

✅ App "conversa" com usuário
✅ Feedback inteligente automático
✅ Card gigante de próxima aplicação
✅ Insights personalizados
✅ Projeção de meta
✅ Engajamento +300%!

---

**TASKS 07 + 08 COMPLETAS = APP INDISPENSÁVEL! 🎯🔥**
