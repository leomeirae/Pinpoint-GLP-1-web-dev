# 📋 PROMPTS CLAUDE CODE - FASES 8, 9 e 10

Documento contendo os prompts completos das próximas 3 fases da refatoração do Mounjaro Tracker para clone do Shotsy.

---

# FASE 8: TELA DE CALENDÁRIO

## CONTEXTO
Esta é a FASE 8 de 15. Vamos criar a tela completa de Calendário (Calendar), que mostra uma visualização mensal de todas as injeções e pesos registrados.

Esta tela é acessada pela tab "Calendário" (📅) e oferece uma visão cronológica diferente da timeline.

## ANÁLISE DETALHADA DO SHOTSY

**Tela Calendar:**

**Layout vertical com 4 seções principais:**

1. **Header com Navegação de Mês**
   - Botão "< Anterior"
   - Mês e Ano atual (ex: "Outubro 2025")
   - Botão "Próximo >"
   - Botão "Hoje" (direita) - volta para mês atual
   - Botão "+ Injeção" (direita) - accent color

2. **Calendário Mensal** (Grid 7x6)
   - Dias da semana (Dom, Seg, Ter, Qua, Qui, Sex, Sab)
   - Grid de dias do mês
   - Marcadores visuais:
     - 💉 Injeção registrada (bolinha com accent color)
     - ⚖️ Peso registrado (bolinha cinza)
     - Múltiplos eventos: duas bolinhas
   - Dia atual destacado (borda)
   - Dias de outros meses em cinza claro

3. **Lista de Eventos do Dia Selecionado**
   - Título: "28 de Outubro, 2025" (data selecionada)
   - Cards de eventos do dia:
     - Injeções:
       - Hora: "19:30"
       - Tipo: "💉 Injeção"
       - Dosagem: "10mg"
       - Tap para editar
     - Pesos:
       - Hora: "08:00"
       - Tipo: "⚖️ Peso"
       - Valor: "87.5 kg"
       - Diferença: "↓ 0.5kg"
       - Tap para editar

4. **Empty State** (dia sem eventos)
   - Mensagem: "Nenhum evento registrado neste dia"
   - Botões:
     - "Adicionar Injeção"
     - "Adicionar Peso"

**Interações:**

- Tap no dia: mostra eventos daquele dia
- Swipe horizontal: navegar entre meses
- Botão "Hoje": volta para mês atual
- Pull to refresh: atualizar eventos
- Tap no evento: abre tela de edição

## TAREFAS

### 1. CRIAR COMPONENTES DO CALENDÁRIO

**1.1. Arquivo:** `/components/calendar/MonthCalendar.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasShot: boolean;
  hasWeight: boolean;
}

interface MonthCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: Array<{ date: Date; type: 'shot' | 'weight' }>;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  events,
}) => {
  const colors = useShotsyColors();

  // Gerar dias do calendário (incluindo dias do mês anterior/posterior)
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasShot: hasEventOnDate(date, 'shot'),
        hasWeight: hasEventOnDate(date, 'weight'),
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        hasShot: hasEventOnDate(date, 'shot'),
        hasWeight: hasEventOnDate(date, 'weight'),
      });
    }

    // Dias do próximo mês para completar o grid
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasShot: hasEventOnDate(date, 'shot'),
        hasWeight: hasEventOnDate(date, 'weight'),
      });
    }

    return days;
  };

  const hasEventOnDate = (date: Date, type: 'shot' | 'weight'): boolean => {
    return events.some(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return (
        eventDate.getTime() === date.getTime() &&
        event.type === type
      );
    });
  };

  const calendarDays = generateCalendarDays();

  const isDateSelected = (date: Date): boolean => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const current = new Date(date);
    current.setHours(0, 0, 0, 0);
    return selected.getTime() === current.getTime();
  };

  return (
    <View style={styles.container}>
      {/* Dias da semana */}
      <View style={styles.weekDaysRow}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grid de dias */}
      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          const selected = isDateSelected(day.date);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day.isToday && { borderWidth: 2, borderColor: colors.primary },
                selected && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => onSelectDate(day.date)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: day.isCurrentMonth ? colors.text : colors.textSecondary,
                    opacity: day.isCurrentMonth ? 1 : 0.4,
                  },
                  day.isToday && { fontWeight: '700', color: colors.primary },
                ]}
              >
                {day.date.getDate()}
              </Text>

              {/* Marcadores de eventos */}
              <View style={styles.eventMarkers}>
                {day.hasShot && (
                  <View
                    style={[styles.eventDot, { backgroundColor: colors.primary }]}
                  />
                )}
                {day.hasWeight && (
                  <View
                    style={[styles.eventDot, { backgroundColor: colors.textSecondary }]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
  },
  eventMarkers: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 3,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
```

