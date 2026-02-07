'use client';

import { useState } from 'react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Eye, EyeOff, UserPlus, Heart, AlertCircle, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { usePayments } from '@/hooks/usePayments';
import { UserAPI } from '@/lib/user-api';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  professionalNumber: string;
  country: string;
  referralCode: string;
  termsAccepted: boolean;
}

export default function RegisterPage() {
  const t = useTranslations('Auth.Register');
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionalNumber: '',
    country: 'España',
    referralCode: '',
    termsAccepted: false,
  });

  const [legalLiabilityAccepted, setLegalLiabilityAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // We use local loading state for UI feedback, but actual logic relies on hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { createCheckoutSession, createInitialCheckoutSession } = usePayments();

  const selectedPlan = searchParams.get('plan');
  const billingInterval = searchParams.get('interval');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Handle checkbox separately
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    // Clear error when user starts typing
    if (localError) setLocalError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setLocalError('El nombre es requerido');
      return false;
    }

    if (!formData.lastName.trim()) {
      setLocalError('El apellido es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      setLocalError('El email es requerido');
      return false;
    }

    if (!formData.professionalNumber.trim()) {
      setLocalError('El número profesional es requerido');
      return false;
    }

    if (!legalLiabilityAccepted) {
      setLocalError('Debes certificar la veracidad de tu habilitación profesional');
      return false;
    }

    if (!formData.termsAccepted) {
      setLocalError('Debes aceptar los términos y condiciones');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Formato de email inválido');
      return false;
    }

    if (formData.password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      // 2. Check for Plan Selection
      // params are now at component level

      // 1. Register User with Plan info (this also handles Auto-Login in AuthContext if no verification needed)
      const { success: isLoggedIn, user: registeredUser } = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        professionalNumber: formData.professionalNumber,
        country: formData.country,
        referralCode: formData.referralCode || undefined,
        role: 'PSYCHOLOGIST',
        plan: selectedPlan || undefined,
        interval: billingInterval || undefined
      });

      if (!isLoggedIn) {
        // Verification required flow OR Payment Required flow
        // Check if we have a user and a paid plan selected
        if (registeredUser && selectedPlan && selectedPlan !== 'demo') {
          try {
            await createInitialCheckoutSession(
              registeredUser.id,
              selectedPlan,
              (billingInterval as 'month' | 'year') || 'month'
            );
            return;
          } catch (paymentError) {
            console.error('Error initiating payment redirect:', paymentError);
            setLocalError('Error iniciando la pasarela de pago. Tu cuenta ha sido creada pero requiere pago. Por favor inicia sesión par aintentarlo de nuevo.');
            setIsSubmitting(false);
            return;
          }
        }

        setIsVerificationSent(true);
        setIsSubmitting(false);
        return;
      }

      // Check if a paid plan is selected (Basic is now paid, only 'demo' or null is free/trial)
      if (selectedPlan && selectedPlan !== 'demo') {
        // 3. Initiate Checkout for Paid Plans (Authenticted User)
        try {
          // Cast the string to the expected union type for safety after verification
          // In a real scenario we'd validate against the allowed values list
          await createCheckoutSession({
            plan: selectedPlan as any,
            interval: (billingInterval as 'month' | 'year') || 'month'
          });
          // Note: createCheckoutSession handles redirection window.location.href
          // We wait here to prevent unmounting/redirecting to dashboard prematurely
          return;
        } catch (paymentError) {
          console.error('Error initiating payment redirect:', paymentError);

          // ROLLBACK: Delete the created user if payment fails to initialize
          try {
            await UserAPI.deleteAccount();
            console.log('Rollback successful: User deleted.');
          } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
          }

          // Logout locally to clean up state
          // Assuming 'logout' is available from useAuth, otherwise we just clear tokens or let context handle it
          // We can't access logout directly if it wasn't destructured, checking imports...
          // We only have { register } from useAuth(). detailed below.

          setLocalError('Error iniciando la pasarela de pago. La cuenta no se ha creado. Por favor, inténtalo de nuevo.');
          setIsSubmitting(false);
          return;
        }
      }

      // 4. Fallback: Redirect to success/dashboard for Basic/Demo plans
      // We use window.location to ensure a hard refresh of context if needed, 
      // though router.push is usually fine with client-side context updates.
      router.push('/dashboard');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en el registro';
      setLocalError(errorMessage);
      setIsSubmitting(false); // Only stop loading if we hit an error (otherwise we are redirecting)
    }
  };

  if (isVerificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('successTitle')}</h2>
          <p className="text-gray-600">
            {t.rich('successMessage', {
              email: formData.email,
              bold: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          <div className="pt-4">
            <Link
              href="/auth/login"
              className="inline-block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {t('successButton')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

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

        {/* Google Register Button */}
        <div>
          <a
            href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google?state=${typeof window !== 'undefined' ? encodeURIComponent(btoa(JSON.stringify({ action: 'register', plan: selectedPlan, interval: billingInterval }))) : 'register'}`}
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

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('firstName')}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('firstNamePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('lastName')}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('lastNamePlaceholder')}
                />
              </div>
            </div>

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


            {/* Professional Fields - B2B Requirement */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="professionalNumber" className="block text-sm font-medium text-gray-700">
                  {t('professionalNumber')}
                </label>
                <input
                  id="professionalNumber"
                  name="professionalNumber"
                  type="text"
                  required
                  value={formData.professionalNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('professionalNumberPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  {t('country')}
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('countryPlaceholder')}</option>
                  <option value="España">España</option>
                  <option value="Andorra">Andorra</option>
                  <option value="Francia">Francia</option>
                  <option value="Otro">Otro (UE)</option>
                </select>
              </div>
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirmPassword')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder={t('confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            {searchParams.get('plan') && searchParams.get('plan') !== 'basic' && (
              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
                  {t('referralCode')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder={t('referralCodePlaceholder')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Gift className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Liability Checkbox */}
            <div className="flex items-start p-3 bg-red-50 rounded-md border border-red-100">
              <div className="flex items-center h-5">
                <input
                  id="legalLiabilityAccepted"
                  name="legalLiabilityAccepted"
                  type="checkbox"
                  required
                  checked={legalLiabilityAccepted}
                  onChange={(e) => setLegalLiabilityAccepted(e.target.checked)}
                  className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="legalLiabilityAccepted" className="font-medium text-gray-800">
                  {t('liabilityLabel')}
                </label>
                <p className="text-gray-600 mt-1 text-xs text-justify">
                  {t.rich('liabilityText', {
                    bold: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="termsAccepted" className="font-medium text-gray-700">
                  {t.rich('termsLabel', {
                    terms: (chunks) => <Link href="/dashboard/compliance?tab=terms" target="_blank" className="text-blue-600 hover:text-blue-500">{chunks}</Link>,
                    privacy: (chunks) => <Link href="/dashboard/compliance?tab=gdpr" target="_blank" className="text-blue-600 hover:text-blue-500">{chunks}</Link>
                  })}
                </label>
                <p className="text-gray-500 mt-1 text-xs">{t('disclaimer')}</p>
              </div>
            </div>

          </div>

          {/* Error message */}
          {localError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{localError}</span>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {searchParams.get('plan') ? t('submittingPaid') : t('submittingFree')}
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {searchParams.get('plan') ? t('submitPaid') : t('submitFree')}
                </div>
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500">
            {t.rich('footerText', {
              terms: (chunks) => <Link href="/dashboard/compliance?tab=terms" target="_blank" className="text-blue-600 hover:text-blue-500">{chunks}</Link>,
              privacy: (chunks) => <Link href="/dashboard/compliance?tab=gdpr" target="_blank" className="text-blue-600 hover:text-blue-500">{chunks}</Link>
            })}
          </p>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('alreadyAccount')}{' '}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {t('loginLink')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}