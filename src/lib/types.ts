// Tipos para o diário digital

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

export interface MedicationEntry {
  id: string;
  date: string;
  medication: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'outro';
  dosage: string;
  time: string;
  notes?: string;
}

export interface HabitEntry {
  id: string;
  date: string;
  waterIntake: number; // copos de água
  exercise: boolean;
  exerciseMinutes?: number;
  sleep: number; // horas
  mood: 'excelente' | 'bom' | 'regular' | 'ruim';
  notes?: string;
}

export interface DiaryData {
  weights: WeightEntry[];
  medications: MedicationEntry[];
  habits: HabitEntry[];
}
