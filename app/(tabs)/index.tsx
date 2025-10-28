import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { useMedications } from '@/hooks/useMedications';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { useAchievements } from '@/hooks/useAchievements';
import { useSideEffects } from '@/hooks/useSideEffects';
import { useMedicationApplications } from '@/hooks/useMedicationApplications';
import { useTimeline } from '@/hooks/useTimeline';
import { useInsights } from '@/hooks/useInsights';
import { useStreaks } from '@/hooks/useStreaks';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { WeightChart } from '@/components/dashboard/WeightChart';
import { WeightHistory } from '@/components/dashboard/WeightHistory';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MedicationList } from '@/components/dashboard/MedicationList';
import { AchievementList } from '@/components/dashboard/AchievementList';
import { SideEffectsList } from '@/components/dashboard/SideEffectsList';
import { Timeline } from '@/components/dashboard/Timeline';
import { JourneyMilestones } from '@/components/dashboard/JourneyMilestones';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { NextApplicationCard } from '@/components/dashboard/NextApplicationCard';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { LevelCard } from '@/components/dashboard/LevelCard';
import { CommunityCard } from '@/components/dashboard/CommunityCard';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { generatePDFReport } from '@/lib/pdf-generator';

export default function DashboardScreen() {
  const { user: clerkUser } = useAuth();
  const { user: dbUser, loading: userLoading } = useUser();
  const { medications, loading: medsLoading, refetch: refetchMeds, updateMedication, deleteMedication } = useMedications();
  const { weightLogs, loading: weightsLoading, refetch: refetchWeights, updateWeightLog, deleteWeightLog } = useWeightLogs();
  const { achievements, loading: achievementsLoading, checkAndUnlockAchievements, refetch: refetchAchievements } = useAchievements();
  const { sideEffects, loading: sideEffectsLoading, refetch: refetchSideEffects, updateSideEffect, deleteSideEffect } = useSideEffects();
  const { applications, refetch: refetchApplications, updateApplication, deleteApplication } = useMedicationApplications();
  const { timeline, loading: timelineLoading } = useTimeline();
  const { insights, stats } = useInsights();
  const { streakData } = useStreaks();
  const { comparison } = useCommunityStats();
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Debug logs
  console.log('Dashboard - dbUser:', dbUser?.id);
  console.log('Dashboard - medications:', medications.length, medications);
  console.log('Dashboard - weightLogs:', weightLogs.length, weightLogs);
  console.log('Dashboard - loadings:', { userLoading, medsLoading, weightsLoading });

  async function handleEditMedication(medication: any) {
    // Navegar para a tela de edição (vamos criar isso)
    router.push({
      pathname: '/(tabs)/add-medication',
      params: { editId: medication.id }
    });
  }

  async function handleDeleteMedication(medicationId: string) {
    try {
      await deleteMedication(medicationId);
      Alert.alert('Sucesso!', 'Medicação excluída com sucesso');
    } catch (error: any) {
      console.error('Error deleting medication:', error);
      Alert.alert('Erro', 'Não foi possível excluir a medicação: ' + error.message);
    }
  }

  async function handleEditApplication(applicationId: string) {
    router.push({
      pathname: '/(tabs)/add-application',
      params: { editId: applicationId }
    });
  }

  async function handleDeleteApplication(applicationId: string) {
    try {
      await deleteApplication(applicationId);
      Alert.alert('Sucesso!', 'Aplicação excluída com sucesso');
    } catch (error: any) {
      console.error('Error deleting application:', error);
      Alert.alert('Erro', 'Não foi possível excluir a aplicação: ' + error.message);
    }
  }

  async function handleEditWeight(weightLogId: string) {
    router.push({
      pathname: '/(tabs)/add-weight',
      params: { editId: weightLogId }
    });
  }

  async function handleDeleteWeight(weightLogId: string) {
    try {
      await deleteWeightLog(weightLogId);
      Alert.alert('Sucesso!', 'Peso excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting weight log:', error);
      Alert.alert('Erro', 'Não foi possível excluir o peso: ' + error.message);
    }
  }

  async function handleEditSideEffect(sideEffect: any) {
    router.push({
      pathname: '/(tabs)/add-side-effect',
      params: { editId: sideEffect.id }
    });
  }

  async function handleDeleteSideEffect(sideEffectId: string) {
    try {
      await deleteSideEffect(sideEffectId);
      Alert.alert('Sucesso!', 'Efeito colateral excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting side effect:', error);
      Alert.alert('Erro', 'Não foi possível excluir o efeito colateral: ' + error.message);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refetchMeds(), refetchWeights(), refetchAchievements(), refetchSideEffects(), refetchApplications()]);
    setRefreshing(false);
  }

  async function handleGeneratePDF() {
    if (!dbUser) {
      Alert.alert('Erro', 'Dados do usuário não carregados');
      return;
    }

    try {
      setGeneratingPDF(true);

      const reportData = {
        userName: clerkUser?.fullName || clerkUser?.firstName || 'Usuário',
        userEmail: clerkUser?.primaryEmailAddress?.emailAddress || '',
        currentWeight: latestWeight,
        initialWeight: firstWeight,
        goalWeight: dbUser.goal_weight || 0,
        weightLost: parseFloat(weightDiff),
        journeyDays,
        totalLogs,
        totalApplications: applications.length,
        medications: medications.filter(m => m.active).map(m => ({
          name: {
            mounjaro: 'Mounjaro',
            ozempic: 'Ozempic',
            saxenda: 'Saxenda',
            wegovy: 'Wegovy',
            zepbound: 'Zepbound',
          }[m.type] || m.type,
          dosage: m.dosage,
          frequency: m.frequency,
          startDate: m.start_date,
        })),
        weightLogs,
        achievements: achievements.map(a => ({
          title: a.title,
          description: a.description,
          earnedAt: a.earned_at,
        })),
      };

      await generatePDFReport(reportData);
      
      Alert.alert('Sucesso! 📄', 'Relatório gerado com sucesso!');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório: ' + error.message);
    } finally {
      setGeneratingPDF(false);
    }
  }

  // Auto-refresh ao focar na tab
  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard focused - refreshing data...');
      refetchMeds();
      refetchWeights();
      refetchAchievements();
      refetchSideEffects();
      refetchApplications();
    }, [])
  );

  // Sistema automático de detecção de conquistas
  useEffect(() => {
    if (!dbUser || weightsLoading || medsLoading) return;

    const latestWeight = weightLogs[0]?.weight || 0;
    const initialWeight = dbUser.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;
    const goalWeight = dbUser.goal_weight || 0;
    const weightLost = initialWeight - latestWeight;
    const goalReached = goalWeight > 0 && latestWeight <= goalWeight;

    checkAndUnlockAchievements({
      weightLogs: weightLogs.length,
      medications: medications.length,
      applications: applications.length,
      weightLost,
      goalReached,
    });
  }, [weightLogs.length, medications.length, applications.length, dbUser?.initial_weight, dbUser?.goal_weight]);

  // Calcular estatísticas
  const latestWeight = weightLogs[0]?.weight || 0;
  // Usar initial_weight do usuário (do onboarding) ou o peso mais antigo registrado
  const firstWeight = dbUser?.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;
  const weightDiff = latestWeight && firstWeight ? (firstWeight - latestWeight).toFixed(1) : '0';
  const activeMedications = medications.filter(m => m.active).length;
  const totalLogs = weightLogs.length;
  
  // Calcular dias de jornada baseado na data do primeiro registro OU data de criação do usuário
  const firstLogDate = weightLogs[weightLogs.length - 1]?.date;
  const journeyDays = firstLogDate 
    ? Math.ceil((Date.now() - new Date(firstLogDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Mostrar loading enquanto carrega
  if (userLoading || medsLoading || weightsLoading || achievementsLoading || sideEffectsLoading || timelineLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
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
        <Text style={styles.greeting}>Olá, {dbUser?.name || clerkUser?.firstName || 'Usuário'}! 👋</Text>
        <Text style={styles.subtitle}>Veja seu progresso</Text>
      </View>

      {/* Card Gigante: Próxima Aplicação */}
      {stats?.daysUntilNextApplication !== null && stats?.daysUntilNextApplication !== undefined && (
        <View style={styles.nextAppContainer}>
          <NextApplicationCard
            daysUntil={stats.daysUntilNextApplication}
            medicationName={medications.find(m => m.active)?.type.toUpperCase() || ''}
            dosage={medications.find(m => m.active)?.dosage || 0}
          />
        </View>
      )}

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
          icon="💉"
          label="Aplicações"
          value={applications.length.toString()}
          subtitle="registradas"
        />
        <StatsCard
          icon="🎯"
          label="Dias"
          value={journeyDays.toString()}
          subtitle="de jornada"
        />
      </View>

      {/* Weight Chart (Sempre visível - Peso e Meta) */}
      {weightLogs.length > 0 && (
        <View style={styles.chartContainer}>
          <WeightChart 
            data={weightLogs} 
            goalWeight={dbUser?.goal_weight}
            initialWeight={dbUser?.initial_weight}
          />
        </View>
      )}

      {/* Medications List (Sempre visível) */}
      <View style={styles.listContainer}>
        <MedicationList 
          medications={medications}
          onEdit={handleEditMedication}
          onDelete={handleDeleteMedication}
        />
      </View>

      {/* Histórico de Peso - Expansível (logo após Medicação) */}
      {weightLogs.length > 0 && (
        <View style={styles.listContainer}>
          <CollapsibleSection title="Histórico de Peso" icon="⚖️">
            <WeightHistory data={weightLogs} />
          </CollapsibleSection>
        </View>
      )}

      {/* Insights - Expansível */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <CollapsibleSection title="Insights" icon="💡">
            <View style={styles.insightsContainer}>
              {insights.slice(0, 3).map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          </CollapsibleSection>
        </View>
      )}

      {/* Seu Progresso (Level/XP/Streaks) - Expansível */}
      {streakData && (
        <View style={styles.section}>
          <CollapsibleSection title="Seu Progresso" icon="🏆">
            <LevelCard
              level={streakData.level}
              currentXP={streakData.experiencePoints}
              xpToNextLevel={streakData.experienceToNextLevel}
            />
            <View style={styles.streaksContainer}>
              <StreakCard
                currentStreak={streakData.currentWeightStreak}
                longestStreak={streakData.longestWeightStreak}
                type="weight"
              />
            </View>
          </CollapsibleSection>
        </View>
      )}

      {/* Marcos da Jornada - Expansível */}
      <View style={styles.section}>
        <CollapsibleSection title="Marcos da Jornada" icon="🎯">
          <JourneyMilestones 
            applications={applications}
            currentWeight={latestWeight}
            initialWeight={firstWeight}
          />
        </CollapsibleSection>
      </View>

      {/* Linha do Tempo - Expansível */}
      <View style={styles.section}>
        <CollapsibleSection title="Linha do Tempo" icon="📅">
          <Timeline 
            events={timeline} 
            maxVisible={10}
            onEditApplication={handleEditApplication}
            onDeleteApplication={handleDeleteApplication}
            onEditWeight={handleEditWeight}
            onDeleteWeight={handleDeleteWeight}
          />
        </CollapsibleSection>
      </View>

      {/* Suas Conquistas - Expansível */}
      <View style={styles.listContainer}>
        <CollapsibleSection 
          title="Suas Conquistas" 
          icon="🏆"
          defaultExpanded={false}
        >
          <AchievementList 
            achievements={achievements} 
            loading={achievementsLoading}
            maxVisible={3}
          />
        </CollapsibleSection>
      </View>

      {/* Efeitos Colaterais - Expansível */}
      <View style={styles.listContainer}>
        <CollapsibleSection title="Efeitos Colaterais" icon="⚠️">
          <SideEffectsList 
            sideEffects={sideEffects} 
            maxVisible={3}
            onEdit={handleEditSideEffect}
            onDelete={handleDeleteSideEffect}
          />
        </CollapsibleSection>
      </View>

      {/* Comunidade - Expansível */}
      {comparison && (
        <View style={styles.section}>
          <CollapsibleSection title="Comunidade" icon="🌍">
            <CommunityCard {...comparison} />
          </CollapsibleSection>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Text style={styles.actionsTitle}>Ações Rápidas</Text>
        <Button
          label="💉 Registrar Aplicação"
          onPress={() => router.push('/(tabs)/add-application')}
          variant="primary"
        />
        <Button
          label="⚖️ Registrar Peso"
          onPress={() => router.push('/(tabs)/add-weight')}
          variant="secondary"
        />
        <Button
          label="⚠️ Registrar Efeito Colateral"
          onPress={() => router.push('/(tabs)/add-side-effect')}
          variant="secondary"
        />
        <Button
          label="📄 Gerar Relatório PDF"
          onPress={handleGeneratePDF}
          variant="outline"
          loading={generatingPDF}
          disabled={generatingPDF || weightLogs.length === 0}
        />
        {weightLogs.length === 0 && (
          <Text style={styles.pdfHint}>
            Adicione pelo menos um registro de peso para gerar o relatório
          </Text>
        )}
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
    fontSize: 16,
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
  chartContainer: {
    paddingHorizontal: 24,
  },
  listContainer: {
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
  pdfHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
  },
  nextAppContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  insightsContainer: {
    marginTop: 12,
  },
  streaksContainer: {
    marginTop: 12,
  },
});
