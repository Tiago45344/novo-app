'use client';

import { useEffect, useState } from 'react';
import { checkPremiumStatus, getSubscriptionInfo } from '@/lib/auth';

interface PremiumCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que verifica o status premium do usuário
 * e renderiza o conteúdo apenas se o usuário for premium
 */
export function PremiumCheck({ children, fallback }: PremiumCheckProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Verificar localStorage primeiro
        const localPremium = localStorage.getItem('isPremium') === 'true';
        
        if (localPremium) {
          setIsPremium(true);
          setIsLoading(false);
          return;
        }

        // Se não tem no localStorage, verificar no banco
        const userId = localStorage.getItem('userId');
        if (userId) {
          const premiumStatus = await checkPremiumStatus(userId);
          setIsPremium(premiumStatus);
          
          // Sincronizar com localStorage
          if (premiumStatus) {
            localStorage.setItem('isPremium', 'true');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status premium:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isPremium && fallback) {
    return <>{fallback}</>;
  }

  if (!isPremium) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook para verificar se o usuário é premium
 */
export function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Verificar localStorage primeiro
        const localPremium = localStorage.getItem('isPremium') === 'true';
        
        if (localPremium) {
          setIsPremium(true);
          
          // Buscar informações da assinatura se tiver userId
          const userId = localStorage.getItem('userId');
          if (userId) {
            const subInfo = await getSubscriptionInfo(userId);
            setSubscription(subInfo);
          }
          
          setIsLoading(false);
          return;
        }

        // Se não tem no localStorage, verificar no banco
        const userId = localStorage.getItem('userId');
        if (userId) {
          const premiumStatus = await checkPremiumStatus(userId);
          setIsPremium(premiumStatus);
          
          if (premiumStatus) {
            localStorage.setItem('isPremium', 'true');
            const subInfo = await getSubscriptionInfo(userId);
            setSubscription(subInfo);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status premium:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { isPremium, isLoading, subscription };
}
