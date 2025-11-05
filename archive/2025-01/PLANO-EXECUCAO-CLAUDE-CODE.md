# 🚀 PLANO DE EXECUÇÃO - MOUNJARO TRACKER → SHOTSY CLONE

**Para:** Claude Code  
**Modo:** Desenvolvimento Task-by-Task  
**Usuário:** Vibecoder (Idealizador, não desenvolvedor)  
**Data:** 31 de Outubro de 2025

---

## 📋 COMO USAR ESTE DOCUMENTO

1. **Abra o Claude Code** no terminal do projeto
2. **Copie e cole** o prompt da task atual
3. **Aguarde** o Claude Code completar
4. **Valide** usando o checklist da task
5. **Marque como concluído** ✅
6. **Passe para a próxima task**

**⚠️ IMPORTANTE:** Siga a ordem! Cada task depende da anterior.

---

## 🎯 RESUMO DO PROJETO

**Objetivo:** Transformar Mounjaro Tracker em clone EXATO do Shotsy (versão PT-BR)  
**Status Atual:** 65% completo  
**Faltam:** 35-40 horas de desenvolvimento  
**Total de Fases:** 4  
**Total de Tasks:** 24

---

## 📊 ESTRUTURA DAS FASES

```
FASE 1: CORE FEATURES (10 tasks) - 25-30h ⚡ CRÍTICO
FASE 2: UX/UI REFINEMENT (6 tasks) - 15-18h 🎨 ALTA
FASE 3: FEATURES AVANÇADAS (5 tasks) - 20-25h 🚀 MÉDIA
FASE 4: INTEGRAÇÕES (3 tasks) - 12-15h 🔌 BAIXA
```

---

# FASE 1: CORE FEATURES (CRÍTICO) ⚡

**Objetivo:** Implementar funcionalidades essenciais que faltam  
**Duração:** 25-30 horas  
**Prioridade:** 🔴 MÁXIMA

---

## 📝 TASK 1.1: Integrar Dados Reais no Dashboard

**Tempo Estimado:** 1-2 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Substituir dados mockados por dados reais do Supabase no Dashboard

## CONTEXTO
O arquivo `/app/(tabs)/dashboard.tsx` atualmente usa dados mockados (mockData).
Preciso integrar os hooks do Supabase que já existem:
- useApplications() - para injeções
- useWeights() - para pesos  
- useProfile() - para dados do usuário

## OBJETIVO
Fazer o Dashboard carregar dados REAIS do banco de dados Supabase.

## TAREFAS

1. Importar os hooks necessários:
   - useApplications de @/hooks/useApplications
   - useWeights de @/hooks/useWeights
   - useProfile de @/hooks/useProfile

2. Substituir mockData por:
   - applications do hook useApplications
   - weights do hook useWeights
   - profile do hook useProfile

3. Calcular as métricas reais:
   - totalShots = applications.length
   - lastShot = applications[0] (mais recente)
   - lastDose = lastShot?.dosage
   - nextShotDate = calcular baseado na última injeção + frequência
   - estimatedLevel = usar função básica (será melhorada depois)

4. Adicionar loading states:
   - Mostrar ShotsySkeleton enquanto carrega
   - Usar loading dos hooks

5. Tratar empty states:
   - Se applications.length === 0, mostrar mensagem apropriada

## VALIDAÇÕES
- [ ] Dashboard carrega sem erros
- [ ] Dados reais aparecem (não mais mockados)
- [ ] Loading state funciona
- [ ] Empty state aparece quando sem dados
- [ ] NextShotWidget mostra data correta
- [ ] ShotHistoryCards mostram números reais

## ARQUIVOS A MODIFICAR
- /app/(tabs)/dashboard.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Abrir app e ver Dashboard
- [ ] Verificar se números mostrados são reais (não 1, 2.5, etc)
- [ ] Adicionar injeção e ver Dashboard atualizar
- [ ] Loading aparece ao carregar
- [ ] Sem erros no console

---

## 📝 TASK 1.2: Integrar Dados Reais no Results

**Tempo Estimado:** 1-2 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Substituir dados mockados por dados reais do Supabase no Results

## CONTEXTO
O arquivo `/app/(tabs)/results.tsx` usa MOCK_WEIGHT_DATA e MOCK_BMI_DATA.
Preciso integrar os hooks reais.

## OBJETIVO
Results deve mostrar gráficos com dados reais do banco.

## TAREFAS

1. Importar hooks:
   - useWeights de @/hooks/useWeights
   - useProfile de @/hooks/useProfile

2. Substituir MOCK_WEIGHT_DATA:
   - Usar weights do hook useWeights
   - Mapear para formato do gráfico: { date, weight }

3. Calcular IMC real:
   - Usar profile.height do banco
   - Calcular IMC para cada peso: weight / (height * height)
   - Gerar MOCK_BMI_DATA dinamicamente

4. Calcular métricas reais:
   - startWeight = weights[weights.length - 1]?.weight || 0
   - currentWeight = weights[0]?.weight || 0
   - targetWeight = profile.target_weight || 75
   - Recalcular todas as outras métricas

5. Adicionar loading states e empty states

## VALIDAÇÕES
- [ ] Results carrega sem erros
- [ ] Gráficos mostram dados reais
- [ ] Métricas calculadas corretamente
- [ ] IMC usa altura real do perfil
- [ ] Loading state funciona

## ARQUIVOS A MODIFICAR
- /app/(tabs)/results.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Abrir Results e ver dados reais
- [ ] Gráfico de peso mostra pesos registrados
- [ ] IMC calculado com altura do perfil
- [ ] Adicionar peso e ver gráfico atualizar

---

## 📝 TASK 1.3: Integrar Dados Reais no Calendar

**Tempo Estimado:** 1-2 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Substituir dados mockados por dados reais no Calendar

## CONTEXTO
O arquivo `/app/(tabs)/calendar.tsx` usa MOCK_EVENTS.
Os componentes MonthCalendar e DayEventsList precisam de dados reais.

