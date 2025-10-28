i# TASK-04: CRUD Operations + UI Tracking

## OBJETIVO
Implementar operações CRUD completas e criar telas para:
- Adicionar/editar medicação
- Registrar peso diário
- Registrar aplicações de medicamento
- Registrar efeitos colaterais
- Dashboard com gráficos de progresso

## PRÉ-REQUISITOS
- TASK-03 completa e funcionando (Supabase + Clerk integrados)
- Usuário sendo criado automaticamente no Supabase
- Terminal aberto na pasta `/Users/user/Desktop/mounjaro-tracker`

---

## PASSO 1: Instalar dependências para gráficos

Execute no terminal:
\`\`\`bash
npx expo install react-native-svg
npx expo install victory-native
\`\`\`

---

## PASSO 2: Criar hooks para operações CRUD

### 2.1 - Criar hooks/useMedications.ts

\`\`\`bash
cat > hooks/useMedications.ts << 'MEDICATIONS_EOF'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { Medication, InsertMedication, UpdateMedication } from '@/lib/types';

export function useMedications() {
  const { user } = useUser();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user]);

  async function fetchMedications() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setMedications(data || []);
    } catch (err: any) {
      console.error('Error fetching medications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addMedication(medication: InsertMedication) {
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('medications')
      .insert({ ...medication, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    await fetchMedications();
    return data;
  }

  async function updateMedication(id: string, updates: UpdateMedication) {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchMedications();
    return data;
  }

  async function deleteMedication(id: string) {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchMedications();
  }

  return {
    medications,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    refetch: fetchMedications,
  };
}
MEDICATIONS_EOF
\`\`\`

### 2.2 - Criar hooks/useWeightLogs.ts

\`\`\`bash
cat > hooks/useWeightLogs.ts << 'WEIGHT_EOF'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { WeightLog, InsertWeightLog } from '@/lib/types';

export function useWeightLogs() {
  const { user } = useUser();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWeightLogs();
    }
  }, [user]);

  async function fetchWeightLogs() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setWeightLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching weight logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addWeightLog(weightLog: InsertWeightLog) {
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ ...weightLog, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    await fetchWeightLogs();
    return data;
  }

  async function deleteWeightLog(id: string) {
    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchWeightLogs();
  }

  return {
    weightLogs,
    loading,
    error,
    addWeightLog,
    deleteWeightLog,
    refetch: fetchWeightLogs,
  };
}
WEIGHT_EOF
\`\`\`

---

## PASSO 3: Criar tela de adicionar medicação

\`\`\`bash
cat > app/\(tabs\)/add-medication.tsx << 'ADD_MED_EOF'
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMedications } from '@/hooks/useMedications';
import { COLORS } from '@/constants/colors';
import { MedicationType } from '@/lib/types';

const MEDICATION_OPTIONS: { value: MedicationType; label: string }[] = [
  { value: 'mounjaro', label: 'Mounjaro' },
  { value: 'ozempic', label: 'Ozempic' },
  { value: 'saxenda', label: 'Saxenda' },
  { value: 'wegovy', label: 'Wegovy' },
  { value: 'zepbound', label: 'Zepbound' },
];

export default function AddMedicationScreen() {
  const router = useRouter();
  const { addMedication } = useMedications();

  const [type, setType] = useState<MedicationType>('mounjaro');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'daily'>('weekly');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!dosage) {
      Alert.alert('Erro', 'Preencha a dosagem');
      return;
    }

    try {
      setLoading(true);
      await addMedication({
        type,
        dosage: parseFloat(dosage),
        frequency,
        start_date: new Date().toISOString().split('T')[0],
      });

      Alert.alert('Sucesso!', 'Medicação adicionada');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Adicionar Medicação</Text>

      <Text style={styles.label}>Tipo de Medicação</Text>
      <View style={styles.optionsGrid}>
        {MEDICATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            label={option.label}
            onPress={() => setType(option.value)}
            variant={type === option.value ? 'primary' : 'outline'}
          />
        ))}
      </View>

      <Input
        label="Dosagem (mg)"
        placeholder="Ex: 2.5"
        value={dosage}
        onChangeText={setDosage}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Frequência</Text>
      <View style={styles.frequencyRow}>
        <Button
          label="Semanal"
          onPress={() => setFrequency('weekly')}
          variant={frequency === 'weekly' ? 'primary' : 'outline'}
        />
        <Button
          label="Diária"
          onPress={() => setFrequency('daily')}
          variant={frequency === 'daily' ? 'primary' : 'outline'}
        />
      </View>

      <Button
        label="Adicionar Medicação"
        onPress={handleSubmit}
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 16,
  },
  optionsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
});
ADD_MED_EOF
\`\`\`

---

## PASSO 4: Criar tela de adicionar peso

\`\`\`bash
cat > app/\(tabs\)/add-weight.tsx << 'ADD_WEIGHT_EOF'
import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { COLORS } from '@/constants/colors';

export default function AddWeightScreen() {
  const router = useRouter();
  const { addWeightLog } = useWeightLogs();

  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!weight) {
      Alert.alert('Erro', 'Preencha o peso');
      return;
    }

    try {
      setLoading(true);
      await addWeightLog({
        weight: parseFloat(weight),
        date: new Date().toISOString().split('T')[0],
        notes: notes || null,
      });

      Alert.alert('Sucesso!', 'Peso registrado');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Peso</Text>

      <Input
        label="Peso (kg)"
        placeholder="Ex: 85.5"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />

      <Input
        label="Observações (opcional)"
        placeholder="Como você está se sentindo?"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Button
        label="Salvar Peso"
        onPress={handleSubmit}
        loading={loading}
      />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
});
ADD_WEIGHT_EOF
\`\`\`

---

## PASSO 5: Atualizar tabs layout

\`\`\`bash
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
        name="add-medication"
        options={{
          title: 'Medicação',
          tabBarLabel: 'Medicação',
        }}
      />
      <Tabs.Screen
        name="add-weight"
        options={{
          title: 'Peso',
          tabBarLabel: 'Peso',
        }}
      />
    </Tabs>
  );
}
TABS_LAYOUT_EOF
\`\`\`

---

## PASSO 6: Testar

Execute no terminal:
\`\`\`bash
npx expo start
\`\`\`

### Teste:

1. ✅ Abrir app
2. ✅ Ver 3 tabs: Início, Medicação, Peso
3. ✅ Tab "Medicação" → Adicionar medicação
4. ✅ Tab "Peso" → Registrar peso
5. ✅ Verificar no Supabase se dados foram salvos

---

## VALIDAÇÃO

- [ ] Hooks CRUD criados
- [ ] Telas de adicionar medicação e peso funcionando
- [ ] Dados sendo salvos no Supabase
- [ ] App compila sem erros
- [ ] Tabs funcionando corretamente

---

## RESULTADO ESPERADO

✅ CRUD completo funcionando
✅ Telas de adicionar medicação e peso
✅ Dados sendo persistidos no Supabase
✅ Pronto para adicionar dashboard com gráficos (próxima fase)
