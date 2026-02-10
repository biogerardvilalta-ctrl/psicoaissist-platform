'use client';

import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Link } from '@/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PaymentSuccessPage() {
  const t = useTranslations('Payment.Success');
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string>('');
  const [planName, setPlanName] = useState<string>('');
  const { reloadUser } = useAuth();

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id') || '';
    const planParam = searchParams.get('plan') || '';

    setSessionId(sessionIdParam);

    // Convertir el plan type a nombre legible
    const planNames: Record<string, string> = {
      'basic': t('plans.basic'),
      'pro': t('plans.pro'),
      'premium': t('plans.premium')
    };
    setPlanName(planNames[planParam] || planParam || t('plans.selected'));
    setPlanName(planNames[planParam] || planParam || t('plans.selected'));

    if (sessionIdParam) {
      // Synchronous Verification to ensure user is active immediately
      // This bypasses potential webhook delays/failures in dev/prod
      console.log('Verifying session:', sessionIdParam);
      import('@/lib/payments-api').then(({ PaymentsAPI }) => {
        PaymentsAPI.verifySession(sessionIdParam)
          .then(async (result) => {
            console.log('Verification result:', result);
            if (result.success) {
              // Force reload user to update status/limits locally
              console.log('Payment verified. Reloading user profile...');
              await reloadUser();
              // Optional: Force hard reload if context isn't enough or to clear valid-but-stale state
              // setTimeout(() => window.location.reload(), 1000); 
            }
          })
          .catch(err => console.error('Verification failed', err));
      });
    }

  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>

        <p className="text-gray-600 mb-4">
          {t('message', { plan: planName })}
        </p>

        {/* Demo mode indicator */}
        {sessionId.includes('demo') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              🎭 <strong>{t('demo.title')}</strong> - {t('demo.message')}
            </p>
          </div>
        )}

        {/* What's next */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">{t('next.title')}</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ {t('next.dashboard')}</li>
            <li>✓ {t('next.profile')}</li>
            <li>✓ {t('next.firstSession')}</li>
            <li>✓ {t('next.exploreAI')}</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('actions.goToDashboard')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            {t('actions.backHome')}
          </Link>
        </div>

        {/* Support info */}
        <p className="text-xs text-gray-500 mt-6">
          {t('support.message')} <a href="/contact" className="text-blue-600 hover:underline">{t('support.link')}</a>
        </p>
      </div>
    </div>
  );
}