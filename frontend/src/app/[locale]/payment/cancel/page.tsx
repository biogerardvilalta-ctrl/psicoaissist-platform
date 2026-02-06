'use client';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function PaymentCancelPage() {
  const t = useTranslations('Payment.Cancel');
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Cancel icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>

        <p className="text-gray-600 mb-8">
          {t('message')}
        </p>

        {/* Reasons */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-yellow-900 mb-2">{t('reasons.title')}</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {t('reasons.cancelled')}</li>
            <li>• {t('reasons.paymentError')}</li>
            <li>• {t('reasons.sessionExpired')}</li>
            <li>• {t('reasons.connectivity')}</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/#pricing"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('actions.retry')}
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('actions.backHome')}
          </Link>
        </div>

        {/* Help section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">{t('help.title')}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {t('help.message')}
          </p>
          <div className="space-y-2">
            <a
              href="mailto:soporte@psicoaissist.com"
              className="block text-sm text-blue-600 hover:underline"
            >
              📧 soporte@psicoaissist.com
            </a>
            <a
              href="/chat"
              className="block text-sm text-blue-600 hover:underline"
            >
              {t('help.liveChat')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}