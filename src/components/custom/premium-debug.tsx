'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Trash2 } from 'lucide-react';

export function PremiumDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const loadDebugInfo = () => {
    const info = {
      isPremium: localStorage.getItem('isPremium'),
      paymentInfo: localStorage.getItem('paymentInfo'),
      premiumActivatedAt: localStorage.getItem('premiumActivatedAt'),
      quizCompleted: localStorage.getItem('quizCompleted'),
      selectedPlan: localStorage.getItem('selectedPlan'),
      timestamp: new Date().toISOString(),
    };
    setDebugInfo(info);
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const handleRefresh = () => {
    loadDebugInfo();
  };

  const handleClearPremium = () => {
    if (confirm('Tem certeza que deseja limpar o status premium? (Para testes)')) {
      localStorage.removeItem('isPremium');
      localStorage.removeItem('paymentInfo');
      localStorage.removeItem('premiumActivatedAt');
      loadDebugInfo();
      window.location.reload();
    }
  };

  const handleSetPremium = () => {
    if (confirm('Ativar status premium manualmente? (Para testes)')) {
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('premiumActivatedAt', new Date().toISOString());
      localStorage.setItem('paymentInfo', JSON.stringify({
        activatedAt: new Date().toISOString(),
        sessionId: 'manual_test',
        clientReferenceId: 'manual_test',
      }));
      loadDebugInfo();
      window.location.reload();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all z-50"
        title="Debug Premium Status"
      >
        🔍
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl p-6 max-w-md z-50 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Debug Premium Status</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Status Premium:</span>
              {debugInfo.isPremium === 'true' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {debugInfo.isPremium === 'true' ? 'Ativo' : 'Inativo'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-semibold text-gray-700 block mb-2">Payment Info:</span>
            <p className="text-xs text-gray-600 break-all">
              {debugInfo.paymentInfo ? '✓ Presente' : '✗ Ausente'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-semibold text-gray-700 block mb-2">Ativado em:</span>
            <p className="text-xs text-gray-600">
              {debugInfo.premiumActivatedAt || 'N/A'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-semibold text-gray-700 block mb-2">Quiz Completo:</span>
            <p className="text-xs text-gray-600">
              {debugInfo.quizCompleted === 'true' ? '✓ Sim' : '✗ Não'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-semibold text-gray-700 block mb-2">Plano Selecionado:</span>
            <p className="text-xs text-gray-600 capitalize">
              {debugInfo.selectedPlan || 'N/A'}
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleRefresh}
              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button
              onClick={handleSetPremium}
              className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Ativar
            </button>
            <button
              onClick={handleClearPremium}
              className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            Última atualização: {new Date(debugInfo.timestamp).toLocaleTimeString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
}
