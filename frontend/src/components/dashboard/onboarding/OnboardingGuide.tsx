import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { UserAPI } from '@/lib/user-api';

export const OnboardingGuide = () => {
  const t = useTranslations('Onboarding');
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { data, loading } = useOnboarding();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Load state from user dashboard layout config
    if (user?.dashboardLayout) {
      if (user.dashboardLayout.includes('onboarding_dismissed')) {
        setIsDismissed(true);
      }
      if (user.dashboardLayout.includes('onboarding_minimized')) {
        setIsMinimized(true);
      }
    }
  }, [user]);

  const saveLayout = async (newLayout: string[]) => {
    if (!user) return;
    try {
      await UserAPI.updateDashboardLayout(user.id, newLayout);
      updateUser({ ...user, dashboardLayout: newLayout });
    } catch (e) {
      console.error('Failed to save layout', e);
    }
  };

  const handleDismiss = async () => {
    setIsDismissed(true);
    if (user) {
      const currentLayout = Array.isArray(user.dashboardLayout) ? [...user.dashboardLayout] : [];
      if (!currentLayout.includes('onboarding_dismissed')) {
        currentLayout.push('onboarding_dismissed');
        await saveLayout(currentLayout);
      }
    }
  };

  const handleToggleMinimize = async () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    
    if (user) {
      const currentLayout = Array.isArray(user.dashboardLayout) ? [...user.dashboardLayout] : [];
      let updatedLayout = currentLayout;
      
      if (newMinimizedState && !currentLayout.includes('onboarding_minimized')) {
        updatedLayout = [...currentLayout, 'onboarding_minimized'];
      } else if (!newMinimizedState) {
        updatedLayout = currentLayout.filter(item => item !== 'onboarding_minimized');
      }
      
      if (updatedLayout.length !== currentLayout.length) {
        await saveLayout(updatedLayout);
      }
    }
  };

  const navigateToStep = (stepId: string) => {
    switch (stepId) {
      case 'create_client':
        router.push('/dashboard/clients?action=new');
        break;
      case 'create_session':
        router.push('/dashboard/sessions?action=new');
        break;
      case 'start_session':
        router.push('/dashboard/sessions');
        break;
      case 'start_recording':
        router.push('/dashboard/sessions');
        break;
      case 'generate_report':
        router.push('/dashboard/reports');
        break;
    }
  };

  if (loading || isDismissed || !data) return null;

  // Auto dismiss if fully completed and not already dismissed
  if (data.isFullyCompleted) {
    return null; 
  }

  const progressPercentage = Math.round((data.completedCount / data.totalSteps) * 100);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${isMinimized ? 'w-16 h-16 rounded-full' : 'w-80 rounded-xl'} bg-white shadow-2xl border border-slate-200 overflow-hidden`}>
      {isMinimized ? (
        <button 
          onClick={handleToggleMinimize}
          className="w-full h-full flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors relative group"
        >
          <Target className="w-8 h-8" />
          {/* Progress ring or badge */}
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {data.completedCount}/{data.totalSteps}
          </div>
          <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs px-2 py-1 rounded -top-8 whitespace-nowrap transition-opacity">
            {t('title')}
          </div>
        </button>
      ) : (
        <div className="flex flex-col h-full max-h-[500px]">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{t('title')}</h3>
              <p className="text-indigo-100 text-xs mt-1">{t('subtitle')}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={handleToggleMinimize} className="p-1 hover:bg-white/20 rounded transition-colors text-white" aria-label="Minimize">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={handleDismiss} className="p-1 hover:bg-white/20 rounded transition-colors text-white" aria-label="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
            <div className="flex justify-between text-xs font-medium text-indigo-900 mb-2">
              <span>{t('progress')}</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-indigo-200" />
          </div>

          {/* Steps */}
          <div className="overflow-y-auto p-2 space-y-1">
            {data.steps.map((step) => {
              const isCompleted = step.completed;
              return (
                <div 
                  key={step.id} 
                  className={`p-3 rounded-lg border flex gap-3 transition-colors ${isCompleted ? 'bg-slate-50 border-transparent' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {t(`steps.${step.id}.title` as any)}
                    </p>
                    {!isCompleted && (
                      <>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {t(`steps.${step.id}.desc` as any)}
                        </p>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-xs text-indigo-600 mt-2 hover:text-indigo-800"
                          onClick={() => navigateToStep(step.id)}
                        >
                          {t(`steps.${step.id}.action` as any)} &rarr;
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
