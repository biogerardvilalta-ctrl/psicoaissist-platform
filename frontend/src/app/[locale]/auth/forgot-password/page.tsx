'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Loader2, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';
import { AuthAPI } from '@/lib/auth-api';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.ForgotPassword');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      await AuthAPI.forgotPassword(email);

      setStatus('success');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setStatus('error');
      setErrorMessage(err.message || t('errors.general'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h2>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900">{t('success.title')}</h3>
            <p className="text-sm text-green-700">
              {t('success.message')}
            </p>
            <div className="pt-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-violet-600 hover:text-violet-500 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToLogin')}
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                {status === 'loading' ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    {t('sending')}
                  </div>
                ) : (
                  t('submitButton')
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {t('backToLogin')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
