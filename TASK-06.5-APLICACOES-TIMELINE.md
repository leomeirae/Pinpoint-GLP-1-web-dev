# TASK-06.5: Registro de Aplicações + Timeline da Jornada

## 🎯 OBJETIVO
Implementar a **FUNCIONALIDADE CENTRAL** do app: registrar quando o usuário aplica a dose do medicamento e criar uma timeline visual mostrando Doses → Pesos em sequência cronológica.

---

## 📋 PRÉ-REQUISITOS
- TASK-05 completa
- Terminal aberto em `/Users/user/Desktop/mounjaro-tracker`

---

# 🗄️ FASE 1: CRIAR TABELA NO SUPABASE

## PASSO 1.1: Criar tabela medication_applications

No Supabase Dashboard → SQL Editor → New Query, cole e execute:

\`\`\`sql
-- Tabela de aplicações de medicamento
CREATE TABLE IF NOT EXISTS medication_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  application_date DATE NOT NULL,
  application_time TIME,
  dosage NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_applications_user ON medication_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_medication ON medication_applications(medication_id);
CREATE INDEX IF NOT EXISTS idx_applications_date ON medication_applications(application_date DESC);

-- Trigger para updated_at
CREATE TRIGGER update_medication_applications_updated_at 
  BEFORE UPDATE ON medication_applications
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE medication_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON medication_applications FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert own applications"
  ON medication_applications FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can update own applications"
  ON medication_applications FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can delete own applications"
  ON medication_applications FOR DELETE
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));
\`\`\`

Clique em **RUN** e aguarde "Success".

---

# 📝 FASE 2: ATUALIZAR TYPES

## PASSO 2.1: Adicionar tipos para aplicações

Cole no terminal:

\`\`\`bash
cat >> lib/types.ts << 'TYPES_EOF'

// Medication Application types
export interface MedicationApplication {
  id: string;
  user_id: string;
  medication_id: string;
  application_date: string;
  application_time: string | null;
  dosage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InsertMedicationApplication = Omit<MedicationApplication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'application_time' | 'notes'> & {
  application_time?: string | null;
  notes?: string | null;
};

export type UpdateMedicationApplication = Partial<Omit<MedicationApplication, 'id' | 'user_id' | 'medication_id' | 'created_at' | 'updated_at'>>;

// Timeline Event (união de aplicações + pesos)
export interface TimelineEvent {
  id: string;
  type: 'application' | 'weight';
  date: string;
  time?: string;
  
  // Se type = 'application'
  medicationName?: string;
  dosage?: number;
  applicationNotes?: string;
  
  // Se type = 'weight'
  weight?: number;
  weightNotes?: string;
  weightDiff?: number; // Diferença do peso anterior
}
TYPES_EOF
\`\`\`

---

# 🪝 FASE 3: CRIAR HOOKS

## PASSO 3.1: Hook para aplicações

\`\`\`bash
cat > hooks/useMedicationApplications.ts << 'APPLICATIONS_HOOK_EOF'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { MedicationApplication, InsertMedicationApplication, UpdateMedicationApplication } from '@/lib/types';

export function useMedicationApplications() {
  const { user } = useUser();
  const [applications, setApplications] = useState<MedicationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  async function fetchApplications() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('medication_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('application_date', { ascending: false });

      if (fetchError) throw fetchError;
      setApplications(data || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addApplication(application: InsertMedicationApplication) {
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('medication_applications')
      .insert({ 
        ...application, 
        user_id: user.id,
        application_time: application.application_time || null,
        notes: application.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchApplications();
    return data;
  }

  async function updateApplication(id: string, updates: UpdateMedicationApplication) {
    const { data, error } = await supabase
      .from('medication_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchApplications();
    return data;
  }

  async function deleteApplication(id: string) {
    const { error } = await supabase
      .from('medication_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchApplications();
  }

  return {
    applications,
    loading,
    error,
    addApplication,
    updateApplication,
    deleteApplication,
    refetch: fetchApplications,
  };
}
APPLICATIONS_HOOK_EOF
\`\`\`

## PASSO 3.2: Hook para timeline

\`\`\`bash
cat > hooks/useTimeline.ts << 'TIMELINE_HOOK_EOF'
import { useMemo } from 'react';
import { useMedicationApplications } from './useMedicationApplications';
import { useWeightLogs } from './useWeightLogs';
import { useMedications } from './useMedications';
import { TimelineEvent } from '@/lib/types';

const MEDICATION_NAMES: Record<string, string> = {
  mounjaro: 'Mounjaro',
  ozempic: 'Ozempic',
  saxenda: 'Saxenda',
  wegovy: 'Wegovy',
  zepbound: 'Zepbound',
};

export function useTimeline() {
  const { applications, loading: appsLoading } = useMedicationApplications();
  const { weightLogs, loading: weightsLoading } = useWeightLogs();
  const { medications } = useMedications();

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Adicionar aplicações
    applications.forEach(app => {
      const medication = medications.find(m => m.id === app.medication_id);
      events.push({
        id: app.id,
        type: 'application',
        date: app.application_date,
        time: app.application_time || undefined,
        medicationName: medication ? MEDICATION_NAMES[medication.type] || medication.type : 'Medicação',
        dosage: app.dosage,
        applicationNotes: app.notes || undefined,
      });
    });

    // Adicionar pesos
    weightLogs.forEach((log, index) => {
      const previousWeight = weightLogs[index + 1]?.weight;
      const weightDiff = previousWeight ? log.weight - previousWeight : undefined;

      events.push({
        id: log.id,
        type: 'weight',
        date: log.date,
        weight: log.weight,
        weightNotes: log.notes || undefined,
        weightDiff,
      });
    });

    // Ordenar por data (mais recente primeiro)
    return events.sort((a, b) => {
      const dateA = new Date(a.date + (a.time ? ` ${a.time}` : '')).getTime();
      const dateB = new Date(b.date + (b.time ? ` ${b.time}` : '')).getTime();
      return dateB - dateA;
    });
  }, [applications, weightLogs, medications]);

  return {
    timeline,
    loading: appsLoading || weightsLoading,
  };
}
TIMELINE_HOOK_EOF
\`\`\`

---

# 🎨 FASE 4: CRIAR COMPONENTES VISUAIS

## PASSO 4.1: Timeline Component

\`\`\`bash
cat > components/dashboard/Timeline.tsx << 'TIMELINE_COMPONENT_EOF'
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '@/constants/colors';
import { TimelineEvent } from '@/lib/types';

interface TimelineProps {
  events: TimelineEvent[];
  maxVisible?: number;
}

export function Timeline({ events, maxVisible }: TimelineProps) {
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📅 Nenhum evento registrado ainda</Text>
        <Text style={styles.emptySubtext}>
          Comece registrando sua primeira aplicação ou peso!
        </Text>
      </View>
    );
  }

  const displayEvents = maxVisible ? events.slice(0, maxVisible) : events;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Linha do Tempo</Text>
      
      <View style={styles.timelineContainer}>
        {displayEvents.map((event, index) => (
          <View key={event.id} style={styles.eventWrapper}>
            {/* Linha conectora */}
            {index < displayEvents.length - 1 && (
              <View style={styles.connector} />
            )}

            {/* Evento */}
            <View style={styles.eventCard}>
              {/* Ícone e data */}
              <View style={styles.eventHeader}>
                <View style={[
                  styles.iconCircle,
                  event.type === 'application' ? styles.iconApplication : styles.iconWeight
                ]}>
                  <Text style={styles.iconText}>
                    {event.type === 'application' ? '💉' : '⚖️'}
                  </Text>
                </View>
                
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  {event.time && (
                    <Text style={styles.timeText}>
                      {event.time.substring(0, 5)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Conteúdo */}
              {event.type === 'application' && (
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>
                    Aplicação: {event.medicationName}
                  </Text>
                  <Text style={styles.eventDetail}>
                    Dosagem: {event.dosage}mg
                  </Text>
                  {event.applicationNotes && (
                    <Text style={styles.eventNotes}>
                      "{event.applicationNotes}"
                    </Text>
                  )}
                </View>
              )}

              {event.type === 'weight' && (
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>
                    Peso: {event.weight}kg
                  </Text>
                  {event.weightDiff && (
                    <Text style={[
                      styles.weightDiff,
                      event.weightDiff > 0 ? styles.weightUp : styles.weightDown
                    ]}>
                      {event.weightDiff > 0 ? '↑' : '↓'} {Math.abs(event.weightDiff).toFixed(1)}kg
                    </Text>
                  )}
                  {event.weightNotes && (
                    <Text style={styles.eventNotes}>
                      "{event.weightNotes}"
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
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
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  eventWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  connector: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: '100%',
    backgroundColor: COLORS.border,
  },
  eventCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginLeft: 48,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -64,
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  iconApplication: {
    backgroundColor: COLORS.primary,
  },
  iconWeight: {
    backgroundColor: COLORS.success,
  },
  iconText: {
    fontSize: 20,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  eventContent: {
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  eventDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  eventNotes: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  weightDiff: {
    fontSize: 14,
    fontWeight: '600',
  },
  weightUp: {
    color: COLORS.error,
  },
  weightDown: {
    color: COLORS.success,
  },
});
TIMELINE_COMPONENT_EOF
\`\`\`

## PASSO 4.2: Journey Milestones Component

\`\`\`bash
cat > components/dashboard/JourneyMilestones.tsx << 'MILESTONES_EOF'
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { MedicationApplication } from '@/lib/types';

interface JourneyMilestonesProps {
  applications: MedicationApplication[];
  currentWeight: number;
  initialWeight: number;
}

export function JourneyMilestones({ applications, currentWeight, initialWeight }: JourneyMilestonesProps) {
  if (applications.length === 0) {
    return null;
  }

  const totalApplications = applications.length;
  const firstApplication = applications[applications.length - 1];
  const lastApplication = applications[0];
  
  const daysSinceStart = firstApplication 
    ? Math.ceil((Date.now() - new Date(firstApplication.application_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  const weightLost = initialWeight - currentWeight;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Marcos da Jornada</Text>
      
      <View style={styles.milestonesGrid}>
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneEmoji}>💉</Text>
          <Text style={styles.milestoneValue}>{totalApplications}</Text>
          <Text style={styles.milestoneLabel}>Aplicações</Text>
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneEmoji}>📅</Text>
          <Text style={styles.milestoneValue}>Semana {weekNumber}</Text>
          <Text style={styles.milestoneLabel}>da jornada</Text>
        </View>

        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneEmoji}>📉</Text>
          <Text style={styles.milestoneValue}>{weightLost.toFixed(1)}kg</Text>
          <Text style={styles.milestoneLabel}>perdidos</Text>
        </View>
      </View>

      {lastApplication && (
        <View style={styles.lastApplicationCard}>
          <Text style={styles.lastAppTitle}>Última Aplicação</Text>
          <Text style={styles.lastAppDate}>
            {new Date(lastApplication.application_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.lastAppDosage}>
            Dosagem: {lastApplication.dosage}mg
          </Text>
        </View>
      )}
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
    marginBottom: 16,
  },
  milestonesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  milestoneEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  milestoneValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  milestoneLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  lastApplicationCard: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  lastAppTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  lastAppDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  lastAppDosage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
MILESTONES_EOF
\`\`\`

---

# 📱 FASE 5: CRIAR TELA DE APLICAÇÃO

## PASSO 5.1: Tela de adicionar aplicação

\`\`\`bash
cat > app/\(tabs\)/add-application.tsx << 'ADD_APPLICATION_EOF'
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMedicationApplications } from '@/hooks/useMedicationApplications';
import { useMedications } from '@/hooks/useMedications';
import { COLORS } from '@/constants/colors';

const MEDICATION_NAMES: Record<string, string> = {
  mounjaro: 'Mounjaro',
  ozempic: 'Ozempic',
  saxenda: 'Saxenda',
  wegovy: 'Wegovy',
  zepbound: 'Zepbound',
};

export default function AddApplicationScreen() {
  const router = useRouter();
  const { addApplication } = useMedicationApplications();
  const { medications } = useMedications();

  const [selectedMedicationId, setSelectedMedicationId] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const activeMedications = medications.filter(m => m.active);

  // Auto-selecionar primeira medicação
  useEffect(() => {
    if (activeMedications.length > 0 && !selectedMedicationId) {
      setSelectedMedicationId(activeMedications[0].id);
      setDosage(activeMedications[0].dosage.toString());
    }
  }, [activeMedications.length]);

  async function handleSubmit() {
    if (!selectedMedicationId) {
      Alert.alert('Erro', 'Selecione uma medicação');
      return;
    }

    if (!dosage) {
      Alert.alert('Erro', 'Informe a dosagem');
      return;
    }

    try {
      setLoading(true);

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

      await addApplication({
        medication_id: selectedMedicationId,
        application_date: currentDate,
        application_time: currentTime,
        dosage: parseFloat(dosage),
        notes: notes || null,
      });

      Alert.alert('Sucesso! 💉', 'Aplicação registrada', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding application:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (activeMedications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💊</Text>
        <Text style={styles.emptyTitle}>Nenhuma medicação cadastrada</Text>
        <Text style={styles.emptyText}>
          Cadastre uma medicação primeiro para registrar aplicações
        </Text>
        <Button
          label="Cadastrar Medicação"
          onPress={() => router.push('/(tabs)/add-medication')}
        />
      </View>
    );
  }

  const selectedMedication = medications.find(m => m.id === selectedMedicationId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>💉</Text>
        <Text style={styles.title}>Registrar Aplicação</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Selecione a Medicação</Text>
        <View style={styles.medicationsList}>
          {activeMedications.map((med) => (
            <Pressable
              key={med.id}
              style={[
                styles.medicationCard,
                selectedMedicationId === med.id && styles.medicationCardActive,
              ]}
              onPress={() => {
                setSelectedMedicationId(med.id);
                setDosage(med.dosage.toString());
              }}
            >
              <Text style={styles.medicationName}>
                {MEDICATION_NAMES[med.type] || med.type}
              </Text>
              <Text style={styles.medicationDosage}>{med.dosage}mg</Text>
              <Text style={styles.medicationFrequency}>
                {med.frequency === 'weekly' ? 'Semanal' : 'Diária'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Input
        label="Dosagem Aplicada (mg)"
        placeholder="Ex: 2.5"
        value={dosage}
        onChangeText={setDosage}
        keyboardType="decimal-pad"
      />

      <Input
        label="Observações (opcional)"
        placeholder="Como você está se sentindo? Alguma reação?"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {selectedMedication && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Sua próxima aplicação de {MEDICATION_NAMES[selectedMedication.type]} deve ser em{' '}
            {selectedMedication.frequency === 'weekly' ? '7 dias' : '1 dia'}
          </Text>
        </View>
      )}

      <Button
        label="Registrar Aplicação"
        onPress={handleSubmit}
        loading={loading}
        disabled={!selectedMedicationId || !dosage}
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  medicationsList: {
    gap: 12,
  },
  medicationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  medicationCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDark,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationFrequency: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
ADD_APPLICATION_EOF
\`\`\`

---

# 📊 FASE 6: ATUALIZAR DASHBOARD

## PASSO 6.1: Atualizar dashboard com Timeline

Cole no Cursor AI este comando completo para **SUBSTITUIR** o dashboard:

\`\`\`
INSTRUÇÕES PARA O CURSOR AI:

Substitua COMPLETAMENTE o arquivo app/(tabs)/index.tsx com o código abaixo.
Este código adiciona:
1. Timeline de eventos (aplicações + pesos)
2. Marcos da jornada
3. Botão para registrar aplicação

===== INÍCIO DO CÓDIGO =====

import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { useMedications } from '@/hooks/useMedications';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { useAchievements } from '@/hooks/useAchievements';
import { useSideEffects } from '@/hooks/useSideEffects';
import { useMedicationApplications } from '@/hooks/useMedicationApplications';
import { useTimeline } from '@/hooks/useTimeline';
import { Button } from '@/components/ui/button';
import { WeightChart } from '@/components/dashboard/WeightChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MedicationList } from '@/components/dashboard/MedicationList';
import { AchievementList } from '@/components/dashboard/AchievementList';
import { SideEffectsList } from '@/components/dashboard/SideEffectsList';
import { Timeline } from '@/components/dashboard/Timeline';
import { JourneyMilestones } from '@/components/dashboard/JourneyMilestones';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { generatePDFReport } from '@/lib/pdf-generator';

export default function DashboardScreen() {
  const { user: clerkUser } = useAuth();
  const { user: dbUser, loading: userLoading } = useUser();
  const { medications, loading: medsLoading, refetch: refetchMeds } = useMedications();
  const { weightLogs, loading: weightsLoading, refetch: refetchWeights } = useWeightLogs();
  const { achievements, loading: achievementsLoading, checkAndUnlockAchievements, refetch: refetchAchievements } = useAchievements();
  const { sideEffects, loading: sideEffectsLoading, refetch: refetchSideEffects } = useSideEffects();
  const { applications, refetch: refetchApplications } = useMedicationApplications();
  const { timeline, loading: timelineLoading } = useTimeline();
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([
      refetchMeds(), 
      refetchWeights(), 
      refetchAchievements(), 
      refetchSideEffects(),
      refetchApplications(),
    ]);
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
      weightLost,
      goalReached,
    });
  }, [weightLogs.length, medications.length, dbUser?.initial_weight, dbUser?.goal_weight]);

  const latestWeight = weightLogs[0]?.weight || 0;
  const firstWeight = dbUser?.initial_weight || weightLogs[weightLogs.length - 1]?.weight || 0;
  const weightDiff = latestWeight && firstWeight ? (firstWeight - latestWeight).toFixed(1) : '0';
  const activeMedications = medications.filter(m => m.active).length;
  const totalLogs = weightLogs.length;
  
  const firstLogDate = weightLogs[weightLogs.length - 1]?.date;
  const journeyDays = firstLogDate 
    ? Math.ceil((Date.now() - new Date(firstLogDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

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
        <Text style={styles.greeting}>Olá, {clerkUser?.firstName || 'Usuário'}! 👋</Text>
        <Text style={styles.subtitle}>Veja sua jornada</Text>
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

      {/* Journey Milestones */}
      <View style={styles.section}>
        <JourneyMilestones 
          applications={applications}
          currentWeight={latestWeight}
          initialWeight={firstWeight}
        />
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <Timeline events={timeline} maxVisible={10} />
      </View>

      {/* Weight Chart */}
      <View style={styles.chartContainer}>
        <WeightChart 
          data={weightLogs} 
          goalWeight={dbUser?.goal_weight}
          initialWeight={dbUser?.initial_weight}
        />
      </View>

      {/* Achievements */}
      <View style={styles.listContainer}>
        <AchievementList 
          achievements={achievements} 
          loading={achievementsLoading}
          maxVisible={3}
        />
      </View>

      {/* Medications List */}
      <View style={styles.listContainer}>
        <MedicationList medications={medications} />
      </View>

      {/* Side Effects */}
      <View style={styles.listContainer}>
        <SideEffectsList sideEffects={sideEffects} maxVisible={3} />
      </View>

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
  section: {
    paddingHorizontal: 24,
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
});

===== FIM DO CÓDIGO =====
\`\`\`

## PASSO 6.2: Adicionar tab de aplicação

\`\`\`bash
# Substituir o arquivo de tabs layout
cat > app/\(tabs\)/_layout.tsx << 'TABS_LAYOUT_EOF'
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
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
          title: 'Início',
          tabBarLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="add-application"
        options={{
          title: 'Aplicação',
          tabBarLabel: 'Aplicação',
        }}
      />
      <Tabs.Screen
        name="add-weight"
        options={{
          title: 'Peso',
          tabBarLabel: 'Peso',
        }}
      />
      <Tabs.Screen
        name="add-medication"
        options={{
          href: null, // Esconder da tab bar
        }}
      />
      <Tabs.Screen
        name="add-side-effect"
        options={{
          href: null, // Esconder da tab bar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tabs>
  );
}
TABS_LAYOUT_EOF
\`\`\`

---

# ✅ FASE 7: TESTAR

## PASSO 7.1: Executar o app

\`\`\`bash
npx expo start
\`\`\`

### Checklist de Testes:

**TESTE 1: Registrar Aplicação**
1. ✅ Ir na tab "Aplicação"
2. ✅ Selecionar medicação cadastrada
3. ✅ Dosagem pré-preenchida
4. ✅ Adicionar observações (opcional)
5. ✅ Registrar com sucesso

**TESTE 2: Ver Timeline**
1. ✅ Voltar ao dashboard
2. ✅ Ver evento de aplicação na timeline (💉)
3. ✅ Ver eventos de peso na timeline (⚖️)
4. ✅ Eventos ordenados por data (mais recente primeiro)

**TESTE 3: Marcos da Jornada**
1. ✅ Ver total de aplicações
2. ✅ Ver semana da jornada
3. ✅ Ver peso perdido
4. ✅ Ver última aplicação

**TESTE 4: Fluxo Completo**
1. ✅ Registrar aplicação hoje
2. ✅ Registrar peso amanhã
3. ✅ Ver timeline mostrando: Aplicação → Peso
4. ✅ Diferença de peso aparece
5. ✅ Dados sincronizados no Supabase

---

## 📊 VALIDAÇÃO FINAL

Antes de marcar TASK-06.5 como completa:

- [ ] SQL executado sem erros
- [ ] Tabela medication_applications criada
- [ ] Hook useMedicationApplications funciona
- [ ] Hook useTimeline funciona
- [ ] Tela de adicionar aplicação funcional
- [ ] Timeline aparece no dashboard
- [ ] Marcos da jornada aparecem
- [ ] Eventos ordenados corretamente
- [ ] Pull-to-refresh atualiza timeline
- [ ] App não trava

---

## 🎉 RESULTADO ESPERADO

✅ Funcionalidade CENTRAL implementada
✅ Usuário registra aplicações
✅ Timeline visual (Aplicações + Pesos)
✅ Marcos da jornada
✅ Relação clara: Dose → Peso
✅ Diário completo da jornada

---

## 📱 VISUALIZAÇÃO ESPERADA

Dashboard agora mostra:
```
📊 Stats (Peso, Medicações, Aplicações, Dias)
🎯 Marcos da Jornada (Aplicações, Semana X, Peso perdido)
📅 Timeline:
   💉 Aplicação Mounjaro 2.5mg - 23/10 10:00
   ⚖️ Peso: 82kg (↓ 1.5kg) - 23/10
   💉 Aplicação Mounjaro 2.5mg - 16/10 09:30
   ⚖️ Peso: 83.5kg - 16/10
📈 Gráfico de Peso
🏆 Conquistas
💊 Medicações Ativas
```

---

**Pronto para implementar o CORAÇÃO do app!** 🎯💉
