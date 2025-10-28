# TASK-05: Dashboard + Analytics + Profile

## OBJETIVO
Criar dashboard completo com:
- Gráfico de evolução de peso
- Cards de estatísticas
- Lista de medicações ativas
- Histórico de aplicações
- Tela de perfil com configurações

## PRÉ-REQUISITOS
- TASK-04 completa (CRUD Operations)
- Victory Native já instalado
- Terminal aberto na pasta `/Users/user/Desktop/mounjaro-tracker`

---

## PASSO 1: Criar componente de gráfico de peso

\`\`\`bash
mkdir -p components/dashboard
cat > components/dashboard/WeightChart.tsx << 'CHART_EOF'
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { COLORS } from '@/constants/colors';
import { WeightLog } from '@/lib/types';

interface WeightChartProps {
  data: WeightLog[];
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📊 Nenhum registro de peso ainda</Text>
        <Text style={styles.emptySubtext}>Comece registrando seu peso hoje!</Text>
      </View>
    );
  }

  // Preparar dados para o gráfico (últimos 30 dias)
  const chartData = data
    .slice(0, 30)
    .reverse()
    .map((log, index) => ({
      x: index + 1,
      y: log.weight,
      date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));

  const minWeight = Math.min(...chartData.map(d => d.y)) - 2;
  const maxWeight = Math.max(...chartData.map(d => d.y)) + 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução de Peso (Últimos 30 dias)</Text>
      <VictoryChart
        theme={VictoryTheme.material}
        height={250}
        width={Dimensions.get('window').width - 48}
        domainPadding={{ x: 20, y: 20 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: COLORS.border },
            tickLabels: { fill: COLORS.textMuted, fontSize: 10 },
          }}
        />
        <VictoryAxis
          dependentAxis
          domain={[minWeight, maxWeight]}
          style={{
            axis: { stroke: COLORS.border },
            tickLabels: { fill: COLORS.textMuted, fontSize: 10 },
          }}
        />
        <VictoryLine
          data={chartData}
          style={{
            data: { stroke: COLORS.primary, strokeWidth: 3 },
          }}
          interpolation="natural"
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
CHART_EOF
\`\`\`

---

## PASSO 2: Criar componente de estatísticas

\`\`\`bash
cat > components/dashboard/StatsCard.tsx << 'STATS_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
}

export function StatsCard({ icon, label, value, subtitle }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
STATS_EOF
\`\`\`

---

## PASSO 3: Criar componente de lista de medicações

\`\`\`bash
cat > components/dashboard/MedicationList.tsx << 'MED_LIST_EOF'
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Medication } from '@/lib/types';

interface MedicationListProps {
  medications: Medication[];
}

const MEDICATION_NAMES: Record<string, string> = {
  mounjaro: 'Mounjaro',
  ozempic: 'Ozempic',
  saxenda: 'Saxenda',
  wegovy: 'Wegovy',
  zepbound: 'Zepbound',
};

export function MedicationList({ medications }: MedicationListProps) {
  if (medications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>💊 Nenhuma medicação cadastrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicações Ativas</Text>
      <FlatList
        data={medications.filter(m => m.active)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationName}>
                {MEDICATION_NAMES[item.type] || item.type}
              </Text>
              <Text style={styles.medicationDosage}>{item.dosage}mg</Text>
            </View>
            <Text style={styles.medicationFrequency}>
              Frequência: {item.frequency === 'weekly' ? 'Semanal' : 'Diária'}
            </Text>
            <Text style={styles.medicationStart}>
              Início: {new Date(item.start_date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  medicationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  medicationDosage: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  medicationFrequency: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  medicationStart: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
MED_LIST_EOF
\`\`\`

---

## PASSO 4: Atualizar dashboard principal (app/(tabs)/index.tsx)

\`\`\`bash
cat > app/\(tabs\)/index.tsx << 'DASHBOARD_EOF'
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth, useClerkAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { useMedications } from '@/hooks/useMedications';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { Button } from '@/components/ui/button';
import { WeightChart } from '@/components/dashboard/WeightChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MedicationList } from '@/components/dashboard/MedicationList';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useState } from 'react';

export default function DashboardScreen() {
  const { user: clerkUser } = useAuth();
  const { user: dbUser, loading: userLoading } = useUser();
  const { medications, loading: medsLoading, refetch: refetchMeds } = useMedications();
  const { weightLogs, loading: weightsLoading, refetch: refetchWeights } = useWeightLogs();
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refetchMeds(), refetchWeights()]);
    setRefreshing(false);
  }

  // Calcular estatísticas
  const latestWeight = weightLogs[0]?.weight || 0;
  const firstWeight = weightLogs[weightLogs.length - 1]?.weight || 0;
  const weightDiff = latestWeight && firstWeight ? (firstWeight - latestWeight).toFixed(1) : '0';
  const activeMedications = medications.filter(m => m.active).length;
  const totalLogs = weightLogs.length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {clerkUser?.firstName || 'Usuário'}! 👋</Text>
        <Text style={styles.subtitle}>Veja seu progresso</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <StatsCard
          icon="⚖️"
          label="Peso Atual"
          value={latestWeight ? `${latestWeight}kg` : '--'}
          subtitle={weightDiff !== '0' ? `${weightDiff}kg perdidos` : undefined}
        />
        <StatsCard
          icon="💊"
          label="Medicações"
          value={activeMedications.toString()}
          subtitle="ativas"
        />
      </View>

      <View style={styles.statsRow}>
        <StatsCard
          icon="📊"
          label="Registros"
          value={totalLogs.toString()}
          subtitle="pesagens"
        />
        <StatsCard
          icon="🎯"
          label="Dias"
          value={weightLogs.length > 0 ? Math.ceil((Date.now() - new Date(weightLogs[weightLogs.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)).toString() : '0'}
          subtitle="de jornada"
        />
      </View>

      {/* Weight Chart */}
      <WeightChart data={weightLogs} />

      {/* Medications List */}
      <MedicationList medications={medications} />

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Text style={styles.actionsTitle}>Ações Rápidas</Text>
        <Button
          label="➕ Registrar Peso"
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
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 12,
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
DASHBOARD_EOF
\`\`\`

---

## PASSO 5: Criar tela de perfil

\`\`\`bash
cat > app/\(tabs\)/profile.tsx << 'PROFILE_EOF'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth, useClerkAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function ProfileScreen() {
  const { signOut } = useClerkAuth();
  const { user: clerkUser } = useAuth();
  const { user: dbUser } = useUser();
  const router = useRouter();

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
        
        <Button
          label="📊 Ver Estatísticas Completas"
          onPress={() => {}}
          variant="secondary"
        />
        
        <Button
          label="🔔 Notificações"
          onPress={() => {}}
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
PROFILE_EOF
\`\`\`

---

## PASSO 6: Atualizar tabs layout com ícones

\`\`\`bash
cat > app/\(tabs\)/_layout.tsx << 'TABS_FINAL_EOF'
import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundLight,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Início',
          tabBarIcon: () => '🏠',
        }}
      />
      <Tabs.Screen
        name="add-medication"
        options={{
          title: 'Adicionar Medicação',
          tabBarLabel: 'Medicação',
          tabBarIcon: () => '💊',
        }}
      />
      <Tabs.Screen
        name="add-weight"
        options={{
          title: 'Registrar Peso',
          tabBarLabel: 'Peso',
          tabBarIcon: () => '⚖️',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: () => '👤',
        }}
      />
    </Tabs>
  );
}
TABS_FINAL_EOF
\`\`\`

---

## PASSO 7: Testar

Execute no terminal:
\`\`\`bash
npx expo start
\`\`\`

### Teste completo:

1. ✅ Dashboard mostra estatísticas
2. ✅ Gráfico de peso aparece (ou mensagem de vazio)
3. ✅ Lista de medicações ativas
4. ✅ Botões de ação rápida funcionam
5. ✅ Tab de perfil mostra dados do usuário
6. ✅ Pull-to-refresh atualiza dados

---

## VALIDAÇÃO

- [ ] Dashboard com gráficos funcionando
- [ ] Stats cards mostrando dados corretos
- [ ] Lista de medicações ativa
- [ ] Tela de perfil completa
- [ ] 4 tabs funcionando
- [ ] Pull-to-refresh ativo
- [ ] App compila sem erros

---

## RESULTADO ESPERADO

✅ Dashboard completo com analytics
✅ Gráfico de evolução de peso
✅ Cards de estatísticas
✅ Lista de medicações
✅ Tela de perfil
✅ 4 tabs navegáveis
✅ App completo e funcional! 🎉

---

## 🎊 PARABÉNS!

Seu app **Mounjaro Tracker** está completo com:
- ✅ Autenticação (Clerk)
- ✅ Database (Supabase)
- ✅ CRUD Operations
- ✅ Dashboard com gráficos
- ✅ Profile screen

**Próximos passos opcionais:**
- Notificações push
- Lembretes de medicação
- Exportar dados (PDF/CSV)
- Dark/Light theme toggle
