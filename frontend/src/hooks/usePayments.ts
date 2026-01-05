'use client';

import { useState, useCallback } from 'react';
import { PaymentsAPI } from '@/lib/payments-api';
import type { Plan, CreateCheckoutSessionRequest } from '@/types/payments';
import { useToast } from '@/hooks/use-toast';

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const createCheckoutSession = useCallback(async (request: CreateCheckoutSessionRequest) => {
    console.log('🔄 Iniciando createCheckoutSession:', request);
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Llamando a PaymentsAPI.createCheckoutSession...');
      const session = await PaymentsAPI.createCheckoutSession(request);
      console.log('✅ Sesión creada:', session);

      if (session.url) {
        console.log('🔗 Redirigiendo a:', session.url);
        window.location.href = session.url;
      } else if (session.success) {
        toast({
          title: "Operación Exitosa",
          description: session.message || "Plan actualizado correctamente.",
          duration: 5000,
        });
        // Reload page to reflect changes? Or just return.
        // Reloading might be safer to refresh permissions without complex state updates.
        setTimeout(() => window.location.reload(), 1500);
      }

      return session;
    } catch (err) {
      console.error('❌ Error en createCheckoutSession:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
    const changePlan = useCallback(async (newPlanId: string, subscriptionId: string) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`🔄 Actualizando plan a ${newPlanId} para suscripción ${subscriptionId}...`);
        await PaymentsAPI.updateSubscription(newPlanId, subscriptionId);

        toast({
          title: "Plan Actualizado",
          description: "Tu suscripción ha sido mejorada correctamente.",
          duration: 5000,
        });

        // Refresh page to update permissions
        setTimeout(() => window.location.reload(), 1500);

      } catch (err) {
        console.error('❌ Error actualizando plan:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        toast({
          title: "Error de Actualización",
          description: errorMessage,
          variant: "destructive"
        });
        throw err;
      } finally {
        setLoading(false);
      }
    }, [toast]);
  }, []);

  const changePlan = useCallback(async (newPlanId: string, subscriptionId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Actualizando plan a ${newPlanId} para suscripción ${subscriptionId}...`);
      await PaymentsAPI.updateSubscription(newPlanId, subscriptionId);

      toast({
        title: "Plan Actualizado",
        description: "Tu suscripción ha sido mejorada correctamente.",
        duration: 5000,
      });

      // Refresh page to update permissions
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      console.error('❌ Error actualizando plan:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error de Actualización",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    createCheckoutSession,
    openCustomerPortal,
    cancelSubscription,
    changePlan,
  };
}