// Sistema de persistência local
import { DiaryData, WeightEntry, MedicationEntry, HabitEntry } from './types';

const STORAGE_KEY = 'glp1-diary-data';

export const storage = {
  // Carregar dados
  loadData(): DiaryData {
    if (typeof window === 'undefined') {
      return { weights: [], medications: [], habits: [] };
    }
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    
    return { weights: [], medications: [], habits: [] };
  },

  // Salvar dados
  saveData(data: DiaryData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  },

  // Adicionar peso
  addWeight(entry: Omit<WeightEntry, 'id'>): void {
    const data = this.loadData();
    const newEntry: WeightEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    data.weights.unshift(newEntry);
    this.saveData(data);
  },

  // Adicionar medicamento
  addMedication(entry: Omit<MedicationEntry, 'id'>): void {
    const data = this.loadData();
    const newEntry: MedicationEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    data.medications.unshift(newEntry);
    this.saveData(data);
  },

  // Adicionar hábito
  addHabit(entry: Omit<HabitEntry, 'id'>): void {
    const data = this.loadData();
    const newEntry: HabitEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    data.habits.unshift(newEntry);
    this.saveData(data);
  },

  // Deletar entrada
  deleteWeight(id: string): void {
    const data = this.loadData();
    data.weights = data.weights.filter(w => w.id !== id);
    this.saveData(data);
  },

  deleteMedication(id: string): void {
    const data = this.loadData();
    data.medications = data.medications.filter(m => m.id !== id);
    this.saveData(data);
  },

  deleteHabit(id: string): void {
    const data = this.loadData();
    data.habits = data.habits.filter(h => h.id !== id);
    this.saveData(data);
  },
};
