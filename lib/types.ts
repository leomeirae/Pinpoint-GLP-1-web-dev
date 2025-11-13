// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Medication types
export type MedicationType = 'mounjaro' | 'ozempic' | 'saxenda' | 'wegovy' | 'zepbound';

export interface Medication {
  id: string;
  user_id: string;
  type: MedicationType;
  dosage: number;
  frequency: 'weekly' | 'daily';
  start_date: string;
  end_date: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InsertMedication = Omit<
  Medication,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'end_date' | 'active' | 'notes'
> & {
  end_date?: string | null;
  active?: boolean;
  notes?: string | null;
};

export type UpdateMedication = Partial<
  Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

// Weight types
export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InsertWeightLog = Omit<
  WeightLog,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'unit'
> & {
  unit?: 'kg' | 'lbs';
};

export type UpdateWeightLog = Partial<
  Omit<WeightLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

// Side effect types
export interface SideEffect {
  id: string;
  user_id: string;
  medication_id: string | null;
  type: string;
  severity: 1 | 2 | 3 | 4 | 5;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InsertSideEffect = Omit<
  SideEffect,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'medication_id'
> & {
  medication_id?: string | null;
};

export type UpdateSideEffect = Partial<
  Omit<SideEffect, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

// Achievement types
export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  created_at: string;
}

export type InsertAchievement = Omit<Achievement, 'id' | 'user_id' | 'earned_at' | 'created_at'>;

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

export type InsertMedicationApplication = Omit<
  MedicationApplication,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'application_time' | 'notes'
> & {
  application_time?: string | null;
  notes?: string | null;
};

export type UpdateMedicationApplication = Partial<
  Omit<MedicationApplication, 'id' | 'user_id' | 'medication_id' | 'created_at' | 'updated_at'>
>;

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