## OBJETIVO
Calendário deve mostrar eventos reais do banco.

## TAREFAS

1. Importar hooks:
   - useApplications de @/hooks/useApplications
   - useWeights de @/hooks/useWeights

2. Criar função para transformar em eventos:
```typescript
const events = [
  ...applications.map(app => ({
    id: app.id,
    type: 'shot' as const,
    date: app.date,
    time: app.date,
    dosage: app.dosage,
    medication: 'Mounjaro',
  })),
  ...weights.map(weight => ({
    id: weight.id,
    type: 'weight' as const,
    date: weight.date,
    time: weight.date,
    weight: weight.weight,
    difference: calculateDifference(weight, weights),
  })),
];
```

3. Criar função calculateDifference:
   - Comparar peso atual com anterior
   - Retornar diferença (negativa = perda, positiva = ganho)

4. Passar eventos reais para componentes:
   - MonthCalendar recebe events
   - DayEventsList recebe events filtrados por data

5. Adicionar loading e empty states

## VALIDAÇÕES
- [ ] Calendário carrega sem erros
- [ ] Marcadores aparecem nos dias corretos
- [ ] Lista de eventos mostra dados reais
- [ ] Diferença de peso calcula corretamente

## ARQUIVOS A MODIFICAR
- /app/(tabs)/calendar.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Abrir Calendar e ver eventos reais
- [ ] Marcadores nos dias com injeções/pesos
- [ ] Tap em dia mostra eventos corretos
- [ ] Diferença de peso mostra seta correta

---

## 📝 TASK 1.4: Salvar Dados Reais no Add Application

**Tempo Estimado:** 2-3 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Implementar salvamento real no Supabase em Add Application

## CONTEXTO
O arquivo `/app/(tabs)/add-application.tsx` tem TODOs e não salva no banco.
O hook useApplications já existe com createApplication().

## OBJETIVO
Salvar injeções no Supabase ao clicar em "Salvar".

## TAREFAS

1. Importar hook:
   - useApplications de @/hooks/useApplications

2. Implementar handleSave:
```typescript
const { createApplication, updateApplication } = useApplications();

const handleSave = async () => {
  if (!canSave) return;

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  try {
    if (isEditMode) {
      await updateApplication(params.editId as string, {
        date: data.date,
        dosage: data.dosage!,
        injection_sites: data.injectionSites,
        side_effects: data.sideEffects,
        notes: data.notes,
      });
    } else {
      await createApplication({
        date: data.date,
        dosage: data.dosage!,
        injection_sites: data.injectionSites,
        side_effects: data.sideEffects,
        notes: data.notes,
      });
    }

    Alert.alert(
      'Sucesso',
      isEditMode ? 'Aplicação atualizada!' : 'Aplicação adicionada!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  } catch (error) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert('Erro', 'Não foi possível salvar a aplicação');
    console.error(error);
  }
};
```

3. Implementar carregamento no modo edição:
```typescript
useEffect(() => {
  if (isEditMode && params.editId) {
    // Buscar aplicação do banco
    const loadApplication = async () => {
      const { applications } = useApplications();
      const app = applications.find(a => a.id === params.editId);
      if (app) {
        setData({
          date: app.date,
          dosage: app.dosage,
          injectionSites: app.injection_sites,
          sideEffects: app.side_effects,
          notes: app.notes || '',
        });
      }
    };
    loadApplication();
  }
}, [isEditMode, params.editId]);
```

4. Implementar handleDelete:
```typescript
const { deleteApplication } = useApplications();

const handleDelete = () => {
  Alert.alert(
    'Deletar Aplicação',
    'Tem certeza?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deleteApplication(params.editId as string);
          router.back();
        },
      },
    ]
  );
};
```

## VALIDAÇÕES
- [ ] Salvar injeção adiciona no banco
- [ ] Dashboard atualiza após salvar
- [ ] Modo edição carrega dados corretos
- [ ] Deletar remove do banco
- [ ] Erros são tratados com alerts

## ARQUIVOS A MODIFICAR
- /app/(tabs)/add-application.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Adicionar injeção e ver aparecer no Dashboard
- [ ] Editar injeção existente
- [ ] Deletar injeção
- [ ] Ver dados persistindo após fechar app

---

## 📝 TASK 1.5: Criar Seção "Hoje" no Dashboard

**Tempo Estimado:** 3-4 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Implementar Seção "Hoje" no Dashboard

## CONTEXTO
O Dashboard precisa da seção "Hoje" com 5 cards rastreáveis:
- Peso do dia
- Calorias
- Proteína  
- Efeitos colaterais
- Notas do dia

Referência: SHOTSY-FUNCIONALIDADES-COMPLETO.md (seção Dashboard)

## OBJETIVO
Criar componente TodaySection com 5 cards interativos.

## TAREFAS

