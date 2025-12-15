'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Processar o pagamento bem-sucedido
    const processPayment = async () => {
      try {
        // Simular verificação do pagamento (em produção, você verificaria com a API do Stripe)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Atualizar status premium no localStorage
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('premiumActivatedAt', new Date().toISOString());
        
        // Salvar informações do pagamento
        const paymentInfo = {
          activatedAt: new Date().toISOString(),
          sessionId: searchParams.get('session_id') || 'unknown',
          clientReferenceId: searchParams.get('client_reference_id') || 'unknown',
        };
        localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

        setStatus('success');

        // Iniciar contagem regressiva
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        setStatus('error');
      }
    };

    processPayment();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
          {status === 'processing' && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                Processando Pagamento...
              </h2>
              <p className="text-gray-600">
                Aguarde enquanto confirmamos seu pagamento
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                Pagamento Confirmado! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Sua conta foi atualizada para Premium com sucesso
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-green-800">
                    Você agora é Premium!
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <p>✓ Registro ilimitado de peso, medicação e hábitos</p>
                  <p>✓ Plano personalizado baseado no seu perfil</p>
                  <p>✓ Gráficos e estatísticas detalhadas</p>
                  <p>✓ Todas as funcionalidades desbloqueadas</p>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Redirecionando em <span className="font-bold text-indigo-600 text-xl">{countdown}</span> segundos...
                </p>
              </div>

              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                Ir para o App Agora
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                Ops! Algo deu errado
              </h2>
              <p className="text-gray-600 mb-6">
                Não conseguimos processar seu pagamento. Por favor, entre em contato com o suporte.
              </p>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                Voltar ao App
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Problemas? Entre em contato com nosso suporte
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
