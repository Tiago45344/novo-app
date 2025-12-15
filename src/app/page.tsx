'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Pill, Heart, TrendingDown, Calendar, Plus, Trash2, Droplet, Moon, Dumbbell, Smile, Activity, Target, Award, ArrowRight, CheckCircle2, CreditCard, Sparkles, Image as ImageIcon, Upload, Apple, Utensils, Lock, AlertCircle, LogOut } from 'lucide-react';
import { storage } from '@/lib/storage';
import { DiaryData, WeightEntry, MedicationEntry, HabitEntry } from '@/lib/types';
import { PremiumDebug } from '@/components/custom/premium-debug';
import { getCurrentUser, signOut, isAuthenticated } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          router.push('/auth');
          return;
        }

        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/auth');
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showPersonalizedPlan, setShowPersonalizedPlan] = useState(false);
  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [quizData, setQuizData] = useState({
    usingGLP1: '',
    medication: '',
    currentDose: '',
    applicationFrequency: '',
    gender: '',
    birthDate: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    measurements: { height: '', weight: '', waist: '' },
    protocolStartDate: '',
    protocolStartDay: '',
    protocolStartMonth: '',
    protocolStartYear: '',
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'weight' | 'medication' | 'habits' | 'plan' | 'emagrecer'>('dashboard');
  const [data, setData] = useState<DiaryData>({ weights: [], medications: [], habits: [] });
  const [isClient, setIsClient] = useState(false);

  // Estados para fotos de evolução
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

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
    
    // Verificar se retornou de um pagamento cancelado
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cancelled') === 'true') {
      console.log('⚠️ Pagamento cancelado pelo usuário');
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Verificar status do quiz
    const hasCompletedQuiz = localStorage.getItem('quizCompleted');
    if (hasCompletedQuiz) {
      setQuizCompleted(true);
      setShowQuiz(false);
    }
    
    // Verificar status premium com múltiplas fontes
    const premiumStatus = localStorage.getItem('isPremium');
    const paymentInfo = localStorage.getItem('paymentInfo');
    const premiumActivatedAt = localStorage.getItem('premiumActivatedAt');
    
    if (premiumStatus === 'true' || paymentInfo) {
      setIsPremium(true);
      console.log('✅ Usuário Premium detectado', {
        premiumStatus,
        hasPaymentInfo: !!paymentInfo,
        activatedAt: premiumActivatedAt
      });
      
      // Sincronizar dados se necessário
      if (!premiumStatus && paymentInfo) {
        localStorage.setItem('isPremium', 'true');
        console.log('🔄 Status premium sincronizado');
      }
    } else {
      console.log('ℹ️ Usuário gratuito');
    }
    
    setData(storage.loadData());
    
    // Carregar fotos salvas
    const savedBeforePhoto = localStorage.getItem('beforePhoto');
    const savedAfterPhoto = localStorage.getItem('afterPhoto');
    if (savedBeforePhoto) setBeforePhoto(savedBeforePhoto);
    if (savedAfterPhoto) setAfterPhoto(savedAfterPhoto);

    // Carregar dados do quiz salvos
    const savedQuizData = localStorage.getItem('quizData');
    if (savedQuizData) {
      setQuizData(JSON.parse(savedQuizData));
    }
  }, []);

  // Salvar dados do quiz automaticamente sempre que mudarem
  useEffect(() => {
    if (isClient && quizData.name) {
      localStorage.setItem('quizData', JSON.stringify(quizData));
      
      // Adicionar automaticamente peso inicial se fornecido
      if (quizData.startingWeight && quizData.protocolStartDay && quizData.protocolStartMonth && quizData.protocolStartYear) {
        const startDate = `${quizData.protocolStartYear}-${String(quizData.protocolStartMonth).padStart(2, '0')}-${String(quizData.protocolStartDay).padStart(2, '0')}`;
        
        // Verificar se já existe um registro de peso para essa data
        const existingWeight = data.weights.find(w => w.date === startDate);
        
        if (!existingWeight) {
          storage.addWeight({
            date: startDate,
            weight: parseFloat(quizData.startingWeight),
            notes: 'Peso inicial do protocolo GLP-1',
          });
          setData(storage.loadData());
        }
      }

      // Adicionar automaticamente primeira dose de medicação se fornecida
      if (quizData.medication && quizData.currentDose && quizData.protocolStartDay && quizData.protocolStartMonth && quizData.protocolStartYear) {
        const startDate = `${quizData.protocolStartYear}-${String(quizData.protocolStartMonth).padStart(2, '0')}-${String(quizData.protocolStartDay).padStart(2, '0')}`;
        
        // Verificar se já existe um registro de medicação para essa data
        const existingMed = data.medications.find(m => m.date === startDate);
        
        if (!existingMed) {
          storage.addMedication({
            date: startDate,
            medication: quizData.medication as any,
            dosage: quizData.currentDose,
            time: '08:00',
            notes: 'Primeira dose do protocolo',
          });
          setData(storage.loadData());
        }
      }

      // Adicionar automaticamente hábitos iniciais baseados no quiz
      if (quizData.protocolStartDay && quizData.protocolStartMonth && quizData.protocolStartYear) {
        const startDate = `${quizData.protocolStartYear}-${String(quizData.protocolStartMonth).padStart(2, '0')}-${String(quizData.protocolStartDay).padStart(2, '0')}`;
        
        // Verificar se já existe um registro de hábito para essa data
        const existingHabit = data.habits.find(h => h.date === startDate);
        
        if (!existingHabit && quizData.activityLevel) {
          const waterIntake = parseInt(calculateWaterIntake());
          const exerciseByLevel = {
            'sedentario': false,
            'leve': true,
            'moderado': true,
            'intenso': true
          };
          
          storage.addHabit({
            date: startDate,
            waterIntake: waterIntake,
            exercise: exerciseByLevel[quizData.activityLevel as keyof typeof exerciseByLevel] || false,
            exerciseMinutes: quizData.activityLevel === 'intenso' ? 60 : quizData.activityLevel === 'moderado' ? 45 : quizData.activityLevel === 'leve' ? 30 : undefined,
            sleep: 8,
            mood: 'bom',
            notes: 'Início do protocolo - metas baseadas no seu perfil',
          });
          setData(storage.loadData());
        }
      }
    }
  }, [quizData, isClient]);

  const refreshData = () => {
    setData(storage.loadData());
  };

  // Função para verificar se usuário pode acessar funcionalidade
  const canAccessFeature = () => {
    // Usuário premium tem acesso completo independente do quiz
    return isPremium;
  };

  // Função para mostrar alerta de upgrade
  const handleLockedFeatureClick = () => {
    if (!quizCompleted) {
      setShowUpgradeAlert(true);
      setTimeout(() => setShowUpgradeAlert(false), 5000);
    } else if (!isPremium) {
      setShowUpgradeAlert(true);
      setTimeout(() => setShowUpgradeAlert(false), 5000);
    }
  };

  // Handlers para upload de fotos
  const handlePhotoUpload = (type: 'before' | 'after', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'before') {
          setBeforePhoto(result);
          localStorage.setItem('beforePhoto', result);
        } else {
          setAfterPhoto(result);
          localStorage.setItem('afterPhoto', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhoto(null);
      localStorage.removeItem('beforePhoto');
    } else {
      setAfterPhoto(null);
      localStorage.removeItem('afterPhoto');
    }
  };

  // Função para calcular próxima aplicação
  const calculateNextApplication = () => {
    if (!quizData.protocolStartDay || !quizData.protocolStartMonth || !quizData.protocolStartYear) {
      return 'Não disponível';
    }

    const startDate = new Date(
      parseInt(quizData.protocolStartYear),
      parseInt(quizData.protocolStartMonth) - 1,
      parseInt(quizData.protocolStartDay)
    );

    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let intervalDays = 7; // padrão semanal
    if (quizData.applicationFrequency === 'quinzenal') intervalDays = 14;
    if (quizData.applicationFrequency === 'diaria') intervalDays = 1;

    const daysSinceLastApplication = diffDays % intervalDays;
    const daysUntilNext = intervalDays - daysSinceLastApplication;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);

    return nextDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Função para calcular água recomendada
  const calculateWaterIntake = () => {
    const weight = parseFloat(quizData.measurements.weight) || 70;
    const waterInLiters = (weight * 35) / 1000; // 35ml por kg
    return waterInLiters.toFixed(1);
  };

  // Função para calcular proteína recomendada
  const calculateProtein = () => {
    const weight = parseFloat(quizData.measurements.weight) || 70;
    const proteinInGrams = weight * 1.6; // 1.6g por kg para perda de peso
    return Math.round(proteinInGrams);
  };

  // Função para calcular fibras recomendadas
  const calculateFiber = () => {
    return quizData.gender === 'feminino' ? '25' : '30'; // recomendação padrão
  };

  const handleQuizNext = async () => {
    // Salvar dados do quiz a cada passo
    localStorage.setItem('quizData', JSON.stringify(quizData));
    
    if (quizStep < 15) {
      setQuizStep(quizStep + 1);
    } else {
      // Após preencher dados pessoais, salvar localmente
      localStorage.setItem('quizData', JSON.stringify(quizData));
      localStorage.setItem('quizCompleted', 'true');
      setQuizCompleted(true);
      setShowQuiz(false);
      setShowPersonalizedPlan(true);
    }
  };

  const handleContinueToSubscription = () => {
    setShowPersonalizedPlan(false);
    setShowPlanSelection(true);
  };

  const handleStartApp = () => {
    localStorage.setItem('quizCompleted', 'true');
    setShowQuiz(false);
  };

  const handleSelectPlan = () => {
    // Salvar dados do quiz antes de redirecionar
    localStorage.setItem('quizData', JSON.stringify(quizData));
    
    // Salvar tipo de plano selecionado
    localStorage.setItem('selectedPlan', 'personalized');
    
    // Criar timestamp único para rastreamento
    const timestamp = Date.now();
    const clientReferenceId = `${timestamp}_personalized_${quizData.email || 'user'}`;
    
    // URLs de retorno
    const successUrl = `${window.location.origin}/success?plan=personalized&ref=${timestamp}`;
    const cancelUrl = `${window.location.origin}?cancelled=true`;
    
    // URL do checkout da Stripe com parâmetros completos
    const checkoutUrl = `https://buy.stripe.com/test_eVqfZgakZ3Oa5Fa2SjaAw00?client_reference_id=${encodeURIComponent(clientReferenceId)}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    
    console.log('🔄 Redirecionando para checkout:', { planType: 'personalized', clientReferenceId });
    
    window.location.href = checkoutUrl;
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
        return quizData.birthDay !== '' && quizData.birthMonth !== '' && quizData.birthYear !== '';
      case 6:
        return quizData.measurements.height !== '' && quizData.measurements.weight !== '';
      case 7:
        return quizData.protocolStartDay !== '' && quizData.protocolStartMonth !== '' && quizData.protocolStartYear !== '';
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
    if (!canAccessFeature()) {
      handleLockedFeatureClick();
      return;
    }
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
    if (!canAccessFeature()) {
      handleLockedFeatureClick();
      return;
    }
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
    if (!canAccessFeature()) {
      handleLockedFeatureClick();
      return;
    }
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
    const currentWeight = data.weights[0]?.weight || parseFloat(quizData.measurements.weight) || 0;
    const initialWeight = parseFloat(quizData.startingWeight) || data.weights[data.weights.length - 1]?.weight || currentWeight;
    const weightLoss = initialWeight - currentWeight;
    const medicationCount = data.medications.length;
    const habitStreak = data.habits.length;

    return { currentWeight, weightLoss, medicationCount, habitStreak };
  };

  const stats = isClient ? getStats() : { currentWeight: 0, weightLoss: 0, medicationCount: 0, habitStreak: 0 };

  // Tela de carregamento durante verificação de autenticação
  if (isAuthChecking || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Tela do Quiz
  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm font-medium text-indigo-600">{Math.round((quizStep / 15) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(quizStep / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Quiz Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Pergunta 0 */}
            {quizStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Você está usando medicação GLP-1?</h2>
                <p className="text-gray-600">Medicações como Ozempic, Wegovy, Mounjaro, etc.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setQuizData({...quizData, usingGLP1: 'sim'})}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      quizData.usingGLP1 === 'sim' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    Sim, estou usando
                  </button>
                  <button
                    onClick={() => setQuizData({...quizData, usingGLP1: 'nao'})}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      quizData.usingGLP1 === 'nao' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    Não, ainda não comecei
                  </button>
                </div>
              </div>
            )}

            {/* Pergunta 1 */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Qual medicação você está usando?</h2>
                <div className="space-y-3">
                  {['Ozempic', 'Wegovy', 'Mounjaro', 'Saxenda', 'Victoza', 'Outra'].map((med) => (
                    <button
                      key={med}
                      onClick={() => setQuizData({...quizData, medication: med.toLowerCase()})}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        quizData.medication === med.toLowerCase() 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {med}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pergunta 2 */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Qual a dose atual?</h2>
                <input
                  type="text"
                  placeholder="Ex: 0.5mg, 1mg, 2.5mg..."
                  value={quizData.currentDose}
                  onChange={(e) => setQuizData({...quizData, currentDose: e.target.value})}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Pergunta 3 */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Frequência de aplicação</h2>
                <div className="space-y-3">
                  {[
                    { value: 'semanal', label: 'Semanal' },
                    { value: 'quinzenal', label: 'Quinzenal' },
                    { value: 'diaria', label: 'Diária' }
                  ].map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() => setQuizData({...quizData, applicationFrequency: freq.value})}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        quizData.applicationFrequency === freq.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pergunta 4 */}
            {quizStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Qual seu gênero?</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setQuizData({...quizData, gender: 'feminino'})}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      quizData.gender === 'feminino' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    Feminino
                  </button>
                  <button
                    onClick={() => setQuizData({...quizData, gender: 'masculino'})}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      quizData.gender === 'masculino' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    Masculino
                  </button>
                </div>
              </div>
            )}

            {/* Pergunta 5 */}
            {quizStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Data de nascimento</h2>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Dia"
                    min="1"
                    max="31"
                    value={quizData.birthDay}
                    onChange={(e) => setQuizData({...quizData, birthDay: e.target.value})}
                    className="p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Mês"
                    min="1"
                    max="12"
                    value={quizData.birthMonth}
                    onChange={(e) => setQuizData({...quizData, birthMonth: e.target.value})}
                    className="p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Ano"
                    min="1900"
                    max="2024"
                    value={quizData.birthYear}
                    onChange={(e) => setQuizData({...quizData, birthYear: e.target.value})}
                    className="p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Pergunta 6 */}
            {quizStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Suas medidas atuais</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                    <input
                      type="number"
                      placeholder="Ex: 170"
                      value={quizData.measurements.height}
                      onChange={(e) => setQuizData({...quizData, measurements: {...quizData.measurements, height: e.target.value}})}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso atual (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 75.5"
                      value={quizData.measurements.weight}
                      onChange={(e) => setQuizData({...quizData, measurements: {...quizData.measurements, weight: e.target.value}})}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cintura (cm) - Opcional</label>
                    <input
                      type="number"
                      placeholder="Ex: 90"
                      value={quizData.measurements.waist}
                      onChange={(e) => setQuizData({...quizData, measurements: {...quizData.measurements, waist: e.target.value}})}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pergunta 7 */}
            {quizStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Quando iniciou o protocolo?</h2>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Dia"
                    min="1"
                    max="31"
                    value={quizData.protocolStartDay}
                    onChange={(e) => setQuizData({...quizData, protocolStartDay: e.target.value})}
                    className="p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Mês"
                    min="1"
                    max="12"
                    value={quizData.protocolStartMonth}
                    onChange={(e) => setQuizData({...quizData, protocolStartMonth: e.target.value})}
                    className="p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Ano"
                    min="2020"
                    max="2024"
                    value={quizData.protocolStartYear}
                    onChange={(e) => setQuizData({...quizData, protocolStartYear: e.target.value})}
                    className="p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Pergunta 8 */}
            {quizStep === 8 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Peso inicial do protocolo (kg)</h2>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 85.5"
                  value={quizData.startingWeight}
                  onChange={(e) => setQuizData({...quizData, startingWeight: e.target.value})}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Pergunta 9 */}
            {quizStep === 9 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Qual seu peso meta? (kg)</h2>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70.0"
                  value={quizData.targetWeight}
                  onChange={(e) => setQuizData({...quizData, targetWeight: e.target.value})}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Pergunta 10 */}
            {quizStep === 10 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Velocidade de emagrecimento desejada</h2>
                <div className="space-y-3">
                  {[
                    { value: 'lenta', label: 'Lenta e sustentável (0.5kg/semana)' },
                    { value: 'moderada', label: 'Moderada (0.7kg/semana)' },
                    { value: 'rapida', label: 'Rápida (1kg/semana)' }
                  ].map((speed) => (
                    <button
                      key={speed.value}
                      onClick={() => setQuizData({...quizData, goalSpeed: speed.value})}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        quizData.goalSpeed === speed.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pergunta 11 */}
            {quizStep === 11 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Nível de atividade física</h2>
                <div className="space-y-3">
                  {[
                    { value: 'sedentario', label: 'Sedentário (pouco ou nenhum exercício)' },
                    { value: 'leve', label: 'Leve (1-3 dias/semana)' },
                    { value: 'moderado', label: 'Moderado (3-5 dias/semana)' },
                    { value: 'intenso', label: 'Intenso (6-7 dias/semana)' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setQuizData({...quizData, activityLevel: level.value})}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        quizData.activityLevel === level.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pergunta 12 */}
            {quizStep === 12 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Qual período você sente mais fome/compulsão?</h2>
                <div className="space-y-3">
                  {[
                    { value: 'manha', label: 'Manhã' },
                    { value: 'tarde', label: 'Tarde' },
                    { value: 'noite', label: 'Noite' },
                    { value: 'madrugada', label: 'Madrugada' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setQuizData({...quizData, strongestCravingDay: period.value})}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        quizData.strongestCravingDay === period.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pergunta 13 */}
            {quizStep === 13 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Principal efeito colateral que você enfrenta</h2>
                <div className="space-y-3">
                  {[
                    { value: 'nausea', label: 'Náusea' },
                    { value: 'constipacao', label: 'Constipação' },
                    { value: 'diarreia', label: 'Diarreia' },
                    { value: 'fadiga', label: 'Fadiga' },
                    { value: 'nenhum', label: 'Nenhum significativo' }
                  ].map((effect) => (
                    <button
                      key={effect.value}
                      onClick={() => setQuizData({...quizData, mainSideEffect: effect.value})}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        quizData.mainSideEffect === effect.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {effect.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pergunta 14 */}
            {quizStep === 14 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Qual sua maior motivação?</h2>
                <div className="space-y-3">
                  {[
                    { value: 'saude', label: 'Melhorar a saúde' },
                    { value: 'estetica', label: 'Estética e aparência' },
                    { value: 'autoestima', label: 'Autoestima e confiança' },
                    { value: 'qualidade', label: 'Qualidade de vida' }
                  ].map((mot) => (
                    <button
                      key={mot.value}
                      onClick={() => setQuizData({...quizData, motivation: mot.value})}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        quizData.motivation === mot.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {mot.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pergunta 15 - Dados Pessoais */}
            {quizStep === 15 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Seus dados de contato</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={quizData.name}
                      onChange={(e) => setQuizData({...quizData, name: e.target.value})}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={quizData.email}
                      onChange={(e) => setQuizData({...quizData, email: e.target.value})}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={quizData.phone}
                      onChange={(e) => setQuizData({...quizData, phone: e.target.value})}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex gap-4 mt-8">
              {quizStep > 0 && (
                <button
                  onClick={() => setQuizStep(quizStep - 1)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
                >
                  Voltar
                </button>
              )}
              <button
                onClick={handleQuizNext}
                disabled={!isQuizStepValid()}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                  isQuizStepValid()
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {quizStep === 15 ? 'Finalizar' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Plano Personalizado
  if (showPersonalizedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seu Plano Personalizado Está Pronto!</h1>
              <p className="text-gray-600">Baseado nas suas respostas, criamos um plano sob medida para você</p>
            </div>

            {/* Resumo do Perfil */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Seu Objetivo
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Peso Inicial:</span> {quizData.startingWeight}kg</p>
                  <p><span className="font-medium">Peso Atual:</span> {quizData.measurements.weight}kg</p>
                  <p><span className="font-medium">Peso Meta:</span> {quizData.targetWeight}kg</p>
                  <p><span className="font-medium">Faltam:</span> {(parseFloat(quizData.measurements.weight) - parseFloat(quizData.targetWeight)).toFixed(1)}kg</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Seu Protocolo
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Medicação:</span> {quizData.medication}</p>
                  <p><span className="font-medium">Dose:</span> {quizData.currentDose}</p>
                  <p><span className="font-medium">Frequência:</span> {quizData.applicationFrequency}</p>
                  <p><span className="font-medium">Próxima aplicação:</span> {calculateNextApplication()}</p>
                </div>
              </div>
            </div>

            {/* Recomendações Nutricionais */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" />
                Metas Nutricionais Diárias
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{calculateWaterIntake()}L</div>
                  <div className="text-sm text-gray-600">Água</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{calculateProtein()}g</div>
                  <div className="text-sm text-gray-600">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{calculateFiber()}g</div>
                  <div className="text-sm text-gray-600">Fibras</div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <button
                onClick={handleContinueToSubscription}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                Continuar para Assinatura
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Seleção de Plano
  if (showPlanSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Escolha Seu Plano</h1>
            <p className="text-xl text-gray-600">Desbloqueie todo o potencial do OzemFit</p>
          </div>

          <div className="max-w-md mx-auto">
            {/* Plano Personalizado Único */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 text-sm font-bold rounded-bl-xl">
                RECOMENDADO
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Plano Personalizado</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">R$ 9,90</span>
                  <span className="text-indigo-100">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Diário completo de peso e medicação</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Acompanhamento de hábitos saudáveis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Gráficos de evolução</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>Lembretes de medicação</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Plano nutricional personalizado</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Metas adaptadas ao seu perfil</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Dicas personalizadas diárias</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Acompanhamento de efeitos colaterais</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Suporte prioritário</span>
                </li>
              </ul>

              <button
                onClick={handleSelectPlan}
                className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all"
              >
                Assinar Plano Personalizado
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Pagamento seguro via Stripe • Cancele quando quiser</p>
            <button
              onClick={() => {
                setShowPlanSelection(false);
                setShowQuiz(false);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voltar ao app
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Componente de Debug Premium (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && <PremiumDebug />}
      
      {/* Alerta de Upgrade */}
      {showUpgradeAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {!quizCompleted 
                  ? 'Complete o quiz na aba "Emagrecer" primeiro!' 
                  : 'Complete seu plano para desbloquear todas as funcionalidades!'}
              </p>
              <p className="text-xs mt-1">
                {!quizCompleted 
                  ? 'Responda o quiz para receber seu plano personalizado' 
                  : 'Acesse todas as funcionalidades premium'}
              </p>
            </div>
          </div>
        </div>
      )}

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
                  OzemFit
                </h1>
                <p className="text-xs text-gray-600">
                  {currentUser?.user_metadata?.name || currentUser?.email || 'Usuário'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isPremium ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-200 text-gray-600 px-4 py-2 rounded-xl">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Gratuito</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Sair</span>
              </button>
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
              onClick={() => {
                if (!canAccessFeature()) {
                  handleLockedFeatureClick();
                } else {
                  setActiveTab('weight');
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'weight'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span className="text-sm">Peso</span>
              {!canAccessFeature() && <Lock className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                if (!canAccessFeature()) {
                  handleLockedFeatureClick();
                } else {
                  setActiveTab('medication');
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'medication'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span className="text-sm">Medicação</span>
              {!canAccessFeature() && <Lock className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                if (!canAccessFeature()) {
                  handleLockedFeatureClick();
                } else {
                  setActiveTab('habits');
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'habits'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">Hábitos</span>
              {!canAccessFeature() && <Lock className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                if (!canAccessFeature()) {
                  handleLockedFeatureClick();
                } else {
                  setActiveTab('plan');
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'plan'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Plano Personalizado</span>
              {!canAccessFeature() && <Lock className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setActiveTab('emagrecer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'emagrecer'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span className="text-sm">Emagrecer</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Scale className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.currentWeight.toFixed(1)}kg</div>
                <div className="text-sm text-gray-600">Peso Atual</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.weightLoss.toFixed(1)}kg</div>
                <div className="text-sm text-gray-600">Perdidos</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Pill className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.medicationCount}</div>
                <div className="text-sm text-gray-600">Aplicações</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.habitStreak}</div>
                <div className="text-sm text-gray-600">Dias Registrados</div>
              </div>
            </div>

            {/* Próxima Aplicação */}
            {quizCompleted && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Próxima Aplicação</h3>
                </div>
                <p className="text-2xl font-bold mb-2">{calculateNextApplication()}</p>
                <p className="text-indigo-100">Medicação: {quizData.medication} - Dose: {quizData.currentDose}</p>
              </div>
            )}

            {/* Fotos de Evolução */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-indigo-600" />
                Fotos de Evolução
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Foto Antes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto Antes</label>
                  {beforePhoto ? (
                    <div className="relative">
                      <img src={beforePhoto} alt="Antes" className="w-full h-64 object-cover rounded-xl" />
                      <button
                        onClick={() => handleRemovePhoto('before')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Clique para adicionar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload('before', e)}
                      />
                    </label>
                  )}
                </div>

                {/* Foto Depois */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto Depois</label>
                  {afterPhoto ? (
                    <div className="relative">
                      <img src={afterPhoto} alt="Depois" className="w-full h-64 object-cover rounded-xl" />
                      <button
                        onClick={() => handleRemovePhoto('after')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Clique para adicionar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload('after', e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weight Tab */}
        {activeTab === 'weight' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Adicionar Peso</h3>
              <form onSubmit={handleAddWeight} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="date"
                    value={weightForm.date}
                    onChange={(e) => setWeightForm({...weightForm, date: e.target.value})}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Peso (kg)"
                    value={weightForm.weight}
                    onChange={(e) => setWeightForm({...weightForm, weight: e.target.value})}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Observações"
                    value={weightForm.notes}
                    onChange={(e) => setWeightForm({...weightForm, notes: e.target.value})}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Peso
                </button>
              </form>
            </div>

            {/* Histórico de Peso */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico</h3>
              <div className="space-y-3">
                {data.weights.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum registro ainda</p>
                ) : (
                  data.weights.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900">{entry.weight}kg</div>
                        <div className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString('pt-BR')}</div>
                        {entry.notes && <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>}
                      </div>
                      <button
                        onClick={() => {
                          storage.deleteWeight(entry.id!);
                          refreshData();
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medication Tab */}
        {activeTab === 'medication' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Registrar Medicação</h3>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={medForm.date}
                    onChange={(e) => setMedForm({...medForm, date: e.target.value})}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  <select
                    value={medForm.medication}
                    onChange={(e) => setMedForm({...medForm, medication: e.target.value})}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="ozempic">Ozempic</option>
                    <option value="wegovy">Wegovy</option>
                    <option value="mounjaro">Mounjaro</option>
                    <option value="saxenda">Saxenda</option>
                    <option value="victoza">Victoza</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Dosagem (ex: 0.5mg)"
                    value={medForm.dosage}
                    onChange={(e) => setMedForm({...medForm, dosage: e.target.value})}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  <input
                    type="time"
                    value={medForm.time}
                    onChange={(e) => setMedForm({...medForm, time: e.target.value})}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Observações"
                  value={medForm.notes}
                  onChange={(e) => setMedForm({...medForm, notes: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Medicação
                </button>
              </form>
            </div>

            {/* Histórico de Medicação */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico</h3>
              <div className="space-y-3">
                {data.medications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum registro ainda</p>
                ) : (
                  data.medications.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{entry.medication} - {entry.dosage}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(entry.date).toLocaleDateString('pt-BR')} às {entry.time}
                        </div>
                        {entry.notes && <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>}
                      </div>
                      <button
                        onClick={() => {
                          storage.deleteMedication(entry.id!);
                          refreshData();
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Registrar Hábitos</h3>
              <form onSubmit={handleAddHabit} className="space-y-4">
                <input
                  type="date"
                  value={habitForm.date}
                  onChange={(e) => setHabitForm({...habitForm, date: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  required
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      Água (copos)
                    </label>
                    <input
                      type="number"
                      value={habitForm.waterIntake}
                      onChange={(e) => setHabitForm({...habitForm, waterIntake: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-600" />
                      Sono (horas)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={habitForm.sleep}
                      onChange={(e) => setHabitForm({...habitForm, sleep: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={habitForm.exercise}
                      onChange={(e) => setHabitForm({...habitForm, exercise: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Dumbbell className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Fiz exercício hoje</span>
                  </label>
                  {habitForm.exercise && (
                    <input
                      type="number"
                      placeholder="Minutos de exercício"
                      value={habitForm.exerciseMinutes}
                      onChange={(e) => setHabitForm({...habitForm, exerciseMinutes: e.target.value})}
                      className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-yellow-600" />
                    Como está seu humor?
                  </label>
                  <select
                    value={habitForm.mood}
                    onChange={(e) => setHabitForm({...habitForm, mood: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="otimo">Ótimo</option>
                    <option value="bom">Bom</option>
                    <option value="regular">Regular</option>
                    <option value="ruim">Ruim</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Observações"
                  value={habitForm.notes}
                  onChange={(e) => setHabitForm({...habitForm, notes: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Hábitos
                </button>
              </form>
            </div>

            {/* Histórico de Hábitos */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico</h3>
              <div className="space-y-3">
                {data.habits.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum registro ainda</p>
                ) : (
                  data.habits.map((entry, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-gray-900">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </div>
                        <button
                          onClick={() => {
                            storage.deleteHabit(entry.id!);
                            refreshData();
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-blue-600" />
                          <span>{entry.waterIntake} copos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-600" />
                          <span>{entry.sleep}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-green-600" />
                          <span>{entry.exercise ? `${entry.exerciseMinutes || 0}min` : 'Não'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smile className="w-4 h-4 text-yellow-600" />
                          <span className="capitalize">{entry.mood}</span>
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-gray-500 mt-2">{entry.notes}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            {quizCompleted ? (
              <>
                {/* Resumo do Perfil */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600" />
                      Seu Objetivo
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Peso Inicial:</span> {quizData.startingWeight}kg</p>
                      <p><span className="font-medium">Peso Atual:</span> {quizData.measurements.weight}kg</p>
                      <p><span className="font-medium">Peso Meta:</span> {quizData.targetWeight}kg</p>
                      <p><span className="font-medium">Faltam:</span> {(parseFloat(quizData.measurements.weight) - parseFloat(quizData.targetWeight)).toFixed(1)}kg</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Seu Protocolo
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Medicação:</span> {quizData.medication}</p>
                      <p><span className="font-medium">Dose:</span> {quizData.currentDose}</p>
                      <p><span className="font-medium">Frequência:</span> {quizData.applicationFrequency}</p>
                      <p><span className="font-medium">Próxima aplicação:</span> {calculateNextApplication()}</p>
                    </div>
                  </div>
                </div>

                {/* Metas Nutricionais */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-600" />
                    Metas Nutricionais Diárias
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{calculateWaterIntake()}L</div>
                      <div className="text-sm text-gray-600">Água</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{calculateProtein()}g</div>
                      <div className="text-sm text-gray-600">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{calculateFiber()}g</div>
                      <div className="text-sm text-gray-600">Fibras</div>
                    </div>
                  </div>
                </div>

                {/* Dicas Personalizadas */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Dicas Personalizadas
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-gray-700">
                        💧 Beba {calculateWaterIntake()}L de água por dia para otimizar os efeitos da medicação e reduzir efeitos colaterais.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-gray-700">
                        🥩 Consuma {calculateProtein()}g de proteína diariamente para preservar massa muscular durante o emagrecimento.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-gray-700">
                        🥗 Inclua {calculateFiber()}g de fibras para melhorar a digestão e controlar a saciedade.
                      </p>
                    </div>
                    {quizData.mainSideEffect !== 'nenhum' && (
                      <div className="p-4 bg-yellow-50 rounded-xl">
                        <p className="text-sm text-gray-700">
                          ⚠️ Para {quizData.mainSideEffect}: Faça refeições menores e mais frequentes, evite alimentos gordurosos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Personalizado Bloqueado</h3>
                <p className="text-gray-600 mb-6">Complete o quiz na aba "Emagrecer" para desbloquear seu plano personalizado</p>
                <button
                  onClick={() => setActiveTab('emagrecer')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Ir para o Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* Emagrecer Tab */}
        {activeTab === 'emagrecer' && (
          <div className="space-y-6">
            {!quizCompleted ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
                  <Apple className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Comece Sua Jornada de Emagrecimento</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Responda nosso quiz personalizado e receba um plano sob medida para potencializar seus resultados com GLP-1
                </p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  Iniciar Quiz
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completo!</h2>
                <p className="text-gray-600 mb-8">
                  Seu plano personalizado está disponível na aba "Plano Personalizado"
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('plan')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Ver Meu Plano
                  </button>
                  {!isPremium && (
                    <button
                      onClick={() => setShowPlanSelection(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Assinar Premium
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