**1.2. Arquivo:** `/components/calendar/DayEventsList.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';
import { router } from 'expo-router';

interface ShotEvent {
  id: string;
  type: 'shot';
  time: Date;
  dosage: number;
  medication: string;
}

interface WeightEvent {
  id: string;
  type: 'weight';
  time: Date;
  weight: number;
  difference?: number;
}

type CalendarEvent = ShotEvent | WeightEvent;

interface DayEventsListProps {
  date: Date;
  events: CalendarEvent[];
  onAddShot: () => void;
  onAddWeight: () => void;
}

export const DayEventsList: React.FC<DayEventsListProps> = ({
  date,
  events,
  onAddShot,
  onAddWeight,
}) => {
  const colors = useShotsyColors();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const sortedEvents = [...events].sort((a, b) => b.time.getTime() - a.time.getTime());

  const renderEvent = (event: CalendarEvent) => {
    if (event.type === 'shot') {
      return (
        <TouchableOpacity
          key={event.id}
          onPress={() => router.push(`/add-application?id=${event.id}`)}
        >
          <ShotsyCard style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                {formatTime(event.time)}
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {event.dosage}mg
                </Text>
              </View>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventIcon}>💉</Text>
              <View style={styles.eventDetails}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>
                  Injeção
                </Text>
                <Text style={[styles.eventSubtitle, { color: colors.textSecondary }]}>
                  {event.medication}
                </Text>
              </View>
            </View>
          </ShotsyCard>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={event.id}
        onPress={() => router.push(`/add-weight?id=${event.id}`)}
      >
        <ShotsyCard style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
              {formatTime(event.time)}
            </Text>
            {event.difference && (
              <View style={styles.differenceContainer}>
                <Text
                  style={[
                    styles.differenceText,
                    { color: event.difference < 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {event.difference > 0 ? '↑' : '↓'} {Math.abs(event.difference).toFixed(1)}kg
                </Text>
              </View>
            )}
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventIcon}>⚖️</Text>
            <View style={styles.eventDetails}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>
                Peso
              </Text>
              <Text style={[styles.eventSubtitle, { color: colors.textSecondary }]}>
                {event.weight} kg
              </Text>
            </View>
          </View>
        </ShotsyCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.dateTitle, { color: colors.text }]}>
        {formatDate(date)}
      </Text>

      {sortedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum evento registrado neste dia
          </Text>
          <View style={styles.emptyButtons}>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={onAddShot}
            >
              <Text style={styles.emptyButtonText}>Adicionar Injeção</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
              onPress={onAddWeight}
            >
              <Text style={[styles.emptyButtonText, { color: colors.text }]}>
                Adicionar Peso
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.eventsList}>
          {sortedEvents.map(renderEvent)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  differenceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  differenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventIcon: {
    fontSize: 24,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButtons: {
    gap: 12,
    width: '100%',
  },
  emptyButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 2. ATUALIZAR TELA PRINCIPAL

**Arquivo:** `/app/(tabs)/calendar-view.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { DayEventsList } from '@/components/calendar/DayEventsList';
import { router } from 'expo-router';

// Mock data - será substituído por dados reais do Supabase
const MOCK_EVENTS = [
  {
    id: '1',
    type: 'shot' as const,
    date: new Date('2025-10-28'),
    time: new Date('2025-10-28T19:30:00'),
    dosage: 10,
    medication: 'Mounjaro',
  },
  {
    id: '2',
    type: 'weight' as const,
    date: new Date('2025-10-28'),
    time: new Date('2025-10-28T08:00:00'),
    weight: 87.5,
    difference: -0.5,
  },
  {
    id: '3',
    type: 'shot' as const,
    date: new Date('2025-10-21'),
    time: new Date('2025-10-21T09:00:00'),
    dosage: 7.5,
    medication: 'Mounjaro',
  },
  {
    id: '4',
    type: 'weight' as const,
    date: new Date('2025-10-21'),
    time: new Date('2025-10-21T08:15:00'),
    weight: 88.0,
    difference: -0.9,
  },
  {
    id: '5',
    type: 'shot' as const,
    date: new Date('2025-10-14'),
    time: new Date('2025-10-14T20:15:00'),
    dosage: 7.5,
    medication: 'Mounjaro',
  },
];

