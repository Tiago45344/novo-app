import { supabase } from './supabase';

// Registrar novo usuário
export async function signUp(email: string, password: string, name: string, phone: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (authError) throw authError;

    // Criar perfil do usuário
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email,
          name,
          phone,
        });

      if (profileError) throw profileError;
    }

    return { data: authData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Login
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Logout
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Obter usuário atual
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

// Verificar se usuário tem assinatura ativa
export async function hasActiveSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return { hasSubscription: !!data, subscription: data, error: null };
  } catch (error) {
    return { hasSubscription: false, subscription: null, error };
  }
}

// Criar ou atualizar assinatura
export async function upsertSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  status: string,
  priceId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status,
        price_id: priceId,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Salvar respostas do quiz
export async function saveQuizResponse(userId: string, quizData: any) {
  try {
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        user_id: userId,
        using_glp1: quizData.usingGLP1,
        medication: quizData.medication,
        current_dose: quizData.currentDose,
        application_frequency: quizData.applicationFrequency,
        gender: quizData.gender,
        birth_date: `${quizData.birthYear}-${quizData.birthMonth.padStart(2, '0')}-${quizData.birthDay.padStart(2, '0')}`,
        height: parseFloat(quizData.measurements.height),
        weight: parseFloat(quizData.measurements.weight),
        waist: quizData.measurements.waist ? parseFloat(quizData.measurements.waist) : null,
        protocol_start_date: `${quizData.protocolStartYear}-${quizData.protocolStartMonth.padStart(2, '0')}-${quizData.protocolStartDay.padStart(2, '0')}`,
        starting_weight: parseFloat(quizData.startingWeight),
        target_weight: parseFloat(quizData.targetWeight),
        goal_speed: quizData.goalSpeed,
        activity_level: quizData.activityLevel,
        strongest_craving_day: quizData.strongestCravingDay,
        main_side_effect: quizData.mainSideEffect,
        motivation: quizData.motivation,
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Salvar registro de peso
export async function saveWeightRecord(userId: string, date: string, weight: number, notes?: string) {
  try {
    const { data, error } = await supabase
      .from('weight_records')
      .insert({
        user_id: userId,
        date,
        weight,
        notes,
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Salvar registro de medicação
export async function saveMedicationRecord(
  userId: string,
  date: string,
  medication: string,
  dosage: string,
  time: string,
  notes?: string
) {
  try {
    const { data, error } = await supabase
      .from('medication_records')
      .insert({
        user_id: userId,
        date,
        medication,
        dosage,
        time,
        notes,
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Salvar registro de hábitos
export async function saveHabitRecord(
  userId: string,
  date: string,
  waterIntake: number,
  exercise: boolean,
  sleep: number,
  mood: string,
  exerciseMinutes?: number,
  notes?: string
) {
  try {
    const { data, error } = await supabase
      .from('habit_records')
      .insert({
        user_id: userId,
        date,
        water_intake: waterIntake,
        exercise,
        exercise_minutes: exerciseMinutes,
        sleep,
        mood,
        notes,
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Buscar registros de peso do usuário
export async function getWeightRecords(userId: string) {
  try {
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Buscar registros de medicação do usuário
export async function getMedicationRecords(userId: string) {
  try {
    const { data, error } = await supabase
      .from('medication_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Buscar registros de hábitos do usuário
export async function getHabitRecords(userId: string) {
  try {
    const { data, error } = await supabase
      .from('habit_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Buscar resposta do quiz do usuário
export async function getQuizResponse(userId: string) {
  try {
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