1. Criar arquivo `/components/dashboard/TodaySection.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { router } from 'expo-router';

interface TodaySectionProps {
  todayWeight?: number;
  todayCalories?: number;
  todayProtein?: number;
  todaySideEffects?: string[];
  todayNotes?: string;
}

export function TodaySection({
  todayWeight,
  todayCalories,
  todayProtein,
  todaySideEffects,
  todayNotes,
}: TodaySectionProps) {
  const colors = useShotsyColors();

  const TodayCard = ({ 
    icon, 
    title, 
    value, 
    onPress 
  }: { 
    icon: string; 
    title: string; 
    value?: string | number; 
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <ShotsyCard style={styles.card}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
        {value ? (
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {value}
          </Text>
        ) : (
          <Text style={[styles.cardEmpty, { color: colors.textSecondary }]}>
            Toque para adicionar
          </Text>
        )}
      </ShotsyCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Hoje</Text>
      
      <View style={styles.grid}>
        <TodayCard
          icon="⚖️"
          title="Peso"
          value={todayWeight ? `${todayWeight} kg` : undefined}
          onPress={() => router.push('/(tabs)/add-weight')}
        />
        
        <TodayCard
          icon="🍖"
          title="Calorias"
          value={todayCalories ? `${todayCalories} kcal` : undefined}
          onPress={() => {
            // TODO: Tela de calorias
            Alert.alert('Em breve', 'Funcionalidade será implementada');
          }}
        />
        
        <TodayCard
          icon="🥩"
          title="Proteína"
          value={todayProtein ? `${todayProtein}g` : undefined}
          onPress={() => {
            // TODO: Tela de proteína
            Alert.alert('Em breve', 'Funcionalidade será implementada');
          }}
        />
        
        <TodayCard
          icon="😷"
          title="Efeitos Colaterais"
          value={todaySideEffects?.length ? `${todaySideEffects.length}` : undefined}
          onPress={() => router.push('/(tabs)/add-side-effect')}
        />
      </View>

      {/* Card de Notas (full width) */}
      <TouchableOpacity 
        onPress={() => {
          // TODO: Modal de notas
          Alert.alert('Em breve', 'Funcionalidade será implementada');
        }}
      >
        <ShotsyCard style={styles.notesCard}>
          <Text style={styles.icon}>📝</Text>
          <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
            Notas do Dia
          </Text>
          {todayNotes ? (
            <Text style={[styles.notesText, { color: colors.text }]}>
              {todayNotes}
            </Text>
          ) : (
            <Text style={[styles.cardEmpty, { color: colors.textSecondary }]}>
              Toque para adicionar
            </Text>
          )}
        </ShotsyCard>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  cardContainer: {
    width: '48%',
  },
  card: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardEmpty: {
    fontSize: 12,
    textAlign: 'center',
  },
  notesCard: {
    padding: 16,
    minHeight: 100,
  },
  notesText: {
    fontSize: 14,
    marginTop: 8,
  },
});
```

2. Integrar no Dashboard:
   - Importar TodaySection
   - Buscar dados do dia (peso, efeitos)
   - Adicionar após NextShotWidget

3. Criar função para buscar dados de hoje:
```typescript
const getTodayData = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayWeight = weights.find(w => {
    const wDate = new Date(w.date);
    wDate.setHours(0, 0, 0, 0);
    return wDate.getTime() === today.getTime();
  })?.weight;

  // TODO: buscar calorias, proteína quando implementado

  return {
    todayWeight,
    todayCalories: undefined,
    todayProtein: undefined,
    todaySideEffects: [],
    todayNotes: undefined,
  };
};
```

## VALIDAÇÕES
- [ ] Seção "Hoje" aparece no Dashboard
- [ ] 5 cards renderizam
- [ ] Tap em Peso abre add-weight
- [ ] Dados de hoje aparecem quando existem
- [ ] Empty state "Toque para adicionar" aparece

## ARQUIVOS A CRIAR
- /components/dashboard/TodaySection.tsx

## ARQUIVOS A MODIFICAR  
- /app/(tabs)/dashboard.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Ver seção "Hoje" no Dashboard
- [ ] Ver 4 cards pequenos + 1 card grande
- [ ] Tap em Peso abre tela de peso
- [ ] Adicionar peso hoje e ver aparecer no card

---

## 📝 TASK 1.6: Criar Preview de Resultados no Dashboard

**Tempo Estimado:** 2-3 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Implementar Preview de Resultados no Dashboard

## CONTEXTO
Dashboard precisa mostrar prévia dos resultados com 6 metric cards:
- Mudança Total
- IMC Atual
- Peso
- Por cento
- Média semanal
- Para a meta

## OBJETIVO
Criar componente ResultsPreview que resume progresso.

## TAREFAS

1. Criar arquivo `/components/dashboard/ResultsPreview.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { router } from 'expo-router';

interface Metrics {
  totalChange: number;
  currentBMI: number;
  currentWeight: number;
  percentProgress: number;
  weeklyAverage: number;
  toGoal: number;
}

interface ResultsPreviewProps {
  metrics: Metrics;
}

export function ResultsPreview({ metrics }: ResultsPreviewProps) {
  const colors = useShotsyColors();

  const MetricCard = ({ 
    label, 
    value, 
    subtitle 
  }: { 
    label: string; 
    value: string; 
    subtitle?: string;
  }) => (
    <View style={styles.metricCard}>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Resultados</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/results')}>
          <Text style={[styles.link, { color: colors.primary }]}>
            Ver gráfico ›
          </Text>
        </TouchableOpacity>
      </View>

      <ShotsyCard style={styles.card}>
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Mudança Total"
            value={`${metrics.totalChange >= 0 ? '+' : ''}${metrics.totalChange.toFixed(1)} kg`}
            subtitle={`${Math.abs(metrics.totalChange / metrics.currentWeight * 100).toFixed(1)}%`}
          />
          <MetricCard
            label="IMC Atual"
            value={metrics.currentBMI.toFixed(1)}
            subtitle={metrics.currentBMI < 25 ? 'Normal' : 'Sobrepeso'}
          />
          <MetricCard
            label="Peso"
            value={`${metrics.currentWeight} kg`}
          />
          <MetricCard
            label="Por cento"
            value={`${metrics.percentProgress.toFixed(0)}%`}
            subtitle="até a meta"
          />
          <MetricCard
            label="Média Semanal"
            value={`${metrics.weeklyAverage.toFixed(1)} kg`}
            subtitle="por semana"
          />
          <MetricCard
            label="Para a Meta"
            value={`${metrics.toGoal.toFixed(1)} kg`}
            subtitle="restantes"
          />
        </View>
      </ShotsyCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    width: '30%',
    minWidth: 90,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 11,
  },
});
```

2. Integrar no Dashboard:
   - Importar ResultsPreview
   - Calcular metrics baseado em weights e profile
   - Adicionar após TodaySection