export default function CalendarScreen() {
  const colors = useShotsyColors();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Buscar dados do Supabase
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Filtrar eventos para o calendário (apenas datas)
  const calendarEvents = MOCK_EVENTS.map(event => ({
    date: event.date,
    type: event.type,
  }));

  // Filtrar eventos do dia selecionado
  const selectedDateEvents = MOCK_EVENTS.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return eventDate.getTime() === selected.getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header de Navegação */}
        <View style={styles.header}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToPreviousMonth}
            >
              <Text style={[styles.navButtonText, { color: colors.primary }]}>
                ‹ Anterior
              </Text>
            </TouchableOpacity>

            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {formatMonthYear(currentDate)}
            </Text>

            <TouchableOpacity
              style={styles.navButton}
              onPress={goToNextMonth}
            >
              <Text style={[styles.navButtonText, { color: colors.primary }]}>
                Próximo ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendário Mensal */}
        <MonthCalendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          events={calendarEvents}
        />

        {/* Lista de Eventos do Dia */}
        <DayEventsList
          date={selectedDate}
          events={selectedDateEvents}
          onAddShot={() => router.push('/add-application')}
          onAddWeight={() => router.push('/add-weight')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
```

### 3. ATUALIZAR HEADER DO CALENDÁRIO

**Arquivo:** `/app/(tabs)/_layout.tsx`

Certifique-se que o header do Calendário tem o botão "Hoje":

```typescript
// No TabNavigator, seção calendar-view:
headerRight: () => (
  <View style={{ flexDirection: 'row', gap: 8, marginRight: 16 }}>
    <TouchableOpacity
      onPress={() => {
        // TODO: Implementar navegação para hoje
      }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.card,
        borderRadius: 20,
      }}
    >
      <Text style={{ color: colors.primary, fontWeight: '600' }}>
        Hoje
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.push('/add-application')}>
      <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '300' }}>
        +
      </Text>
    </TouchableOpacity>
  </View>
),
```

## VALIDAÇÃO

**Checklist de Validação:**

- [ ] Tela de Calendário carrega sem erros
- [ ] Calendário mensal renderiza corretamente (7x6 grid)
- [ ] Dias da semana aparecem
- [ ] Dia atual tem borda destacada
- [ ] Dias de outros meses aparecem em cinza claro
- [ ] Marcadores de eventos aparecem:
  - [ ] Bolinha colorida para injeções
  - [ ] Bolinha cinza para pesos
  - [ ] Múltiplos marcadores quando há vários eventos
- [ ] Navegação entre meses funciona:
  - [ ] Botão "< Anterior"
  - [ ] Botão "Próximo >"
  - [ ] Título do mês atualiza
- [ ] Botão "Hoje" volta para mês atual
- [ ] Tap em dia seleciona e mostra eventos
- [ ] Lista de eventos do dia aparece:
  - [ ] Cards de injeções com hora, dosagem
  - [ ] Cards de pesos com hora, valor, diferença
  - [ ] Ordenados por hora (mais recente primeiro)
- [ ] Empty state aparece quando dia não tem eventos
- [ ] Botões de adicionar funcionam no empty state
- [ ] Tap em evento abre tela de edição
- [ ] Pull to refresh funciona
- [ ] Temas aplicados em todos os componentes
- [ ] Dark mode funciona perfeitamente

## PRÓXIMOS PASSOS

Após validação:
- **FASE 9:** Tela de Ajustes (configurações do app)
- **FASE 10:** Integração com Supabase (dados reais)

## OBSERVAÇÕES

- Dados mockados serão substituídos por Supabase
- Calendário mostra 6 semanas (42 dias) para grid completo
- Swipe entre meses pode ser adicionado futuramente
- TODOs marcados para integração futura

---

# FASE 9: TELA DE AJUSTES (SETTINGS)

## CONTEXTO
Esta é a FASE 9 de 15. Vamos criar a tela completa de Ajustes (Settings), que permite ao usuário configurar o app, gerenciar conta, escolher temas, ajustar notificações e acessar informações.

Esta tela é acessada pela tab "Ajustes" (⚙️).

## ANÁLISE DETALHADA DO SHOTSY

**Tela Settings:**

**Layout vertical com 7 seções agrupadas:**

1. **Perfil do Usuário** (Header)
   - Avatar (iniciais ou foto)
   - Nome do usuário
   - Email
   - Botão "Editar Perfil"

2. **Medicação e Metas**
   - Medicação Atual: "Mounjaro 10mg"
   - Frequência: "Semanal"
   - Peso Inicial: "92 kg"
   - Peso Meta: "75 kg"
   - Altura: "175 cm"
   - Botão "Editar Informações"

3. **Aparência**
   - Tema: Seletor com 8 temas (Classic, Ocean, Drizzle, Galaxy, Petal, Sunset, Monster, Phantom)
   - Cor de Destaque: Seletor com 5 cores (Amarelo, Laranja, Rosa, Roxo, Azul)
   - Dark Mode: Toggle

4. **Notificações**
   - Lembrete de Injeção: Toggle + horário
   - Lembrete de Peso: Toggle + horário
   - Conquistas: Toggle
   - Notificações Push: Status de permissão

5. **Dados e Privacidade**
   - Exportar Dados: Botão (CSV ou PDF)
   - Sincronizar com Apple Health: Toggle
   - Backup Automático: Toggle
   - Deletar Todos os Dados: Botão vermelho

6. **Sobre o App**
   - Versão: "1.0.0"
   - Política de Privacidade: Link
   - Termos de Uso: Link
   - Suporte: Link
   - Avaliar App: Link para App Store

7. **Conta**
   - Sair: Botão
   - Deletar Conta: Botão vermelho

**Interações:**

- Toggle switches funcionais
- Seletores de tema com preview
- Modals para edição de perfil e informações
- Confirmações para ações destrutivas
- Feedback visual ao salvar alterações

## TAREFAS

### 1. CRIAR COMPONENTES DE AJUSTES

**1.1. Arquivo:** `/components/settings/SettingsSection.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const colors = useShotsyColors();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
```

**1.2. Arquivo:** `/components/settings/SettingsRow.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';

