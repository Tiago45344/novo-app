'use client';

import { useState, useEffect } from 'react';
import { Scale, Pill, Heart, TrendingDown, Calendar, Plus, Trash2, Droplet, Moon, Dumbbell, Smile, Activity, Target, Award, ArrowRight, CheckCircle2, CreditCard, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { DiaryData, WeightEntry, MedicationEntry, HabitEntry } from '@/lib/types';

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(true);
  const [quizStep, setQuizStep] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizData, setQuizData] = useState({
    usingGLP1: '',
    medication: '',
    currentDose: '',
    applicationFrequency: '',
    gender: '',
    birthDate: '',
    measurements: { height: '', weight: '', waist: '' },
    protocolStartDate: '',
    startingWeight: '',
    targetWeight: '',
    goalSpeed: '',
    activityLevel: '',
    strongestCravingDay: '',
    mainSideEffect: '',
    motivation: '',
    name: '',
    email: '',
    phone: ''
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'weight' | 'medication' | 'habits'>('dashboard');
  const [data, setData] = useState<DiaryData>({ weights: [], medications: [], habits: [] });
  const [isClient, setIsClient] = useState(false);

  // Formulários
  const [weightForm, setWeightForm] = useState({ date: '', weight: '', notes: '' });
  const [medForm, setMedForm] = useState({ date: '', medication: 'ozempic', dosage: '', time: '', notes: '' });
  const [habitForm, setHabitForm] = useState({ 
    date: '', 
    waterIntake: '8', 
    exercise: false, 
    exerciseMinutes: '', 
    sleep: '8', 
    mood: 'bom',
    notes: '' 
  });

  useEffect(() => {
    setIsClient(true);
    const hasCompletedQuiz = localStorage.getItem('quizCompleted');
    if (hasCompletedQuiz) {
      setShowQuiz(false);
    }
    setData(storage.loadData());
  }, []);

  const refreshData = () => {
    setData(storage.loadData());
  };

  const handleQuizNext = () => {
    if (quizStep < 15) {
      setQuizStep(quizStep + 1);
    } else {
      // Salvar dados do quiz e mostrar tela de assinatura
      localStorage.setItem('quizData', JSON.stringify(quizData));
      setQuizCompleted(true);
    }
  };

  const handleStartApp = () => {
    localStorage.setItem('quizCompleted', 'true');
    setShowQuiz(false);
  };

  const handleSubscribe = () => {
    // Redirecionar para o link de pagamento do Stripe
    window.location.href = 'https://buy.stripe.com/00wbJ39aE2Av7KVeJf2wU00';
  };

  const isQuizStepValid = () => {
    switch (quizStep) {
      case 0:
        return quizData.usingGLP1 !== '';
      case 1:
        return quizData.medication !== '';
      case 2:
        return quizData.currentDose !== '';
      case 3:
        return quizData.applicationFrequency !== '';
      case 4:
        return quizData.gender !== '';
      case 5:
        return quizData.birthDate !== '';
      case 6:
        return quizData.measurements.height !== '' && quizData.measurements.weight !== '';
      case 7:
        return quizData.protocolStartDate !== '';
      case 8:
        return quizData.startingWeight !== '';
      case 9:
        return quizData.targetWeight !== '';
      case 10:
        return quizData.goalSpeed !== '';
      case 11:
        return quizData.activityLevel !== '';
      case 12:
        return quizData.strongestCravingDay !== '';
      case 13:
        return quizData.mainSideEffect !== '';
      case 14:
        return quizData.motivation !== '';
      case 15:
        return quizData.name !== '' && quizData.email !== '' && quizData.email.includes('@') && quizData.phone !== '';
      default:
        return false;
    }
  };

  // Handlers de peso
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightForm.date || !weightForm.weight) return;
    
    storage.addWeight({
      date: weightForm.date,
      weight: parseFloat(weightForm.weight),
      notes: weightForm.notes,
    });
    
    setWeightForm({ date: '', weight: '', notes: '' });
    refreshData();
  };

  // Handlers de medicamento
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.date || !medForm.dosage || !medForm.time) return;
    
    storage.addMedication({
      date: medForm.date,
      medication: medForm.medication as any,
      dosage: medForm.dosage,
      time: medForm.time,
      notes: medForm.notes,
    });
    
    setMedForm({ date: '', medication: 'ozempic', dosage: '', time: '', notes: '' });
    refreshData();
  };

  // Handlers de hábitos
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitForm.date) return;
    
    storage.addHabit({
      date: habitForm.date,
      waterIntake: parseInt(habitForm.waterIntake),
      exercise: habitForm.exercise,
      exerciseMinutes: habitForm.exerciseMinutes ? parseInt(habitForm.exerciseMinutes) : undefined,
      sleep: parseFloat(habitForm.sleep),
      mood: habitForm.mood as any,
      notes: habitForm.notes,
    });
    
    setHabitForm({ 
      date: '', 
      waterIntake: '8', 
      exercise: false, 
      exerciseMinutes: '', 
      sleep: '8', 
      mood: 'bom',
      notes: '' 
    });
    refreshData();
  };

  // Calcular estatísticas
  const getStats = () => {
    const currentWeight = data.weights[0]?.weight || 0;
    const initialWeight = data.weights[data.weights.length - 1]?.weight || currentWeight;
    const weightLoss = initialWeight - currentWeight;
    const medicationCount = data.medications.length;
    const habitStreak = data.habits.length;

    return { currentWeight, weightLoss, medicationCount, habitStreak };
  };

  const stats = isClient ? getStats() : { currentWeight: 0, weightLoss: 0, medicationCount: 0, habitStreak: 0 };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (showQuiz) {
    // Tela de assinatura após completar quiz
    if (quizCompleted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
              {/* Ícone de sucesso */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              {/* Título */}
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                Parabéns, {quizData.name}! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Você completou o questionário inicial
              </p>

              {/* Card de assinatura */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 mb-8 text-white">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Diário GLP-1 Premium</h3>
                </div>
                
                <p className="text-indigo-100 mb-6">
                  Desbloqueie todos os recursos e acompanhe sua jornada completa
                </p>

                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Registro ilimitado de peso, medicação e hábitos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Gráficos e estatísticas detalhadas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Lembretes personalizados de medicação</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Exportação de relatórios em PDF</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Suporte prioritário</span>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold">R$ 29,90</span>
                    <span className="text-indigo-100">/mês</span>
                  </div>
                  <p className="text-sm text-indigo-100 mt-2">Cancele quando quiser</p>
                </div>

                <button
                  onClick={handleSubscribe}
                  className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <CreditCard className="w-5 h-5" />
                  Assinar Agora
                </button>
              </div>


            </div>
          </div>
        </div>
      );
    }

    const quizQuestions = [
      {
        title: 'Você já está usando medicamentos GLP-1?',
        options: [
          { value: 'sim', label: 'Sim, já estou usando', icon: CheckCircle2 },
          { value: 'nao', label: 'Não, ainda não comecei', icon: Activity }
        ]
      },
      {
        title: 'Qual medicamento GLP-1 você está usando?',
        options: [
          { value: 'ozempic', label: 'Ozempic', icon: Pill },
          { value: 'wegovy', label: 'Wegovy', icon: Pill },
          { value: 'mounjaro', label: 'Mounjaro', icon: Pill },
          { value: 'zepbound', label: 'Zepbound', icon: Pill },
          { value: 'saxenda', label: 'Saxenda', icon: Pill },
          { value: 'outro', label: 'Outro', icon: Pill }
        ]
      },
      {
        title: 'Qual é a sua dose atual?',
        type: 'text',
        field: 'currentDose',
        placeholder: 'Ex: 0.5mg, 1mg, 2.5mg'
      },
      {
        title: 'Qual a frequência de aplicação?',
        options: [
          { value: 'semanal', label: 'Semanal', icon: Calendar },
          { value: 'quinzenal', label: 'Quinzenal', icon: Calendar },
          { value: 'diaria', label: 'Diária', icon: Calendar }
        ]
      },
      {
        title: 'Qual é o seu gênero?',
        options: [
          { value: 'masculino', label: 'Masculino', icon: Activity },
          { value: 'feminino', label: 'Feminino', icon: Activity },
          { value: 'outro', label: 'Prefiro não informar', icon: Activity }
        ]
      },
      {
        title: 'Qual é a sua data de nascimento?',
        type: 'date',
        field: 'birthDate'
      },
      {
        title: 'Quais são as suas medidas?',
        type: 'measurements',
        fields: ['height', 'weight', 'waist']
      },
      {
        title: 'Quando você começou o protocolo GLP-1?',
        type: 'date',
        field: 'protocolStartDate'
      },
      {
        title: 'Qual era o seu peso quando começou?',
        type: 'number',
        field: 'startingWeight',
        placeholder: 'Ex: 85.5 kg'
      },
      {
        title: 'Qual é a sua meta atual de peso?',
        type: 'number',
        field: 'targetWeight',
        placeholder: 'Ex: 70 kg'
      },
      {
        title: 'O quão rápido você quer atingir sua meta?',
        options: [
          { value: 'lento', label: 'Lento e sustentável', icon: TrendingDown },
          { value: 'moderado', label: 'Moderado', icon: Target },
          { value: 'rapido', label: 'Rápido', icon: Activity }
        ]
      },
      {
        title: 'Qual é o seu nível de atividade física?',
        options: [
          { value: 'sedentario', label: 'Sedentário', icon: Moon },
          { value: 'leve', label: 'Leve (1-2x/semana)', icon: Dumbbell },
          { value: 'moderado', label: 'Moderado (3-4x/semana)', icon: Dumbbell },
          { value: 'intenso', label: 'Intenso (5+x/semana)', icon: Dumbbell }
        ]
      },
      {
        title: 'Em qual dia o desejo por comida é mais forte?',
        options: [
          { value: 'segunda', label: 'Segunda-feira', icon: Calendar },
          { value: 'terca', label: 'Terça-feira', icon: Calendar },
          { value: 'quarta', label: 'Quarta-feira', icon: Calendar },
          { value: 'quinta', label: 'Quinta-feira', icon: Calendar },
          { value: 'sexta', label: 'Sexta-feira', icon: Calendar },
          { value: 'sabado', label: 'Sábado', icon: Calendar },
          { value: 'domingo', label: 'Domingo', icon: Calendar }
        ]
      },
      {
        title: 'Qual efeito colateral você teve mais problema?',
        options: [
          { value: 'nausea', label: 'Náusea', icon: Activity },
          { value: 'vomito', label: 'Vômito', icon: Activity },
          { value: 'diarreia', label: 'Diarreia', icon: Activity },
          { value: 'constipacao', label: 'Constipação', icon: Activity },
          { value: 'fadiga', label: 'Fadiga', icon: Moon },
          { value: 'dor-cabeca', label: 'Dor de cabeça', icon: Activity },
          { value: 'nenhum', label: 'Nenhum', icon: CheckCircle2 }
        ]
      },
      {
        title: 'O que está levando você a alcançar essa meta?',
        type: 'textarea',
        field: 'motivation',
        placeholder: 'Compartilhe sua motivação...'
      },
      {
        title: 'Por último, como podemos te chamar?',
        type: 'contact',
        fields: ['name', 'email', 'phone']
      }
    ];

    const currentQuestion = quizQuestions[quizStep];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress Bar - SEM mostrar total */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progresso</span>
              <span className="text-sm font-medium text-indigo-600">{Math.round(((quizStep + 1) / 16) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((quizStep + 1) / 16) * 100}%` }}
              />
            </div>
          </div>

          {/* Quiz Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
            <div className="mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl w-fit mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-gray-600">Vamos personalizar sua experiência</p>
            </div>

            {/* Options or Input */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options ? (
                currentQuestion.options.map((option) => {
                  const Icon = option.icon;
                  let isSelected = false;
                  
                  // Determinar qual campo verificar baseado no step
                  if (quizStep === 0) isSelected = quizData.usingGLP1 === option.value;
                  else if (quizStep === 1) isSelected = quizData.medication === option.value;
                  else if (quizStep === 3) isSelected = quizData.applicationFrequency === option.value;
                  else if (quizStep === 4) isSelected = quizData.gender === option.value;
                  else if (quizStep === 10) isSelected = quizData.goalSpeed === option.value;
                  else if (quizStep === 11) isSelected = quizData.activityLevel === option.value;
                  else if (quizStep === 12) isSelected = quizData.strongestCravingDay === option.value;
                  else if (quizStep === 13) isSelected = quizData.mainSideEffect === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (quizStep === 0) setQuizData({ ...quizData, usingGLP1: option.value });
                        else if (quizStep === 1) setQuizData({ ...quizData, medication: option.value });
                        else if (quizStep === 3) setQuizData({ ...quizData, applicationFrequency: option.value });
                        else if (quizStep === 4) setQuizData({ ...quizData, gender: option.value });
                        else if (quizStep === 10) setQuizData({ ...quizData, goalSpeed: option.value });
                        else if (quizStep === 11) setQuizData({ ...quizData, activityLevel: option.value });
                        else if (quizStep === 12) setQuizData({ ...quizData, strongestCravingDay: option.value });
                        else if (quizStep === 13) setQuizData({ ...quizData, mainSideEffect: option.value });
                      }}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${
                        isSelected ? 'bg-indigo-500' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className={`text-lg font-medium ${
                        isSelected ? 'text-indigo-700' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-indigo-500 ml-auto" />
                      )}
                    </button>
                  );
                })
              ) : currentQuestion.type === 'measurements' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Altura (cm)</label>
                    <input
                      type="number"
                      value={quizData.measurements.height}
                      onChange={(e) => setQuizData({ 
                        ...quizData, 
                        measurements: { ...quizData.measurements, height: e.target.value }
                      })}
                      placeholder="Ex: 170"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Peso atual (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={quizData.measurements.weight}
                      onChange={(e) => setQuizData({ 
                        ...quizData, 
                        measurements: { ...quizData.measurements, weight: e.target.value }
                      })}
                      placeholder="Ex: 85.5"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cintura (cm) - Opcional</label>
                    <input
                      type="number"
                      value={quizData.measurements.waist}
                      onChange={(e) => setQuizData({ 
                        ...quizData, 
                        measurements: { ...quizData.measurements, waist: e.target.value }
                      })}
                      placeholder="Ex: 90"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                    />
                  </div>
                </div>
              ) : currentQuestion.type === 'contact' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={quizData.name}
                      onChange={(e) => setQuizData({ ...quizData, name: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={quizData.email}
                      onChange={(e) => setQuizData({ ...quizData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={quizData.phone}
                      onChange={(e) => setQuizData({ ...quizData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                      required
                    />
                  </div>
                </div>
              ) : currentQuestion.type === 'textarea' ? (
                <textarea
                  value={quizData[currentQuestion.field as keyof typeof quizData] as string}
                  onChange={(e) => setQuizData({ ...quizData, [currentQuestion.field as string]: e.target.value })}
                  placeholder={currentQuestion.placeholder}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg resize-none"
                  rows={4}
                  required
                />
              ) : (
                <div>
                  <input
                    type={currentQuestion.type}
                    step={currentQuestion.type === 'number' ? '0.1' : undefined}
                    value={quizData[currentQuestion.field as keyof typeof quizData] as string}
                    onChange={(e) => setQuizData({ ...quizData, [currentQuestion.field as string]: e.target.value })}
                    placeholder={currentQuestion.placeholder}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                    required
                  />
                </div>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={handleQuizNext}
              disabled={!isQuizStepValid()}
              className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                isQuizStepValid()
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {quizStep === 15 ? 'Finalizar' : 'Próxima'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  OzeFit
                </h1>
                <p className="text-xs text-gray-600">Acompanhe sua jornada de saúde</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Meta: -10kg</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-[73px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'weight'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span className="text-sm">Peso</span>
            </button>
            <button
              onClick={() => setActiveTab('medication')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'medication'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span className="text-sm">Medicação</span>
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'habits'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">Hábitos</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card Peso Atual */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-indigo-100 p-2 rounded-xl">
                      <Scale className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.currentWeight.toFixed(1)}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Peso Atual (kg)</p>
                  </div>
                </div>
              </div>

              {/* Card Perda de Peso */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-green-100 p-2 rounded-xl">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">-{stats.weightLoss.toFixed(1)}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Perda Total (kg)</p>
                  </div>
                </div>
              </div>

              {/* Card Medicamentos */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-purple-100 p-2 rounded-xl">
                      <Pill className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.medicationCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Doses Aplicadas</p>
                  </div>
                </div>
              </div>

              {/* Card Hábitos */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-pink-100 p-2 rounded-xl">
                      <Award className="w-5 h-5 text-pink-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.habitStreak}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Dias Registrados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Peso */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-indigo-600" />
                  Evolução do Peso
                </h2>
                {data.weights.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">{data.weights.length} registros</span>
                )}
              </div>
              {data.weights.length > 0 ? (
                <div className="space-y-2">
                  {data.weights.slice(0, 5).map((entry, index) => {
                    const prevWeight = data.weights[index + 1]?.weight;
                    const diff = prevWeight ? entry.weight - prevWeight : 0;
                    
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg sm:text-xl font-bold text-gray-800">{entry.weight} kg</span>
                          {diff !== 0 && (
                            <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-lg ${
                              diff < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum registro de peso ainda</p>
                  <button
                    onClick={() => setActiveTab('weight')}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Adicionar primeiro registro →
                  </button>
                </div>
              )}
            </div>

            {/* Grid com Medicamentos e Hábitos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Últimos Medicamentos */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-purple-600" />
                    Últimas Doses
                  </h2>
                </div>
                {data.medications.length > 0 ? (
                  <div className="space-y-3">
                    {data.medications.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 capitalize text-sm">{entry.medication}</p>
                          <p className="text-xs text-gray-600 mt-1">{entry.dosage} • {entry.time}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhuma dose registrada</p>
                  </div>
                )}
              </div>

              {/* Últimos Hábitos */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Hábitos Recentes
                  </h2>
                </div>
                {data.habits.length > 0 ? (
                  <div className="space-y-3">
                    {data.habits.slice(0, 3).map((entry) => {
                      const moodEmoji = {
                        excelente: '😄',
                        bom: '🙂',
                        regular: '😐',
                        ruim: '😔'
                      };
                      
                      return (
                        <div key={entry.id} className="p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">
                              {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-lg">{moodEmoji[entry.mood]}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Droplet className="w-3 h-3 text-blue-500" />
                              <span className="text-gray-700">{entry.waterIntake}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Moon className="w-3 h-3 text-indigo-500" />
                              <span className="text-gray-700">{entry.sleep}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Dumbbell className="w-3 h-3 text-orange-500" />
                              <span className="text-gray-700">{entry.exercise ? '✓' : '✗'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum hábito registrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Peso Tab */}
        {activeTab === 'weight' && (
          <div className="space-y-6">
            {/* Formulário */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Registrar Peso
              </h2>
              <form onSubmit={handleAddWeight} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={weightForm.date}
                      onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightForm.weight}
                      onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ex: 75.5"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observações (opcional)</label>
                  <textarea
                    value={weightForm.notes}
                    onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Como você está se sentindo?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Adicionar Registro
                </button>
              </form>
            </div>

            {/* Lista de Registros */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5">Histórico de Peso</h2>
              {data.weights.length > 0 ? (
                <div className="space-y-3">
                  {data.weights.map((entry, index) => {
                    const prevWeight = data.weights[index + 1]?.weight;
                    const diff = prevWeight ? entry.weight - prevWeight : 0;
                    
                    return (
                      <div key={entry.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-600">
                                {new Date(entry.date).toLocaleDateString('pt-BR', { 
                                  weekday: 'short', 
                                  day: '2-digit', 
                                  month: 'short' 
                                })}
                              </span>
                              <span className="text-2xl font-bold text-gray-800">{entry.weight} kg</span>
                              {diff !== 0 && (
                                <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${
                                  diff < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                                </span>
                              )}
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              storage.deleteWeight(entry.id);
                              refreshData();
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum registro ainda. Adicione seu primeiro peso!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicamentos Tab */}
        {activeTab === 'medication' && (
          <div className="space-y-6">
            {/* Formulário */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Registrar Medicamento
              </h2>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={medForm.date}
                      onChange={(e) => setMedForm({ ...medForm, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medicamento</label>
                    <select
                      value={medForm.medication}
                      onChange={(e) => setMedForm({ ...medForm, medication: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="ozempic">Ozempic</option>
                      <option value="wegovy">Wegovy</option>
                      <option value="mounjaro">Mounjaro</option>
                      <option value="zepbound">Zepbound</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dosagem</label>
                    <input
                      type="text"
                      value={medForm.dosage}
                      onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Ex: 0.5mg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Horário</label>
                    <input
                      type="time"
                      value={medForm.time}
                      onChange={(e) => setMedForm({ ...medForm, time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observações (opcional)</label>
                  <textarea
                    value={medForm.notes}
                    onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Efeitos colaterais, local da aplicação, etc."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Adicionar Registro
                </button>
              </form>
            </div>

            {/* Lista de Registros */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5">Histórico de Medicamentos</h2>
              {data.medications.length > 0 ? (
                <div className="space-y-3">
                  {data.medications.map((entry) => (
                    <div key={entry.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <Pill className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-lg font-bold text-gray-800 capitalize">{entry.medication}</span>
                            <span className="text-sm text-gray-600">{entry.dosage}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 ml-11">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(entry.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span>{entry.time}</span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-3 ml-11">{entry.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            storage.deleteMedication(entry.id);
                            refreshData();
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum medicamento registrado ainda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hábitos Tab */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            {/* Formulário */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-pink-600" />
                Registrar Hábitos do Dia
              </h2>
              <form onSubmit={handleAddHabit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={habitForm.date}
                    onChange={(e) => setHabitForm({ ...habitForm, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      Água (copos)
                    </label>
                    <input
                      type="number"
                      value={habitForm.waterIntake}
                      onChange={(e) => setHabitForm({ ...habitForm, waterIntake: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      Sono (horas)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={habitForm.sleep}
                      onChange={(e) => setHabitForm({ ...habitForm, sleep: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      min="0"
                      max="24"
                      required
                    />
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={habitForm.exercise}
                      onChange={(e) => setHabitForm({ ...habitForm, exercise: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <Dumbbell className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-700">Fiz exercícios hoje</span>
                  </label>
                </div>

                {habitForm.exercise && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duração (minutos)</label>
                    <input
                      type="number"
                      value={habitForm.exerciseMinutes}
                      onChange={(e) => setHabitForm({ ...habitForm, exerciseMinutes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      min="0"
                      placeholder="Ex: 30"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-yellow-500" />
                    Como você se sente?
                  </label>
                  <select
                    value={habitForm.mood}
                    onChange={(e) => setHabitForm({ ...habitForm, mood: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  >
                    <option value="excelente">😄 Excelente</option>
                    <option value="bom">🙂 Bom</option>
                    <option value="regular">😐 Regular</option>
                    <option value="ruim">😔 Ruim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observações (opcional)</label>
                  <textarea
                    value={habitForm.notes}
                    onChange={(e) => setHabitForm({ ...habitForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Como foi seu dia?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Adicionar Registro
                </button>
              </form>
            </div>

            {/* Lista de Registros */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5">Histórico de Hábitos</h2>
              {data.habits.length > 0 ? (
                <div className="space-y-3">
                  {data.habits.map((entry) => {
                    const moodEmoji = {
                      excelente: '😄',
                      bom: '🙂',
                      regular: '😐',
                      ruim: '😔'
                    };

                    return (
                      <div key={entry.id} className="p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">
                                {new Date(entry.date).toLocaleDateString('pt-BR', { 
                                  weekday: 'long', 
                                  day: '2-digit', 
                                  month: 'long' 
                                })}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                <Droplet className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">{entry.waterIntake} copos</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                <Moon className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-medium text-gray-700">{entry.sleep}h</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                <Dumbbell className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {entry.exercise ? `${entry.exerciseMinutes || 0} min` : 'Não'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                <span className="text-lg">{moodEmoji[entry.mood]}</span>
                                <span className="text-sm font-medium text-gray-700 capitalize">{entry.mood}</span>
                              </div>
                            </div>

                            {entry.notes && (
                              <p className="text-sm text-gray-600 mt-2 bg-white p-3 rounded-lg">{entry.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              storage.deleteHabit(entry.id);
                              refreshData();
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum hábito registrado ainda</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