3. Criar função calculateMetrics:
```typescript
const calculateMetrics = (): Metrics => {
  if (weights.length === 0) {
    return {
      totalChange: 0,
      currentBMI: 0,
      currentWeight: 0,
      percentProgress: 0,
      weeklyAverage: 0,
      toGoal: 0,
    };
  }

  const currentWeight = weights[0].weight;
  const startWeight = weights[weights.length - 1].weight;
  const targetWeight = profile?.target_weight || 75;
  const height = profile?.height || 1.75;

  const totalChange = currentWeight - startWeight;
  const currentBMI = currentWeight / (height * height);
  const totalToLose = startWeight - targetWeight;
  const lost = startWeight - currentWeight;
  const percentProgress = (lost / totalToLose) * 100;
  const toGoal = currentWeight - targetWeight;
  
  // Calcular média semanal
  const weeks = Math.max(1, Math.floor(weights.length / 7));
  const weeklyAverage = Math.abs(totalChange) / weeks;

  return {
    totalChange,
    currentBMI,
    currentWeight,
    percentProgress,
    weeklyAverage,
    toGoal,
  };
};
```

## VALIDAÇÕES
- [ ] Preview aparece no Dashboard
- [ ] 6 metric cards renderizam
- [ ] Valores calculados corretamente
- [ ] Link "Ver gráfico" navega para Results
- [ ] Métricas atualizam com novos pesos

## ARQUIVOS A CRIAR
- /components/dashboard/ResultsPreview.tsx

## ARQUIVOS A MODIFICAR
- /app/(tabs)/dashboard.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Ver preview Resultados no Dashboard
- [ ] Ver 6 cards de métricas
- [ ] Valores fazem sentido
- [ ] Tap em "Ver gráfico" abre Results

---

## 📝 TASK 1.7: Implementar Cálculo Básico de Níveis Estimados

**Tempo Estimado:** 4-5 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Criar função básica de cálculo de níveis estimados

## CONTEXTO
O Shotsy calcula níveis estimados de medicação no corpo baseado em farmacocinética.
Esta é uma versão SIMPLIFICADA inicial. Versão completa virá depois.

Referência: Meia-vida Mounjaro ≈ 5 dias (120 horas)

## OBJETIVO
Criar função que calcula níveis estimados baseado em:
- Histórico de injeções
- Meia-vida do medicamento
- Data atual

## TAREFAS

1. Criar arquivo `/lib/pharmacokinetics.ts`:

```typescript
/**
 * Cálculo BÁSICO de níveis estimados de medicação GLP-1
 * Baseado em modelo de eliminação de primeira ordem
 * 
 * Referências:
 * - Tirzepatide (Mounjaro): meia-vida ≈ 5 dias (120h)
 * - Semaglutide (Ozempic): meia-vida ≈ 7 dias (168h)
 */

export interface Application {
  date: Date;
  dosage: number;
}

export interface EstimatedLevel {
  date: Date;
  level: number; // mg no corpo
  dosage?: number; // mg da dose (se foi dia de injeção)
}

// Meia-vida por medicamento (em horas)
const HALF_LIFE: Record<string, number> = {
  mounjaro: 120, // 5 dias
  ozempic: 168, // 7 dias
  wegovy: 168, // 7 dias
  zepbound: 120, // 5 dias
};

/**
 * Calcula nível de medicação no corpo em uma data específica
 * baseado em uma única aplicação
 */
function calculateLevelFromApplication(
  application: Application,
  targetDate: Date,
  halfLife: number
): number {
  const hoursSinceApplication = 
    (targetDate.getTime() - application.date.getTime()) / (1000 * 60 * 60);

  // Se a data alvo é antes da aplicação, nível = 0
  if (hoursSinceApplication < 0) return 0;

  // Fórmula de decaimento exponencial: C(t) = C0 * (0.5)^(t/t½)
  const level = application.dosage * Math.pow(0.5, hoursSinceApplication / halfLife);

  return level;
}

/**
 * Calcula níveis estimados ao longo do tempo
 * considerando múltiplas aplicações
 */
export function calculateEstimatedLevels(
  applications: Application[],
  medication: string = 'mounjaro',
  daysAhead: number = 30
): EstimatedLevel[] {
  if (applications.length === 0) return [];

  const halfLife = HALF_LIFE[medication.toLowerCase()] || 120;
  const levels: EstimatedLevel[] = [];

  // Ordenar aplicações por data
  const sortedApps = [...applications].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Data inicial = primeira aplicação
  const startDate = new Date(sortedApps[0].date);
  startDate.setHours(0, 0, 0, 0);

  // Data final = hoje + daysAhead
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  // Calcular nível para cada dia
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    let totalLevel = 0;

    // Somar contribuição de cada aplicação
    sortedApps.forEach(app => {
      totalLevel += calculateLevelFromApplication(app, currentDate, halfLife);
    });

    // Verificar se houve aplicação neste dia
    const applicationOnThisDay = sortedApps.find(app => {
      const appDate = new Date(app.date);
      appDate.setHours(0, 0, 0, 0);
      return appDate.getTime() === currentDate.getTime();
    });

    levels.push({
      date: new Date(currentDate),
      level: totalLevel,
      dosage: applicationOnThisDay?.dosage,
    });

    // Próximo dia
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return levels;
}

/**
 * Calcula nível atual estimado
 */
export function getCurrentEstimatedLevel(
  applications: Application[],
  medication: string = 'mounjaro'
): number {
  if (applications.length === 0) return 0;

  const now = new Date();
  const levels = calculateEstimatedLevels(applications, medication, 0);
  
  return levels[levels.length - 1]?.level || 0;
}

/**
 * Calcula próxima injeção recomendada
 * baseado na frequência do usuário
 */
export function calculateNextShotDate(
  lastApplication: Date,
  frequency: 'weekly' | 'biweekly' = 'weekly'
): Date {
  const nextDate = new Date(lastApplication);
  const daysToAdd = frequency === 'weekly' ? 7 : 14;
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
}
```

2. Criar testes básicos `/lib/__tests__/pharmacokinetics.test.ts`:

```typescript
import {
  calculateEstimatedLevels,
  getCurrentEstimatedLevel,
  calculateNextShotDate,
} from '../pharmacokinetics';

describe('Pharmacokinetics', () => {
  test('calcula níveis com uma aplicação', () => {
    const applications = [
      { date: new Date('2025-10-01'), dosage: 10 },
    ];

    const levels = calculateEstimatedLevels(applications, 'mounjaro', 10);
    
    expect(levels.length).toBeGreaterThan(0);
    expect(levels[0].level).toBeCloseTo(10, 1);
    expect(levels[5].level).toBeCloseTo(5, 1); // Após 5 dias (meia-vida)
  });

  test('calcula nível atual', () => {
    const applications = [
      { date: new Date(), dosage: 10 },
    ];

    const currentLevel = getCurrentEstimatedLevel(applications);
    
    expect(currentLevel).toBeCloseTo(10, 0);
  });

  test('calcula próxima injeção', () => {
    const lastDate = new Date('2025-10-01');
    const nextWeekly = calculateNextShotDate(lastDate, 'weekly');
    const nextBiweekly = calculateNextShotDate(lastDate, 'biweekly');

    expect(nextWeekly.getDate()).toBe(8); // 7 dias depois
    expect(nextBiweekly.getDate()).toBe(15); // 14 dias depois
  });
});
```

3. Integrar no Dashboard:
   - Importar calculateEstimatedLevels
   - Usar no EstimatedLevelsChart
   - Mostrar nível atual no Dashboard

## VALIDAÇÕES
- [ ] Função calcula sem erros
- [ ] Níveis fazem sentido (decaem com tempo)
- [ ] Testes passam
- [ ] Dashboard mostra nível estimado atual

## ARQUIVOS A CRIAR
- /lib/pharmacokinetics.ts
- /lib/__tests__/pharmacokinetics.test.ts

## ARQUIVOS A MODIFICAR
- /app/(tabs)/dashboard.tsx
- /components/dashboard/EstimatedLevelsChart.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Rodar testes: `npm test pharmacokinetics`
- [ ] Ver nível estimado no Dashboard
- [ ] Adicionar injeção e ver nível subir
- [ ] Valores fazem sentido (não negativos, decaem)

---

## 📝 TASK 1.8: Melhorar EstimatedLevelsChart

**Tempo Estimado:** 3-4 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Melhorar gráfico de níveis estimados

## CONTEXTO
O componente EstimatedLevelsChart existe mas precisa:
- Usar função de farmacocinética
- Mostrar linha tracejada (projeção futura)
- Tabs de período (Semana, Mês, 90 dias, Tudo)
- Botão "Jump to Today"
- Marcadores de dosagem

## OBJETIVO
Gráfico completo de níveis como no Shotsy.

## TAREFAS

1. Atualizar `/components/dashboard/EstimatedLevelsChart.tsx`:

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { LineChart } from 'react-native-chart-kit';
import { calculateEstimatedLevels } from '@/lib/pharmacokinetics';
import { useApplications } from '@/hooks/useApplications';

type Period = 'week' | 'month' | '90days' | 'all';

const PERIOD_TABS: { key: Period; label: string; days: number }[] = [
  { key: 'week', label: 'Semana', days: 7 },
  { key: 'month', label: 'Mês', days: 30 },
  { key: '90days', label: '90 dias', days: 90 },
  { key: 'all', label: 'Tudo', days: 365 },
];

export function EstimatedLevelsChart() {
  const colors = useShotsyColors();
  const { applications } = useApplications();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  // Calcular níveis estimados
  const levels = useMemo(() => {
    const period = PERIOD_TABS.find(p => p.key === selectedPeriod);
    return calculateEstimatedLevels(
      applications.map(app => ({ date: app.date, dosage: app.dosage })),
      'mounjaro',
      period?.days || 30
    );
  }, [applications, selectedPeriod]);

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    if (levels.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    // Filtrar para não ter muitos pontos
    const step = Math.max(1, Math.floor(levels.length / 30));
    const filteredLevels = levels.filter((_, index) => index % step === 0);

    return {
      labels: filteredLevels.map(l => 
        l.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
      ),
      datasets: [
        {
          data: filteredLevels.map(l => l.level),
          strokeWidth: 2,
        },
      ],
    };
  }, [levels]);

  // Encontrar nível atual
  const currentLevel = levels[levels.length - 1]?.level || 0;

  const handleJumpToToday = () => {
    // TODO: Scroll para hoje no gráfico
  };

  if (applications.length === 0) {
    return null; // Sem dados para mostrar
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Níveis Estimados de Medicação
        </Text>
        <TouchableOpacity 
          style={[styles.todayButton, { backgroundColor: colors.primary }]}
          onPress={handleJumpToToday}
        >
          <Text style={styles.todayButtonText}>Jump to Today</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs de período */}
      <View style={styles.tabs}>
        {PERIOD_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedPeriod === tab.key && {
                backgroundColor: colors.primary + '20',
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedPeriod(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: selectedPeriod === tab.key ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nível atual destacado */}
      <ShotsyCard style={styles.currentLevelCard}>
        <Text style={[styles.currentLevelLabel, { color: colors.textSecondary }]}>
          Nível Atual Estimado
        </Text>
        <Text style={[styles.currentLevelValue, { color: colors.primary }]}>
          {currentLevel.toFixed(2)} mg
        </Text>
      </ShotsyCard>

      {/* Gráfico */}
      <ShotsyCard style={styles.chartCard}>
        {chartData.datasets[0].data.length > 0 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 1,
              color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16),
              labelColor: (opacity = 1) => colors.textSecondary + Math.round(opacity * 255).toString(16),
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={[styles.emptyChart, { color: colors.textSecondary }]}>
            Adicione injeções para ver o gráfico
          </Text>
        )}
      </ShotsyCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentLevelCard: {
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  currentLevelLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  currentLevelValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  chartCard: {
    padding: 16,
  },
  chart: {
    borderRadius: 16,
  },
  emptyChart: {
    textAlign: 'center',
    paddingVertical: 40,
  },
});
```

2. Instalar dependência (se necessário):
```bash
npm install react-native-chart-kit
```

## VALIDAÇÕES
- [ ] Gráfico renderiza sem erros
- [ ] Tabs de período funcionam
- [ ] Nível atual aparece destacado
- [ ] Linha do gráfico mostra decaimento
- [ ] Botão "Jump to Today" existe

## ARQUIVOS A MODIFICAR
- /components/dashboard/EstimatedLevelsChart.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Ver gráfico completo no Dashboard
- [ ] Mudar período e ver gráfico atualizar
- [ ] Adicionar injeção e ver pico no gráfico
- [ ] Linha decai com o tempo

---

## 📝 TASK 1.9: Melhorar NextShotWidget Estados

**Tempo Estimado:** 2-3 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Implementar todos os estados dinâmicos do NextShotWidget

## CONTEXTO
NextShotWidget precisa de 4 estados diferentes baseado nos dados:
1. "Bem-vindo! Adicione sua primeira injeção" (0 injeções)
2. "It's shot day!" (hoje é dia de injeção)
3. "You did it! 🎉" (injeção tomada hoje)
4. "X dias até a próxima injeção" (contagem)

Referência: SHOTSY-FUNCIONALIDADES-COMPLETO.md

## OBJETIVO
Widget dinâmico que responde ao estado real do usuário.

## TAREFAS

1. Atualizar `/components/dashboard/NextShotWidget.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { ShotsyCircularProgress } from '@/components/ui/shotsy-circular-progress';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { router } from 'expo-router';
import { calculateNextShotDate } from '@/lib/pharmacokinetics';