interface SettingsRowProps {
  label: string;
  value?: string;
  icon?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
  isLast?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  icon,
  onPress,
  showChevron = false,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  destructive = false,
  isLast = false,
}) => {
  const colors = useShotsyColors();

  const content = (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.leftContent}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.label,
            { color: destructive ? '#EF4444' : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {value && (
          <Text style={[styles.value, { color: colors.textSecondary }]}>
            {value}
          </Text>
        )}
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={switchValue ? colors.primary : colors.card}
          />
        )}
        {showChevron && (
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});
```

**1.3. Arquivo:** `/components/settings/UserProfile.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { ShotsyCard } from '@/components/ui/shotsy-card';

interface UserProfileProps {
  name: string;
  email: string;
  onEditPress: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  onEditPress,
}) => {
  const colors = useShotsyColors();

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <ShotsyCard style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.initials}>{getInitials(name)}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={onEditPress}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </ShotsyCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

**1.4. Arquivo:** `/components/settings/ThemeSelector.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { SHOTSY_THEMES } from '@/constants/theme';

export const ThemeSelector: React.FC = () => {
  const colors = useShotsyColors();
  const { theme, setTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Tema</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.themesContainer}
      >
        {Object.entries(SHOTSY_THEMES).map(([key, themeData]) => {
          const isSelected = theme === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.themeOption,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setTheme(key as any)}
            >
              <View
                style={[
                  styles.themePreview,
                  { backgroundColor: themeData.colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.themeName,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
              >
                {themeData.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  themesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  themeOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  themePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

**1.5. Arquivo:** `/components/settings/AccentColorSelector.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';

const ACCENT_COLORS = [
  { name: 'Amarelo', color: '#FBBF24' },
  { name: 'Laranja', color: '#F97316' },
  { name: 'Rosa', color: '#EC4899' },
  { name: 'Roxo', color: '#A855F7' },
  { name: 'Azul', color: '#0891B2' },
];

