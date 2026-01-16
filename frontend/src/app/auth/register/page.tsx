'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Heart, AlertCircle, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { usePayments } from '@/hooks/usePayments';
import { UserAPI } from '@/lib/user-api';

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { createCheckoutSession } = usePayments();

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
      // 1. Register User (this also handles Auto-Login in AuthContext)
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        professionalNumber: formData.professionalNumber,
        country: formData.country,
        referralCode: formData.referralCode || undefined,
        role: 'PSYCHOLOGIST'
      });

      // 2. Check for Plan Selection
      const selectedPlan = searchParams.get('plan');
      const billingInterval = searchParams.get('interval') as 'month' | 'year' | undefined;

      // Check if a paid plan is selected (Basic is now paid, only 'demo' or null is free/trial)
      if (selectedPlan && selectedPlan !== 'demo') {
        // 3. Initiate Checkout for Paid Plans
        try {
          // Cast the string to the expected union type for safety after verification
          // In a real scenario we'd validate against the allowed values list
          await createCheckoutSession({
            plan: selectedPlan as any,
            interval: billingInterval || 'month'
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
            Únete a PsicoAIssist
          </h2>
          <p className="text-gray-600">
            Crea tu cuenta y comienza a transformar tu práctica psicológica
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email profesional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
              />
            </div>


            {/* Professional Fields - B2B Requirement */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="professionalNumber" className="block text-sm font-medium text-gray-700">
                  Nº Profesional / Colegiado
                </label>
                <input
                  id="professionalNumber"
                  name="professionalNumber"
                  type="text"
                  required
                  value={formData.professionalNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Colegiado / Asoc. / CIF"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  País
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selección</option>
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
                Contraseña
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
                  placeholder="Mínimo 8 caracteres"
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
                Confirmar contraseña
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
                  placeholder="Repite tu contraseña"
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
                  Código de referido (Opcional)
                </label>
                <div className="mt-1 relative">
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Si tienes un código, introdúcelo aquí"
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
                  Certificación de Habilitación Profesional
                </label>
                <p className="text-gray-600 mt-1 text-xs text-justify">
                  Certifico que el <strong>número profesional/colegiado</strong> introducido es verídico y se encuentra vigente.
                  Entiendo que la falsedad en este dato constituye un delito de intrusismo profesional y falsedad documental, conllevando las <strong>responsabilidades penales</strong> correspondientes según la normativa vigente.
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
                  Acepto los <Link href="/dashboard/compliance?tab=terms" target="_blank" className="text-blue-600 hover:text-blue-500">Términos de Servicio</Link> y la <Link href="/dashboard/compliance?tab=gdpr" target="_blank" className="text-blue-600 hover:text-blue-500">Política de Privacidad</Link>
                </label>
                <p className="text-gray-500 mt-1 text-xs">Esta herramienta ofrece apoyo clínico orientativo exclusivamente para psicólogos. No realiza diagnósticos ni sustituye el criterio clínico.</p>
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
                  {searchParams.get('plan') ? 'Preparando pago...' : 'Creando cuenta...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {searchParams.get('plan') ? 'Continuar al Pago' : 'Crear cuenta gratuita'}
                </div>
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <Link href="/dashboard/compliance?tab=terms" target="_blank" className="text-blue-600 hover:text-blue-500">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/dashboard/compliance?tab=gdpr" target="_blank" className="text-blue-600 hover:text-blue-500">
              Política de Privacidad
            </Link>
          </p>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}