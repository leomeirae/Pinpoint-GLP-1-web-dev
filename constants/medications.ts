// constants/medications.ts
// Fallback local para configuração de medicamentos (usado quando Remote Config não está disponível)

export interface MedicationConfig {
  id: string;
  name: string; // "Mounjaro", "Ozempic", etc.
  genericName: string; // "Tirzepatida", "Semaglutida"
  availableDoses: number[]; // [2.5, 5, 7.5, 10, 12.5, 15]
  unit: 'mg' | 'mL';
  frequency: 'weekly' | 'daily';
  featured: boolean; // destaque no onboarding
  enabled: boolean; // ativo/inativo
}

// Configuração padrão local (fallback)
export const DEFAULT_MEDICATION_CONFIGS: MedicationConfig[] = [
  {
    id: 'mounjaro',
    name: 'Mounjaro',
    genericName: 'Tirzepatida',
    availableDoses: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: 'mg',
    frequency: 'weekly',
    featured: true,
    enabled: true,
  },
  {
    id: 'retatrutida',
    name: 'Retatrutida',
    genericName: 'Retatrutida',
    availableDoses: [2, 4, 6, 8, 10, 12],
    unit: 'mg',
    frequency: 'weekly',
    featured: true,
    enabled: true,
  },
  {
    id: 'ozempic',
    name: 'Ozempic',
    genericName: 'Semaglutida',
    availableDoses: [0.25, 0.5, 1, 2],
    unit: 'mg',
    frequency: 'weekly',
    featured: false,
    enabled: true,
  },
  {
    id: 'saxenda',
    name: 'Saxenda',
    genericName: 'Liraglutida',
    availableDoses: [0.6, 1.2, 1.8, 2.4, 3.0],
    unit: 'mg',
    frequency: 'daily',
    featured: false,
    enabled: true,
  },
  {
    id: 'wegovy',
    name: 'Wegovy',
    genericName: 'Semaglutida',
    availableDoses: [0.25, 0.5, 1, 1.7, 2.4],
    unit: 'mg',
    frequency: 'weekly',
    featured: false,
    enabled: true,
  },
  {
    id: 'zepbound',
    name: 'Zepbound',
    genericName: 'Tirzepatida',
    availableDoses: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: 'mg',
    frequency: 'weekly',
    featured: false,
    enabled: true,
  },
];

// Helper para buscar medicamento por ID
export function getMedicationById(id: string): MedicationConfig | undefined {
  return DEFAULT_MEDICATION_CONFIGS.find((med) => med.id === id);
}

// Helper para buscar medicamentos destacados (featured)
export function getFeaturedMedications(): MedicationConfig[] {
  return DEFAULT_MEDICATION_CONFIGS.filter((med) => med.featured && med.enabled);
}

// Helper para buscar medicamentos habilitados
export function getEnabledMedications(): MedicationConfig[] {
  return DEFAULT_MEDICATION_CONFIGS.filter((med) => med.enabled);
}