export const AccentColorSelector: React.FC = () => {
  const colors = useShotsyColors();
  const { accentColor, setAccentColor } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Cor de Destaque
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorsContainer}
      >
        {ACCENT_COLORS.map((accent) => {
          const isSelected = accentColor === accent.color;
          return (
            <TouchableOpacity
              key={accent.name}
              style={[
                styles.colorOption,
                {
                  borderColor: isSelected ? accent.color : colors.border,
                  borderWidth: isSelected ? 3 : 1,
                },
              ]}
              onPress={() => setAccentColor(accent.color)}
            >
              <View
                style={[styles.colorCircle, { backgroundColor: accent.color }]}
              />
              <Text
                style={[
                  styles.colorName,
                  { color: isSelected ? colors.text : colors.textSecondary },
                ]}
              >
                {accent.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  colorsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  colorOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

### 2. ATUALIZAR TELA PRINCIPAL

**Arquivo:** `/app/(tabs)/settings.tsx`

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { UserProfile } from '@/components/settings/UserProfile';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { AccentColorSelector } from '@/components/settings/AccentColorSelector';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const colors = useShotsyColors();
  const { isDarkMode, setIsDarkMode } = useTheme();

  // Mock data - será substituído por dados reais
  const [userData, setUserData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    medication: 'Mounjaro',
    currentDose: '10mg',
    frequency: 'Semanal',
    startWeight: 92,
    targetWeight: 75,
    height: 175,
  });

  const [notifications, setNotifications] = useState({
    shotReminder: true,
    shotReminderTime: '09:00',
    weightReminder: true,
    weightReminderTime: '08:00',
    achievements: true,
  });

  const [dataSettings, setDataSettings] = useState({
    syncAppleHealth: false,
    autoBackup: true,
  });

  const handleEditProfile = () => {
    // TODO: Abrir modal de edição de perfil
    Alert.alert('Editar Perfil', 'Funcionalidade em desenvolvimento');
  };

  const handleEditMedication = () => {
    // TODO: Abrir modal de edição de medicação
    Alert.alert('Editar Informações', 'Funcionalidade em desenvolvimento');
  };

  const handleExportData = (format: 'csv' | 'pdf') => {
    // TODO: Implementar exportação
    Alert.alert('Exportar Dados', `Exportando em formato ${format.toUpperCase()}`);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Deletar Todos os Dados',
      'Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente deletados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar deleção
            Alert.alert('Dados deletados');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          // TODO: Implementar logout
          router.replace('/onboarding/welcome');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deletar Conta',
      'Esta ação não pode ser desfeita. Sua conta e todos os dados serão permanentemente deletados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar Conta',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar deleção de conta
            Alert.alert('Conta deletada');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.content}>
          {/* Perfil do Usuário */}
          <UserProfile
            name={userData.name}
            email={userData.email}
            onEditPress={handleEditProfile}
          />

          {/* Medicação e Metas */}
          <SettingsSection title="Medicação e Metas">
            <SettingsRow
              label="Medicação Atual"
              value={`${userData.medication} ${userData.currentDose}`}
              icon="💉"
              showChevron
              onPress={handleEditMedication}
            />
            <SettingsRow
              label="Frequência"
              value={userData.frequency}
              icon="📅"
              showChevron
              onPress={handleEditMedication}
            />
            <SettingsRow
              label="Peso Inicial"
              value={`${userData.startWeight} kg`}
              icon="⚖️"
              showChevron
              onPress={handleEditMedication}
            />
            <SettingsRow
              label="Peso Meta"
              value={`${userData.targetWeight} kg`}
              icon="🎯"
              showChevron
              onPress={handleEditMedication}
            />
            <SettingsRow
              label="Altura"
              value={`${userData.height} cm`}
              icon="📏"
              showChevron
              onPress={handleEditMedication}
              isLast
            />
          </SettingsSection>

          {/* Aparência */}
          <SettingsSection title="Aparência">
            <ThemeSelector />
            <AccentColorSelector />
            <SettingsRow
              label="Dark Mode"
              icon="🌙"
              showSwitch
              switchValue={isDarkMode}
              onSwitchChange={setIsDarkMode}
              isLast
            />
          </SettingsSection>

          {/* Notificações */}
          <SettingsSection title="Notificações">
            <SettingsRow
              label="Lembrete de Injeção"
              value={notifications.shotReminderTime}
              icon="💉"
              showSwitch
              switchValue={notifications.shotReminder}
              onSwitchChange={(value) =>
                setNotifications({ ...notifications, shotReminder: value })
              }
            />
            <SettingsRow
              label="Lembrete de Peso"
              value={notifications.weightReminderTime}
              icon="⚖️"
              showSwitch
              switchValue={notifications.weightReminder}
              onSwitchChange={(value) =>
                setNotifications({ ...notifications, weightReminder: value })
              }
            />
            <SettingsRow
              label="Conquistas"
              icon="🏆"
              showSwitch
              switchValue={notifications.achievements}
              onSwitchChange={(value) =>
                setNotifications({ ...notifications, achievements: value })
              }
              isLast
            />
          </SettingsSection>

          {/* Dados e Privacidade */}
          <SettingsSection title="Dados e Privacidade">
            <SettingsRow
              label="Exportar como CSV"
              icon="📄"
              showChevron
              onPress={() => handleExportData('csv')}
            />
            <SettingsRow
              label="Exportar como PDF"
              icon="📊"
              showChevron
              onPress={() => handleExportData('pdf')}
            />
            <SettingsRow
              label="Sincronizar com Apple Health"
              icon="❤️"
              showSwitch
              switchValue={dataSettings.syncAppleHealth}
              onSwitchChange={(value) =>
                setDataSettings({ ...dataSettings, syncAppleHealth: value })
              }
            />
            <SettingsRow
              label="Backup Automático"
              icon="☁️"
              showSwitch
              switchValue={dataSettings.autoBackup}
              onSwitchChange={(value) =>
                setDataSettings({ ...dataSettings, autoBackup: value })
              }
            />
            <SettingsRow
              label="Deletar Todos os Dados"
              icon="🗑️"
              showChevron
              onPress={handleDeleteAllData}
              destructive
              isLast
            />
          </SettingsSection>

          {/* Sobre o App */}
          <SettingsSection title="Sobre o App">
            <SettingsRow label="Versão" value="1.0.0" icon="ℹ️" />
            <SettingsRow
              label="Política de Privacidade"
              icon="🔒"
              showChevron
              onPress={() => Alert.alert('Política de Privacidade')}
            />
            <SettingsRow
              label="Termos de Uso"
              icon="📜"
              showChevron
              onPress={() => Alert.alert('Termos de Uso')}
            />
            <SettingsRow
              label="Suporte"
              icon="💬"
              showChevron
              onPress={() => Alert.alert('Suporte')}
            />
            <SettingsRow
              label="Avaliar App"
              icon="⭐"
              showChevron
              onPress={() => Alert.alert('Avaliar App')}
              isLast
            />
          </SettingsSection>

          {/* Conta */}
          <SettingsSection title="Conta">
            <SettingsRow
              label="Sair"
              icon="🚪"
              showChevron
              onPress={handleLogout}
            />
            <SettingsRow
              label="Deletar Conta"
              icon="⚠️"
              showChevron
              onPress={handleDeleteAccount}
              destructive
              isLast
            />
          </SettingsSection>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
```

## VALIDAÇÃO

**Checklist de Validação:**

- [ ] Tela de Ajustes carrega sem erros
- [ ] Perfil do usuário aparece com avatar e informações
- [ ] Botão "Editar Perfil" funciona
- [ ] Seção "Medicação e Metas" mostra todos os dados
- [ ] Seção "Aparência" funciona:
  - [ ] Seletor de temas renderiza todos os 8 temas
  - [ ] Tap em tema aplica o tema
  - [ ] Seletor de accent color renderiza 5 cores
  - [ ] Tap em cor aplica a cor
  - [ ] Toggle de Dark Mode funciona
- [ ] Seção "Notificações" funciona:
  - [ ] Toggles respondem corretamente
  - [ ] Horários aparecem quando toggle ativado
- [ ] Seção "Dados e Privacidade" funciona:
  - [ ] Botões de exportar mostram alerta
  - [ ] Toggles respondem corretamente
  - [ ] Botão de deletar dados mostra confirmação
- [ ] Seção "Sobre o App" mostra informações corretas
- [ ] Seção "Conta" funciona:
  - [ ] Botão "Sair" mostra confirmação
  - [ ] Botão "Deletar Conta" mostra confirmação
- [ ] Todos os alertas de confirmação aparecem
- [ ] Temas aplicados em todos os componentes
- [ ] Dark mode funciona perfeitamente
- [ ] Scroll funciona suavemente

## PRÓXIMOS PASSOS

Após validação:
- **FASE 10:** Integração com Supabase (banco de dados real)
- **FASE 11:** Tela de Peso (adicionar/editar)
- **FASE 12:** Sistema de Conquistas

## OBSERVAÇÕES

- Dados mockados serão substituídos por Supabase
- Exportação de dados requer implementação de geração de PDF/CSV
- Integração com Apple Health requer configuração específica
- TODOs marcados para integração futura

---

# FASE 10: INTEGRAÇÃO COM SUPABASE

## CONTEXTO
Esta é a FASE 10 de 15. Vamos integrar o app com o Supabase para persistir todos os dados reais: injeções, pesos, perfil do usuário, configurações, etc.

Esta fase substitui todos os dados mockados por dados reais do banco de dados.

## ESTRUTURA DO BANCO DE DADOS

### Tabelas Necessárias:

**1. profiles**
- id (uuid, PK, FK para auth.users)
- name (text)
- email (text)
- height (numeric)
- start_weight (numeric)
- target_weight (numeric)
- medication (text)
- current_dose (numeric)
- frequency (text)
- created_at (timestamp)
- updated_at (timestamp)

**2. applications (injeções)**
- id (uuid, PK)
- user_id (uuid, FK para profiles)
- date (timestamp)
- dosage (numeric)
- injection_sites (text[])
- side_effects (text[])
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

**3. weights**
- id (uuid, PK)
- user_id (uuid, FK para profiles)
- date (timestamp)
- weight (numeric)
- notes (text, nullable)
- created_at (timestamp)

**4. settings**
- id (uuid, PK)
- user_id (uuid, FK para profiles)
- theme (text)
- accent_color (text)
- dark_mode (boolean)
- shot_reminder (boolean)
- shot_reminder_time (time)
- weight_reminder (boolean)
- weight_reminder_time (time)
- achievements_notifications (boolean)
- sync_apple_health (boolean)
- auto_backup (boolean)
- created_at (timestamp)
- updated_at (timestamp)

## TAREFAS

### 1. CRIAR SCHEMA NO SUPABASE

**1.1. SQL Migration:**

Crie um novo arquivo de migração no Supabase:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  height NUMERIC(5, 2),
  start_weight NUMERIC(5, 2),
  target_weight NUMERIC(5, 2),
  medication TEXT,
  current_dose NUMERIC(4, 1),
  frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  dosage NUMERIC(4, 1) NOT NULL,
  injection_sites TEXT[] NOT NULL,
  side_effects TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weights table
CREATE TABLE IF NOT EXISTS public.weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  weight NUMERIC(5, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'classic',
  accent_color TEXT DEFAULT '#0891B2',
  dark_mode BOOLEAN DEFAULT FALSE,
  shot_reminder BOOLEAN DEFAULT TRUE,
  shot_reminder_time TIME DEFAULT '09:00:00',
  weight_reminder BOOLEAN DEFAULT TRUE,
  weight_reminder_time TIME DEFAULT '08:00:00',
  achievements_notifications BOOLEAN DEFAULT TRUE,
  sync_apple_health BOOLEAN DEFAULT FALSE,
  auto_backup BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_date ON public.applications(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_weights_user_date ON public.weights(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for weights
CREATE POLICY "Users can view own weights"
  ON public.weights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weights"
  ON public.weights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weights"
  ON public.weights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weights"
  ON public.weights FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for settings
CREATE POLICY "Users can view own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. CRIAR HOOKS DO SUPABASE

**2.1. Arquivo:** `/hooks/useProfile.ts`

```typescript
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  height?: number;
  start_weight?: number;
  target_weight?: number;
  medication?: string;
  current_dose?: number;
  frequency?: string;
}

export const useProfile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;
      await fetchProfile();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const createProfile = async (profileData: Omit<UserProfile, 'id'>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{ id: user?.id, ...profileData }]);

      if (error) throw error;
      await fetchProfile();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refetch: fetchProfile,
  };
};
```

**2.2. Arquivo:** `/hooks/useApplications.ts`

```typescript
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';

