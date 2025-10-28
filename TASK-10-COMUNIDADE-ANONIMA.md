# TASK-10: Comparação com Comunidade (Anônima)

## 🎯 OBJETIVO
Mostrar benchmarks anônimos para motivar: "Você está indo bem comparado a outros usuários!"

**Por que isso é IMPORTANTE?**
- "Você não está sozinho"
- Validação social
- Motivação por comparação

---

## 📋 PRÉ-REQUISITOS
- TASK-09 completa

---

# 🗄️ FASE 1: CRIAR VIEW NO SUPABASE

## PASSO 1.1: View de estatísticas agregadas

No Supabase → SQL Editor:

\`\`\`sql
-- View de estatísticas da comunidade (ANÔNIMA)
CREATE OR REPLACE VIEW community_stats AS
SELECT
  medications.type as medication_type,
  medications.dosage,
  AVG(weight_lost.total_lost) as avg_weight_lost,
  COUNT(DISTINCT users.id) as user_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY weight_lost.total_lost) as median_weight_lost,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY weight_lost.total_lost) as top_25_percentile,
  AVG(weight_lost.weeks_in_treatment) as avg_weeks
FROM users
JOIN medications ON medications.user_id = users.id AND medications.active = true
JOIN LATERAL (
  SELECT
    users.id,
    COALESCE(users.initial_weight, 0) - COALESCE(
      (SELECT weight FROM weight_logs WHERE user_id = users.id ORDER BY date DESC LIMIT 1),
      0
    ) as total_lost,
    GREATEST(1, EXTRACT(EPOCH FROM (NOW() - users.created_at)) / 604800) as weeks_in_treatment
  FROM users
  WHERE users.id = medications.user_id
) weight_lost ON true
WHERE users.initial_weight IS NOT NULL
GROUP BY medications.type, medications.dosage
HAVING COUNT(DISTINCT users.id) >= 5; -- Mínimo 5 usuários para preservar anonimato

-- Permitir leitura para todos (anônimo)
GRANT SELECT ON community_stats TO anon, authenticated;
\`\`\`

---

# 🪝 FASE 2: HOOK

## PASSO 2.1: useCommunityStats

\`\`\`bash
cat > hooks/useCommunityStats.ts << 'COMMUNITY_HOOK_EOF'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { useWeightLogs } from './useWeightLogs';
import { useMedications } from './useMedications';

interface CommunityComparison {
  yourWeightLost: number;
  avgWeightLost: number;
  medianWeightLost: number;
  top25Percentile: number;
  yourPercentile: number;
  usersInSample: number;
  message: string;
  emoji: string;
}

export function useCommunityStats() {
  const { user } = useUser();
  const { weightLogs } = useWeightLogs();
  const { medications } = useMedications();
  const [comparison, setComparison] = useState<CommunityComparison | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && weightLogs.length > 0 && medications.length > 0) {
      fetchCommunityStats();
    }
  }, [user?.id, weightLogs.length, medications.length]);

  async function fetchCommunityStats() {
    if (!user) return;

    try {
      setLoading(true);

      const activeMed = medications.find(m => m.active);
      if (!activeMed) return;

      // Buscar stats da comunidade
      const { data, error } = await supabase
        .from('community_stats')
        .select('*')
        .eq('medication_type', activeMed.type)
        .eq('dosage', activeMed.dosage)
        .single();

      if (error || !data) {
        console.log('Sem dados suficientes da comunidade');
        return;
      }

      // Calcular peso perdido do usuário
      const currentWeight = weightLogs[0]?.weight || 0;
      const initialWeight = user.initial_weight || 0;
      const yourWeightLost = initialWeight - currentWeight;

      // Calcular percentil
      let yourPercentile = 50;
      if (yourWeightLost > data.top_25_percentile) {
        yourPercentile = 90; // Top 10%
      } else if (yourWeightLost > data.median_weight_lost) {
        yourPercentile = 75; // Top 25%
      } else if (yourWeightLost > data.avg_weight_lost * 0.7) {
        yourPercentile = 50;
      } else {
        yourPercentile = 25;
      }

      // Gerar mensagem
      let message = '';
      let emoji = '';

      if (yourPercentile >= 90) {
        message = 'Você está no TOP 10%! Resultado EXCEPCIONAL! 🏆';
        emoji = '🏆';
      } else if (yourPercentile >= 75) {
        message = 'Você está acima da média! Continue assim! 💪';
        emoji = '💪';
      } else if (yourPercentile >= 50) {
        message = 'Você está na média da comunidade 👍';
        emoji = '👍';
      } else {
        message = 'Continue firme! Cada corpo é único 💙';
        emoji = '💙';
      }

      setComparison({
        yourWeightLost,
        avgWeightLost: data.avg_weight_lost,
        medianWeightLost: data.median_weight_lost,
        top25Percentile: data.top_25_percentile,
        yourPercentile,
        usersInSample: data.user_count,
        message,
        emoji,
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    comparison,
    loading,
  };
}
COMMUNITY_HOOK_EOF
\`\`\`

---

# 🎨 FASE 3: COMPONENTE

## PASSO 3.1: CommunityCard

\`\`\`bash
cat > components/dashboard/CommunityCard.tsx << 'COMMUNITY_CARD_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface CommunityCardProps {
  yourWeightLost: number;
  avgWeightLost: number;
  yourPercentile: number;
  message: string;
  emoji: string;
  usersInSample: number;
}

export function CommunityCard({ 
  yourWeightLost, 
  avgWeightLost, 
  yourPercentile,
  message, 
  emoji,
  usersInSample 
}: CommunityCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      
      <Text style={styles.message}>{message}</Text>

      <View style={styles.comparisonRow}>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Você</Text>
          <Text style={styles.comparisonValue}>{yourWeightLost.toFixed(1)}kg</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Média</Text>
          <Text style={styles.comparisonValue}>{avgWeightLost.toFixed(1)}kg</Text>
        </View>
      </View>

      <View style={styles.percentileBar}>
        <View style={[styles.percentileFill, { width: \`\${yourPercentile}%\` }]} />
      </View>
      <Text style={styles.percentileText}>
        Top {100 - yourPercentile}% dos {usersInSample} usuários
      </Text>

      <Text style={styles.disclaimer}>
        * Dados anônimos e agregados da comunidade
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  percentileBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  percentileFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  percentileText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
COMMUNITY_CARD_EOF
\`\`\`

---

# 📊 FASE 4: ADICIONAR NO DASHBOARD

Cole no Cursor:

\`\`\`
INSTRUÇÕES: Adicionar no dashboard:

1. Importar:
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { CommunityCard } from '@/components/dashboard/CommunityCard';

2. Hook:
const { comparison } = useCommunityStats();

3. Adicionar seção:

{/* Comparação com Comunidade */}
{comparison && (
  <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 }}>
      🌍 Comunidade
    </Text>
    <CommunityCard {...comparison} />
  </View>
)}
\`\`\`

---

## ✅ RESULTADO

✅ Comparação anônima com comunidade
✅ Benchmarks motivacionais
✅ Percentil do usuário
✅ "Você não está sozinho"

**Tempo: ~15 minutos** ⚡
