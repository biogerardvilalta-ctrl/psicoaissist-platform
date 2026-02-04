'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Eye, EyeOff, LogIn, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { AuthAPI } from '@/lib/auth-api';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const t = useTranslations('Auth.Login');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, isLoading, error, clearError, isAuthenticated, user, loginWithTokens } = useAuth();
  const { createCheckoutSession } = usePayments();
  const { toast } = useToast();

  const processedRef = useRef(false);

  useEffect(() => {
    // Wait for auth check to finish before processing URL tokens (prevents race condition)
    if (isLoading) return;

    // Check for Google Login tokens in URL
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    // Check for error messages from redirects (e.g. Google Login failure)
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'account_not_found') {
        clearError(); // Clear any previous errors
        setSuccessMessage(null);
        logout(); // Force logout to prevent redirect to dashboard
        toast({
          title: t('accountNotFoundTitle'),
          description: t('accountNotFoundMessage'),
          variant: "destructive",
          duration: 6000,
        });
      } else {
        const errorDesc = searchParams.get('error_description');
        logout(); // Force logout on any login error
        toast({
          title: t('errorTitle'),
          description: errorDesc ? decodeURIComponent(errorDesc) : `Ha ocurrido un error al intentar iniciar sesión (Código: ${errorParam}).`,
          variant: "destructive",
          duration: 6000,
        });
      }
      // Clean URL and stop processing
      // Use router.replace to ensure useSearchParams hook updates (fixes persistent error loop)
      router.replace('/auth/login');
      return;
    }

    // Check for success message from registration
    const message = searchParams.get('message');
    if (message === 'registro-exitoso') {
      setSuccessMessage(t('successMessage'));
    }

    if (accessToken && refreshToken && !processedRef.current) {
      processedRef.current = true;
      const handleGoogleLogin = async () => {
        try {
          // Clear params from URL
          window.history.replaceState({}, '', '/auth/login');

          // Explicitly logout from backend to clear any httpOnly session cookies
          // This prevents the backend from prioritizing an old session over the new tokens
          await AuthAPI.logout().catch(() => { });

          // CRITICAL: Force clear any existing session/storage to prevent mixing users
          // accessing direct localStorage since logout() might trigger state updates we don't want yet
          localStorage.removeItem('psychoai_user');
          localStorage.removeItem('psychoai_access_token');
          localStorage.removeItem('psychoai_refresh_token');
          sessionStorage.clear();

          // Set tokens in storage for API calls
          localStorage.setItem('psychoai_access_token', accessToken);
          localStorage.setItem('psychoai_refresh_token', refreshToken);

          // Fetch user profile
          const user = await AuthAPI.getCurrentUser();

          if (user) {
            // Update context state atomically
            await loginWithTokens(user, { accessToken, refreshToken });

            // Check if there is a pending plan selection from registration
            const plan = searchParams.get('plan');
            const interval = searchParams.get('interval') as 'month' | 'year' | undefined;

            if (plan && plan !== 'demo') {
              console.log('Redirecting to payment for plan:', plan);
              await createCheckoutSession({
                plan: plan as any,
                interval: interval || 'month'
              });
              // Return to avoid dashboard redirect
              return;
            }
          }
        } catch (error) {
          console.error('Google login error:', error);
          localStorage.removeItem('psychoai_access_token');
          localStorage.removeItem('psychoai_refresh_token');
        }
      };

      handleGoogleLogin();
      return;
    }

    // Redirect if already authenticated
    if (isAuthenticated && user) {
      // Don't redirect if we are about to process a payment plan
      if (searchParams.get('plan')) return;

      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      return;
    }


  }, [searchParams, isAuthenticated, user, router, isLoading, t, clearError, logout, toast, loginWithTokens, createCheckoutSession]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear messages when user starts typing
    if (error) clearError();
    if (successMessage) setSuccessMessage(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }

    if (!formData.password) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login({ email: formData.email, password: formData.password }, formData.rememberMe);
      // Redirect is handled by useEffect when user state changes
    } catch (err: any) {
      console.error('Login error:', err);
      // Error display is handled by AuthContext
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">{t('submitting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
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

        {/* Google Login Button */}
        <div>
          <a
            href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('google')}
          </a>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('divider')}</span>
            </div>
          </div>
        </div>

        {/* Demo credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">🎮 Quick Login (Click para rellenar):</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, email: 'admin@psicoaissist.com', password: 'password123' }))}
                className="w-full text-left bg-white/50 hover:bg-white border border-blue-100 rounded p-2 text-xs text-blue-700 transition-colors flex justify-between items-center"
              >
                <span className="font-semibold">Admin</span>
                <span className="opacity-75">admin@psicoaissist.com</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, email: 'basic@plan.com', password: 'password123' }))}
                  className="text-left bg-white/50 hover:bg-white border border-blue-100 rounded p-2 text-xs text-blue-700 transition-colors"
                >
                  <div className="font-semibold">🥉 Basic</div>
                  <div className="opacity-75 truncate">basic@plan.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, email: 'pro@plan.com', password: 'password123' }))}
                  className="text-left bg-white/50 hover:bg-white border border-blue-100 rounded p-2 text-xs text-blue-700 transition-colors"
                >
                  <div className="font-semibold">🥈 Pro</div>
                  <div className="opacity-75 truncate">pro@plan.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, email: 'premium@plan.com', password: 'password123' }))}
                  className="text-left bg-white/50 hover:bg-white border border-blue-100 rounded p-2 text-xs text-blue-700 transition-colors"
                >
                  <div className="font-semibold">🥇 Premium</div>
                  <div className="opacity-75 truncate">premium@plan.com</div>
                </button>


              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('emailPlaceholder')}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder={t('passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                {t('rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('submitting')}
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('submit')}
                </div>
              )}
            </button>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('noAccount')}{' '}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {t('registerLink')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}