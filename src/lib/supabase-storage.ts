import { supabase } from './supabase';

// Helper para salvar dados do usuário no Supabase
export const supabaseStorage = {
  // Salvar respostas do quiz
  async saveQuizResponses(userId: string, quizData: any) {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .upsert([
          {
            user_id: userId,
            using_glp1: quizData.usingGLP1,
            medication: quizData.medication,
            current_dose: quizData.currentDose,
            application_frequency: quizData.applicationFrequency,
            gender: quizData.gender,
            birth_date: `${quizData.birthYear}-${String(quizData.birthMonth).padStart(2, '0')}-${String(quizData.birthDay).padStart(2, '0')}`,
            height: parseFloat(quizData.measurements.height),
            weight: parseFloat(quizData.measurements.weight),
            waist: quizData.measurements.waist ? parseFloat(quizData.measurements.waist) : null,
            protocol_start_date: `${quizData.protocolStartYear}-${String(quizData.protocolStartMonth).padStart(2, '0')}-${String(quizData.protocolStartDay).padStart(2, '0')}`,
            starting_weight: parseFloat(quizData.startingWeight),
            target_weight: parseFloat(quizData.targetWeight),
            goal_speed: quizData.goalSpeed,
            activity_level: quizData.activityLevel,
            strongest_craving_day: quizData.strongestCravingDay,
            main_side_effect: quizData.mainSideEffect,
            motivation: quizData.motivation,
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao salvar quiz:', error);
      return { success: false, error };
    }
  },

  // Adicionar registro de peso
  async addWeight(userId: string, weightData: { date: string; weight: number; notes?: string }) {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert([
          {
            user_id: userId,
            date: weightData.date,
            weight: weightData.weight,
            notes: weightData.notes || null,
          },
        ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar peso:', error);
      return { success: false, error };
    }
  },

  // Buscar registros de peso
  async getWeights(userId: string) {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar pesos:', error);
      return { success: false, error };
    }
  },

  // Adicionar registro de medicação
  async addMedication(userId: string, medData: { date: string; medication: string; dosage: string; time: string; notes?: string }) {
    try {
      const { data, error } = await supabase
        .from('medication_records')
        .insert([
          {
            user_id: userId,
            date: medData.date,
            medication: medData.medication,
            dosage: medData.dosage,
            time: medData.time,
            notes: medData.notes || null,
          },
        ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar medicação:', error);
      return { success: false, error };
    }
  },

  // Buscar registros de medicação
  async getMedications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('medication_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar medicações:', error);
      return { success: false, error };
    }
  },

  // Adicionar registro de hábitos
  async addHabit(userId: string, habitData: { 
    date: string; 
    waterIntake: number; 
    exercise: boolean; 
    exerciseMinutes?: number; 
    sleep: number; 
    mood: string; 
    notes?: string 
  }) {
    try {
      const { data, error } = await supabase
        .from('habit_records')
        .insert([
          {
            user_id: userId,
            date: habitData.date,
            water_intake: habitData.waterIntake,
            exercise: habitData.exercise,
            exercise_minutes: habitData.exerciseMinutes || null,
            sleep: habitData.sleep,
            mood: habitData.mood,
            notes: habitData.notes || null,
          },
        ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error);
      return { success: false, error };
    }
  },

  // Buscar registros de hábitos
  async getHabits(userId: string) {
    try {
      const { data, error } = await supabase
        .from('habit_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar hábitos:', error);
      return { success: false, error };
    }
  },

  // Salvar assinatura
  async saveSubscription(userId: string, subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePaymentIntentId?: string;
    status: string;
    priceId?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert([
          {
            user_id: userId,
            stripe_customer_id: subscriptionData.stripeCustomerId || null,
            stripe_subscription_id: subscriptionData.stripeSubscriptionId || null,
            stripe_payment_intent_id: subscriptionData.stripePaymentIntentId || null,
            status: subscriptionData.status,
            price_id: subscriptionData.priceId || null,
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      return { success: false, error };
    }
  },

  // Verificar se usuário tem assinatura ativa
  async hasActiveSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { success: true, hasSubscription: !!data };
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return { success: false, hasSubscription: false };
    }
  },
};