interface NextShotWidgetProps {
  totalShots: number;
  lastShotDate?: Date;
  frequency?: 'weekly' | 'biweekly';
}

export function NextShotWidget({
  totalShots,
  lastShotDate,
  frequency = 'weekly',
}: NextShotWidgetProps) {
  const colors = useShotsyColors();

  // Calcular estado do widget
  const getWidgetState = () => {
    // Estado 1: Sem injeções
    if (totalShots === 0 || !lastShotDate) {
      return {
        title: 'Bem-vindo!',
        subtitle: 'Adicione sua primeira\ninjeção para começar.',
        buttonText: 'Adicionar Injeção',
        progress: 0,
        emoji: '💉',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastShot = new Date(lastShotDate);
    lastShot.setHours(0, 0, 0, 0);

    // Estado 2: Injeção tomada hoje
    if (lastShot.getTime() === today.getTime()) {
      return {
        title: 'Você conseguiu! 🎉',
        subtitle: 'Injeção tomada hoje',
        buttonText: 'Editar aplicação',
        progress: 1,
        emoji: '✅',
      };
    }

    // Calcular próxima injeção
    const nextShotDate = calculateNextShotDate(lastShotDate, frequency);
    nextShotDate.setHours(0, 0, 0, 0);

    // Estado 3: Hoje é dia de injeção (mas ainda não tomou)
    if (nextShotDate.getTime() === today.getTime()) {
      return {
        title: "It's shot day!",
        subtitle: today.toLocaleDateString('pt-BR', { 
          day: 'numeric', 
          month: 'long' 
        }),
        buttonText: 'Marcar como tomada',
        progress: 0.75,
        emoji: '💉',
      };
    }

    // Estado 4: Dias até próxima injeção
    const daysUntil = Math.ceil(
      (nextShotDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Se passou do dia
    if (daysUntil < 0) {
      return {
        title: 'Injeção atrasada!',
        subtitle: `${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'dia' : 'dias'} de atraso`,
        buttonText: 'Adicionar Injeção',
        progress: 0,
        emoji: '⚠️',
      };
    }

    // Calcular progresso
    const totalDays = frequency === 'weekly' ? 7 : 14;
    const daysPassed = totalDays - daysUntil;
    const progress = daysPassed / totalDays;

    return {
      title: `${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}`,
      subtitle: 'até a próxima injeção',
      buttonText: daysUntil <= 1 ? 'Adicionar Injeção' : undefined,
      progress,
      emoji: '📅',
    };
  };

  const state = getWidgetState();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Próxima Injeção
      </Text>

      <ShotsyCard style={styles.card}>
        <ShotsyCircularProgress 
          size={240} 
          progress={state.progress}
        >
          <View style={styles.content}>
            <Text style={styles.emoji}>{state.emoji}</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {state.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {state.subtitle}
            </Text>

            {state.buttonText && (
              <ShotsyButton
                title={state.buttonText}
                onPress={() => router.push('/(tabs)/add-application')}
                size="medium"
                style={styles.button}
              />
            )}
          </View>
        </ShotsyCircularProgress>
      </ShotsyCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 12,
  },
});
```

2. Atualizar Dashboard para passar frequency:
   - Ler frequency do profile
   - Passar para NextShotWidget

## VALIDAÇÕES
- [ ] Widget mostra estado correto
- [ ] "Bem-vindo" aparece sem injeções
- [ ] "You did it!" aparece após adicionar hoje
- [ ] Contagem de dias funciona
- [ ] Progresso circular anima

## ARQUIVOS A MODIFICAR
- /components/dashboard/NextShotWidget.tsx
- /app/(tabs)/dashboard.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Ver widget sem injeções → "Bem-vindo"
- [ ] Adicionar injeção hoje → "You did it!"
- [ ] Ver contagem de dias correta
- [ ] Anel circular muda conforme progresso

---

## 📝 TASK 1.10: Criar Diagrama Visual do Corpo

**Tempo Estimado:** 4-5 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Criar diagrama visual do corpo para seleção de locais

## CONTEXTO
Atualmente InjectionSiteGrid usa emojis simples.
Shotsy tem diagrama visual do corpo humano com rotação inteligente.

## OBJETIVO
Substituir emojis por SVG visual do corpo mostrando 8 locais.

## TAREFAS

1. Criar arquivo `/components/application/BodyDiagram.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useShotsyColors } from '@/hooks/useShotsyColors';

interface BodyDiagramProps {
  selectedSites: string[];
  onSiteToggle: (siteId: string) => void;
  history?: string[]; // Histórico de locais usados
}

const INJECTION_SITES = [
  { id: 'stomach_left', x: 120, y: 200, label: 'Abdômen\nEsquerdo' },
  { id: 'stomach_right', x: 180, y: 200, label: 'Abdômen\nDireito' },
  { id: 'thigh_left', x: 130, y: 350, label: 'Coxa\nEsquerda' },
  { id: 'thigh_right', x: 170, y: 350, label: 'Coxa\nDireita' },
  { id: 'arm_left', x: 80, y: 150, label: 'Braço\nEsquerdo' },
  { id: 'arm_right', x: 220, y: 150, label: 'Braço\nDireito' },
];

export function BodyDiagram({ 
  selectedSites, 
  onSiteToggle,
  history = [] 
}: BodyDiagramProps) {
  const colors = useShotsyColors();

  // Verificar se local foi usado recentemente
  const isRecentlyUsed = (siteId: string): boolean => {
    const lastThree = history.slice(-3);
    return lastThree.includes(siteId);
  };

  // Sugerir próximo local (rotação)
  const suggestNextSite = (): string | null => {
    if (history.length === 0) return null;
    
    const lastSite = history[history.length - 1];
    const lastIndex = INJECTION_SITES.findIndex(s => s.id === lastSite);
    
    // Rotacionar para próximo local
    const nextIndex = (lastIndex + 1) % INJECTION_SITES.length;
    return INJECTION_SITES[nextIndex].id;
  };

  const suggestedSite = suggestNextSite();

  return (
    <View style={styles.container}>
      {/* Título com sugestão */}
      {suggestedSite && !selectedSites.includes(suggestedSite) && (
        <View style={[styles.suggestionBanner, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.suggestionText, { color: colors.primary }]}>
            💡 Sugerido: {INJECTION_SITES.find(s => s.id === suggestedSite)?.label.replace('\n', ' ')}
          </Text>
        </View>
      )}

      {/* Diagrama do corpo */}
      <View style={styles.diagramContainer}>
        <Svg width="300" height="400" viewBox="0 0 300 400">
          {/* Corpo simples (silhueta) */}
          {/* Cabeça */}
          <Circle cx="150" cy="50" r="30" fill={colors.cardSecondary} />
          
          {/* Tronco */}
          <Path
            d="M 120 80 L 120 240 Q 120 260 135 260 L 165 260 Q 180 260 180 240 L 180 80 Z"
            fill={colors.cardSecondary}
          />
          
          {/* Braços */}
          <Path
            d="M 120 100 L 80 140 L 85 145 L 125 110 Z"
            fill={colors.cardSecondary}
          />
          <Path
            d="M 180 100 L 220 140 L 215 145 L 175 110 Z"
            fill={colors.cardSecondary}
          />
          
          {/* Pernas */}
          <Path
            d="M 135 260 L 130 380 L 145 380 L 145 260 Z"
            fill={colors.cardSecondary}
          />
          <Path
            d="M 165 260 L 170 380 L 155 380 L 155 260 Z"
            fill={colors.cardSecondary}
          />

          {/* Pontos de injeção */}
          {INJECTION_SITES.map(site => {
            const isSelected = selectedSites.includes(site.id);
            const isRecent = isRecentlyUsed(site.id);
            const isSuggested = site.id === suggestedSite;

            return (
              <Circle
                key={site.id}
                cx={site.x}
                cy={site.y}
                r={isSelected ? 18 : 12}
                fill={
                  isSelected ? colors.primary :
                  isSuggested ? colors.primary + '50' :
                  isRecent ? colors.textSecondary + '30' :
                  'transparent'
                }
                stroke={colors.primary}
                strokeWidth={isSelected ? 3 : isSuggested ? 2 : 1}
                opacity={isRecent && !isSelected ? 0.5 : 1}
              />
            );
          })}
        </Svg>
      </View>

      {/* Botões de seleção */}
      <View style={styles.buttonsGrid}>
        {INJECTION_SITES.map(site => {
          const isSelected = selectedSites.includes(site.id);
          const isRecent = isRecentlyUsed(site.id);
          const isSuggested = site.id === suggestedSite;

          return (
            <TouchableOpacity
              key={site.id}
              style={[
                styles.siteButton,
                {
                  backgroundColor: colors.cardSecondary,
                  borderColor: isSelected ? colors.primary : 
                               isSuggested ? colors.primary + '80' :
                               colors.border,
                  borderWidth: isSelected ? 3 : isSuggested ? 2 : 1,
                  opacity: isRecent && !isSelected ? 0.6 : 1,
                },
              ]}
              onPress={() => onSiteToggle(site.id)}
            >
              <Text
                style={[
                  styles.siteLabel,
                  { color: isSelected ? colors.primary : colors.textSecondary },
                ]}
              >
                {site.label}
              </Text>
              {isSuggested && !isSelected && (
                <Text style={styles.suggestedIcon}>💡</Text>
              )}
              {isRecent && !isSelected && (
                <Text style={styles.recentIcon}>🕐</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Selecionado
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: colors.primary + '50',
            borderWidth: 1,
            borderColor: colors.primary,
          }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Sugerido
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { 
            backgroundColor: colors.textSecondary + '30',
          }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Usado recentemente
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  suggestionBanner: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  diagramContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  siteButton: {
    width: '30%',
    minWidth: 90,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  siteLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  suggestedIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 16,
  },
  recentIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    opacity: 0.6,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
  },
});
```

2. Instalar dependência:
```bash
npm install react-native-svg
```

3. Substituir InjectionSiteGrid por BodyDiagram em add-application.tsx:
   - Importar BodyDiagram
   - Passar histórico de locais
   - Manter mesma interface (value/onChange)

4. Buscar histórico de locais:
```typescript
const { applications } = useApplications();
const injectionHistory = applications
  .map(app => app.injection_sites)
  .flat()
  .slice(-10); // Últimos 10 locais
```

## VALIDAÇÕES
- [ ] Diagrama renderiza sem erros
- [ ] SVG do corpo aparece
- [ ] 8 pontos clicáveis
- [ ] Seleção funciona
- [ ] Sugestão aparece baseada em histórico
- [ ] Locais recentes ficam opacos

## ARQUIVOS A CRIAR
- /components/application/BodyDiagram.tsx

## ARQUIVOS A MODIFICAR
- /app/(tabs)/add-application.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Ver diagrama visual do corpo
- [ ] Clicar em local e ver seleção
- [ ] Ver sugestão de próximo local
- [ ] Adicionar múltiplas injeções e ver rotação

---

## 🎉 FIM DA FASE 1

**Parabéns!** Se completou todas as 10 tasks, você tem:
✅ Dados reais integrados em todas as telas
✅ Cálculo de níveis estimados funcionando
✅ Dashboard completo (Hoje + Preview Resultados)
✅ Gráfico melhorado com tabs
✅ Widget dinâmico com estados
✅ Diagrama visual do corpo

**Progresso:** ~40% → ~80% completo

**Próximo:** FASE 2 - UX/UI Refinement

---

# FASE 2: UX/UI REFINEMENT (ALTA) 🎨

**Objetivo:** Polish e melhorias de experiência do usuário  
**Duração:** 15-18 horas  
**Prioridade:** 🟠 ALTA

---

## 📝 TASK 2.1: Implementar Swipe Actions em Injections

**Tempo Estimado:** 3-4 horas

### PROMPT PARA CLAUDE CODE:

```
# TASK: Adicionar swipe actions (editar/deletar) nos ShotCards

## CONTEXTO
Lista de injeções precisa de swipe gestures para editar e deletar rapidamente.
react-native-gesture-handler já está instalado.

## OBJETIVO
Swipe esquerda → Deletar | Swipe direita → Editar

## TAREFAS

1. Criar componente `/components/shots/SwipeableShotCard.tsx`:

```typescript
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotCard, Shot } from './ShotCard';

interface SwipeableShotCardProps {
  shot: Shot;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SwipeableShotCard({ 
  shot, 
  onEdit, 
  onDelete 
}: SwipeableShotCardProps) {
  const colors = useShotsyColors();
  const swipeableRef = useRef<Swipeable>(null);

  // Ação da direita (deletar)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(shot.id);
          }}
        >
          <Text style={styles.actionText}>🗑️ Deletar</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Ação da esquerda (editar)
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [-100, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.leftAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            swipeableRef.current?.close();
            onEdit(shot.id);
          }}
        >
          <Text style={styles.actionText}>✏️ Editar</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <ShotCard shot={shot} onDelete={onDelete} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    justifyContent: 'center',
    marginRight: 8,
  },
  rightAction: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

2. Atualizar `/app/(tabs)/injections.tsx`:
   - Importar SwipeableShotCard
   - Substituir ShotCard por SwipeableShotCard
   - Implementar onEdit e onDelete

3. Adicionar feedback tátil:
```typescript
import * as Haptics from 'expo-haptics';

const handleDelete = (id: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  Alert.alert(
    'Deletar Injeção',
    'Tem certeza?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deleteApplication(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]
  );
};

const handleEdit = (id: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  router.push(`/(tabs)/add-application?editId=${id}`);
};
```

## VALIDAÇÕES
- [ ] Swipe funciona em ambas direções
- [ ] Editar abre tela com dados
- [ ] Deletar remove do banco
- [ ] Animações suaves
- [ ] Feedback tátil funciona

## ARQUIVOS A CRIAR
- /components/shots/SwipeableShotCard.tsx

## ARQUIVOS A MODIFICAR
- /app/(tabs)/injections.tsx
```

### ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Swipe para direita → ver botão Editar
- [ ] Swipe para esquerda → ver botão Deletar
- [ ] Tap em Editar abre tela com dados
- [ ] Tap em Deletar mostra confirmação

---

## 📝 TASK 2.2-2.6: [TASKS RESUMIDAS]

*Por questões de espaço, incluirei headers das próximas tasks:*

**TASK 2.2:** Implementar Dark Mode Funcional (3-4h)
**TASK 2.3:** Melhorar Gráficos em Results (4-5h)
**TASK 2.4:** Completar Settings com Dados Reais (3-4h)
**TASK 2.5:** Implementar Empty States Melhores (2h)
**TASK 2.6:** Adicionar Animações e Transições (3-4h)

---

# FASES 3 E 4 (RESUMIDAS)

## FASE 3: FEATURES AVANÇADAS (20-25h) 🚀
- Sistema de Conquistas
- Notificações Push
- Exportação CSV/PDF
- Calendário Avançado
- Insights Automatizados

## FASE 4: INTEGRAÇÕES (12-15h) 🔌
- Apple Health
- Insights IA
- Polimento Final

---

## 📊 PROGRESSO GERAL

```
FASE 1: Core Features         [██████████] 100% ✅
FASE 2: UX/UI Refinement      [░░░░░░░░░░]   0%
FASE 3: Features Avançadas    [░░░░░░░░░░]   0%
FASE 4: Integrações          [░░░░░░░░░░]   0%

TOTAL PROJETO: ~80% após FASE 1
```

---

## 🎯 COMO CONTINUAR

1. ✅ Complete TODAS as 10 tasks da FASE 1
2. ✅ Valide cada checklist antes de avançar
3. ✅ Teste o app após cada task
4. ✅ Marque tasks como concluídas
5. ✅ Peça próximas tasks quando pronto

---

**Boa sorte com o desenvolvimento! 🚀**

*Criado para uso com Claude Code*  
*Última atualização: 31/10/2025*
