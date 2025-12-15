// Cliente Supabase - STUB para evitar erros de build
// Este arquivo fornece funções mock até que o Supabase seja configurado corretamente

const isBrowser = typeof window !== 'undefined'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificar se Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO (MOCK)
// ============================================

// Cadastrar novo usuário
export async function signUp(email: string, password: string, name?: string) {
  console.warn('Supabase não está configurado. Configure as variáveis de ambiente.')
  throw new Error('Supabase não está configurado')
}

// Login
export async function signIn(email: string, password: string) {
  console.warn('Supabase não está configurado. Configure as variáveis de ambiente.')
  throw new Error('Supabase não está configurado')
}

// Logout
export async function signOut() {
  console.warn('Supabase não está configurado. Configure as variáveis de ambiente.')
  throw new Error('Supabase não está configurado')
}

// Obter usuário atual
export async function getCurrentUser() {
  return null
}

// Obter sessão atual
export async function getSession() {
  return null
}

// Verificar se usuário está autenticado
export async function isAuthenticated() {
  return false
}

// Exportar função para obter cliente (stub)
export async function supabase() {
  return null
}

// ============================================
// TIPOS PARA O BANCO DE DADOS
// ============================================

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string | null
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_payment_intent_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  price_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface QuizResponse {
  id: string
  user_id: string
  using_glp1: string
  medication: string
  current_dose: string
  application_frequency: string
  gender: string
  birth_date: string
  height: number
  weight: number
  waist?: number
  protocol_start_date: string
  starting_weight: number
  target_weight: number
  goal_speed: string
  activity_level: string
  strongest_craving_day: string
  main_side_effect: string
  motivation: string
  created_at: string
  updated_at: string
}

export interface WeightRecord {
  id: string
  user_id: string
  date: string
  weight: number
  notes?: string
  created_at: string
}

export interface MedicationRecord {
  id: string
  user_id: string
  date: string
  medication: string
  dosage: string
  time: string
  notes?: string
  created_at: string
}

export interface HabitRecord {
  id: string
  user_id: string
  date: string
  water_intake: number
  exercise: boolean
  exercise_minutes?: number
  sleep: number
  mood: string
  notes?: string
  created_at: string
}
