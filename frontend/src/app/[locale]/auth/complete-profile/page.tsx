'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { AuthAPI } from '@/lib/auth-api';
import { useToast } from '@/hooks/use-toast';
import { usePayments } from '@/hooks/usePayments';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CompleteProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { createCheckoutSession } = usePayments();

    useEffect(() => {
        console.log('CompleteProfile Params:', {
            plan: searchParams.get('plan'),
            interval: searchParams.get('interval'),
            token: searchParams.get('token')
        });
    }, [searchParams]);

    useEffect(() => {
        // Critical: Clear existing admin session if present to prevent redirect loops
        // The backend has redirected us here with a specific registration token
        if (typeof window !== 'undefined') {
            localStorage.removeItem('psychoai_access_token');
            localStorage.removeItem('psychoai_refresh_token');
        }
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        professionalNumber: '',
        country: 'España',
        referralCode: '',
        acceptTerms: false,
        certifyProfessional: false
    });

    // Pre-filled data from URL
    const token = searchParams.get('token');
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : '';

    useEffect(() => {
        if (!token) {
            setError('Token de registro inválido o expirado. Por favor intenta registrarte de nuevo.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.acceptTerms || !formData.certifyProfessional) {
            setError('Debes aceptar los términos y certificar que eres un profesional habilitado.');
            return;
        }

        if (!formData.professionalNumber) {
            setError('El número de colegiado es obligatorio.');
            return;
        }

        setLoading(true);

        try {
            if (!token) throw new Error("No token provided");

            // Call API to complete registration
            const response = await AuthAPI.completeGoogleRegistration({
                token,
                professionalNumber: formData.professionalNumber,
                country: formData.country,
                referralCode: formData.referralCode,
                acceptTerms: formData.acceptTerms
            });

            if (response.tokens) {
                localStorage.setItem('psychoai_access_token', response.tokens.accessToken);
                localStorage.setItem('psychoai_refresh_token', response.tokens.refreshToken);
            } else {
                // Should not happen on successful completion, but handle safety
                console.error("No tokens returned after profile completion");
                setError("Error de autenticación. Por favor inicia sesión.");
                router.push('/auth/login');
                return;
            }

            toast({
                title: "¡Cuenta completada!",
                description: "Bienvenido a PsicoAIssist.",
            });

            // Check for plan redirection
            const plan = searchParams.get('plan');
            const interval = searchParams.get('interval') as 'month' | 'year' | undefined;

            if (plan && plan !== 'demo') {
                try {
                    console.log('Redirecting to payment for plan:', plan);
                    await createCheckoutSession({
                        plan: plan as any,
                        interval: interval || 'month'
                    });
                    // createCheckoutSession handles the redirect
                    return;
                } catch (paymentError: any) {
                    console.error('Payment redirection failed', paymentError);
                    toast({
                        title: "Error iniciando el pago",
                        description: paymentError.message || "Hubo un problema al conectar con Stripe.",
                        variant: "destructive",
                        duration: 5000
                    });
                    // Delay fallback to dashboard so user sees the error
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 3000);
                }
            } else {
                // Redirect to dashboard
                window.location.href = '/dashboard';
            }

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al completar el registro. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
                    <p className="text-gray-600 mb-6">El enlace de registro no es válido o ha expirado.</p>
                    <Link href="/auth/register" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Volver al registro
                    </Link>
                </div>
            </div>
        );
    }

    // If we have a payment error but profile is actually complete (tokens set), allow going to dashboard
    if (error && error.includes('Error de Pago')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Perfil Completado</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <p className="text-sm text-gray-500 mb-6">Tu cuenta ha sido creada correctamente, pero falló la redirección al pago. Puedes intentar cambiar de plan desde el Dashboard.</p>
                    <a href="/dashboard" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Ir al Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Completa tu perfil profesional
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Solo un paso más para acceder a PsicoAIssist
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    <div className="mb-6 bg-blue-50 p-4 rounded-md flex items-start">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Cuenta de Google verificada</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>Te estás registrando como <strong>{name}</strong> ({email})</p>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Professional Number */}
                        <div>
                            <label htmlFor="professionalNumber" className="block text-sm font-medium text-gray-700">
                                Nº Profesional / Colegiado
                            </label>
                            <div className="mt-1">
                                <input
                                    id="professionalNumber"
                                    name="professionalNumber"
                                    type="text"
                                    required
                                    placeholder="Ej: Colegiado / Asoc. / CIF"
                                    value={formData.professionalNumber}
                                    onChange={(e) => setFormData({ ...formData, professionalNumber: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Country */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                País
                            </label>
                            <div className="mt-1">
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="España">España</option>
                                    <option value="México">México</option>
                                    <option value="Argentina">Argentina</option>
                                    <option value="Colombia">Colombia</option>
                                    <option value="Chile">Chile</option>
                                    <option value="Perú">Perú</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        {/* Referral Code */}
                        <div>
                            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
                                Código de referido (Opcional)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="referralCode"
                                    name="referralCode"
                                    type="text"
                                    value={formData.referralCode}
                                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Certifications & Terms */}
                        <div className="space-y-4">
                            <div className="flex items-start bg-yellow-50 p-3 rounded-md">
                                <div className="flex items-center h-5">
                                    <input
                                        id="certify"
                                        name="certify"
                                        type="checkbox"
                                        checked={formData.certifyProfessional}
                                        onChange={(e) => setFormData({ ...formData, certifyProfessional: e.target.checked })}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="certify" className="font-medium text-gray-700">
                                        Certificación de Habilitación Profesional
                                    </label>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Certifico que el número profesional/colegiado introducido es verídico y me encuentro habilitado para ejercer.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={formData.acceptTerms}
                                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        Acepto los <a href="#" className="text-blue-600 hover:text-blue-500">Términos de Servicio</a> y la <a href="#" className="text-blue-600 hover:text-blue-500">Política de Privacidad</a>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Creando cuenta...
                                    </>
                                ) : (
                                    'Finalizar Registro'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
