import { useState, useEffect, useCallback } from 'react';
import { httpClient } from '@/lib/http-client';

export interface OnboardingStepData {
  id: string;
  completed: boolean;
}

export interface OnboardingData {
  steps: OnboardingStepData[];
  completedCount: number;
  totalSteps: number;
  isFullyCompleted: boolean;
}

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await httpClient.get('/users/me/onboarding');
      setData(response as OnboardingData);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    data,
    loading,
    error,
    refreshProgress: fetchProgress
  };
}