export interface Application {
  id: string;
  user_id: string;
  date: Date;
  dosage: number;
  injection_sites: string[];
  side_effects: string[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export const useApplications = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Parse dates
      const parsedData = data.map(app => ({
        ...app,
        date: new Date(app.date),
        created_at: new Date(app.created_at),
        updated_at: new Date(app.updated_at),
      }));
      
      setApplications(parsedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: Omit<Application, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          user_id: user?.id,
          ...applicationData,
        }]);

      if (error) throw error;
      await fetchApplications();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchApplications();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchApplications();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    refetch: fetchApplications,
  };
};
```

**2.3. Arquivo:** `/hooks/useWeights.ts`

```typescript
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';

export interface Weight {
  id: string;
  user_id: string;
  date: Date;
  weight: number;
  notes?: string;
  created_at: Date;
}

export const useWeights = () => {
  const { user } = useUser();
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchWeights();
    }
  }, [user]);

  const fetchWeights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weights')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Parse dates
      const parsedData = data.map(weight => ({
        ...weight,
        date: new Date(weight.date),
        created_at: new Date(weight.created_at),
      }));
      
      setWeights(parsedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createWeight = async (weightData: Omit<Weight, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('weights')
        .insert([{
          user_id: user?.id,
          ...weightData,
        }]);

      if (error) throw error;
      await fetchWeights();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateWeight = async (id: string, updates: Partial<Weight>) => {
    try {
      const { error } = await supabase
        .from('weights')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchWeights();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteWeight = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchWeights();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    weights,
    loading,
    error,
    createWeight,
    updateWeight,
    deleteWeight,
    refetch: fetchWeights,
  };
};
```

**2.4. Arquivo:** `/hooks/useSettings.ts`

```typescript
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  accent_color: string;
  dark_mode: boolean;
  shot_reminder: boolean;
  shot_reminder_time: string;
  weight_reminder: boolean;
  weight_reminder_time: string;
  achievements_notifications: boolean;
  sync_apple_health: boolean;
  auto_backup: boolean;
}

export const useSettings = () => {
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        // Se não houver settings, criar com valores default
        if (error.code === 'PGRST116') {
          await createSettings();
        } else {
          throw error;
        }
      } else {
        setSettings(data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createSettings = async () => {
    try {
      const defaultSettings = {
        user_id: user?.id,
        theme: 'classic',
        accent_color: '#0891B2',
        dark_mode: false,
        shot_reminder: true,
        shot_reminder_time: '09:00:00',
        weight_reminder: true,
        weight_reminder_time: '08:00:00',
        achievements_notifications: true,
        sync_apple_health: false,
        auto_backup: true,
      };

      const { data, error } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchSettings();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};
```

### 3. ATUALIZAR TELAS PARA USAR HOOKS

**3.1. Atualizar `/app/(tabs)/shots.tsx`:**

Substituir dados mockados:

```typescript
// Substituir MOCK_SHOTS por:
import { useApplications } from '@/hooks/useApplications';

// No componente:
const { applications, loading, deleteApplication, refetch } = useApplications();

// Substituir shots por applications
const filteredShots = useMemo(() => {
  // ... usar applications em vez de shots
}, [applications, selectedFilter]);
```

**3.2. Atualizar `/app/(tabs)/results.tsx`:**

Substituir dados mockados:

```typescript
import { useWeights } from '@/hooks/useWeights';
import { useApplications } from '@/hooks/useApplications';
import { useProfile } from '@/hooks/useProfile';

// No componente:
const { weights, loading: weightsLoading } = useWeights();
const { applications, loading: appsLoading } = useApplications();
const { profile } = useProfile();

// Usar dados reais nos gráficos
```

**3.3. Atualizar `/app/(tabs)/settings.tsx`:**

Substituir dados mockados:

```typescript
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';

// No componente:
const { profile, updateProfile } = useProfile();
const { settings, updateSettings } = useSettings();

// Usar profile e settings reais
```

### 4. ATUALIZAR THEME CONTEXT PARA SINCRONIZAR COM SUPABASE

**Arquivo:** `/lib/theme-context.tsx`

Adicionar sincronização:

```typescript
import { useSettings } from '@/hooks/useSettings';

// No ThemeProvider:
const { settings, updateSettings } = useSettings();

// Sincronizar tema
useEffect(() => {
  if (settings) {
    setTheme(settings.theme);
    setAccentColor(settings.accent_color);
    setIsDarkMode(settings.dark_mode);
  }
}, [settings]);

// Ao mudar tema, salvar no Supabase
const setTheme = async (newTheme: string) => {
  await updateSettings({ theme: newTheme });
  // ... resto do código
};
```

## VALIDAÇÃO

**Checklist de Validação:**

- [ ] Schema criado no Supabase sem erros
- [ ] Todas as tabelas existem
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS funcionando
- [ ] Hooks criados e exportados corretamente
- [ ] useProfile funciona:
  - [ ] Busca perfil do usuário
  - [ ] Cria perfil novo
  - [ ] Atualiza perfil
- [ ] useApplications funciona:
  - [ ] Lista todas as injeções
  - [ ] Cria nova injeção
  - [ ] Atualiza injeção
  - [ ] Deleta injeção
- [ ] useWeights funciona:
  - [ ] Lista todos os pesos
  - [ ] Cria novo peso
  - [ ] Atualiza peso
  - [ ] Deleta peso
- [ ] useSettings funciona:
  - [ ] Busca configurações
  - [ ] Cria configurações default
  - [ ] Atualiza configurações
- [ ] Telas atualizadas usam hooks:
  - [ ] Tela de Shots usa dados reais
  - [ ] Tela de Results usa dados reais
  - [ ] Tela de Settings usa dados reais
  - [ ] Tela de Calendar usa dados reais
- [ ] Tema sincroniza com Supabase
- [ ] Loading states aparecem corretamente
- [ ] Errors são tratados
- [ ] Dados persistem após fechar app
- [ ] Múltiplos usuários têm dados isolados (RLS)

## PRÓXIMOS PASSOS

Após validação:
- **FASE 11:** Tela de Adicionar/Editar Peso
- **FASE 12:** Sistema de Conquistas
- **FASE 13:** Notificações Push
- **FASE 14:** Integração com Apple Health
- **FASE 15:** Polimento Final

## OBSERVAÇÕES IMPORTANTES

- **RLS é crítico:** Garante isolamento de dados entre usuários
- **Indexes melhoram performance:** Especialmente em queries por data
- **Triggers mantêm updated_at:** Automação importante
- **Default values:** Settings tem defaults sensatos
- **Error handling:** Todos os hooks tratam erros
- **Loading states:** UX melhor durante fetches
- **TypeScript types:** Interfaces bem definidas
- **Supabase + Clerk:** Integração via user.id

---

## 🎯 RESUMO DAS 3 FASES

- **FASE 8:** Calendário mensal com visualização de eventos
- **FASE 9:** Tela de Ajustes completa com temas e configurações
- **FASE 10:** Integração total com Supabase (banco de dados real)

Estas 3 fases completam as telas principais e trazem persistência de dados! 🚀
