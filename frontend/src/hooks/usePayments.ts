'use client';

import { useState, useCallback } from 'react';
import { PaymentsAPI } from '@/lib/payments-api';
import stripePromise from '@/lib/stripe';
import type { Plan, CreateCheckoutSessionRequest } from '@/types/payments';

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = useCallback(async (request: CreateCheckoutSessionRequest) => {
    console.log('🔄 Iniciando createCheckoutSession:', request);
    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      console.log('📡 Llamando a PaymentsAPI.createCheckoutSession...');
      const session = await PaymentsAPI.createCheckoutSession(request);
      console.log('✅ Sesión creada:', session);
      
      // Redirect to Stripe Checkout using the modern approach
      const redirectUrl = session.url || `https://checkout.stripe.com/pay/${session.sessionId}`;
      console.log('🔗 Redirigiendo a:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('❌ Error en createCheckoutSession:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { url } = await PaymentsAPI.createPortalSession();
      window.location.href = url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await PaymentsAPI.cancelSubscription();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCheckoutSession,
    openCustomerPortal,
    cancelSubscription,
  };
}