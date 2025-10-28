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


